
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readData, writeData } from '../data/store.js';

const router = express.Router();

// Listar todas as seções
router.get('/sections', (req, res) => {
  try {
    const sections = readData('sections');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar seções' });
  }
});

// Obter conteúdo de seção específica
router.get('/sections/:section', (req, res) => {
  try {
    const sections = readData('sections');
    const section = sections[req.params.section];
    
    if (!section) {
      return res.status(404).json({ error: 'Seção não encontrada' });
    }
    
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter seção' });
  }
});

// Atualizar conteúdo de seção
router.put('/sections/:section', authMiddleware, (req, res) => {
  try {
    const sections = readData('sections');
    const sectionName = req.params.section;
    
    sections[sectionName] = {
      ...sections[sectionName],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    writeData('sections', sections);
    
    res.json({
      message: 'Seção atualizada com sucesso',
      section: sections[sectionName]
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar seção' });
  }
});

export default router;
