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
api/contact.js       # Vercel Serverless Function — envia o form por e-mail via Resend (deploy Vercel)
manifest.webmanifest # metadados do PWA (ícones, cores, display standalone, atalhos)
sw.js                # Service Worker — cache offline (network-first navegação, cache-first assets)
offline.html          # fallback exibido sem conexão e sem cache
icons/                # ícones PWA (192/512/512-maskable/apple-touch/favicon)
scripts/generate-icons.js # gera os PNGs em /icons via zlib/PNG puro (sem libs externas)
docker/nginx.conf     # nginx do deploy Portainer: serve estático + proxy /api/ -> backend
docker/server.js      # backend Node puro (equivalente ao api/contact.js) do deploy Portainer
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

**Duas hospedagens ativas em paralelo, ambas a partir do mesmo `main` — manter as duas funcionando.**

- **Git remoto:** github.com/medeiros-web/atender-adv-site

### Vercel
- Projeto na team `medeiros-assessoria-s-projects` (team_oBYxdKZ4hmVessNfbIOSblS1)
- Site estático — framework "Other" no Vercel, sem build command
- Auto-deploy a cada push no `main` (projetos `atender-adv-site` e `atender-adv-site-t28m`, duplicados — mantidos por decisão do usuário)
- URL: atender-adv-site.vercel.app
- Backend do form: `api/contact.js` (Vercel Serverless Function)

### Portainer / Docker Swarm (chatatender.ia.br)
- Portainer: `portainer.chatatender.ia.br` (endpoint `primary`, id 1), rede `minha_rede`, Traefik `certresolver=letsencryptresolver`
- Stack lógico `tecnologia` (label `com.docker.stack.namespace=tecnologia`), dois serviços Swarm criados via API do Docker (não é um stack do Portainer no sentido de compose — services soltos com o label de namespace):
  - `tecnologia_frontend` — `nginx:alpine`, arquivos estáticos injetados via **Docker Configs** (imutáveis — ver README.md para o processo de atualização), domínio **tecnologia.chatatender.ia.br**, proxy interno `/api/` → `tecnologia_backend`
  - `tecnologia_backend` — `node:20-alpine`, roda `docker/server.js` (Config montado em `/app/server.js`), domínio **tecnologiaapi.chatatender.ia.br**, env `RESEND_API_KEY`/`TO_EMAIL`/`CORS_ORIGIN`/`PORT` no Service Spec
- **Ao editar HTML/CSS/JS/ícones: replicar a mudança nos dois deploys.** Vercel é automático (push); Portainer exige criar novos Docker Configs e atualizar os services (processo documentado no README.md) — perguntar ao usuário se quer que isso seja feito a cada mudança ou só quando pedido.

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
