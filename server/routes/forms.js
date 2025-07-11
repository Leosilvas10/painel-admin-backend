
import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { readData, writeData } from "../data/store.js";

const router = express.Router();

// Listar formulários
router.get("/", authMiddleware, (req, res) => {
  try {
    const forms = readData("forms");
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar formulários" });
  }
});

// Criar formulário
router.post("/", authMiddleware, (req, res) => {
  try {
    const forms = readData("forms");
    const { name, fields, settings } = req.body;

    if (!name || !fields) {
      return res.status(400).json({ error: "Nome e campos são obrigatórios" });
    }

    const form = {
      id: Date.now().toString(),
      name,
      fields,
      settings: settings || {},
      submissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    forms.push(form);
    writeData("forms", forms);

    res.json({ message: "Formulário criado com sucesso", form });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar formulário" });
  }
});

// Obter formulário específico
router.get("/:id", authMiddleware, (req, res) => {
  try {
    const forms = readData("forms");
    const form = forms.find((f) => f.id === req.params.id);

    if (!form) {
      return res.status(404).json({ error: "Formulário não encontrado" });
    }

    res.json(form);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar formulário" });
  }
});

// Atualizar formulário
router.put("/:id", authMiddleware, (req, res) => {
  try {
    const forms = readData("forms");
    const formIndex = forms.findIndex((f) => f.id === req.params.id);

    if (formIndex === -1) {
      return res.status(404).json({ error: "Formulário não encontrado" });
    }

    const { name, fields, settings } = req.body;
    forms[formIndex] = {
      ...forms[formIndex],
      name: name || forms[formIndex].name,
      fields: fields || forms[formIndex].fields,
      settings: settings || forms[formIndex].settings,
      updatedAt: new Date().toISOString(),
    };

    writeData("forms", forms);
    res.json({
      message: "Formulário atualizado com sucesso",
      form: forms[formIndex],
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar formulário" });
  }
});

// Deletar formulário
router.delete("/:id", authMiddleware, (req, res) => {
  try {
    const forms = readData("forms");
    const formIndex = forms.findIndex((f) => f.id === req.params.id);

    if (formIndex === -1) {
      return res.status(404).json({ error: "Formulário não encontrado" });
    }

    forms.splice(formIndex, 1);
    writeData("forms", forms);

    res.json({ message: "Formulário deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar formulário" });
  }
});

// Submeter formulário (público)
router.post("/:id/submit", (req, res) => {
  try {
    const forms = readData("forms");
    const formIndex = forms.findIndex((f) => f.id === req.params.id);

    if (formIndex === -1) {
      return res.status(404).json({ error: "Formulário não encontrado" });
    }

    const submission = {
      id: Date.now().toString(),
      data: req.body,
      submittedAt: new Date().toISOString(),
    };

    forms[formIndex].submissions.push(submission);
    writeData("forms", forms);

    res.json({ message: "Formulário enviado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao enviar formulário" });
  }
});

export default router;
