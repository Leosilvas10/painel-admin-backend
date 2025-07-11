
import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { readData, writeData } from "../data/store.js";

const router = express.Router();

// Listar blocos
router.get("/", authMiddleware, (req, res) => {
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
    const { name, type, content, position, active } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: "Nome e tipo são obrigatórios" });
    }

    const block = {
      id: Date.now().toString(),
      name,
      type,
      content: content || {},
      position: position || 0,
      active: active !== undefined ? active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    blocks.push(block);
    writeData("blocks", blocks);

    res.json({ message: "Bloco criado com sucesso", block });
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
    const blocks = readData("blocks");
    const blockIndex = blocks.findIndex((b) => b.id === req.params.id);

    if (blockIndex === -1) {
      return res.status(404).json({ error: "Bloco não encontrado" });
    }

    const { name, type, content, position, active } = req.body;
    blocks[blockIndex] = {
      ...blocks[blockIndex],
      name: name || blocks[blockIndex].name,
      type: type || blocks[blockIndex].type,
      content: content || blocks[blockIndex].content,
      position: position !== undefined ? position : blocks[blockIndex].position,
      active: active !== undefined ? active : blocks[blockIndex].active,
      updatedAt: new Date().toISOString(),
    };

    writeData("blocks", blocks);
    res.json({
      message: "Bloco atualizado com sucesso",
      block: blocks[blockIndex],
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar bloco" });
  }
});

// Deletar bloco
router.delete("/:id", authMiddleware, (req, res) => {
  try {
    const blocks = readData("blocks");
    const blockIndex = blocks.findIndex((b) => b.id === req.params.id);

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

export default router;outer;
