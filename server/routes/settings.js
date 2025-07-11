
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { readData, writeData } = require('../data/store');

const router = express.Router();

// Obter todas as configurações
router.get('/', (req, res) => {
  try {
    const settings = readData('settings');
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter configurações' });
  }
});

// Atualizar configurações gerais
router.put('/', authMiddleware, (req, res) => {
  try {
    const settings = readData('settings');
    
    const updatedSettings = {
      ...settings,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    writeData('settings', updatedSettings);
    
    res.json({
      message: 'Configurações atualizadas com sucesso',
      settings: updatedSettings
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
});

// Atualizar configurações de SEO
router.put('/seo', authMiddleware, (req, res) => {
  try {
    const settings = readData('settings');
    const { metaTitle, metaDescription, metaKeywords, ogTitle, ogDescription, ogImage } = req.body;
    
    const updatedSettings = {
      ...settings,
      metaTitle: metaTitle || settings.metaTitle,
      metaDescription: metaDescription || settings.metaDescription,
      metaKeywords: metaKeywords || settings.metaKeywords,
      ogTitle: ogTitle || settings.ogTitle,
      ogDescription: ogDescription || settings.ogDescription,
      ogImage: ogImage || settings.ogImage,
      updatedAt: new Date().toISOString()
    };

    writeData('settings', updatedSettings);
    
    res.json({
      message: 'Configurações de SEO atualizadas com sucesso',
      settings: updatedSettings
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar configurações de SEO' });
  }
});

module.exports = router;
