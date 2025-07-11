
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeData } from './data/store.js';

// Importar rotas
import authRoutes from './routes/auth.js';
import logoRoutes from './routes/logo.js';
import videoRoutes from './routes/videos.js';
import contentRoutes from './routes/content.js';
import blockRoutes from './routes/blocks.js';
import settingsRoutes from './routes/settings.js';
import imageRoutes from './routes/images.js';
import formRoutes from './routes/forms.js';
import userRoutes from './routes/users.js';
import dashboardRoutes from './routes/dashboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Criar diretórios necessários
const uploadDirs = ['uploads', 'uploads/logos', 'uploads/videos', 'uploads/images'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/logo', logoRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro detalhado:', err);
  
  // Tratar erro específico do path-to-regexp
  if (err.message && err.message.includes('Missing parameter name')) {
    return res.status(400).json({ 
      error: 'Erro na definição da rota',
      message: 'Parâmetro de rota mal formatado'
    });
  }
  
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

// Rota 404
app.use('/*splat', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicializar dados e iniciar servidor
const startServer = async () => {
  try {
    await initializeData();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 API disponível em http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

export default app;
export { startServer };
