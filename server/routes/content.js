
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readData, writeData } from '../data/store.js';

const router = express.Router();

// Listar conteúdos
router.get('/', authMiddleware, (req, res) => {
  try {
    const content = readData('content');
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar conteúdos' });
  }
});

// Criar conteúdo
router.post('/', authMiddleware, (req, res) => {
  try {
    const content = readData('content');
    const { title, type, data, active } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'Título e tipo são obrigatórios' });
    }

    const newContent = {
      id: Date.now().toString(),
      title,
      type,
      data: data || {},
      active: active !== undefined ? active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    content.push(newContent);
    writeData('content', content);

    res.json({ message: 'Conteúdo criado com sucesso', content: newContent });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar conteúdo' });
  }
});

// Obter conteúdo específico
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const content = readData('content');
    const item = content.find((c) => c.id === req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar conteúdo' });
  }
});

// Atualizar conteúdo
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const content = readData('content');
    const contentIndex = content.findIndex((c) => c.id === req.params.id);

    if (contentIndex === -1) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }

    const { title, type, data, active } = req.body;
    const updatedContent = {
      ...content[contentIndex],
      title: title || content[contentIndex].title,
      type: type || content[contentIndex].type,
      data: data || content[contentIndex].data,
      active: active !== undefined ? active : content[contentIndex].active,
      updatedAt: new Date().toISOString(),
    };

    content[contentIndex] = updatedContent;
    writeData('content', content);

    res.json({ message: 'Conteúdo atualizado com sucesso', content: updatedContent });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar conteúdo' });
  }
});

// Deletar conteúdo
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const content = readData('content');
    const contentIndex = content.findIndex((c) => c.id === req.params.id);

    if (contentIndex === -1) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }

    content.splice(contentIndex, 1);
    writeData('content', content);

    res.json({ message: 'Conteúdo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar conteúdo' });
  }
});

export default router' });
  }
});

// Atualizar conteúdo
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const content = readData('content');
    const contentIndex = content.findIndex((c) => c.id === req.params.id);

    if (contentIndex === -1) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }

    const { title, type, data, active } = req.body;
    content[contentIndex] = {
      ...content[contentIndex],
      title: title || content[contentIndex].title,
      type: type || content[contentIndex].type,
      data: data || content[contentIndex].data,
      active: active !== undefined ? active : content[contentIndex].active,
      updatedAt: new Date().toISOString(),
    };

    writeData('content', content);
    res.json({
      message: 'Conteúdo atualizado com sucesso',
      content: content[contentIndex],
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar conteúdo' });
  }
});

// Deletar conteúdo
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const content = readData('content');
    const contentIndex = content.findIndex((c) => c.id === req.params.id);

    if (contentIndex === -1) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }

    content.splice(contentIndex, 1);
    writeData('content', content);

    res.json({ message: 'Conteúdo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar conteúdo' });
  }
});

export default router;
