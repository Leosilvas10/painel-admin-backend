
import app from './app.js';
import { initializeData } from './data/store.js';

const PORT = process.env.PORT || 3000;

// Inicializar dados
initializeData();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor do painel admin iniciado na porta ${PORT}`);
  console.log(`📡 Servidor disponível em: http://0.0.0.0:${PORT}`);
  console.log('📝 Usuário padrão: admin');
  console.log('🔑 Senha padrão: admin123');
  console.log('⚠️  ALTERE AS CREDENCIAIS EM PRODUÇÃO!');
});
