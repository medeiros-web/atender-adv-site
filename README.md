# Atender.adv — Site institucional

Site estático (HTML/CSS/JS puro, sem build) que apresenta as plataformas Atender.adv
e coleta pedidos de orçamento para sites/apps sob medida.

## Estrutura

```
index.html      # página única (hero, soluções, diferenciais, formulário, rodapé)
css/style.css   # estilos
js/script.js    # menu mobile, animações e envio do formulário
```

## Rodar localmente

Basta abrir `index.html` no navegador, ou servir a pasta:

```bash
npx serve .
```

## Ativar o formulário de orçamento (envio por e-mail)

O formulário usa o [Formspree](https://formspree.io) (grátis, sem backend):

1. Crie uma conta em formspree.io com `medeirosassessor.adv@gmail.com`.
2. Crie um novo formulário e copie o endpoint (`https://formspree.io/f/xxxxxxx`).
3. Em `index.html`, troque `SEU_FORM_ID` na tag `<form ... action="...">` pelo ID recebido.
4. Confirme o e-mail de verificação que o Formspree envia após o primeiro teste de envio.

Enquanto isso não for feito, o site mostra uma mensagem pedindo para o visitante
enviar e-mail diretamente.

## Pendências (TODO)

- [ ] Configurar o endpoint real do Formspree (ver acima).
- [ ] Se quiser botão de WhatsApp flutuante, adicionar número real (não incluído por padrão).
- [ ] Trocar favicon/logo genérico por identidade visual definitiva, se houver.

## Deploy

Publicado como site estático na Vercel (sem build step — framework "Other").
