/* Funções de validação reutilizadas nos formulários (login, cadastro, contato). */
'use strict';

(function (global) {
  var MSG_HORARIO = 'Selecione o horário de brincar';
  var MSG_TELEFONE = 'Telefone inválido. Use DDD + 9 dígitos.';
  var MSG_EMAIL = 'Digite um e-mail válido.';
  var MSG_EMAIL_DUPLICADO = 'Este e-mail já está cadastrado';
  var MSG_SENHA = 'A senha precisa ter 8 caracteres, maiúscula, minúscula, número e caractere especial, sem espaços.';
  var MSG_SENHA_COMUM = 'Essa senha é muito comum. Escolha outra.';
  var MSG_SENHA_CONFIRMACAO = 'As senhas não coincidem.';
  var EMAIL_MAX = 160;
  var SENHA_MAX = 128;
  var NOME_MIN = 2;
  var NOME_MAX = 80;
  var CRIANCA_NOME_MAX = 80;
  var MENSAGEM_MIN = 10;
  var MENSAGEM_MAX = 2000;
  var MSG_NOME = 'Informe um nome com pelo menos 2 caracteres.';
  var MSG_MENSAGEM = 'A mensagem precisa ter entre 10 e 2000 caracteres.';
  var SENHAS_COMUNS = [
    '12345678', '123456789', 'senha123', 'senha1234', 'qwerty123', 'qwertyui',
    'password', 'password1', 'admin123', '11111111', 'abc12345', '1234qwer'
  ];

  function normalizarHorarioBrincar(valor) {
    if (valor == null) return '';
    var s = String(valor).trim();
    if (!s) return '';
    var m = s.match(/^(\d{1,2}):(\d{2})/);
    if (!m) return '';
    var h = Number(m[1]);
    var min = Number(m[2]);
    if (!Number.isInteger(h) || !Number.isInteger(min) || h < 0 || h > 23 || min < 0 || min > 59) {
      return '';
    }
    return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
  }

  function obterHorarioBrincar(obj) {
    if (!obj) return '';
    return normalizarHorarioBrincar(obj.horarioBrincar || obj.HorarioBrincar || obj.horario || '');
  }

  function validarHorarioBrincar(valor) {
    var horario = normalizarHorarioBrincar(valor);
    if (!horario) {
      return { ok: false, mensagem: MSG_HORARIO, valor: '' };
    }
    return { ok: true, mensagem: '', valor: horario };
  }

  function apenasDigitosTelefone(valor) {
    return String(valor == null ? '' : valor).replace(/\D/g, '').slice(0, 11);
  }

  function mascararTelefone(valor) {
    var d = apenasDigitosTelefone(valor);
    if (d.length === 0) return '';
    if (d.length <= 2) return '(' + d;
    if (d.length <= 7) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }

  function validarTelefone(valor) {
    var d = apenasDigitosTelefone(valor);
    if (!/^[1-9]\d9\d{8}$/.test(d)) {
      return { ok: false, mensagem: MSG_TELEFONE, valor: d };
    }
    return { ok: true, mensagem: '', valor: d };
  }

  function aplicarMascaraTelefone(input) {
    if (!input || input.dataset.mascaraTel === '1') return;
    input.dataset.mascaraTel = '1';
    input.setAttribute('maxlength', '15');
    input.addEventListener('input', function () {
      input.value = mascararTelefone(input.value);
    });
  }

  function normalizarEmail(valor) {
    if (valor == null) return '';
    return String(valor).trim().toLowerCase();
  }

  function requisitosSenha(valor) {
    var s = valor == null ? '' : String(valor);
    return {
      tamanho: s.length >= 8 && s.length <= SENHA_MAX,
      maiuscula: /[A-Z]/.test(s),
      minuscula: /[a-z]/.test(s),
      numero: /\d/.test(s),
      especial: /[^A-Za-z0-9]/.test(s),
      semEspaco: s.length > 0 && !/\s/.test(s),
      comum: s.length > 0 && SENHAS_COMUNS.indexOf(s.toLowerCase()) === -1
    };
  }

  function validarSenha(valor) {
    var s = valor == null ? '' : String(valor);
    var req = requisitosSenha(s);
    if (!req.comum) {
      return { ok: false, mensagem: MSG_SENHA_COMUM, valor: s, requisitos: req };
    }
    if (!req.tamanho || !req.maiuscula || !req.minuscula || !req.numero || !req.especial || !req.semEspaco) {
      return { ok: false, mensagem: MSG_SENHA, valor: s, requisitos: req };
    }
    return { ok: true, mensagem: '', valor: s, requisitos: req };
  }

  function validarConfirmacaoSenha(senha, confirmar) {
    if (senha !== confirmar) {
      return { ok: false, mensagem: MSG_SENHA_CONFIRMACAO };
    }
    return { ok: true, mensagem: '' };
  }

  function atualizarRequisitosSenha(listaEl, requisitos) {
    if (!listaEl || !requisitos) return;
    listaEl.querySelectorAll('[data-req]').forEach(function (li) {
      var chave = li.getAttribute('data-req');
      li.classList.toggle('ok', !!requisitos[chave]);
    });
  }

  function aplicarOlhoSenha(input) {
    if (!input || input.dataset.olho === '1') return;
    input.dataset.olho = '1';
    var wrap = document.createElement('div');
    wrap.className = 'campo-senha-wrap';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-olho-senha';
    btn.setAttribute('aria-label', 'Mostrar senha');
    btn.setAttribute('aria-pressed', 'false');
    btn.title = 'Mostrar senha';
    btn.textContent = '👁';
    wrap.appendChild(btn);
    btn.addEventListener('click', function () {
      var visivel = input.type === 'text';
      input.type = visivel ? 'password' : 'text';
      var label = visivel ? 'Mostrar senha' : 'Ocultar senha';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('aria-pressed', visivel ? 'false' : 'true');
      btn.title = label;
    });
  }

  function validarNome(valor, min, max) {
    var minimo = min == null ? NOME_MIN : min;
    var maximo = max == null ? NOME_MAX : max;
    var s = valor == null ? '' : String(valor).trim();
    if (s.length < minimo || s.length > maximo) {
      return { ok: false, mensagem: MSG_NOME, valor: s };
    }
    return { ok: true, mensagem: '', valor: s };
  }

  function validarMensagemContato(valor) {
    var s = valor == null ? '' : String(valor).trim();
    if (s.length < MENSAGEM_MIN || s.length > MENSAGEM_MAX) {
      return { ok: false, mensagem: MSG_MENSAGEM, valor: s };
    }
    return { ok: true, mensagem: '', valor: s };
  }

  function validarEmail(valor) {
    var email = normalizarEmail(valor);
    if (!email || /\s/.test(email) || email.length > EMAIL_MAX) {
      return { ok: false, mensagem: MSG_EMAIL, valor: email };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, mensagem: MSG_EMAIL, valor: email };
    }
    return { ok: true, mensagem: '', valor: email };
  }

  function definirErroCampo(erroEl, mensagem, inputEl) {
    if (!erroEl) return;
    if (mensagem) {
      erroEl.textContent = mensagem;
      erroEl.classList.remove('oculto');
    } else {
      erroEl.textContent = '';
      erroEl.classList.add('oculto');
    }
    var campo = inputEl;
    if (!campo && erroEl.parentElement) {
      campo = erroEl.parentElement.querySelector('input, select, textarea');
    }
    if (campo) {
      if (mensagem) {
        campo.classList.add('campo-invalido');
        campo.setAttribute('aria-invalid', 'true');
      } else {
        campo.classList.remove('campo-invalido');
        campo.removeAttribute('aria-invalid');
      }
    }
  }

  function atualizarBotaoEnviar(botao, valido) {
    if (!botao) return;
    botao.removeAttribute('disabled');
    botao.setAttribute('aria-disabled', valido ? 'false' : 'true');
    botao.classList.toggle('btn-incompleto', !valido);
  }

  global.FabularValidacao = {
    MSG_HORARIO: MSG_HORARIO,
    MSG_TELEFONE: MSG_TELEFONE,
    MSG_EMAIL: MSG_EMAIL,
    MSG_EMAIL_DUPLICADO: MSG_EMAIL_DUPLICADO,
    MSG_SENHA: MSG_SENHA,
    MSG_SENHA_COMUM: MSG_SENHA_COMUM,
    MSG_SENHA_CONFIRMACAO: MSG_SENHA_CONFIRMACAO,
    EMAIL_MAX: EMAIL_MAX,
    SENHA_MAX: SENHA_MAX,
    NOME_MIN: NOME_MIN,
    NOME_MAX: NOME_MAX,
    CRIANCA_NOME_MAX: CRIANCA_NOME_MAX,
    MENSAGEM_MIN: MENSAGEM_MIN,
    MENSAGEM_MAX: MENSAGEM_MAX,
    MSG_NOME: MSG_NOME,
    MSG_MENSAGEM: MSG_MENSAGEM,
    normalizarHorarioBrincar: normalizarHorarioBrincar,
    obterHorarioBrincar: obterHorarioBrincar,
    validarHorarioBrincar: validarHorarioBrincar,
    apenasDigitosTelefone: apenasDigitosTelefone,
    mascararTelefone: mascararTelefone,
    validarTelefone: validarTelefone,
    aplicarMascaraTelefone: aplicarMascaraTelefone,
    normalizarEmail: normalizarEmail,
    validarEmail: validarEmail,
    validarNome: validarNome,
    validarMensagemContato: validarMensagemContato,
    requisitosSenha: requisitosSenha,
    validarSenha: validarSenha,
    validarConfirmacaoSenha: validarConfirmacaoSenha,
    atualizarRequisitosSenha: atualizarRequisitosSenha,
    aplicarOlhoSenha: aplicarOlhoSenha,
    definirErroCampo: definirErroCampo,
    atualizarBotaoEnviar: atualizarBotaoEnviar
  };
})(window);
