const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** Preço vem da API em reais (number) ou null (doação) */
export const formatarPreco = (preco: number | null) => (preco === null ? 'Doação' : moeda.format(preco))

export const formatarData = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')

export const DOMINIO_INSTITUCIONAL = '@academico.ifpb.edu.br'

/** RF01.2 — o formulário rejeita e-mails fora do domínio (a API também valida) */
export const emailInstitucional = (email: string) => email.trim().toLowerCase().endsWith(DOMINIO_INSTITUCIONAL)
