import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readData, writeData } from '../data/store.js';

const router = express.Router();

// Listar blocos
router.get('/', (req, res) => {
  try {
    const blocks = readData('blocks');
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar blocos' });
  }
});

// Criar bloco
router.post('/', authMiddleware, (req, res) => {
  try {
    const { type, content, enabled, order } = req.body;
    const blocks = readData('blocks');

    const blockData = {
      id: Date.now().toString(),
      type,
      content,
      enabled: enabled !== undefined ? enabled : true,
      order: order || blocks.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    blocks.push(blockData);
    writeData('blocks', blocks);

    res.json({ message: 'Bloco criado com sucesso', block: blockData });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar bloco' });
  }
});

// Atualizar bloco
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const blocks = readData('blocks');
    const blockIndex = blocks.findIndex(b => b.id === req.params.id);

    if (blockIndex === -1) {
      return res.status(404).json({ error: 'Bloco não encontrado' });
    }

    const { type, content, enabled, order } = req.body;
    blocks[blockIndex] = {
      ...blocks[blockIndex],
      type: type || blocks[blockIndex].type,
      content: content || blocks[blockIndex].content,
      enabled: enabled !== undefined ? enabled : blocks[blockIndex].enabled,
      order: order !== undefined ? order : blocks[blockIndex].order,
      updatedAt: new Date().toISOString()
    };

    writeData('blocks', blocks);
    res.json({ message: 'Bloco atualizado com sucesso', block: blocks[blockIndex] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar bloco' });
  }
});

// Deletar bloco
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const blocks = readData('blocks');
    const blockIndex = blocks.findIndex(b => b.id === req.params.id);

    if (blockIndex === -1) {
      return res.status(404).json({ error: 'Bloco não encontrado' });
    }

    blocks.splice(blockIndex, 1);
    writeData('blocks', blocks);

    res.json({ message: 'Bloco deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar bloco' });
  }
});

export default router;