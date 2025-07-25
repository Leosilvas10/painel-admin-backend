import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initializeData } from "./server/data/store.js";
import logger from "./server/middleware/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Importar rotas
import authRoutes from "./routes/auth.js";
import logoRoutes from "./routes/logo.js";
import videoRoutes from "./routes/videos.js";
import contentRoutes from "./routes/content.js";
import blockRoutes from "./routes/blocks.js";
import settingsRoutes from "./routes/settings.js";
import imageRoutes from "./routes/images.js";
import formRoutes from "./routes/forms.js";
import userRoutes from "./routes/users.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();
const PORT = process.env.PORT || 3000;

// CORS APENAS para SEU servidor
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000", 
    "http://212.85.10.205:3000",
    "https://www.bancojota.com.br",
    "https://www.jotasolucoes.com.br",
    "https://www.metodocor.com.br"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
}));

app.options('/*path', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(logger);

// Criar diretórios de upload
const uploadDirs = ["uploads", "uploads/logos", "uploads/videos", "uploads/images"];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend funcionando perfeitamente!",
    server: "212.85.10.205:3000",
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/logo", logoRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/blocks", blockRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

// API info
app.get("/api", (req, res) => {
  res.json({
    message: "API funcionando - SERVIDOR: 212.85.10.205:3000",
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use("/*catchall", (req, res) => {
  res.status(404).json({ 
    error: "Rota não encontrada",
    server: "212.85.10.205:3000",
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Erro:", err);
  res.status(500).json({ 
    error: "Erro interno",
    server: "212.85.10.205:3000"
  });
});

const startServer = async () => {
  try {
    await initializeData();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 SERVIDOR RODANDO: 212.85.10.205:${PORT}`);
      console.log(`📡 API: http://212.85.10.205:${PORT}/api`);
      console.log("🌐 CORS CONFIGURADO APENAS PARA SEU SERVIDOR!");
      console.log("❌ REPLIT COMPLETAMENTE REMOVIDO!");
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar:", error);
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export default app;
export { startServer };

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('🚨 Erro não capturado:', error);
  // Não encerrar o processo, apenas logar
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Promise rejeitada:', reason);
  // Não encerrar o processo, apenas logar
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido, encerrando graciosamente...');
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recebido, encerrando graciosamente...');
});
