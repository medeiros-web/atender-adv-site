// Backend do formulário de orçamento para a hospedagem própria (Docker/Portainer).
// Equivalente a api/contact.js (usado na Vercel), mas como servidor HTTP standalone
// (sem dependências) para rodar em container Node puro. Lê RESEND_API_KEY do ambiente.
const http = require('http');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = process.env.TO_EMAIL || 'medeirosassessor.adv@gmail.com';
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const server = http.createServer((req, res) => {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true }));
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > 1e6) req.destroy();
  });

  req.on('end', async () => {
    let data;
    try {
      data = JSON.parse(body || '{}');
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'JSON inválido' }));
    }

    const { nome, email, whatsapp, tipo, prazo, orcamento_estimado, descricao } = data;

    if (!nome || !email || !whatsapp || !tipo || !descricao) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Campos obrigatórios ausentes.' }));
    }

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY não configurada.');
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Serviço de e-mail não configurado.' }));
    }

    try {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Atender.adv <onboarding@resend.dev>',
          to: [TO_EMAIL],
          reply_to: email,
          subject: `Novo pedido de orçamento — ${nome}`,
          html: `
            <h2>Novo pedido de orçamento</h2>
            <p><strong>Nome:</strong> ${escapeHtml(nome)}</p>
            <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
            <p><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>
            <p><strong>Tipo de projeto:</strong> ${escapeHtml(tipo)}</p>
            <p><strong>Prazo desejado:</strong> ${escapeHtml(prazo || 'Não informado')}</p>
            <p><strong>Orçamento estimado:</strong> ${escapeHtml(orcamento_estimado || 'Não informado')}</p>
            <p><strong>Descrição:</strong><br>${escapeHtml(descricao).replace(/\n/g, '<br>')}</p>
          `,
        }),
      });

      if (!resendResponse.ok) {
        const errBody = await resendResponse.text();
        console.error('Resend error:', errBody);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Falha ao enviar e-mail.' }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erro interno.' }));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`tecnologia_backend ouvindo na porta ${PORT}`));
