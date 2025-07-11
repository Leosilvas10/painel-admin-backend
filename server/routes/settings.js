import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readData, writeData } from '../data/store.js';

const router = express.Router();

// Obter configurações
router.get('/', (req, res) => {
  try {
    const settings = readData('settings');
    res.json(settings.length > 0 ? settings[0] : {});
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter configurações' });
  }
});

// Atualizar configurações
router.put('/', authMiddleware, (req, res) => {
  try {
    const settings = readData('settings');
    const newSettings = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    if (settings.length > 0) {
      settings[0] = { ...settings[0], ...newSettings };
    } else {
      settings.push({ id: '1', ...newSettings, createdAt: new Date().toISOString() });
    }

    writeData('settings', settings);
    res.json({ message: 'Configurações atualizadas com sucesso', settings: settings[0] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
});

export default router;