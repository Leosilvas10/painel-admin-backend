import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readData, writeData } from '../data/store.js';

const router = express.Router();

// Listar formulários
router.get('/', authMiddleware, (req, res) => {
  try {
    const forms = readData('forms');
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar formulários' });
  }
});

// Criar formulário
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, fields, settings } = req.body;
    const forms = readData('forms');

    const formData = {
      id: Date.now().toString(),
      name,
      fields: fields || [],
      settings: settings || { enabled: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    forms.push(formData);
    writeData('forms', forms);

    res.json({ message: 'Formulário criado com sucesso', form: formData });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar formulário' });
  }
});

// Submeter formulário (público)
router.post('/:id/submit', (req, res) => {
  try {
    const forms = readData('forms');
    const form = forms.find(f => f.id === req.params.id);

    if (!form) {
      return res.status(404).json({ error: 'Formulário não encontrado' });
    }

    if (!form.settings?.enabled) {
      return res.status(400).json({ error: 'Formulário desabilitado' });
    }

    const submissions = readData('submissions');
    const submissionData = {
      id: Date.now().toString(),
      formId: req.params.id,
      data: req.body,
      submittedAt: new Date().toISOString(),
      ip: req.ip
    };

    submissions.push(submissionData);
    writeData('submissions', submissions);

    res.json({ message: 'Formulário enviado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar formulário' });
  }
});

// Obter submissões
router.get('/:id/submissions', authMiddleware, (req, res) => {
  try {
    const submissions = readData('submissions');
    const formSubmissions = submissions.filter(s => s.formId === req.params.id);
    res.json(formSubmissions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter submissões' });
  }
});

// Obter formulário específico
router.get('/:id', authMiddleware, (req, res) => {
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

export default router;