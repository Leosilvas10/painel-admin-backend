
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');
const { readData, writeData } = require('../data/store');

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
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// Upload da nova logo
router.post('/upload', authMiddleware, upload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const logoData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/logos/${req.file.filename}`,
      uploadedAt: new Date().toISOString()
    };

    // Remover logo anterior se existir
    const currentLogo = readData('logo');
    if (currentLogo.filename) {
      const oldPath = path.join(__dirname, '../uploads/logos/', currentLogo.filename);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    writeData('logo', logoData);

    res.json({
      message: 'Logo enviada com sucesso',
      logo: logoData
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer upload da logo' });
  }
});

// Obter logo atual
router.get('/', (req, res) => {
  try {
    const logo = readData('logo');
    res.json(logo);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter logo' });
  }
});

// Excluir logo atual
router.delete('/', authMiddleware, (req, res) => {
  try {
    const logo = readData('logo');
    
    if (logo.filename) {
      const filePath = path.join(__dirname, '../uploads/logos/', logo.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    writeData('logo', {});
    res.json({ message: 'Logo excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir logo' });
  }
});

module.exports = router;
