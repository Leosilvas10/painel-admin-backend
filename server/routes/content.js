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

// ========== ROTAS PARA LANDING PAGES POR SLUG ==========

// Buscar dados de uma landing page específica por slug
router.get("/landing/:slug", (req, res) => {
  try {
    const { slug } = req.params;
    const landingData = readData("landing_pages");
    
    const landing = landingData[slug];
    if (!landing) {
      return res.status(404).json({ 
        error: "Landing page não encontrada",
        slug: slug 
      });
    }

    res.json({
      slug: slug,
      data: landing,
      message: "Landing page encontrada com sucesso"
    });
  } catch (error) {
    console.error("Erro ao buscar landing page:", error);
    res.status(500).json({ error: "Erro ao buscar dados da landing page" });
  }
});

// Atualizar dados de uma landing page específica por slug
router.put("/landing/:slug", (req, res) => {
  try {
    const { slug } = req.params;
    const { title, subtitle, cta, description, ...otherData } = req.body;
    
    const landingData = readData("landing_pages");
    
    // Criar ou atualizar os dados da landing page
    landingData[slug] = {
      title: title || "",
      subtitle: subtitle || "",
      cta: cta || "",
      description: description || "",
      ...otherData,
      updatedAt: new Date().toISOString(),
      createdAt: landingData[slug]?.createdAt || new Date().toISOString()
    };

    writeData("landing_pages", landingData);

    res.json({
      message: "Landing page atualizada com sucesso",
      slug: slug,
      data: landingData[slug]
    });
  } catch (error) {
    console.error("Erro ao atualizar landing page:", error);
    res.status(500).json({ error: "Erro ao atualizar dados da landing page" });
  }
});

// Listar todas as landing pages
router.get("/landing", (req, res) => {
  try {
    const landingData = readData("landing_pages");
    
    const landingList = Object.keys(landingData).map(slug => ({
      slug: slug,
      title: landingData[slug].title || "Sem título",
      updatedAt: landingData[slug].updatedAt || landingData[slug].createdAt
    }));

    res.json({
      message: "Landing pages listadas com sucesso",
      count: landingList.length,
      landings: landingList
    });
  } catch (error) {
    console.error("Erro ao listar landing pages:", error);
    res.status(500).json({ error: "Erro ao listar landing pages" });
  }
});

// Deletar uma landing page específica por slug
router.delete("/landing/:slug", (req, res) => {
  try {
    const { slug } = req.params;
    const landingData = readData("landing_pages");
    
    // Verificar se a landing page existe
    if (!landingData[slug]) {
      return res.status(404).json({ 
        error: "Landing page não encontrada",
        slug: slug 
      });
    }

    // Deletar a landing page
    delete landingData[slug];
    
    // Salvar os dados atualizados
    writeData("landing_pages", landingData);

    res.json({
      message: "Landing page deletada com sucesso",
      slug: slug,
      deletedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erro ao deletar landing page:", error);
    res.status(500).json({ error: "Erro ao deletar landing page" });
  }
});

export default router;