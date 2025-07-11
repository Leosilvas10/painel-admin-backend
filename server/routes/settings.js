
import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { readData, writeData } from "../data/store.js";

const router = express.Router();

// Obter configurações
router.get("/", authMiddleware, (req, res) => {
  try {
    const settings = readData("settings");
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar configurações" });
  }
});

// Atualizar configurações
router.put("/", authMiddleware, (req, res) => {
  try {
    const settings = readData("settings");
    const { siteName, siteDescription, contactEmail, socialMedia, theme } = req.body;

    const updatedSettings = {
      ...settings,
      siteName: siteName || settings.siteName,
      siteDescription: siteDescription || settings.siteDescription,
      contactEmail: contactEmail || settings.contactEmail,
      socialMedia: socialMedia || settings.socialMedia,
      theme: theme || settings.theme,
      updatedAt: new Date().toISOString(),
    };

    writeData("settings", updatedSettings);

    res.json({
      message: "Configurações atualizadas com sucesso",
      settings: updatedSettings,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar configurações" });
  }
});

// Obter configuração específica
router.get("/:key", authMiddleware, (req, res) => {
  try {
    const settings = readData("settings");
    const value = settings[req.params.key];

    if (value === undefined) {
      return res.status(404).json({ error: "Configuração não encontrada" });
    }

    res.json({ key: req.params.key, value });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar configuração" });
  }
});

// Atualizar configuração específica
router.put("/:key", authMiddleware, (req, res) => {
  try {
    const settings = readData("settings");
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: "Valor é obrigatório" });
    }

    settings[req.params.key] = value;
    settings.updatedAt = new Date().toISOString();

    writeData("settings", settings);

    res.json({
      message: "Configuração atualizada com sucesso",
      key: req.params.key,
      value,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar configuração" });
  }
});

export default router;
