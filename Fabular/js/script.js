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
const contatoNomeEl = document.getElementById("contato-nome");
const contatoEmailEl = document.getElementById("contato-email");
const contatoMensagemEl = document.getElementById("contato-mensagem");
const contatoWebsiteEl = document.getElementById("contato-website");
const erroContatoNome = document.getElementById("erro-contato-nome");
const erroContatoEmail = document.getElementById("erro-contato-email");
const erroContatoMensagem = document.getElementById("erro-contato-mensagem");
const btnContatoEnviar = form ? form.querySelector('button[type="submit"]') : null;
const V = window.FabularValidacao;

function validarNomeContato(mostrarErro) {
  const resultado = V
    ? V.validarNome(contatoNomeEl && contatoNomeEl.value)
    : { ok: false, mensagem: "Informe um nome com pelo menos 2 caracteres.", valor: "" };
  if (V) V.definirErroCampo(erroContatoNome, mostrarErro && !resultado.ok ? resultado.mensagem : "");
  return resultado;
}

function validarEmailContato(mostrarErro) {
  const resultado = V
    ? V.validarEmail(contatoEmailEl && contatoEmailEl.value)
    : { ok: false, mensagem: "Digite um e-mail válido.", valor: "" };
  if (V) V.definirErroCampo(erroContatoEmail, mostrarErro && !resultado.ok ? resultado.mensagem : "");
  return resultado;
}

function validarMensagemContato(mostrarErro) {
  const resultado = V
    ? V.validarMensagemContato(contatoMensagemEl && contatoMensagemEl.value)
    : { ok: false, mensagem: "A mensagem precisa ter entre 10 e 2000 caracteres.", valor: "" };
  if (V) V.definirErroCampo(erroContatoMensagem, mostrarErro && !resultado.ok ? resultado.mensagem : "");
  return resultado;
}

function formularioContatoValido() {
  return validarNomeContato(false).ok && validarEmailContato(false).ok && validarMensagemContato(false).ok;
}

function atualizarBotaoContato() {
  if (V) V.atualizarBotaoEnviar(btnContatoEnviar, formularioContatoValido());
  else if (btnContatoEnviar) btnContatoEnviar.disabled = !formularioContatoValido();
}

[contatoNomeEl, contatoEmailEl, contatoMensagemEl].forEach((el) => {
  if (!el) return;
  el.addEventListener("input", () => {
    if (el === contatoNomeEl) validarNomeContato(true);
    if (el === contatoEmailEl) validarEmailContato(true);
    if (el === contatoMensagemEl) validarMensagemContato(true);
    atualizarBotaoContato();
  });
});
atualizarBotaoContato();

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nomeVal = validarNomeContato(true);
    const emailVal = validarEmailContato(true);
    const mensagemVal = validarMensagemContato(true);
    if (!nomeVal.ok || !emailVal.ok || !mensagemVal.ok) {
      if (!nomeVal.ok && contatoNomeEl) contatoNomeEl.focus();
      else if (!emailVal.ok && contatoEmailEl) contatoEmailEl.focus();
      else if (!mensagemVal.ok && contatoMensagemEl) contatoMensagemEl.focus();
      return;
    }

    const dados = {
      nome: nomeVal.valor,
      email: emailVal.valor,
      assunto: document.getElementById("contato-assunto").value,
      mensagem: mensagemVal.valor,
      website: contatoWebsiteEl ? contatoWebsiteEl.value : ""
    };

    try {
      if (feedback) feedback.textContent = "Enviando...";
      const apiBase = (window.API_BASE_URL || "http://localhost:5275").replace(/\/$/, "");
      const resposta = await fetch(
        `${apiBase}/api/contato`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dados)
        }
      );

      if (!resposta.ok) {
        let msg = "Erro ao enviar";
        try {
          const data = await resposta.json();
          if (data && data.message) msg = data.message;
        } catch (_) { }
        throw new Error(msg);
      }

      if (feedback) feedback.textContent = "Mensagem enviada com sucesso!";
      form.reset();
      if (V) {
        V.definirErroCampo(erroContatoNome, "");
        V.definirErroCampo(erroContatoEmail, "");
        V.definirErroCampo(erroContatoMensagem, "");
      }
      atualizarBotaoContato();
    }
    catch (erro) {
      console.error(erro);
      const msg = erro && erro.message ? erro.message : "Não foi possível enviar a mensagem.";
      if (V && msg === V.MSG_EMAIL) V.definirErroCampo(erroContatoEmail, V.MSG_EMAIL);
      else if (V && msg === V.MSG_NOME) V.definirErroCampo(erroContatoNome, V.MSG_NOME);
      else if (V && msg === V.MSG_MENSAGEM) V.definirErroCampo(erroContatoMensagem, V.MSG_MENSAGEM);
      else if (feedback) feedback.textContent = msg === "Erro ao enviar" ? "Não foi possível enviar a mensagem." : msg;
    }
  });
}
