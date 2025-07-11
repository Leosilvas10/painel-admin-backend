import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "json");

// Criar diretório de dados se não existir
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
    console.error(`Erro ao ler ${type}:`, error);
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
    console.error(`Erro ao escrever ${type}:`, error);
    return false;
  }
};

// Inicializar dados padrão
export const initializeData = async () => {
  try {
    // Criar usuário admin padrão se não existir
    const users = readData("users");
    if (users.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const defaultUser = {
        id: "1",
        username: "admin",
        email: "admin@admin.com",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      writeData("users", [defaultUser]);
      console.log("✅ Usuário admin padrão criado");
    }

    // Inicializar outros tipos de dados se não existirem
    const dataTypes = [
      "videos",
      "images",
      "contents",
      "blocks",
      "settings",
      "forms",
      "logos",
    ];
    dataTypes.forEach((type) => {
      if (readData(type).length === 0) {
        writeData(type, []);
      }
    });

    console.log("✅ Dados inicializados com sucesso");
  } catch (error) {
    console.error("❌ Erro ao inicializar dados:", error);
  }
};
