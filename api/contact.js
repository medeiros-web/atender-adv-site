// Vercel Serverless Function — envia o formulário de orçamento por e-mail via Resend.
// Requer a env var RESEND_API_KEY configurada no projeto Vercel (Settings > Environment Variables).

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nome, email, whatsapp, tipo, prazo, orcamento_estimado, descricao } = req.body || {};

  if (!nome || !email || !whatsapp || !tipo || !descricao) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY não configurada.');
    return res.status(500).json({ error: 'Serviço de e-mail não configurado.' });
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Atender.adv <onboarding@resend.dev>',
        to: ['medeirosassessor.adv@gmail.com'],
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
      return res.status(502).json({ error: 'Falha ao enviar e-mail.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
