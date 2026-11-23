const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** Preço vem da API em reais (number) ou null (doação) */
export const formatarPreco = (preco: number | null) => (preco === null ? 'Doação' : moeda.format(preco))

export const formatarData = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')

export const DOMINIO_INSTITUCIONAL = '@academico.ifpb.edu.br'

/** RF01.2 — o formulário rejeita e-mails fora do domínio (a API também valida) */
export const emailInstitucional = (email: string) => email.trim().toLowerCase().endsWith(DOMINIO_INSTITUCIONAL)

/** "(83) 99999-0000" -> https://wa.me/5583999990000 (adiciona o DDI do Brasil se faltar) */
export function linkWhatsApp(telefone: string) {
  let digitos = telefone.replace(/\D/g, '')
  if (digitos.length <= 11) digitos = `55${digitos}`
  return `https://wa.me/${digitos}`
}