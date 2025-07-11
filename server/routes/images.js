
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

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// Upload de imagens
router.post('/upload', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const { alt, category } = req.body;
    const images = readData('images');
    
    const imageData = {
      id: Date.now().toString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      alt: alt || '',
      category: category || 'general',
      path: `/uploads/images/${req.file.filename}`,
      size: req.file.size,
      uploadedAt: new Date().toISOString()
    };

    images.push(imageData);
    writeData('images', images);

    res.json({
      message: 'Imagem enviada com sucesso',
      image: imageData
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

// Listar imagens
router.get('/', (req, res) => {
  try {
    const images = readData('images');
    const { category, limit } = req.query;
    
    let filteredImages = images;
    
    if (category) {
      filteredImages = images.filter(img => img.category === category);
    }
    
    if (limit) {
      filteredImages = filteredImages.slice(0, parseInt(limit));
    }
    
    res.json(filteredImages);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar imagens' });
  }
});

// Excluir imagem
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const images = readData('images');
    const imageIndex = images.findIndex(img => img.id === req.params.id);
    
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }

    const image = images[imageIndex];
    const filePath = path.join(__dirname, '../uploads/images/', image.filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    images.splice(imageIndex, 1);
    writeData('images', images);

    res.json({ message: 'Imagem excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir imagem' });
  }
});

export default router;
