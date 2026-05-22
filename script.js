// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

// Close mobile menu when link is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });
});

// ===== REVEAL ON SCROLL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger children if parent has children
      const el = entry.target;
      el.style.transitionDelay = `${(el.dataset.delay || 0)}ms`;
      el.classList.add('visible');
      revealObserver.unobserve(el);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

// Observe all .reveal elements
document.querySelectorAll('.reveal').forEach((el, index) => {
  revealObserver.observe(el);
});

// Stagger cards and grid items
function staggerChildren(parentSelector, childSelector, delayStep = 100) {
  document.querySelectorAll(parentSelector).forEach(parent => {
    parent.querySelectorAll(childSelector).forEach((child, i) => {
      child.dataset.delay = i * delayStep;
    });
  });
}

staggerChildren('.cards-grid', '.feature-card', 120);
staggerChildren('.games-grid', '.game-card-big', 100);
staggerChildren('.diff-grid', '.diff-item', 80);
staggerChildren('.team-grid', '.team-card', 100);
staggerChildren('.steps-track', '.step', 120);

// ===== SMOOTH ACTIVE NAV LINK =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ===== PARALLAX SHAPES IN HERO =====
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const shapes = document.querySelectorAll('.shape');
  shapes.forEach((shape, i) => {
    const speed = (i + 1) * 0.15;
    shape.style.transform = `translateY(${scrollY * speed}px)`;
  });
});

// ===== PROGRESS BAR ANIMATION RESTART =====
const progressFill = document.querySelector('.progress-fill');
if (progressFill) {
  setInterval(() => {
    progressFill.style.animation = 'none';
    void progressFill.offsetWidth;
    progressFill.style.animation = 'progress 2s ease-in-out infinite alternate';
  }, 4500);
}

// ===== HERO FLOATING CARDS MOUSE PARALLAX =====
const heroIllustration = document.querySelector('.hero-illustration');
if (heroIllustration) {
  document.querySelector('.hero').addEventListener('mousemove', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    heroIllustration.querySelectorAll('.hero-card').forEach((card, i) => {
      const depth = (i + 1) * 6;
      card.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
    });

    heroIllustration.querySelectorAll('.floating-emoji').forEach((emoji, i) => {
      const depth = (i + 1) * 12;
      emoji.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
    });
  });

  document.querySelector('.hero').addEventListener('mouseleave', () => {
    heroIllustration.querySelectorAll('.hero-card, .floating-emoji').forEach(el => {
      el.style.transform = '';
    });
  });
}

// ===== COUNTER ANIMATION (STATS) =====
// (Simple pulse on stat cards for delight)
document.querySelectorAll('.stat').forEach((stat, i) => {
  setTimeout(() => {
    stat.style.transition = 'transform 0.3s, background 0.3s';
    stat.addEventListener('mouseenter', () => {
      stat.style.background = 'rgba(255,255,255,0.35)';
      stat.style.transform = 'scale(1.05)';
    });
    stat.addEventListener('mouseleave', () => {
      stat.style.background = 'rgba(255,255,255,0.2)';
      stat.style.transform = 'scale(1)';
    });
  }, i * 100);
});

// ===== INIT: Trigger initial reveals for hero (already visible) =====
window.dispatchEvent(new Event('scroll'));

// Fire reveal check on load
window.addEventListener('load', () => {
  document.querySelectorAll('.reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('visible');
    }
  });
});

// ===== CONTATO (BREVO CRM + BACKEND API) =====
const contatoForm = document.getElementById('footer-contato-form');
if (contatoForm) {
  const API_BASE = (window.API_BASE_URL || 'http://localhost:5275').replace(/\/$/, '');
  const feedbackEl = document.getElementById('contato-feedback');

  const setFeedback = (mensagem, erro = false) => {
    if (!feedbackEl) return;
    feedbackEl.textContent = mensagem;
    feedbackEl.style.color = erro ? '#FFD2D2' : 'rgba(255,255,255,0.9)';
  };

  contatoForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome = (document.getElementById('contato-nome')?.value || '').trim();
    const email = (document.getElementById('contato-email')?.value || '').trim();
    const assunto = (document.getElementById('contato-assunto')?.value || '').trim();
    const mensagem = (document.getElementById('contato-mensagem')?.value || '').trim();
    const btnEnviar = contatoForm.querySelector('.footer-btn-enviar');

    if (!nome || !email || !assunto || !mensagem) {
      setFeedback('Preencha todos os campos para enviar a mensagem.', true);
      return;
    }

    if (btnEnviar) {
      btnEnviar.disabled = true;
      btnEnviar.textContent = 'Enviando...';
    }

    try {
      const resposta = await fetch(`${API_BASE}/api/v1/contact/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, assunto, mensagem })
      });

      let dados = null;
      try { dados = await resposta.json(); } catch (_) {}
      if (!resposta.ok) {
        throw new Error(dados?.message || 'Falha ao enviar contato.');
      }

      setFeedback('Mensagem enviada! Nossa equipe responderá em breve.');
      contatoForm.reset();
    } catch (error) {
      setFeedback(error.message || 'Não foi possível enviar sua mensagem no momento.', true);
    } finally {
      if (btnEnviar) {
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Enviar mensagem';
      }
    }
  });
}
