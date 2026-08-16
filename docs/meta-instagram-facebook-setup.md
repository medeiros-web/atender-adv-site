# Publicação automática no Instagram/Facebook — guia passo a passo

Objetivo: conectar o Atender.adv ao Instagram/Facebook via API oficial do Meta,
para que o workflow de marketing (n8n) possa publicar automaticamente — em vez
de só mandar o rascunho pra revisão no WhatsApp.

**Você faz os cliques nas telas do Meta (login, permissões); eu configuro o n8n
depois que você tiver o token.** Esse processo não pode ser automatizado por um
agente porque exige login real e confirmação humana em cada etapa.

## Pré-requisitos

- [ ] Uma **Página do Facebook** (não é o perfil pessoal) para o Atender.adv
- [ ] O Instagram configurado como **conta profissional/comercial** (não pessoal)
- [ ] O Instagram **vinculado** a essa Página do Facebook
- [ ] Você precisa ser administrador da Página

Se o Instagram ainda for conta pessoal: app do Instagram → Configurações →
Conta → "Mudar para conta profissional" → escolher "Empresa" → vincular a uma
Página do Facebook (cria uma nova se não tiver).

## Passo 1 — Criar o App no Meta for Developers

1. Acesse [developers.facebook.com/apps](https://developers.facebook.com/apps)
2. "Criar app" → tipo **"Empresa"** (Business)
3. Dê um nome (ex.: "Atender.adv Marketing") e confirme
4. No painel do app, adicione os produtos:
   - **Instagram Graph API**
   - **Facebook Login for Business** (necessário para gerar token com as permissões certas)

## Passo 2 — Gerar um token de acesso (Graph API Explorer)

1. Acesse [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)
2. No canto superior direito, selecione o **App** que você criou no Passo 1
3. Em "Permissões", adicione:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `instagram_basic`
   - `instagram_content_publish`
   - `business_management`
4. Clique em **"Gerar Token de Acesso"** e faça login/confirme as permissões

Esse token dura só ~1 hora — é só para o próximo passo.

## Passo 3 — Trocar por um token de longa duração (60 dias)

Com o token de curta duração do Passo 2, chame (pode ser no navegador mesmo,
colando a URL com os valores substituídos):

```
https://graph.facebook.com/v21.0/oauth/access_token?
  grant_type=fb_exchange_token&
  client_id=SEU_APP_ID&
  client_secret=SEU_APP_SECRET&
  fb_exchange_token=TOKEN_DO_PASSO_2
```

`SEU_APP_ID` e `SEU_APP_SECRET` ficam em Configurações do App → Básico, no
painel do Meta for Developers. A resposta traz um novo `access_token`,
válido por 60 dias.

## Passo 4 — Pegar o Token da Página (esse não expira sozinho)

Com o token de longa duração do Passo 3:

```
https://graph.facebook.com/v21.0/me/accounts?access_token=TOKEN_DO_PASSO_3
```

Isso retorna a lista de Páginas que você administra, cada uma com seu próprio
`access_token` — **é esse token de Página que vamos usar no n8n**, ele
continua valendo enquanto o token de usuário de origem não for revogado.

## Passo 5 — Descobrir o ID da conta do Instagram

```
https://graph.facebook.com/v21.0/SEU_PAGE_ID?fields=instagram_business_account&access_token=TOKEN_DA_PAGINA
```

Anota o `instagram_business_account.id` — é o ID que a API usa para publicar.

## Passo 6 — Me passar essas 2 informações

Quando tiver:
1. O **token da Página** (Passo 4)
2. O **Instagram Business Account ID** (Passo 5)

Me traga os dois (de preferência não colado direto na conversa se puder
evitar — mas se colar, tudo bem, eu configuro como variável de ambiente no
n8n, nunca deixo hardcoded em nada versionado) que eu:
- Configuro os nodes de publicação no workflow do n8n (Instagram + Facebook)
- Adapto o fluxo atual (que hoje manda pra revisão no WhatsApp) para, depois
  da sua aprovação, publicar direto

## Importante — App Review do Meta

A permissão `instagram_content_publish` é considerada **avançada**. Enquanto
o App estiver em modo "Em desenvolvimento", só publica em contas que você
mesmo adicionar como "testador" no painel do App (Funções → Testadores) —
o que já é suficiente pra você testar com a própria conta do Atender.adv.

Para publicar em produção sem essa limitação (ex.: se no futuro outra pessoa
for gerenciar a conta), o Meta exige passar por uma revisão (App Review),
que pede uma gravação de tela mostrando o uso da permissão — processo à
parte, sem pressa de fazer agora.

## Checklist rápido

- [ ] Página do Facebook criada e Instagram vinculado como conta comercial
- [ ] App criado em developers.facebook.com
- [ ] Token de longa duração gerado
- [ ] Token da Página obtido
- [ ] Instagram Business Account ID obtido
- [ ] Token e ID passados para configurar o n8n
