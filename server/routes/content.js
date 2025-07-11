
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readData, writeData } from '../data/store.js';

const router = express.Router();

// Listar conteúdos
router.get('/', authMiddleware, (req, res) => {
  try {
    const contents = readData('contents');
    res.json(contents);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar conteúdos' });
  }
});

// Criar conteúdo
router.post('/', authMiddleware, (req, res) => {
  try {
    const contents = readData('contents');
    const { title, body, type, status } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
    }

    const content = {
      id: Date.now().toString(),
      title,
      body,
      type: type || 'page',
      status: status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    contents.push(content);
    writeData('contents', contents);

    res.json({ message: 'Conteúdo criado com sucesso', content });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar conteúdo' });
  }
});

// Obter conteúdo específico
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const contents = readData('contents');
    const content = contents.find(c => c.id === req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }
    
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar conteúdo' });
  }
});

// Atualizar conteúdo
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const contents = readData('contents');
    const contentIndex = contents.findIndex(c => c.id === req.params.id);
    
    if (contentIndex === -1) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }
    
    const { title, body, type, status } = req.body;
    contents[contentIndex] = {
      ...contents[contentIndex],
      title: title || contents[contentIndex].title,
      body: body || contents[contentIndex].body,
      type: type || contents[contentIndex].type,
      status: status || contents[contentIndex].status,
      updatedAt: new Date().toISOString()
    };
    
    writeData('contents', contents);
    res.json({ message: 'Conteúdo atualizado com sucesso', content: contents[contentIndex] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar conteúdo' });
  }
});

// Deletar conteúdo
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const contents = readData('contents');
    const contentIndex = contents.findIndex(c => c.id === req.params.id);
    
    if (contentIndex === -1) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }
    
    contents.splice(contentIndex, 1);
    writeData('contents', contents);
    
    res.json({ message: 'Conteúdo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar conteúdo' });
  }
});

export default router;
