
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readData } from '../data/store.js';

const router = express.Router();

// Obter estatísticas do dashboard
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const users = readData('users');
    const contents = readData('contents');
    const images = readData('images');
    const videos = readData('videos');
    const forms = readData('forms');
    const blocks = readData('blocks');

    const stats = {
      users: users.length,
      contents: contents.length,
      images: images.length,
      videos: videos.length,
      forms: forms.length,
      blocks: blocks.length,
      totalFiles: images.length + videos.length,
      activeContents: contents.filter(c => c.status === 'published').length,
      activeBlocks: blocks.filter(b => b.active === true).length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

// Obter atividades recentes
router.get('/activities', authMiddleware, (req, res) => {
  try {
    const users = readData('users');
    const contents = readData('contents');
    const images = readData('images');
    const videos = readData('videos');

    const activities = [];

    // Adicionar criações recentes de usuários
    users.slice(-5).forEach(user => {
      activities.push({
        type: 'user_created',
        description: `Usuário ${user.username} foi criado`,
        timestamp: user.createdAt,
        data: { username: user.username }
      });
    });

    // Adicionar conteúdos recentes
    contents.slice(-5).forEach(content => {
      activities.push({
        type: 'content_created',
        description: `Conteúdo "${content.title}" foi criado`,
        timestamp: content.createdAt,
        data: { title: content.title, type: content.type }
      });
    });

    // Adicionar uploads recentes
    [...images.slice(-3), ...videos.slice(-3)].forEach(file => {
      const type = file.path.includes('/images/') ? 'image' : 'video';
      activities.push({
        type: `${type}_uploaded`,
        description: `${type === 'image' ? 'Imagem' : 'Vídeo'} "${file.title}" foi enviado`,
        timestamp: file.uploadedAt || file.createdAt,
        data: { title: file.title, filename: file.filename }
      });
    });

    // Ordenar por timestamp (mais recente primeiro)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activities.slice(0, 10));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter atividades' });
  }
});

export default router;
