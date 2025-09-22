const express = require('express');
const router = express.Router();
const Spit = require('../models/Spit');

// GET /api/spits - Get all spits
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, user = 'anonymous' } = req.query;
    const skip = (page - 1) * limit;

    const spits = await Spit.find({ user })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Spit.countDocuments({ user });

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
    res.status(500).json({ error: 'Failed to fetch spits' });
  }
});

// GET /api/spits/today - Get today's spits
router.get('/today', async (req, res) => {
  try {
    const { user = 'anonymous' } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysSpits = await Spit.find({
      user,
      timestamp: {
        $gte: today,
        $lt: tomorrow
      }
    }).sort({ timestamp: -1 }).lean();

    res.json({ spits: todaysSpits });
  } catch (error) {
    console.error('Error fetching today\'s spits:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s spits' });
  }
});

// GET /api/spits/stats - Get statistics
router.get('/stats', async (req, res) => {
  try {
    const { user = 'anonymous' } = req.query;

    const totalSpits = await Spit.countDocuments({ user });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysSpits = await Spit.countDocuments({
      user,
      timestamp: { $gte: today, $lt: tomorrow }
    });

    const locationCount = await Spit.countDocuments({
      user,
      location: { $exists: true, $ne: null }
    });

    const attachmentCount = await Spit.aggregate([
      { $match: { user } },
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
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// POST /api/spits - Create a new spit
router.post('/', async (req, res) => {
  try {
    const { content, mood, files, location, user = 'anonymous' } = req.body;

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (content.length > 180) {
      return res.status(400).json({ error: 'Content must be 180 characters or less' });
    }

    if (mood && !['happy', 'neutral', 'frustrated', 'inspired'].includes(mood)) {
      return res.status(400).json({ error: 'Invalid mood value' });
    }

    const spit = new Spit({
      content: content.trim(),
      mood: mood || 'neutral',
      files: files || [],
      location: location || null,
      user
    });

    const savedSpit = await spit.save();
    res.status(201).json(savedSpit);
  } catch (error) {
    console.error('Error creating spit:', error);
    res.status(500).json({ error: 'Failed to create spit' });
  }
});

// PUT /api/spits/:id - Update a spit
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, user = 'anonymous' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (content.length > 180) {
      return res.status(400).json({ error: 'Content must be 180 characters or less' });
    }

    const spit = await Spit.findOneAndUpdate(
      { _id: id, user },
      { content: content.trim() },
      { new: true, runValidators: true }
    );

    if (!spit) {
      return res.status(404).json({ error: 'Spit not found' });
    }

    res.json(spit);
  } catch (error) {
    console.error('Error updating spit:', error);
    res.status(500).json({ error: 'Failed to update spit' });
  }
});

// DELETE /api/spits/:id - Delete a spit
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user = 'anonymous' } = req.query;

    const spit = await Spit.findOneAndDelete({ _id: id, user });

    if (!spit) {
      return res.status(404).json({ error: 'Spit not found' });
    }

    res.json({ message: 'Spit deleted successfully' });
  } catch (error) {
    console.error('Error deleting spit:', error);
    res.status(500).json({ error: 'Failed to delete spit' });
  }
});

module.exports = router;
