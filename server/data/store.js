
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'json');

// Garantir que o diretório existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Função para ler dados
export function readData(filename) {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  
  if (!fs.existsSync(filePath)) {
    return [];
  }
  
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erro ao ler arquivo ${filename}:`, error);
    return [];
  }
}

// Função para escrever dados
export function writeData(filename, data) {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Erro ao escrever arquivo ${filename}:`, error);
    return false;
  }
}

// Função para inicializar dados padrão
export function initializeData() {
  const files = [
    'users',
    'videos',
    'images',
    'logos',
    'blocks',
    'settings',
    'content',
    'forms',
    'submissions'
  ];
  
  files.forEach(filename => {
    const data = readData(filename);
    if (data.length === 0) {
      writeData(filename, []);
    }
  });
  
  // Criar usuário admin padrão se não existir
  const users = readData('users');
  if (users.length === 0) {
    const defaultUser = {
      id: '1',
      username: 'admin',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
      role: 'admin',
      email: 'admin@example.com',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    writeData('users', [defaultUser]);
  }
}
