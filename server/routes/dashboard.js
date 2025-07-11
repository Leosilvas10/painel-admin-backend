import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readData } from '../data/store.js';

const router = express.Router();

// Obter estatísticas do dashboard
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const users = readData('users');
    const videos = readData('videos');
    const images = readData('images');
    const content = readData('content');
    const blocks = readData('blocks');
    const forms = readData('forms');

    const stats = {
      users: users.length,
      videos: videos.length,
      images: images.length,
      content: content.length,
      blocks: blocks.length,
      forms: forms.length,
      totalStorage: videos.reduce((total, video) => total + (video.size || 0), 0) +
                   images.reduce((total, image) => total + (image.size || 0), 0)
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

// Obter atividades recentes
router.get('/activities', authMiddleware, (req, res) => {
  try {
    const activities = [];

    // Buscar atividades recentes de diferentes tipos
    const videos = readData('videos').slice(-5);
    const images = readData('images').slice(-5);
    const content = readData('content').slice(-5);

    videos.forEach(video => {
      activities.push({
        id: `video-${video.id}`,
        type: 'video',
        action: 'upload',
        description: `Vídeo "${video.title}" foi enviado`,
        timestamp: video.createdAt,
        user: 'admin'
      });
    });

    images.forEach(image => {
      activities.push({
        id: `image-${image.id}`,
        type: 'image',
        action: 'upload',
        description: `Imagem "${image.title}" foi enviada`,
        timestamp: image.createdAt,
        user: 'admin'
      });
    });

    content.forEach(item => {
      activities.push({
        id: `content-${item.id}`,
        type: 'content',
        action: 'create',
        description: `Conteúdo "${item.title}" foi criado`,
        timestamp: item.createdAt,
        user: 'admin'
      });
    });

    // Ordenar por data mais recente
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activities.slice(0, 10)); // Retornar apenas as 10 mais recentes
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter atividades' });
  }
});

// Obter dados para gráficos
router.get('/charts', authMiddleware, (req, res) => {
  try {
    const submissions = readData('submissions');
    const videos = readData('videos');
    const images = readData('images');

    // Dados de submissões dos últimos 30 dias
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const submissionsChart = last30Days.map(date => {
      const count = submissions.filter(s => 
        s.submittedAt.split('T')[0] === date
      ).length;
      return { date, count };
    });

    // Dados de uploads dos últimos 7 dias
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const uploadsChart = last7Days.map(date => {
      const videoCount = videos.filter(v => 
        v.uploadedAt && v.uploadedAt.split('T')[0] === date
      ).length;
      const imageCount = images.filter(i => 
        i.uploadedAt && i.uploadedAt.split('T')[0] === date
      ).length;
      return { date, videos: videoCount, images: imageCount };
    });

    res.json({
      submissions: submissionsChart,
      uploads: uploadsChart
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter dados para gráficos' });
  }
});

// Obter resumo de sistema
router.get('/system', authMiddleware, (req, res) => {
  try {
    const settings = readData('settings');
    
    const systemInfo = {
      version: '1.0.0',
      uptime: process.uptime(),
      lastUpdate: settings.updatedAt || new Date().toISOString(),
      status: 'operational',
      maintenance: false
    };

    res.json(systemInfo);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter informações do sistema' });
  }
});

export default router;