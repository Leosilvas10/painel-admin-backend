
import { useState, useEffect } from 'react';

const LandingEditor = () => {
  const [landingData, setLandingData] = useState({
    title: '',
    subtitle: '',
    cta: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API_BASE = 'https://painel-admin-backend-leonardosilvas2.replit.app/api';

  // Buscar dados atuais
  const fetchLandingData = async () => {
    try {
      const response = await fetch(`${API_BASE}/content/landing/banco-jota`);
      const result = await response.json();
      
      if (response.ok) {
        setLandingData(result.data);
      } else {
        setMessage('Erro ao carregar dados: ' + result.error);
      }
    } catch (error) {
      setMessage('Erro de conexão: ' + error.message);
    }
  };

  // Salvar alterações
  const saveLandingData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/content/landing/banco-jota`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(landingData)
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('✅ Landing page atualizada com sucesso!');
        setLandingData(result.data);
      } else {
        setMessage('❌ Erro ao salvar: ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Erro de conexão: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados ao montar componente
  useEffect(() => {
    fetchLandingData();
  }, []);

  const handleInputChange = (field, value) => {
    setLandingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>🏦 Editor - Landing Page Banco Jota</h2>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Título Principal:
        </label>
        <input
          type="text"
          value={landingData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
          placeholder="Ex: Bem-vindo ao Banco Jota"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Subtítulo:
        </label>
        <input
          type="text"
          value={landingData.subtitle}
          onChange={(e) => handleInputChange('subtitle', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
          placeholder="Ex: Soluções financeiras para sua vida"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Call to Action (Botão):
        </label>
        <input
          type="text"
          value={landingData.cta}
          onChange={(e) => handleInputChange('cta', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
          placeholder="Ex: Abra sua conta agora!"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Descrição:
        </label>
        <textarea
          value={landingData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={5}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px',
            resize: 'vertical'
          }}
          placeholder="Descrição detalhada dos serviços e benefícios..."
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={saveLandingData}
          disabled={loading}
          style={{
            background: loading ? '#ccc' : '#007bff',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? 'Salvando...' : '💾 Salvar Alterações'}
        </button>

        <button
          onClick={fetchLandingData}
          style={{
            background: '#6c757d',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          🔄 Recarregar
        </button>
      </div>

      {message && (
        <div style={{
          padding: '15px',
          borderRadius: '5px',
          background: message.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          color: message.includes('✅') ? '#155724' : '#721c24'
        }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
        <h4>📋 Preview dos Dados:</h4>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(landingData, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#e7f3ff', borderRadius: '5px' }}>
        <h4>🔗 API Info:</h4>
        <p><strong>Endpoint:</strong> {API_BASE}/content/landing/banco-jota</p>
        <p><strong>Última atualização:</strong> {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default LandingEditor;
