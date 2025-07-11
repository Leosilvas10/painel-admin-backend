
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "json");

// Garantir que o diretório de dados existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Função para ler dados
export const readData = (type) => {
  try {
    const filePath = path.join(DATA_DIR, `${type}.json`);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erro ao ler dados de ${type}:`, error);
    return [];
  }
};

// Função para escrever dados
export const writeData = (type, data) => {
  try {
    const filePath = path.join(DATA_DIR, `${type}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Erro ao escrever dados de ${type}:`, error);
    return false;
  }
};

// Função para inicializar dados padrão
export const initializeData = async () => {
  try {
    console.log("🔄 Inicializando dados do sistema...");

    // Inicializar usuários
    const users = readData("users");
    if (users.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const adminUser = {
        id: "1",
        username: "admin",
        email: "admin@sistema.com",
        password: hashedPassword,
        role: "admin",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      writeData("users", [adminUser]);
      console.log("✅ Usuário admin padrão criado");
    }

    // Inicializar outros tipos de dados se não existirem
    const dataTypes = ["contents", "logos", "videos", "images", "blocks", "forms", "settings"];
    
    dataTypes.forEach((type) => {
      const data = readData(type);
      if (data.length === 0) {
        writeData(type, []);
        console.log(`✅ Arquivo ${type}.json inicializado`);
      }
    });

    console.log("✅ Inicialização de dados concluída");
  } catch (error) {
    console.error("❌ Erro ao inicializar dados:", error);
  }
};
