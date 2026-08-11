# Atender.adv — Site institucional

## O que é

Landing page única (site estático, sem build) que apresenta as três plataformas
Atender.adv e captura pedidos de orçamento para sites/apps sob medida.

## Estrutura

```
index.html      # página única: header, hero, soluções, diferenciais, form de orçamento, rodapé
css/style.css   # todo o CSS (tema dark, gradiente roxo/azul, responsivo)
js/script.js    # menu mobile, animações de scroll, envio do form (JSON) para /api/contact
api/contact.js  # Vercel Serverless Function — envia o form por e-mail via Resend
.env.example    # modelo de env var (RESEND_API_KEY) — nunca commitar a chave real
README.md       # instruções de setup/deploy
```

Sem framework, sem bundler, sem dependências de build — qualquer edição em
`index.html`/`css/style.css`/`js/script.js` já reflete direto no navegador.

## Plataformas divulgadas (não editar URLs sem confirmar com o usuário)

| Plataforma | URL |
|---|---|
| Criação de Sites e Apps com IA (Lovable) | https://lovablezheus.atender.adv.br/landing |
| Atendimento — Chat | https://chat.atender.adv.br/ |
| Atendimento — Painel | https://painel.atender.adv.br/landing |
| Agente de IA | https://bot.atender.adv.br/ |

## Formulário de orçamento

Envia por e-mail via [Resend](https://resend.com) através de uma Vercel
Serverless Function (`api/contact.js`). O front (`js/script.js`) faz POST em
JSON para `/api/contact`; a function chama a API do Resend usando
`process.env.RESEND_API_KEY` (nunca hardcoded no código).
Destino do e-mail: medeirosassessor.adv@gmail.com.
Remetente atual: `onboarding@resend.dev` (domínio de teste do Resend, sem
verificação — trocar por domínio próprio quando verificado em resend.com/domains).

**Importante:** a `RESEND_API_KEY` deve ser configurada apenas como env var no
painel da Vercel (Project Settings → Environment Variables) ou em `.env.local`
local (git-ignorado). Nunca colar a chave em arquivos versionados.

## Infraestrutura de deploy

- **Git remoto:** github.com/medeiros-web/atender-adv-site
- **Hospedagem:** Vercel, projeto na team `medeiros-assessoria-s-projects`
  (team_oBYxdKZ4hmVessNfbIOSblS1)
- Site estático — framework "Other" no Vercel, sem build command.

## Convenções de estilo já estabelecidas

- Tema dark (`#0b0d14`), gradiente de destaque roxo→azul (`#8b5cf6` → `#3b82f6`)
- Fonte Inter (Google Fonts)
- BEM-like class naming (`.card__icon`, `.btn--primary`, etc.)
- Sem emojis no HTML exceto nos ícones de "Diferenciais" (decorativos, já aprovados)
- Responder sempre em português do Brasil

## Pendências conhecidas

- [ ] Configurar `RESEND_API_KEY` nas env vars do projeto na Vercel (ver README.md)
- [ ] Sem número de WhatsApp cadastrado — não adicionar botão flutuante de WhatsApp
      sem confirmar o número com o usuário antes
- [ ] Domínio próprio (ex.: www.atender.adv.br) ainda não apontado — hoje só a URL
      gerada pela Vercel
