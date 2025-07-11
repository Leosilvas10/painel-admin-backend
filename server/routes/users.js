import express from 'express';
import bcrypt from 'bcryptjs';
import { authMiddleware } from '../middleware/auth.js';
import { readData, writeData } from '../data/store.js';

const router = express.Router();

// Listar usuários
router.get('/', authMiddleware, (req, res) => {
  try {
    const users = readData('users');
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    }));
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// Criar usuário
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const users = readData('users');

    // Verificar se usuário já existe
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      role: role || 'editor',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    users.push(userData);
    writeData('users', users);

    const { password: _, ...safeUser } = userData;
    res.json({ message: 'Usuário criado com sucesso', user: safeUser });
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

    // Verificar conflitos de username/email
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

    if (password) {
      updatedUser.password = await bcrypt.hash(password, 10);
    }

    users[userIndex] = updatedUser;
    writeData('users', users);

    const { password: _, ...safeUser } = updatedUser;
    res.json({ message: 'Usuário atualizado com sucesso', user: safeUser });
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

export default router;
import express from 'express';
import bcrypt from 'bcryptjs';
import { authMiddleware } from '../middleware/auth.js';
import { readData, writeData } from '../data/store.js';

const router = express.Router();

// Listar usuários
router.get('/', authMiddleware, (req, res) => {
  try {
    const users = readData('users');
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json(usersWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// Criar usuário
router.post('/', authMiddleware, async (req, res) => {
  try {
    const users = readData('users');
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email e senha são obrigatórios' });
    }

    // Verificar se usuário já existe
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(userData);
    writeData('users', users);

    const { password: _, ...userWithoutPassword } = userData;
    res.json({ message: 'Usuário criado com sucesso', user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Deletar usuário
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const users = readData('users');
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    users.splice(userIndex, 1);
    writeData('users', users);
    
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

export default router;
