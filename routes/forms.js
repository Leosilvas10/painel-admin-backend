import express from 'express';
import { authMiddleware } from '../server/middleware/auth.js'; // Caminho correto!
import { readData, writeData } from '../server/data/store.js';

const router = express.Router();

// Listar formulários (protegido; só usuários autenticados listam)
router.get("/", authMiddleware, (req, res) => {
  try {
    const forms = readData("forms");
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar formulários" });
  }
});

// Criar formulário (protegido — tradicionalmente, envio de formulário seria público, mas mantém padrão)
router.post("/", authMiddleware, (req, res) => {
  try {
    const forms = readData("forms");
    const { name, email, message, phone } = req.body;

    const formData = {
      id: Date.now().toString(),
      name: name || "",
      email: email || "",
      message: message || "",
      phone: phone || "",
      read: false,
      createdAt: new Date().toISOString()
    };

    forms.push(formData);
    writeData("forms", forms);

    res.json({ message: "Formulário enviado com sucesso", form: formData });
  } catch (error) {
    res.status(500).json({ error: "Erro ao enviar formulário" });
  }
});

// Marcar como lido
router.put("/:id/read", authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const forms = readData("forms");

    const formIndex = forms.findIndex(form => form.id === id);
    if (formIndex === -1) {
      return res.status(404).json({ error: "Formulário não encontrado" });
    }

    forms[formIndex].read = true;

    writeData("forms", forms);
    res.json({ message: "Formulário marcado como lido", form: forms[formIndex] });
  } catch (error) {
    res.status(500).json({ error: "Erro ao marcar formulário como lido" });
  }
});

// Deletar formulário
router.delete("/:id", authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const forms = readData("forms");

    const formIndex = forms.findIndex(form => form.id === id);
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

export default router;

