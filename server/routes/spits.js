const express = require('express');
const router = express.Router();
const Spit = require('../models/Spit');
const { authenticate } = require('../middleware/auth');

// GET /api/spits - Get all spits
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const spits = await Spit.find({ user: req.user._id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Spit.countDocuments({ user: req.user._id });

    res.json({
      spits,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: spits.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Error fetching spits:', error);
    res.status(500).json({ error: 'Error al obtener los spits' });
  }
});

// GET /api/spits/today - Get today's spits
router.get('/today', authenticate, async (req, res) => {
  try {
    const timezone = req.user.preferences?.timezone || 'UTC';

    // Get today's date in the user's timezone
    const now = new Date();
    const userToday = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    userToday.setHours(0, 0, 0, 0);

    // Convert to UTC for database query
    const todayUTC = new Date(userToday.getTime() - (userToday.getTimezoneOffset() * 60000));
    const tomorrowUTC = new Date(todayUTC.getTime() + (24 * 60 * 60 * 1000));

    const todaysSpits = await Spit.find({
      user: req.user._id,
      timestamp: {
        $gte: todayUTC,
        $lt: tomorrowUTC
      }
    }).sort({ timestamp: -1 }).lean();

    res.json({ spits: todaysSpits });
  } catch (error) {
    console.error('Error fetching today\'s spits:', error);
    res.status(500).json({ error: 'Error al obtener los spits de hoy' });
  }
});

// GET /api/spits/stats - Get statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const timezone = req.user.preferences?.timezone || 'UTC';

    const totalSpits = await Spit.countDocuments({ user: req.user._id });

    // Get today's date in the user's timezone
    const now = new Date();
    const userToday = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    userToday.setHours(0, 0, 0, 0);

    // Convert to UTC for database query
    const todayUTC = new Date(userToday.getTime() - (userToday.getTimezoneOffset() * 60000));
    const tomorrowUTC = new Date(todayUTC.getTime() + (24 * 60 * 60 * 1000));

    const todaysSpits = await Spit.countDocuments({
      user: req.user._id,
      timestamp: { $gte: todayUTC, $lt: tomorrowUTC }
    });

    const locationCount = await Spit.countDocuments({
      user: req.user._id,
      location: { $exists: true, $ne: null }
    });

    const attachmentCount = await Spit.aggregate([
      { $match: { user: req.user._id } },
      { $project: { fileCount: { $size: { $ifNull: ['$files', []] } } } },
      { $group: { _id: null, total: { $sum: '$fileCount' } } }
    ]);

    res.json({
      totalSpits,
      todaysSpits,
      locationCount,
      attachmentCount: attachmentCount[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error al obtener las estadísticas' });
  }
});

// POST /api/spits - Create a new spit
router.post('/', authenticate, async (req, res) => {
  try {
    const { content, mood, files, location } = req.body;

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'El contenido es requerido' });
    }

    if (content.length > 180) {
      return res.status(400).json({ error: 'El contenido debe tener 180 caracteres o menos' });
    }

    if (mood && !['happy', 'neutral', 'frustrated', 'inspired'].includes(mood)) {
      return res.status(400).json({ error: 'Valor de estado de ánimo inválido' });
    }

    const spit = new Spit({
      content: content.trim(),
      mood: mood || 'neutral',
      files: files || [],
      location: location || null,
      user: req.user._id
    });

    const savedSpit = await spit.save();
    res.status(201).json(savedSpit);
  } catch (error) {
    console.error('Error creating spit:', error);
    res.status(500).json({ error: 'Error al crear el spit' });
  }
});

// PUT /api/spits/:id - Update a spit
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'El contenido es requerido' });
    }

    if (content.length > 180) {
      return res.status(400).json({ error: 'El contenido debe tener 180 caracteres o menos' });
    }

    // Check if spit exists and is not summarized
    const existingSpit = await Spit.findOne({ _id: id, user: req.user._id });
    if (!existingSpit) {
      return res.status(404).json({ error: 'Spit no encontrado' });
    }

    if (existingSpit.isSummarized) {
      return res.status(403).json({ error: 'No se puede editar un spit que ya ha sido incluido en un resumen de IA' });
    }

    const spit = await Spit.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { content: content.trim() },
      { new: true, runValidators: true }
    );

    res.json(spit);
  } catch (error) {
    console.error('Error updating spit:', error);
    res.status(500).json({ error: 'Error al actualizar el spit' });
  }
});

// DELETE /api/spits/:id - Delete a spit
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if spit exists and is not summarized
    const existingSpit = await Spit.findOne({ _id: id, user: req.user._id });
    if (!existingSpit) {
      return res.status(404).json({ error: 'Spit no encontrado' });
    }

    if (existingSpit.isSummarized) {
      return res.status(403).json({ error: 'No se puede eliminar un spit que ya ha sido incluido en un resumen de IA' });
    }

    const spit = await Spit.findOneAndDelete({ _id: id, user: req.user._id });

    res.json({ message: 'Spit eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting spit:', error);
    res.status(500).json({ error: 'Error al eliminar el spit' });
  }
});

module.exports = router;

