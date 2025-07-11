
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authMiddleware } from '../middleware/auth.js';
import { readData, writeData } from '../data/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configuração do multer para upload de logo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/logos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas para o logo'));
    }
  }
});

// Upload de logo
router.post('/upload', authMiddleware, upload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const logos = readData('logos');
    
    const logoData = {
      id: Date.now().toString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/logos/${req.file.filename}`,
      size: req.file.size,
      uploadedAt: new Date().toISOString()
    };

    logos.push(logoData);
    writeData('logos', logos);

    res.json({
      message: 'Logo enviado com sucesso',
      logo: logoData
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer upload do logo' });
  }
});

// Obter logo atual
router.get('/', (req, res) => {
  try {
    const logos = readData('logos');
    const currentLogo = logos.length > 0 ? logos[logos.length - 1] : null;
    res.json(currentLogo);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter logo' });
  }
});

// Listar todos os logos
router.get('/all', authMiddleware, (req, res) => {
  try {
    const logos = readData('logos');
    res.json(logos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar logos' });
  }
});

// Deletar logo
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const logos = readData('logos');
    const logoIndex = logos.findIndex(l => l.id === req.params.id);
    
    if (logoIndex === -1) {
      return res.status(404).json({ error: 'Logo não encontrado' });
    }
    
    const logo = logos[logoIndex];
    const filePath = path.join(__dirname, '../uploads/logos/', logo.filename);
    
    // Remover arquivo físico
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    logos.splice(logoIndex, 1);
    writeData('logos', logos);
    
    res.json({ message: 'Logo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar logo' });
  }
});

export default router;
