import express from 'express';
import { authMiddleware } from '../server/middleware/auth.js'; // Caminho corrigido!
import { readData } from '../server/data/store.js';

const router = express.Router();

// Obter estatísticas do dashboard (protegido)
router.get("/stats", authMiddleware, (req, res) => {
  try {
    const users = readData("users");
    const content = readData("content");
    const images = readData("images");
    const videos = readData("videos");
    const forms = readData("forms");
    const blocks = readData("blocks");

    const stats = {
      users: users.length,
      content: content.length,
      images: images.length,
      videos: videos.length,
      forms: forms.length,
      blocks: blocks.length,
      lastLogin: new Date().toISOString()
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Erro ao obter estatísticas" });
  }
});

// Obter atividades recentes (protegido; exemplo estático)
router.get("/activities", authMiddleware, (req, res) => {
  try {
    const activities = [
      {
        id: "1",
        type: "login",
        description: "Usuário fez login",
        timestamp: new Date().toISOString()
      },
      {
        id: "2",
        type: "content",
        description: "Conteúdo atualizado",
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Erro ao obter atividades" });
  }
});

export default router;

