
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authMiddleware, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Usuário admin padrão (em produção, usar banco de dados)
const ADMIN_USER = {
  id: 1,
  username: 'admin',
  password: '$2b$10$1HX59jkPqUUjO2nZnxQOtuhbCxwkRnimvQUBDfiLqN/vUu8/VVAu6'
};

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    if (username !== ADMIN_USER.username) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Usar bcrypt para validar a senha
    const isValidPassword = await bcrypt.compare(password, ADMIN_USER.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: ADMIN_USER.id, username: ADMIN_USER.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: { id: ADMIN_USER.id, username: ADMIN_USER.username }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Logout
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

// Verificar autenticação
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default router;
