const express = require('express');
const router = express.Router();
const { generateText } = require("ai")
const { openai } = require("@ai-sdk/openai")
const DailySummary = require('../models/DailySummary');
const Spit = require('../models/Spit');

// GET /api/summaries/latest - Get latest summary
router.get('/latest', async (req, res) => {
  try {
    const { user = 'anonymous' } = req.query;
    const summary = await DailySummary.getLatestSummary(user);

    if (!summary) {
      return res.json({ summary: null });
    }

    res.json({ summary });
  } catch (error) {
    console.error('Error fetching latest summary:', error);
    res.status(500).json({ error: 'Error al obtener el último resumen' });
  }
});

// GET /api/summaries/today - Get today's summary (kept for backward compatibility)
router.get('/today', async (req, res) => {
  try {
    const { user = 'anonymous', timezone = 'UTC' } = req.query;
    const summary = await DailySummary.getTodaysSummary(user, timezone);

    if (!summary) {
      return res.json({ summary: null });
    }

    res.json({ summary });
  } catch (error) {
    console.error('Error fetching today\'s summary:', error);
    res.status(500).json({ error: 'Error al obtener el resumen de hoy' });
  }
});

// GET /api/summaries/all - Get all summaries for timeline
router.get('/all', async (req, res) => {
  try {
    const { user = 'anonymous', limit = 30 } = req.query;
    const summaries = await DailySummary.getAllSummaries(user, parseInt(limit));

    res.json({ summaries });
  } catch (error) {
    console.error('Error fetching all summaries:', error);
    res.status(500).json({ error: 'Error al obtener los resúmenes' });
  }
});

// GET /api/summaries/unsummarized-count - Get count of unsummarized spits
router.get('/unsummarized-count', async (req, res) => {
  try {
    const { user = 'anonymous' } = req.query;
    const count = await Spit.getUnsummarizedSpitsCount(user);

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unsummarized spits count:', error);
    res.status(500).json({ error: 'Error al obtener el conteo de spits no resumidos' });
  }
});

// POST /api/summaries/generate - Generate summary from unsummarized spits
router.post('/generate', async (req, res) => {
  try {
    const { user = 'anonymous', timezone = 'UTC', limit = 20 } = req.body;

    // Get unsummarized spits
    const unsummarizedSpits = await Spit.getUnsummarizedSpits(user, limit);

    if (unsummarizedSpits.length === 0) {
      return res.status(400).json({
        error: 'No hay spits sin resumir para generar un resumen'
      });
    }

    // Calculate mood statistics
    const moodCounts = unsummarizedSpits.reduce((acc, spit) => {
      acc[spit.mood] = (acc[spit.mood] || 0) + 1;
      return acc;
    }, {});

    const totalSpits = unsummarizedSpits.length;
    const moodStats = Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / totalSpits) * 100)
    }));

    const locationCount = unsummarizedSpits.filter(spit => spit.location).length;
    const attachmentCount = unsummarizedSpits.reduce((total, spit) => {
      return total + (spit.files ? spit.files.length : 0);
    }, 0);

    // Extract locations for mapping
    const locations = unsummarizedSpits
      .filter(spit => spit.location)
      .map(spit => ({
        lat: spit.location.lat,
        lng: spit.location.lng,
        spitId: spit._id
      }));

    // Prepare data for AI
    const spitsData = unsummarizedSpits.map(spit => ({
      content: spit.content,
      mood: spit.mood,
      timestamp: spit.timestamp,
      hasLocation: !!spit.location,
      hasAttachments: !!(spit.files && spit.files.length > 0)
    }));

    // Get date range for the summary
    const oldestSpit = unsummarizedSpits[unsummarizedSpits.length - 1];
    const newestSpit = unsummarizedSpits[0];
    const dateRange = oldestSpit.timestamp.toDateString() === newestSpit.timestamp.toDateString()
      ? `del ${newestSpit.timestamp.toLocaleDateString('es-ES')}`
      : `desde el ${oldestSpit.timestamp.toLocaleDateString('es-ES')} hasta el ${newestSpit.timestamp.toLocaleDateString('es-ES')}`;

    // Generate AI summary
    const { text: aiSummary } = await generateText({
      model: openai('gpt-3.5-turbo'),
      prompt: `Eres un asistente de análisis personal que ayuda a las personas a reflexionar sobre sus experiencias recientes. 

Basándote en los siguientes spits recientes, genera un resumen reflexivo y positivo en español:

Datos del período:
- Total de spits: ${totalSpits}
- Período: ${dateRange}
- Estadísticas de estado de ánimo: ${JSON.stringify(moodStats)}
- Spits con ubicación: ${locationCount}
- Spits con adjuntos: ${attachmentCount}

Spits recientes:
${spitsData.map((spit, index) =>
        `${index + 1}. [${spit.mood}] ${spit.content} ${spit.hasLocation ? '(con ubicación)' : ''} ${spit.hasAttachments ? '(con adjuntos)' : ''}`
      ).join('\n')}

Genera un resumen que:
1. Refleje los patrones de estado de ánimo del período
2. Identifique temas o preocupaciones recurrentes
3. Destaque momentos positivos o inspiradores
4. Ofrezca una perspectiva reflexiva sobre las experiencias
5. Sea alentador y constructivo
6. Tenga entre 150-250 palabras
7. Use un tono cálido y personal
8. Mencione el período de tiempo cubierto

Resumen:`,
      maxTokens: 500,
      temperature: 0.7,
    });

    // Save summary to database using the date of the newest spit
    const summaryDate = new Date(newestSpit.timestamp);
    summaryDate.setHours(0, 0, 0, 0);

    const summary = await DailySummary.create({
      user,
      date: summaryDate,
      summary: aiSummary,
      spitsCount: totalSpits,
      moodAnalysis: moodStats,
      locationCount,
      attachmentCount,
      summarizedSpits: unsummarizedSpits.map(spit => spit._id),
      locations,
      timezone
    });

    // Mark all spits as summarized
    await Spit.updateMany(
      { _id: { $in: unsummarizedSpits.map(spit => spit._id) } },
      { isSummarized: true }
    );

    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Error al generar el resumen' });
  }
});

module.exports = router;
