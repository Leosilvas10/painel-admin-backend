import { startServer } from "./app.js";

console.log("🔄 Iniciando servidor...");
startServer().catch((error) => {
  console.error("❌ Erro fatal:", error);
  process.exit(1);
});
