import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initializeData } from "./data/store.js";
import dotenv from "dotenv";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: [
      // Frontend principal na Vercel
      "https://painel-admin-frontend.vercel.app",
      // Todos os domínios de preview do Vercel (branches, PRs, etc)
      /^https:\/\/painel-admin-frontend-.*\.vercel\.app$/,
      // Localhost para desenvolvimento
      "http://localhost:3000",
      "http://localhost:5173",
      // IP do backend (acesso direto)
      "http://212.85.10.205",
      "https://212.85.10.205",
      // Outros domínios que você queira permitir podem ser adicionados aqui
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Criar diretórios necessários
const uploadDirs = [
  "uploads",
  "uploads/logos",
  "uploads/videos",
  "uploads/images",
];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Rota de health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend está funcionando!",
    timestamp: new Date().toISOString(),
  });
});

// Debug middleware para todas as requisições - DEVE VIR ANTES DAS ROTAS
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  console.log(`📨 Headers:`, JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📨 Body:`, JSON.stringify(req.body, null, 2));
  }
  next();
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

// Rota de teste para debug
app.get("/api", (req, res) => {
  res.json({
    message: "API está funcionando!",
    rotas_disponiveis: [
      "POST /api/auth/login",
      "GET /api/auth/verify",
      "GET /api/health",
      "GET /api/logo",
      "GET /api/settings",
      "GET /api/users",
      "GET /api/dashboard",
      "GET /api/images",
      "GET /api/videos",
      "GET /api/content",
      "GET /api/blocks",
      "GET /api/forms",
      "GET /api/content/landing",
      "GET /api/content/landing/:slug",
      "PUT /api/content/landing/:slug",
      "DELETE /api/content/landing/:slug",
    ],
  });
});

// Rota raiz para deployment
app.get("/", (req, res) => {
  res.json({
    message: "Painel Admin Backend está funcionando!",
    status: "OK",
    api_endpoint: "/api",
    rotas_disponiveis: [
      "POST /api/auth/login",
      "GET /api/auth/verify",
      "GET /api/health",
      "GET /api/logo",
      "GET /api/settings",
      "GET /api/users",
      "GET /api/dashboard",
      "GET /api/images",
      "GET /api/videos",
      "GET /api/content",
      "GET /api/blocks",
      "GET /api/forms",
      "GET /api/content/landing",
      "GET /api/content/landing/:slug",
      "PUT /api/content/landing/:slug",
      "DELETE /api/content/landing/:slug",
    ],
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error("Erro detalhado:", err);

  // Tratar erro específico do path-to-regexp
  if (err.message && err.message.includes("Missing parameter name")) {
    return res.status(400).json({
      error: "Erro na definição da rota",
      message: "Parâmetro de rota mal formatado",
    });
  }

  res.status(500).json({
    error: "Algo deu errado!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Erro interno do servidor",
  });
});

// ROTA 404 CATCH-ALL — FORMA MAIS SEGURA PARA EXPRESS 5+
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// Inicializar dados e iniciar servidor
const startServer = async () => {
  try {
    await initializeData();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 API disponível em http://0.0.0.0:${PORT}/api`);
      console.log(
      );
      console.log(
      );
      console.log(
        `🌐 Acesso pelo IP: http://212.85.10.205:${PORT}/api`
      );
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error);
    process.exit(1);
  }
};

export default app;
export { startServer };
