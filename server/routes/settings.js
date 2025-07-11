import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readData, writeData } from '../data/store.js';

const router = express.Router();

// Obter configurações
router.get('/', authMiddleware, (req, res) => {
  try {
    const settings = readData('settings');
    const currentSettings = settings[0] || {
      siteName: 'Meu Site',
      siteDescription: 'Descrição do site',
      contactEmail: 'contato@meusite.com',
      socialMedia: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: ''
      },
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: ''
      }
    };

    res.json(currentSettings);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter configurações' });
  }
});

// Atualizar configurações
router.put('/', authMiddleware, (req, res) => {
  try {
    const settings = readData('settings');
    const newSettings = {
      id: '1',
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    if (settings.length === 0) {
      newSettings.createdAt = new Date().toISOString();
      settings.push(newSettings);
    } else {
      settings[0] = { ...settings[0], ...newSettings };
    }

    writeData('settings', settings);
    res.json({ message: 'Configurações atualizadas com sucesso', settings: settings[0] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
});

export default router;