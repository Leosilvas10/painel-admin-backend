
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { readData, writeData } = require('../data/store');

const router = express.Router();

// Listar todos os blocos
router.get('/', (req, res) => {
  try {
    const blocks = readData('blocks');
    // Ordenar por ordem
    blocks.sort((a, b) => a.order - b.order);
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar blocos' });
  }
});

// Criar novo bloco
router.post('/', authMiddleware, (req, res) => {
  try {
    const blocks = readData('blocks');
    const { id, type, content, enabled = true } = req.body;

    if (!id || !type) {
      return res.status(400).json({ error: 'ID e tipo são obrigatórios' });
    }

    // Verificar se ID já existe
    if (blocks.find(b => b.id === id)) {
      return res.status(400).json({ error: 'Bloco com este ID já existe' });
    }

    const newBlock = {
      id,
      type,
      order: blocks.length + 1,
      content: content || {},
      enabled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    blocks.push(newBlock);
    writeData('blocks', blocks);

    res.status(201).json({
      message: 'Bloco criado com sucesso',
      block: newBlock
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar bloco' });
  }
});

// Obter bloco específico
router.get('/:id', (req, res) => {
  try {
    const blocks = readData('blocks');
    const block = blocks.find(b => b.id === req.params.id);
    
    if (!block) {
      return res.status(404).json({ error: 'Bloco não encontrado' });
    }
    
    res.json(block);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter bloco' });
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

    blocks[blockIndex] = {
      ...blocks[blockIndex],
      ...req.body,
      id: req.params.id, // Manter o ID original
      updatedAt: new Date().toISOString()
    };

    writeData('blocks', blocks);
    
    res.json({
      message: 'Bloco atualizado com sucesso',
      block: blocks[blockIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar bloco' });
  }
});

// Excluir bloco
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const blocks = readData('blocks');
    const blockIndex = blocks.findIndex(b => b.id === req.params.id);
    
    if (blockIndex === -1) {
      return res.status(404).json({ error: 'Bloco não encontrado' });
    }

    blocks.splice(blockIndex, 1);
    writeData('blocks', blocks);

    res.json({ message: 'Bloco excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir bloco' });
  }
});

// Reordenar blocos
router.put('/reorder', authMiddleware, (req, res) => {
  try {
    const { blockIds } = req.body;
    
    if (!Array.isArray(blockIds)) {
      return res.status(400).json({ error: 'blockIds deve ser um array' });
    }

    const blocks = readData('blocks');
    
    // Atualizar ordem dos blocos
    blockIds.forEach((id, index) => {
      const block = blocks.find(b => b.id === id);
      if (block) {
        block.order = index + 1;
        block.updatedAt = new Date().toISOString();
      }
    });

    writeData('blocks', blocks);
    
    res.json({
      message: 'Blocos reordenados com sucesso',
      blocks: blocks.sort((a, b) => a.order - b.order)
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao reordenar blocos' });
  }
});

module.exports = router;
