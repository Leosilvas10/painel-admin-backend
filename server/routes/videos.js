
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');
const { readData, writeData } = require('../data/store');

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
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|wmv|flv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('video/');

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas vídeos são permitidos'));
    }
  }
});

// Upload de vídeo
router.post('/upload', authMiddleware, upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const { title, description } = req.body;
    const videos = readData('videos');
    
    const videoData = {
      id: Date.now().toString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      title: title || req.file.originalname,
      description: description || '',
      path: `/uploads/videos/${req.file.filename}`,
      size: req.file.size,
      uploadedAt: new Date().toISOString()
    };

    videos.push(videoData);
    writeData('videos', videos);

    res.json({
      message: 'Vídeo enviado com sucesso',
      video: videoData
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer upload do vídeo' });
  }
});

// Listar todos os vídeos
router.get('/', (req, res) => {
  try {
    const videos = readData('videos');
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar vídeos' });
  }
});

// Obter vídeo específico
router.get('/:id', (req, res) => {
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

// Atualizar metadados do vídeo
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
    res.json({
      message: 'Vídeo atualizado com sucesso',
      video: videos[videoIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar vídeo' });
  }
});

// Excluir vídeo
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const videos = readData('videos');
    const videoIndex = videos.findIndex(v => v.id === req.params.id);
    
    if (videoIndex === -1) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }

    const video = videos[videoIndex];
    const filePath = path.join(__dirname, '../uploads/videos/', video.filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    videos.splice(videoIndex, 1);
    writeData('videos', videos);

    res.json({ message: 'Vídeo excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir vídeo' });
  }
});

module.exports = router;
