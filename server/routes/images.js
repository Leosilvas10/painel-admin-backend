
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
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
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

// Upload de imagem
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo de imagem enviado' });
    }

    const images = readData('images');
    const { title, description } = req.body;

    const imageData = {
      id: Date.now().toString(),
      title: title || req.file.originalname,
      description: description || '',
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/images/${req.file.filename}`,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    images.push(imageData);
    writeData('images', images);

    res.json({ message: 'Imagem enviada com sucesso', image: imageData });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
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
    
    // Deletar arquivo físico
    const filePath = path.join(process.cwd(), 'server/uploads/images', image.filename);
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

export default router;);

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
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

// Upload de imagem
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo de imagem enviado' });
    }

    const images = readData('images');
    const { title, description } = req.body;

    const imageData = {
      id: Date.now().toString(),
      title: title || req.file.originalname,
      description: description || '',
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/images/${req.file.filename}`,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    images.push(imageData);
    writeData('images', images);

    res.json({ message: 'Imagem enviada com sucesso', image: imageData });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

// Obter imagem específica
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const images = readData('images');
    const image = images.find(img => img.id === req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }
    
    res.json(image);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar imagem' });
  }
});

// Atualizar imagem
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const images = readData('images');
    const imageIndex = images.findIndex(img => img.id === req.params.id);
    
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }
    
    const { title, description } = req.body;
    images[imageIndex] = {
      ...images[imageIndex],
      title: title || images[imageIndex].title,
      description: description || images[imageIndex].description,
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
    const imageIndex = images.findIndex(img => img.id === req.params.id);
    
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }
    
    const image = images[imageIndex];
    
    // Deletar arquivo físico
    const filePath = path.join(process.cwd(), 'server/uploads/images', image.filename);
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
