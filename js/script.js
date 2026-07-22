// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  });
}

// ===== REVEAL ON SCROLL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
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

document.querySelectorAll('.reveal').forEach((el, index) => {
  revealObserver.observe(el);
});

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
if (heroIllustration && document.querySelector('.hero')) {
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

window.dispatchEvent(new Event('scroll'));

window.addEventListener('load', () => {
  document.querySelectorAll('.reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('visible');
    }
  });
});

// ===== CONTATO (BREVO CRM + BACKEND API) =====
const form = document.getElementById("footer-contato-form");
const feedback = document.getElementById("contato-feedback");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = {
      nome: document.getElementById("contato-nome").value,
      email: document.getElementById("contato-email").value,
      assunto: document.getElementById("contato-assunto").value,
      mensagem: document.getElementById("contato-mensagem").value
    };

    try {
      if (feedback) feedback.textContent = "Enviando...";

      const resposta = await fetch(
        "https://localhost:7157/api/contato",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dados)
        }
      );

      if (!resposta.ok) {
        throw new Error("Erro ao enviar");
      }

      if (feedback) feedback.textContent = "Mensagem enviada com sucesso!";
      form.reset();
    }
    catch (erro) {
      console.error(erro);
      if (feedback) feedback.textContent = "Não foi possível enviar a mensagem.";
    }
  });
}
