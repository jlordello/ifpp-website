/**
 * Utilitários de conversão e formatação monetária padrão brasileiro (BRL).
 * Permite digitação flexível: 400000, 400.000, 400.000,00, 400 mil, 400k, 1.5 mi, etc.
 */

export function parseCurrencyBRL(input: string | number | undefined | null): number {
  if (input === undefined || input === null || input === '') return 0;
  if (typeof input === 'number') return isNaN(input) ? 0 : input;

  let s = String(input).trim();
  // Remove símbolo R$ e normaliza espaços
  s = s.replace(/^R\$\s*/i, '').replace(/\s+/g, ' ');

  // Tratamento de multiplicadores textuais (ex: "400 mil", "400k", "1.5 mi", "2 milhões")
  let multiplier = 1;
  if (/\b(mil|k)\b/i.test(s) || /mil$/i.test(s) || /k$/i.test(s)) {
    multiplier = 1000;
    s = s.replace(/\b(mil|k)\b/gi, '').replace(/(mil|k)$/gi, '').trim();
  } else if (/\b(mi|milhao|milhão|milhoes|milhões)\b/i.test(s)) {
    multiplier = 1000000;
    s = s.replace(/\b(mi|milhao|milhão|milhoes|milhões)\b/gi, '').trim();
  }

  // Remove espaços restantes
  s = s.replace(/\s/g, '');

  if (s.includes(',') && s.includes('.')) {
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    if (lastComma > lastDot) {
      // Padrão brasileiro: 400.000,50 -> ponto é milhar, vírgula é centavos
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // Padrão internacional: 400,000.50
      s = s.replace(/,/g, '');
    }
  } else if (s.includes(',')) {
    // Apenas vírgula: ex: 400000,00 ou 400,50
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (s.includes('.')) {
    const parts = s.split('.');
    if (parts.length > 2) {
      // Múltiplos pontos: 1.000.000 -> separador de milhar
      s = s.replace(/\./g, '');
    } else if (parts[1].length === 3) {
      // Ponto seguido de 3 dígitos (ex: 400.000, 50.000, 1.000) -> milhar
      s = s.replace(/\./g, '');
    }
    // Caso contrário (ex: 400.50), o ponto é tratado como decimal
  }

  const parsed = parseFloat(s);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * multiplier * 100) / 100;
}

export function formatCurrencyBRL(value: number | undefined | null): string {
  const num = Number(value || 0);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function getExtensoSintetico(value: number | undefined | null): string {
  const val = Number(value || 0);
  if (!val || val <= 0) return '';
  if (val >= 1000000) {
    const mi = val / 1000000;
    return mi === 1 ? '1 Milhão de Reais' : `${mi.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} Milhões de Reais`;
  }
  if (val >= 1000) {
    const mil = val / 1000;
    return `${mil.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} Mil Reais`;
  }
  return `${val.toLocaleString('pt-BR')} Reais`;
}
