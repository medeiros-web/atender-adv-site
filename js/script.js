// Ano no rodapé
document.getElementById('year').textContent = new Date().getFullYear();

// Tema claro/escuro (balança da justiça)
const themeToggle = document.getElementById('themeToggle');
const themeColorMeta = document.getElementById('themeColorMeta');
const THEME_COLORS = { dark: '#0b0d14', light: '#f5f4fb' };
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

// Sincroniza o botão com o tema já aplicado pelo script inline no <head>
themeToggle.setAttribute('aria-pressed', String(currentTheme() === 'light'));
themeToggle.setAttribute('aria-label', currentTheme() === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro');

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  document.documentElement.style.colorScheme = theme;
  themeColorMeta.setAttribute('content', THEME_COLORS[theme]);
  themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
  themeToggle.setAttribute('aria-label', theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro');
  try { localStorage.setItem('atv-theme', theme); } catch (e) {}
}

themeToggle.addEventListener('click', (event) => {
  const nextTheme = currentTheme() === 'light' ? 'dark' : 'light';

  themeToggle.classList.remove('is-weighing');
  void themeToggle.offsetWidth; // reinicia a animação se clicar rápido de novo
  themeToggle.classList.add('is-weighing');

  const canAnimatePage = document.startViewTransition && !prefersReducedMotion.matches;

  if (canAnimatePage) {
    const rect = themeToggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    const transition = document.startViewTransition(() => applyTheme(nextTheme));
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 650,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    }).catch(() => {});
  } else {
    applyTheme(nextTheme);
  }
});

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
