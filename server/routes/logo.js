
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
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
  }
});

// Obter logo atual
router.get('/', (req, res) => {
  try {
    const settings = readData('settings');
    const logo = settings.find(s => s.key === 'logo');
    res.json(logo || { key: 'logo', value: null });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter logo' });
  }
});

// Upload de logo
router.post('/', authMiddleware, upload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo de logo enviado' });
    }

    const settings = readData('settings');
    const logoIndex = settings.findIndex(s => s.key === 'logo');

    // Se já existe logo, deletar arquivo anterior
    if (logoIndex !== -1 && settings[logoIndex].value) {
      const oldFilename = path.basename(settings[logoIndex].value);
      const oldFilePath = path.join(__dirname, '..', 'uploads', 'logos', oldFilename);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const logoData = {
      key: 'logo',
      value: `/uploads/logos/${req.file.filename}`,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      updatedAt: new Date().toISOString()
    };

    if (logoIndex !== -1) {
      settings[logoIndex] = logoData;
    } else {
      settings.push(logoData);
    }

    writeData('settings', settings);

    res.json({ message: 'Logo atualizado com sucesso', logo: logoData });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer upload do logo' });
  }
});

// Deletar logo
router.delete('/', authMiddleware, (req, res) => {
  try {
    const settings = readData('settings');
    const logoIndex = settings.findIndex(s => s.key === 'logo');
    
    if (logoIndex === -1) {
      return res.status(404).json({ error: 'Logo não encontrado' });
    }
    
    const logo = settings[logoIndex];
    
    // Deletar arquivo físico
    if (logo.filename) {
      const filePath = path.join(__dirname, '..', 'uploads', 'logos', logo.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    settings[logoIndex] = { key: 'logo', value: null };
    writeData('settings', settings);
    
    res.json({ message: 'Logo removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover logo' });
  }
});

export default router;
