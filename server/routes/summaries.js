const express = require('express');
const router = express.Router();
const { generateText } = require("ai")
const { openai } = require("@ai-sdk/openai")
const DailySummary = require('../models/DailySummary');
const Spit = require('../models/Spit');

// GET /api/summaries/today - Get today's summary
router.get('/today', async (req, res) => {
  try {
    const { user = 'anonymous' } = req.query;
    const summary = await DailySummary.getTodaysSummary(user);

    if (!summary) {
      return res.json({ summary: null });
    }

    res.json({ summary });
  } catch (error) {
    console.error('Error fetching today\'s summary:', error);
    res.status(500).json({ error: 'Error al obtener el resumen de hoy' });
  }
});

// POST /api/summaries/generate - Generate today's summary
router.post('/generate', async (req, res) => {
  try {
    const { user = 'anonymous' } = req.body;

    // Check if summary already exists for today
    const existingSummary = await DailySummary.getTodaysSummary(user);
    if (existingSummary) {
      return res.status(400).json({
        error: 'Ya se ha generado un resumen para hoy',
        summary: existingSummary
      });
    }

    // Get today's spits
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
    }).sort({ timestamp: 1 }).lean();

    if (todaysSpits.length === 0) {
      return res.status(400).json({
        error: 'No hay spits para generar un resumen hoy'
      });
    }

    // Calculate mood statistics
    const moodCounts = todaysSpits.reduce((acc, spit) => {
      acc[spit.mood] = (acc[spit.mood] || 0) + 1;
      return acc;
    }, {});

    const totalSpits = todaysSpits.length;
    const moodStats = Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / totalSpits) * 100)
    }));

    const locationCount = todaysSpits.filter(spit => spit.location).length;
    const attachmentCount = todaysSpits.reduce((total, spit) => {
      return total + (spit.files ? spit.files.length : 0);
    }, 0);

    // Prepare data for AI
    const spitsData = todaysSpits.map(spit => ({
      content: spit.content,
      mood: spit.mood,
      timestamp: spit.timestamp,
      hasLocation: !!spit.location,
      hasAttachments: !!(spit.files && spit.files.length > 0)
    }));

    // Generate AI summary
    const { text: aiSummary } = await generateText({
      model: openai('gpt-3.5-turbo'),
      prompt: `Eres un asistente de análisis personal que ayuda a las personas a reflexionar sobre su día. 

Basándote en los siguientes datos del día de hoy, genera un resumen reflexivo y positivo en español:

Datos del día:
- Total de spits: ${totalSpits}
- Estadísticas de estado de ánimo: ${JSON.stringify(moodStats)}
- Spits con ubicación: ${locationCount}
- Spits con adjuntos: ${attachmentCount}

Spits del día:
${spitsData.map((spit, index) =>
        `${index + 1}. [${spit.mood}] ${spit.content} ${spit.hasLocation ? '(con ubicación)' : ''} ${spit.hasAttachments ? '(con adjuntos)' : ''}`
      ).join('\n')}

Genera un resumen que:
1. Refleje los patrones de estado de ánimo del día
2. Identifique temas o preocupaciones recurrentes
3. Destaque momentos positivos o inspiradores
4. Ofrezca una perspectiva reflexiva sobre el día
5. Sea alentador y constructivo
6. Tenga entre 150-250 palabras
7. Use un tono cálido y personal

Resumen:`,
      maxTokens: 500,
      temperature: 0.7,
    });

    // Save summary to database
    const summary = await DailySummary.createTodaysSummary({
      user,
      summary: aiSummary,
      spitsCount: totalSpits,
      moodAnalysis: moodStats,
      locationCount,
      attachmentCount
    });

    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Error al generar el resumen' });
  }
});

module.exports = router;
