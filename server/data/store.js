
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'json');

// Verificar se o diretório existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Estrutura padrão dos dados
const defaultData = {
  users: [],
  settings: {
    siteName: 'Meu Site',
    siteDescription: 'Descrição do meu site',
    contactEmail: 'contato@meusite.com',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    theme: 'light',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  images: [],
  videos: [],
  logos: [],
  content: [],
  blocks: [],
  forms: []
};

// Função para ler dados de um arquivo
export const readData = (collection) => {
  try {
    const filePath = path.join(DATA_DIR, `${collection}.json`);
    
    if (!fs.existsSync(filePath)) {
      // Se o arquivo não existe, retorna dados padrão
      const data = defaultData[collection] || [];
      writeData(collection, data);
      return data;
    }
    
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Erro ao ler dados de ${collection}:`, error);
    return defaultData[collection] || [];
  }
};

// Função para escrever dados em um arquivo
export const writeData = (collection, data) => {
  try {
    const filePath = path.join(DATA_DIR, `${collection}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Erro ao escrever dados de ${collection}:`, error);
    return false;
  }
};

// Função para inicializar dados padrão
export const initializeData = async () => {
  console.log('🗃️ Inicializando dados...');
  
  try {
    // Inicializar cada coleção
    Object.keys(defaultData).forEach(collection => {
      const data = readData(collection);
      console.log(`✅ ${collection}: ${Array.isArray(data) ? data.length : 'configurado'} item(s)`);
    });

    // Criar usuário admin padrão se não existir
    const users = readData('users');
    if (users.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = {
        id: '1',
        username: 'admin',
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      users.push(adminUser);
      writeData('users', users);
      console.log('👤 Usuário admin criado');
      console.log('📧 Email: admin@admin.com');
      console.log('🔑 Senha: admin123');
    }

    console.log('✅ Dados inicializados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar dados:', error);
    throw error;
  }
};

// Função para backup dos dados
export const backupData = () => {
  try {
    const backupDir = path.join(DATA_DIR, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

    const allData = {};
    Object.keys(defaultData).forEach(collection => {
      allData[collection] = readData(collection);
    });

    fs.writeFileSync(backupFile, JSON.stringify(allData, null, 2));
    console.log(`✅ Backup criado: ${backupFile}`);
    return backupFile;
  } catch (error) {
    console.error('❌ Erro ao criar backup:', error);
    return null;
  }
};
