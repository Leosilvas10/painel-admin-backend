import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readData, writeData } from '../data/store.js';

const router = express.Router();

// Listar conteúdo
router.get("/", (req, res) => {
  try {
    const content = readData("content");
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar conteúdo" });
  }
});

// Criar conteúdo
router.post("/", authMiddleware, (req, res) => {
  try {
    const content = readData("content");
    const { title, subtitle, description, type, order } = req.body;

    const contentData = {
      id: Date.now().toString(),
      title: title || "",
      subtitle: subtitle || "",
      description: description || "",
      type: type || "text",
      order: order || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    content.push(contentData);
    writeData("content", content);

    res.json({ message: "Conteúdo criado com sucesso", content: contentData });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar conteúdo" });
  }
});

// Atualizar conteúdo
router.put("/:id", authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, type, order } = req.body;
    const content = readData("content");

    const contentIndex = content.findIndex(item => item.id === id);
    if (contentIndex === -1) {
      return res.status(404).json({ error: "Conteúdo não encontrado" });
    }

    content[contentIndex] = {
      ...content[contentIndex],
      title: title || content[contentIndex].title,
      subtitle: subtitle || content[contentIndex].subtitle,
      description: description || content[contentIndex].description,
      type: type || content[contentIndex].type,
      order: order !== undefined ? order : content[contentIndex].order,
      updatedAt: new Date().toISOString()
    };

    writeData("content", content);
    res.json({ message: "Conteúdo atualizado com sucesso", content: content[contentIndex] });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar conteúdo" });
  }
});

// Deletar conteúdo
router.delete("/:id", authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const content = readData("content");

    const contentIndex = content.findIndex(item => item.id === id);
    if (contentIndex === -1) {
      return res.status(404).json({ error: "Conteúdo não encontrado" });
    }

    content.splice(contentIndex, 1);
    writeData("content", content);

    res.json({ message: "Conteúdo deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar conteúdo" });
  }
});

export default router;