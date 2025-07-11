import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readData } from '../data/store.js';

const router = express.Router();

// Obter estatísticas do dashboard
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const videos = readData('videos');
    const images = readData('images');
    const blocks = readData('blocks');
    const forms = readData('forms');
    const submissions = readData('submissions');
    const users = readData('users');

    // Calcular estatísticas
    const stats = {
      content: {
        videos: videos.length,
        images: images.length,
        blocks: blocks.length,
        enabledBlocks: blocks.filter(b => b.enabled).length
      },
      forms: {
        total: forms.length,
        active: forms.filter(f => f.settings?.enabled).length,
        totalSubmissions: submissions.length,
        recentSubmissions: submissions.filter(s => {
          const submissionDate = new Date(s.submittedAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return submissionDate > weekAgo;
        }).length
      },
      users: {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        admins: users.filter(u => u.role === 'admin').length,
        editors: users.filter(u => u.role === 'editor').length
      },
      storage: {
        videosSize: videos.reduce((total, video) => total + (video.size || 0), 0),
        imagesSize: images.reduce((total, image) => total + (image.size || 0), 0),
        totalSize: videos.reduce((total, video) => total + (video.size || 0), 0) + 
                   images.reduce((total, image) => total + (image.size || 0), 0)
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

// Obter atividades recentes
router.get('/activities', authMiddleware, (req, res) => {
  try {
    const submissions = readData('submissions');
    const videos = readData('videos');
    const images = readData('images');
    const blocks = readData('blocks');

    const activities = [];

    // Últimas submissões de formulários
    submissions.slice(-5).forEach(submission => {
      activities.push({
        type: 'form_submission',
        message: 'Nova submissão de formulário recebida',
        timestamp: submission.submittedAt,
        data: { formId: submission.formId }
      });
    });

    // Últimos uploads de vídeos
    videos.slice(-3).forEach(video => {
      activities.push({
        type: 'video_upload',
        message: `Vídeo "${video.title}" foi enviado`,
        timestamp: video.uploadedAt,
        data: { videoId: video.id }
      });
    });

    // Últimos uploads de imagens
    images.slice(-3).forEach(image => {
      activities.push({
        type: 'image_upload',
        message: `Imagem "${image.originalName}" foi enviada`,
        timestamp: image.uploadedAt,
        data: { imageId: image.id }
      });
    });

    // Últimas atualizações de blocos
    blocks.filter(b => b.updatedAt !== b.createdAt).slice(-3).forEach(block => {
      activities.push({
        type: 'block_update',
        message: `Bloco "${block.id}" foi atualizado`,
        timestamp: block.updatedAt,
        data: { blockId: block.id }
      });
    });

    // Ordenar por timestamp (mais recente primeiro)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activities.slice(0, 10)); // Retornar apenas os 10 mais recentes
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