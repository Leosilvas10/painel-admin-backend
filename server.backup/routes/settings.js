import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readData, writeData } from '../data/store.js';

const router = express.Router();

// Obter configurações
router.get("/", (req, res) => {
  try {
    const settings = readData("settings");
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: "Erro ao obter configurações" });
  }
});

// Atualizar configurações
router.put("/", authMiddleware, (req, res) => {
  try {
    const currentSettings = readData("settings");
    const newSettings = { ...currentSettings, ...req.body };

    writeData("settings", newSettings);
    res.json({ message: "Configurações atualizadas com sucesso", settings: newSettings });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar configurações" });
  }
});

export default router;