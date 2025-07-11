
import express from 'express';
import bcrypt from 'bcryptjs';
import { authMiddleware } from '../middleware/auth.js';
import { readData, writeData } from '../data/store.js';

const router = express.Router();

// Listar todos os usuários
router.get('/', authMiddleware, (req, res) => {
  try {
    const users = readData('users');
    // Remover senhas da resposta
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// Criar novo usuário
router.post('/', authMiddleware, async (req, res) => {
  try {
    const users = readData('users');
    const { username, email, password, role, status } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email e password são obrigatórios' });
    }

    // Verificar se username ou email já existem
    if (users.find(u => u.username === username || u.email === email)) {
      return res.status(400).json({ error: 'Username ou email já existem' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      role: role || 'editor',
      status: status || 'active',
      lastLogin: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    writeData('users', users);

    // Remover senha da resposta
    const { password: _, ...safeUser } = newUser;

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Obter usuário específico
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const users = readData('users');
    const user = users.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Remover senha da resposta
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter usuário' });
  }
});

// Atualizar usuário
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const users = readData('users');
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const { username, email, password, role, status } = req.body;

    // Verificar conflitos de username/email (exceto com o próprio usuário)
    if (username || email) {
      const conflictUser = users.find(u => 
        u.id !== req.params.id && 
        (u.username === username || u.email === email)
      );
      
      if (conflictUser) {
        return res.status(400).json({ error: 'Username ou email já existem' });
      }
    }

    const updatedUser = {
      ...users[userIndex],
      username: username || users[userIndex].username,
      email: email || users[userIndex].email,
      role: role || users[userIndex].role,
      status: status || users[userIndex].status,
      updatedAt: new Date().toISOString()
    };

    // Atualizar senha se fornecida
    if (password) {
      updatedUser.password = await bcrypt.hash(password, 10);
    }

    users[userIndex] = updatedUser;
    writeData('users', users);

    // Remover senha da resposta
    const { password: _, ...safeUser } = updatedUser;
    
    res.json({
      message: 'Usuário atualizado com sucesso',
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Excluir usuário
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const users = readData('users');
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Não permitir excluir o próprio usuário
    if (users[userIndex].id === req.user.id) {
      return res.status(400).json({ error: 'Não é possível excluir seu próprio usuário' });
    }

    users.splice(userIndex, 1);
    writeData('users', users);

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

// Alterar status do usuário
router.patch('/:id/status', authMiddleware, (req, res) => {
  try {
    const users = readData('users');
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const { status } = req.body;
    
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    users[userIndex].status = status;
    users[userIndex].updatedAt = new Date().toISOString();
    
    writeData('users', users);

    const { password: _, ...safeUser } = users[userIndex];
    
    res.json({
      message: 'Status do usuário atualizado com sucesso',
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status do usuário' });
  }
});

export default router;
