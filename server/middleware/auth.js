
import jwt from 'jsonwebtoken';
import { readData } from '../data/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-secreta';

export const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = readData('users');
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};
import jwt from 'jsonwebtoken';
import { readData } from '../data/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-secreta';

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acesso necessário' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = readData('users');
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};
