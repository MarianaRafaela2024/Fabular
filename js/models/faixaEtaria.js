/* Faixa etária calculada a partir da data de nascimento */
'use strict';

function calcularIdade(dataNascimento, referencia) {
  if (!dataNascimento) return null;
  const ref = referencia || new Date();
  const nasc = new Date(String(dataNascimento).slice(0, 10) + 'T12:00:00');
  if (Number.isNaN(nasc.getTime())) return null;

  let idade = ref.getFullYear() - nasc.getFullYear();
  const mesDiff = ref.getMonth() - nasc.getMonth();
  if (mesDiff < 0 || (mesDiff === 0 && ref.getDate() < nasc.getDate())) {
    idade--;
  }
  return idade;
}

function calcularFaixaEtaria(dataNascimento, referencia) {
  const idade = calcularIdade(dataNascimento, referencia);
  if (idade === null) return 1;
  if (idade <= 6) return 1;
  if (idade <= 8) return 2;
  return 3;
}

function labelFaixaEtaria(faixa) {
  return { 1: '5–6 anos', 2: '7–8 anos', 3: '9–10 anos' }[faixa] || '';
}

function normalizarPerfilCrianca(perfil) {
  if (!perfil) return perfil;
  const p = Object.assign({}, perfil);
  p.nome = p.nome || '';
  p.avatar = p.avatar || 'midia/lion.png';
  p.genero = p.genero || p.generoFavorito || 'narrativo';
  p.dataNascimento = p.dataNascimento || null;
  p.horarioBrincar = p.horarioBrincar || p.horario || null;
  p.faixa = calcularFaixaEtaria(p.dataNascimento);
  return p;
}

function atualizarFaixaPerfil(perfil) {
  if (!perfil) return perfil;
  perfil.faixa = calcularFaixaEtaria(perfil.dataNascimento);
  return perfil;
}
