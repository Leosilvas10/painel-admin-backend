
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readData } from '../data/store.js';

const router = express.Router();

// Obter estatísticas do dashboard
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const users = readData('users');
    const images = readData('images');
    const videos = readData('videos');
    const forms = readData('forms');
    const blocks = readData('blocks');
    const content = readData('content');

    const stats = {
      users: users.length,
      images: images.length,
      videos: videos.length,
      forms: forms.length,
      blocks: blocks.length,
      content: content.length,
      totalSubmissions: forms.reduce((total, form) => total + (form.submissions?.length || 0), 0),
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

// Obter atividades recentes
router.get('/recent', authMiddleware, (req, res) => {
  try {
    const images = readData('images');
    const videos = readData('videos');
    const forms = readData('forms');

    const activities = [];

    // Adicionar uploads recentes
    images.slice(-5).forEach(img => {
      activities.push({
        type: 'image_upload',
        title: `Imagem: ${img.title}`,
        date: img.uploadedAt,
        id: img.id
      });
    });

    videos.slice(-5).forEach(video => {
      activities.push({
        type: 'video_upload',
        title: `Vídeo: ${video.title}`,
        date: video.uploadedAt,
        id: video.id
      });
    });

    // Adicionar submissões recentes
    forms.forEach(form => {
      if (form.submissions && form.submissions.length > 0) {
        form.submissions.slice(-3).forEach(submission => {
          activities.push({
            type: 'form_submission',
            title: `Submissão: ${form.name}`,
            date: submission.submittedAt,
            id: submission.id
          });
        });
      }
    });

    // Ordenar por data mais recente
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(activities.slice(0, 10));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter atividades recentes' });
  }
});

export default router;uter;
