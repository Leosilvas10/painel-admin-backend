// Configuração CORS atualizada
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://212.85.10.205:3000",
    "https://www.bancojota.com.br",
    "https://bancojota.com.br",
    "https://www.jotasolucoes.com.br",
    "https://jotasolucoes.com.br",
    "https://api.jotasolucoes.com.br",
    "http://api.jotasolucoes.com.br",
    "https://www.metodocor.com.br",
    "https://metodocor.com.br"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cache-Control']
}));
