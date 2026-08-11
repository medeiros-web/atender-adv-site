// Ano no rodapé
document.getElementById('year').textContent = new Date().getFullYear();

// Service Worker (PWA offline + instalável)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('Falha ao registrar o service worker:', err);
    });
  });
}

// Instalação do PWA (Chrome/Edge/Android — beforeinstallprompt)
const installBtn = document.getElementById('installBtn');
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installBtn.hidden = false;
});

installBtn.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  installBtn.hidden = true;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
});

window.addEventListener('appinstalled', () => {
  installBtn.hidden = true;
  deferredInstallPrompt = null;
});

// Menu mobile
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

navToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  navToggle.classList.toggle('is-open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealEls.forEach((el) => observer.observe(el));

// Envio do formulário de orçamento (Formspree)
const form = document.getElementById('orcamentoForm');
const submitBtn = document.getElementById('formSubmit');
const statusEl = document.getElementById('formStatus');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const actionUrl = form.getAttribute('action');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';
  statusEl.textContent = '';
  statusEl.dataset.state = 'loading';

  try {
    const payload = Object.fromEntries(new FormData(form).entries());

    const response = await fetch(actionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      statusEl.textContent = 'Recebemos seu pedido! Em breve entraremos em contato com o orçamento.';
      statusEl.dataset.state = 'success';
      form.reset();
    } else {
      throw new Error('Falha no envio');
    }
  } catch (err) {
    statusEl.textContent = 'Não foi possível enviar agora. Tente novamente ou escreva para medeirosassessor.adv@gmail.com.';
    statusEl.dataset.state = 'error';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Solicitar orçamento';
  }
});
