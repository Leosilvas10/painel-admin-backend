
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readData, writeData } from '../data/store.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Debug middleware para log de rotas
router.use((req, res, next) => {
  console.log(`🔍 Auth Route: ${req.method} ${req.path}`);
  console.log(`🔍 Body:`, req.body);
  next();
});

// Login
router.post('/login', async (req, res) => {
  console.log('🚀 Processando login...');
  try {
    const { username, password } = req.body;

    console.log(`📝 Tentativa de login para: ${username}`);

    if (!username || !password) {
      console.log('❌ Username ou password em branco');
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    const users = readData('users');
    console.log(`👥 Total de usuários: ${users.length}`);
    
    const user = users.find(u => u.username === username);

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    console.log('✅ Usuário encontrado, verificando senha...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Senha inválida');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    console.log('✅ Senha válida, gerando token...');
    const token = generateToken(user);

    console.log('✅ Login bem-sucedido!');
    res.json({ 
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar token
router.get('/verify', (req, res) => {
  console.log('🔍 Verificando token...');
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('❌ Token não fornecido');
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua-chave-secreta-super-secreta');
    const users = readData('users');
    const user = users.find(u => u.id === decoded.userId || u.id === decoded.id);

    if (!user) {
      console.log('❌ Usuário não encontrado no token');
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    console.log('✅ Token válido');
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Erro na verificação do token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;
