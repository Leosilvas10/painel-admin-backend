
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readData } from '../data/store.js';

const router = express.Router();

// Obter estatísticas do dashboard
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const users = readData('users');
    const contents = readData('contents');
    const blocks = readData('blocks');
    const forms = readData('forms');
    const images = readData('images');
    const videos = readData('videos');

    const stats = {
      users: users.length,
      contents: contents.length,
      blocks: blocks.length,
      forms: forms.length,
      images: images.length,
      videos: videos.length,
      totalUploads: images.length + videos.length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Obter dados do dashboard
router.get('/', authMiddleware, (req, res) => {
  try {
    const stats = {
      users: readData('users').length,
      contents: readData('contents').length,
      blocks: readData('blocks').length,
      forms: readData('forms').length,
      images: readData('images').length,
      videos: readData('videos').length
    };

    const recentContents = readData('contents').slice(-5);
    const recentBlocks = readData('blocks').slice(-5);

    res.json({
      stats,
      recentContents,
      recentBlocks,
      message: 'Dashboard carregado com sucesso'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar dashboard' });
  }
});

export default router;
