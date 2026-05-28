/**
 * Helper para formatar CPF dinamicamente durante a digitação: 000.000.000-00
 */
export function formatarCpf(value) {
  if (!value) return '';
  const apenasNumeros = value.replace(/\D/g, '');
  return apenasNumeros
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14); // Limita tamanho da string formatada
}

/**
 * Helper para formatar Telefone dinamicamente durante a digitação: (00) 00000-0000 ou (00) 0000-0000
 */
export function formatarTelefone(value) {
  if (!value) return '';
  const apenasNumeros = value.replace(/\D/g, '');
  if (apenasNumeros.length <= 10) {
    return apenasNumeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 14);
  }
  return apenasNumeros
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
}

/**
 * Validador de CPF utilizando o cálculo oficial de dígitos verificadores brasileiros.
 * Impede que CPFs inválidos ou repetidos (ex: 111.111.111-11) sejam salvos no banco.
 */
export function validarCpf(cpf) {
  if (!cpf) return false;
  const limpo = cpf.replace(/\D/g, '');
  
  if (limpo.length !== 11) return false;
  
  // Rejeita CPFs com todos os dígitos iguais (ex: 11111111111)
  if (/^(\d)\1{10}$/.test(limpo)) return false;
  
  // Valida primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(limpo.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digito1 = resto >= 10 ? 0 : resto;
  if (digito1 !== parseInt(limpo.charAt(9))) return false;
  
  // Valida segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(limpo.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digito2 = resto >= 10 ? 0 : resto;
  if (digito2 !== parseInt(limpo.charAt(10))) return false;
  
  return true;
}
