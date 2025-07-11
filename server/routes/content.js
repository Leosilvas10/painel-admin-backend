import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readData, writeData } from '../data/store.js';

const router = express.Router();

// Obter conteúdo
router.get('/', (req, res) => {
  try {
    const content = readData('content');
    res.json(content.length > 0 ? content[0] : {});
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter conteúdo' });
  }
});

// Atualizar conteúdo
router.put('/', authMiddleware, (req, res) => {
  try {
    const content = readData('content');
    const newContent = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    if (content.length > 0) {
      content[0] = { ...content[0], ...newContent };
    } else {
      content.push({ id: '1', ...newContent, createdAt: new Date().toISOString() });
    }

    writeData('content', content);
    res.json({ message: 'Conteúdo atualizado com sucesso', content: content[0] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar conteúdo' });
  }
});

export default router;