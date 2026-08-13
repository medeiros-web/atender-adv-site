# Atender.adv — Site institucional

Site estático (HTML/CSS/JS, sem build) que apresenta as plataformas Atender.adv
e coleta pedidos de orçamento para sites/apps sob medida, com envio automático
de e-mail via Resend.

## Estrutura

```
index.html          # página única (hero, soluções, diferenciais, formulário, rodapé)
css/style.css       # estilos
js/script.js        # menu mobile, animações, envio do formulário, PWA (SW + instalação)
api/contact.js      # Vercel Serverless Function — recebe o form e envia e-mail via Resend (deploy Vercel)
manifest.webmanifest # metadados do PWA (ícones, cores, atalhos)
sw.js               # Service Worker — cache offline dos assets estáticos
offline.html        # página exibida quando não há conexão e nada em cache
icons/               # ícones do PWA (gerados por scripts/generate-icons.js)
scripts/generate-icons.js # gera os PNGs em /icons sem dependências externas
docker/nginx.conf    # config do nginx usado no deploy Portainer (serve estático + proxy /api/)
docker/server.js     # backend standalone (Node puro) equivalente ao api/contact.js, para o deploy Portainer
.env.example        # modelo da variável de ambiente necessária
```

O site tem **dois deploys ativos em paralelo**, ambos a partir do mesmo `main`:

| Deploy | Frontend | Backend do formulário |
|---|---|---|
| Vercel | atender-adv-site.vercel.app | `api/contact.js` (Serverless Function) |
| Portainer/Docker | tecnologia.chatatender.ia.br | `docker/server.js` (container Node, atrás de tecnologiaapi.chatatender.ia.br) |

## Rodar localmente

O `api/contact.js` só funciona com o runtime da Vercel. Para testar o site
completo (front + função serverless) localmente:

```bash
npm i -g vercel
vercel dev
```

Crie um `.env.local` (não versionado) com base em `.env.example`, preenchendo
`RESEND_API_KEY` com a chave real.

Para editar só o visual, sem testar o envio de e-mail, basta abrir `index.html`
no navegador ou rodar `npx serve .`.

## Envio de e-mail (Resend)

O formulário de orçamento faz POST em `/api/contact`, que envia o e-mail para
`medeirosassessor.adv@gmail.com` usando a API do [Resend](https://resend.com).

**Configuração necessária na Vercel** (Project Settings → Environment Variables):

| Nome | Valor |
|---|---|
| `RESEND_API_KEY` | sua chave da conta Resend (começa com `re_`) |

A chave **nunca** deve ser colocada diretamente no código — só como env var no
painel da Vercel (e em `.env.local` localmente, que está no `.gitignore`).

O remetente atual é `onboarding@resend.dev` (domínio de teste do Resend, funciona
sem verificação). Para enviar com um domínio próprio (ex.: `contato@atender.adv.br`),
verifique o domínio em resend.com/domains e troque o campo `from` em `api/contact.js`.

## PWA (instalável em celular e desktop)

O site é um Progressive Web App: pode ser instalado (ícone na tela inicial /
lista de apps) e funciona offline para as páginas já visitadas.

- **Instalar (Android/Desktop Chrome/Edge):** aparece um botão "Instalar app"
  no cabeçalho quando o navegador considera o site instalável, ou use o menu
  do navegador → "Instalar Atender.adv" / ícone de instalação na barra de endereço.
- **Instalar (iOS Safari):** compartilhar → "Adicionar à Tela de Início"
  (o iOS não dispara o prompt automático, mas o site já está configurado com
  `apple-touch-icon` e `apple-mobile-web-app-capable` para abrir em tela cheia).
- **Offline:** o Service Worker (`sw.js`) cacheia os arquivos estáticos; se o
  usuário abrir o app sem internet, é exibida `offline.html`. Chamadas à API
  (`/api/contact`) nunca são cacheadas.
- **Trocar os ícones:** regenere com `node scripts/generate-icons.js` após
  editar o script, ou substitua os arquivos em `/icons` diretamente por um
  logo definitivo (mantendo os nomes/tamanhos usados no `manifest.webmanifest`).
- **Atualizar o cache depois de mudar CSS/JS/HTML:** suba a constante
  `CACHE_NAME` em `sw.js` (ex.: `atender-adv-v2`) — sem isso, usuários que já
  instalaram o app podem continuar vendo a versão antiga em cache por um tempo.

## Pendências (TODO)

- [ ] Configurar `RESEND_API_KEY` nas variáveis de ambiente do projeto na Vercel.
- [ ] (Opcional) Verificar domínio próprio no Resend e trocar o remetente.
- [ ] Se quiser botão de WhatsApp flutuante, adicionar número real (não incluído por padrão).
- [ ] Trocar favicon/logo genérico por identidade visual definitiva, se houver.

## Deploy

Repositório: github.com/medeiros-web/atender-adv-site

### Vercel

Importar o repositório em vercel.com/new (framework "Other"). Auto-deploy a
cada push no `main`. URL: **atender-adv-site.vercel.app**.

### Portainer / Docker Swarm (chatatender.ia.br)

Site espelhado no servidor Docker Swarm do ChatAtender (Portainer em
`portainer.chatatender.ia.br`, endpoint `primary`, rede `minha_rede`,
Traefik com `certresolver=letsencryptresolver`). Dois serviços, agrupados
sob o label `com.docker.stack.namespace=tecnologia`:

| Serviço | Imagem | Domínio | O que faz |
|---|---|---|---|
| `tecnologia_frontend` | `nginx:alpine` | tecnologia.chatatender.ia.br | Serve os arquivos estáticos (via Docker Configs) + faz proxy interno de `/api/` para o backend |
| `tecnologia_backend` | `node:20-alpine` | tecnologiaapi.chatatender.ia.br | Roda `docker/server.js`, envia e-mail via Resend (env `RESEND_API_KEY`) |

Cada arquivo estático (`index.html`, `css/style.css`, `js/script.js`,
`manifest.webmanifest`, `sw.js`, `offline.html`, ícones, `docker/nginx.conf`)
foi injetado como um **Docker Config** individual (não há build de imagem —
usa a imagem oficial `nginx:alpine` "crua"). `docker/server.js` também entra
como Config, montado em `/app/server.js` no container `node:20-alpine`.

**Importante — Docker Configs são imutáveis.** Para atualizar o site nesse
deploy depois de mudar HTML/CSS/JS/ícones:
1. Criar um novo Config com o conteúdo atualizado (nome novo, ex.: sufixo `-v2`).
2. Atualizar o serviço (`tecnologia_frontend` ou `tecnologia_backend`) para
   trocar o Config antigo pelo novo no mesmo caminho de destino — pela API
   Docker (`POST /services/{id}/update`) ou pela UI do Portainer
   (Services → editar → trocar o Config na aba correspondente).
3. Remover o Config antigo depois de confirmar que o novo está em uso
   (`DELETE /configs/{id}`), para não acumular lixo.

Variáveis de ambiente do `tecnologia_backend` (`RESEND_API_KEY`, `TO_EMAIL`,
`CORS_ORIGIN`, `PORT`) ficam no próprio Service Spec e podem ser editadas
direto pela UI do Portainer (Services → tecnologia_backend → editar).
