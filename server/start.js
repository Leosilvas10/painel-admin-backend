
import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor do painel admin iniciado na porta ${PORT}`);
  console.log('📝 Usuário padrão: admin');
  console.log('🔑 Senha padrão: admin123');
  console.log('⚠️  ALTERE AS CREDENCIAIS EM PRODUÇÃO!');
});
