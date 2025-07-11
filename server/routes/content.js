import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readData, writeData } from '../data/store.js';

const router = express.Router();

// Listar conteúdo
router.get('/', (req, res) => {
  try {
    const content = readData('content');
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar conteúdo' });
  }
});

// Criar conteúdo
router.post('/', authMiddleware, (req, res) => {
  try {
    const { title, body, type, status } = req.body;
    const content = readData('content');

    const contentData = {
      id: Date.now().toString(),
      title: title || 'Conteúdo sem título',
      body: body || '',
      type: type || 'page',
      status: status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    content.push(contentData);
    writeData('content', content);

    res.json({ message: 'Conteúdo criado com sucesso', content: contentData });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar conteúdo' });
  }
});

// Obter conteúdo por ID
router.get('/:id', (req, res) => {
  try {
    const content = readData('content');
    const item = content.find(c => c.id === req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter conteúdo' });
  }
});

// Atualizar conteúdo
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const content = readData('content');
    const contentIndex = content.findIndex(c => c.id === req.params.id);

    if (contentIndex === -1) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }

    const { title, body, type, status } = req.body;
    content[contentIndex] = {
      ...content[contentIndex],
      title: title || content[contentIndex].title,
      body: body || content[contentIndex].body,
      type: type || content[contentIndex].type,
      status: status || content[contentIndex].status,
      updatedAt: new Date().toISOString()
    };

    writeData('content', content);
    res.json({ message: 'Conteúdo atualizado com sucesso', content: content[contentIndex] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar conteúdo' });
  }
});

// Deletar conteúdo
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const content = readData('content');
    const contentIndex = content.findIndex(c => c.id === req.params.id);

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