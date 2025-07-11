
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
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
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
router.get('/', authMiddleware, (req, res) => {
  try {
    const images = readData('images');
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar imagens' });
  }
});

// Obter imagem por ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const images = readData('images');
    const image = images.find(i => i.id === req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }
    
    res.json(image);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter imagem' });
  }
});

// Atualizar imagem
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const images = readData('images');
    const imageIndex = images.findIndex(i => i.id === req.params.id);
    
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }
    
    const { alt, category } = req.body;
    images[imageIndex] = {
      ...images[imageIndex],
      alt: alt || images[imageIndex].alt,
      category: category || images[imageIndex].category,
      updatedAt: new Date().toISOString()
    };
    
    writeData('images', images);
    res.json({ message: 'Imagem atualizada com sucesso', image: images[imageIndex] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar imagem' });
  }
});

// Deletar imagem
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const images = readData('images');
    const imageIndex = images.findIndex(i => i.id === req.params.id);
    
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }
    
    const image = images[imageIndex];
    const filePath = path.join(__dirname, '../uploads/images/', image.filename);
    
    // Remover arquivo físico
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    images.splice(imageIndex, 1);
    writeData('images', images);
    
    res.json({ message: 'Imagem deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar imagem' });
  }
});

export default router;
