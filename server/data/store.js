
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'json');

// Criar diretório de dados se não existir
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultData = {
  settings: {
    title: "Consórcio Imobiliário Banco Jota",
    description: "Casa própria sem juros",
    whatsapp: "5511999999999",
    email: "contato@bancojota.com.br",
    metaTitle: "SEO Title",
    metaDescription: "SEO Description"
  },
  blocks: [],
  videos: [],
  images: [],
  forms: [],
  users: [],
  submissions: [],
  logo: {},
  sections: {
    hero: {
      title: "Realize o Sonho da Casa Própria",
      subtitle: "Sem Juros",
      description: "Consórcio imobiliário..."
    }
  }
};

const readData = (filename) => {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return defaultData[filename] || {};
  } catch (error) {
    console.error(`Erro ao ler ${filename}:`, error);
    return defaultData[filename] || {};
  }
};

const writeData = (filename, data) => {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Erro ao escrever ${filename}:`, error);
    return false;
  }
};

module.exports = { readData, writeData };
