
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

// Configuração do multer para upload de vídeos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/videos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de vídeo são permitidos'));
    }
  }
});

// Listar vídeos
router.get('/', authMiddleware, (req, res) => {
  try {
    const videos = readData('videos');
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar vídeos' });
  }
});

// Upload de vídeo
router.post('/', authMiddleware, upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo de vídeo enviado' });
    }

    const videos = readData('videos');
    const { title, description } = req.body;

    const videoData = {
      id: Date.now().toString(),
      title: title || req.file.originalname,
      description: description || '',
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/videos/${req.file.filename}`,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    videos.push(videoData);
    writeData('videos', videos);

    res.json({ message: 'Vídeo enviado com sucesso', video: videoData });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer upload do vídeo' });
  }
});

// Obter vídeo por ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const videos = readData('videos');
    const video = videos.find(v => v.id === req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }
    
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter vídeo' });
  }
});

// Atualizar vídeo
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const videos = readData('videos');
    const videoIndex = videos.findIndex(v => v.id === req.params.id);
    
    if (videoIndex === -1) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }
    
    const { title, description } = req.body;
    videos[videoIndex] = {
      ...videos[videoIndex],
      title: title || videos[videoIndex].title,
      description: description || videos[videoIndex].description,
      updatedAt: new Date().toISOString()
    };
    
    writeData('videos', videos);
    res.json({ message: 'Vídeo atualizado com sucesso', video: videos[videoIndex] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar vídeo' });
  }
});

// Deletar vídeo
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const videos = readData('videos');
    const videoIndex = videos.findIndex(v => v.id === req.params.id);
    
    if (videoIndex === -1) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }
    
    const video = videos[videoIndex];
    
    // Deletar arquivo físico
    const filePath = path.join(__dirname, '..', 'uploads', 'videos', video.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    videos.splice(videoIndex, 1);
    writeData('videos', videos);
    
    res.json({ message: 'Vídeo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar vídeo' });
  }
});

export default router;
