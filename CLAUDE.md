# Atender.adv — Site institucional

## O que é

Landing page única (site estático, sem build), também instalável como PWA em
celular e desktop, que apresenta as três plataformas Atender.adv e captura
pedidos de orçamento para sites/apps sob medida.

## Estrutura

```
index.html           # página única: header, hero, soluções, diferenciais, form, rodapé
css/style.css        # todo o CSS (tema dark, gradiente roxo/azul, responsivo)
js/script.js         # menu mobile, animações, envio do form, registro do SW e instalação PWA
api/contact.js       # Vercel Serverless Function — envia o form por e-mail via Resend
manifest.webmanifest # metadados do PWA (ícones, cores, display standalone, atalhos)
sw.js                # Service Worker — cache offline (network-first navegação, cache-first assets)
offline.html          # fallback exibido sem conexão e sem cache
icons/                # ícones PWA (192/512/512-maskable/apple-touch/favicon)
scripts/generate-icons.js # gera os PNGs em /icons via zlib/PNG puro (sem libs externas)
.env.example          # modelo de env var (RESEND_API_KEY) — nunca commitar a chave real
README.md             # instruções de setup/deploy/PWA
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

## PWA

- Instalável (Android/desktop via `beforeinstallprompt` + botão "Instalar app"
  no header; iOS via Compartilhar → Adicionar à Tela de Início).
- `sw.js` cacheia os assets estáticos; **sempre subir `CACHE_NAME` em `sw.js`**
  (ex.: `atender-adv-v2`) ao alterar HTML/CSS/JS, senão usuários com o app
  instalado continuam vendo a versão antiga.
- Ícones são gerados, não desenhados — se houver logo definitivo da marca no
  futuro, substituir os arquivos em `/icons` e não é mais necessário rodar
  `scripts/generate-icons.js`.

## Pendências conhecidas

- [ ] Configurar `RESEND_API_KEY` nas env vars do projeto na Vercel (ver README.md)
- [ ] Sem número de WhatsApp cadastrado — não adicionar botão flutuante de WhatsApp
      sem confirmar o número com o usuário antes
- [ ] Domínio próprio (ex.: www.atender.adv.br) ainda não apontado — hoje só a URL
      gerada pela Vercel
