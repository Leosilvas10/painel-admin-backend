
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { readData, writeData } = require('../data/store');

const router = express.Router();

// Listar todos os formulários
router.get('/', (req, res) => {
  try {
    const forms = readData('forms');
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar formulários' });
  }
});

// Criar novo formulário
router.post('/', authMiddleware, (req, res) => {
  try {
    const forms = readData('forms');
    const { name, fields, settings } = req.body;

    if (!name || !fields) {
      return res.status(400).json({ error: 'Nome e campos são obrigatórios' });
    }

    const newForm = {
      id: Date.now().toString(),
      name,
      fields: fields || [],
      settings: settings || {
        enabled: true,
        emailNotification: false,
        autoReply: false
      },
      submissions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    forms.push(newForm);
    writeData('forms', forms);

    res.status(201).json({
      message: 'Formulário criado com sucesso',
      form: newForm
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar formulário' });
  }
});

// Obter formulário específico
router.get('/:id', (req, res) => {
  try {
    const forms = readData('forms');
    const form = forms.find(f => f.id === req.params.id);
    
    if (!form) {
      return res.status(404).json({ error: 'Formulário não encontrado' });
    }
    
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter formulário' });
  }
});

// Atualizar formulário
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const forms = readData('forms');
    const formIndex = forms.findIndex(f => f.id === req.params.id);
    
    if (formIndex === -1) {
      return res.status(404).json({ error: 'Formulário não encontrado' });
    }

    forms[formIndex] = {
      ...forms[formIndex],
      ...req.body,
      id: req.params.id, // Manter o ID original
      updatedAt: new Date().toISOString()
    };

    writeData('forms', forms);
    
    res.json({
      message: 'Formulário atualizado com sucesso',
      form: forms[formIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar formulário' });
  }
});

// Excluir formulário
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const forms = readData('forms');
    const formIndex = forms.findIndex(f => f.id === req.params.id);
    
    if (formIndex === -1) {
      return res.status(404).json({ error: 'Formulário não encontrado' });
    }

    forms.splice(formIndex, 1);
    writeData('forms', forms);

    res.json({ message: 'Formulário excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir formulário' });
  }
});

// Submeter formulário (endpoint público)
router.post('/:id/submit', (req, res) => {
  try {
    const forms = readData('forms');
    const formIndex = forms.findIndex(f => f.id === req.params.id);
    
    if (formIndex === -1) {
      return res.status(404).json({ error: 'Formulário não encontrado' });
    }

    const form = forms[formIndex];
    
    if (!form.settings.enabled) {
      return res.status(400).json({ error: 'Formulário desabilitado' });
    }

    // Salvar submissão
    const submissions = readData('submissions');
    const submission = {
      id: Date.now().toString(),
      formId: req.params.id,
      data: req.body,
      submittedAt: new Date().toISOString(),
      ip: req.ip
    };

    submissions.push(submission);
    writeData('submissions', submissions);

    // Incrementar contador
    forms[formIndex].submissions += 1;
    writeData('forms', forms);

    res.json({ message: 'Formulário enviado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar formulário' });
  }
});

// Listar submissões de um formulário
router.get('/:id/submissions', authMiddleware, (req, res) => {
  try {
    const submissions = readData('submissions');
    const formSubmissions = submissions.filter(s => s.formId === req.params.id);
    
    res.json(formSubmissions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar submissões' });
  }
});

module.exports = router;
