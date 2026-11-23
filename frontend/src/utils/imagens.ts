export const TIPOS_IMAGEM = ['image/jpeg', 'image/png', 'image/webp']
export const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024 // 5 MB (limite da API)

/** Retorna a mensagem de erro ou null se o arquivo é aceitável. A API valida de novo (pelo conteúdo). */
export function validarImagem(arquivo: File): string | null {
  if (!TIPOS_IMAGEM.includes(arquivo.type)) return 'Envie imagens JPEG, PNG ou WebP.'
  if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) return 'A foto pode ter no máximo 5 MB.'
  return null
}
