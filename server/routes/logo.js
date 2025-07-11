
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
    const logos = readData('logos');
    const currentLogo = logos.find(logo => logo.active === true);
    
    if (!currentLogo) {
      return res.status(404).json({ error: 'Nenhum logo ativo encontrado' });
    }
    
    res.json(currentLogo);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar logo' });
  }
});

// Upload de logo
router.post('/', authMiddleware, upload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo de logo enviado' });
    }

    const logos = readData('logos');
    
    // Desativar logos anteriores
    logos.forEach(logo => {
      logo.active = false;
    });

    const logoData = {
      id: Date.now().toString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/logos/${req.file.filename}`,
      size: req.file.size,
      active: true,
      uploadedAt: new Date().toISOString()
    };

    logos.push(logoData);
    writeData('logos', logos);

    res.json({ message: 'Logo enviado com sucesso', logo: logoData });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer upload do logo' });
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
    
    // Deletar arquivo físico
    const filePath = path.join(process.cwd(), 'server/uploads/logos', logo.filename);
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

export default router;uter;
