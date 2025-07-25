import express from 'express';
import { authMiddleware } from '../server/middleware/auth.js';
import { readData, writeData } from '../server/data/store.js';

const router = express.Router();

// Listar blocos
router.get("/", (req, res) => {
  try {
    const blocks = readData("blocks");
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar blocos" });
  }
});

// Criar bloco
router.post("/", authMiddleware, (req, res) => {
  try {
    const blocks = readData("blocks");
    const { name, type, content, order, visible } = req.body;

    const blockData = {
      id: Date.now().toString(),
      name: name || "",
      type: type || "text",
      content: content || "",
      order: order || 0,
      visible: visible !== undefined ? visible : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    blocks.push(blockData);
    writeData("blocks", blocks);

    res.json({ message: "Bloco criado com sucesso", block: blockData });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar bloco" });
  }
});

// Obter bloco específico
router.get("/:id", authMiddleware, (req, res) => {
  try {
    const blocks = readData("blocks");
    const block = blocks.find((b) => b.id === req.params.id);

    if (!block) {
      return res.status(404).json({ error: "Bloco não encontrado" });
    }

    res.json(block);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar bloco" });
  }
});

// Atualizar bloco
router.put("/:id", authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, content, order, visible } = req.body;
    const blocks = readData("blocks");

    const blockIndex = blocks.findIndex(block => block.id === id);
    if (blockIndex === -1) {
      return res.status(404).json({ error: "Bloco não encontrado" });
    }

    blocks[blockIndex] = {
      ...blocks[blockIndex],
      name: name || blocks[blockIndex].name,
      type: type || blocks[blockIndex].type,
      content: content || blocks[blockIndex].content,
      order: order !== undefined ? order : blocks[blockIndex].order,
      visible: visible !== undefined ? visible : blocks[blockIndex].visible,
      updatedAt: new Date().toISOString()
    };

    writeData("blocks", blocks);
    res.json({ message: "Bloco atualizado com sucesso", block: blocks[blockIndex] });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar bloco" });
  }
});

// Deletar bloco
router.delete("/:id", authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const blocks = readData("blocks");

    const blockIndex = blocks.findIndex(block => block.id === id);
    if (blockIndex === -1) {
      return res.status(404).json({ error: "Bloco não encontrado" });
    }

    blocks.splice(blockIndex, 1);
    writeData("blocks", blocks);

    res.json({ message: "Bloco deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar bloco" });
  }
});

export default router;

