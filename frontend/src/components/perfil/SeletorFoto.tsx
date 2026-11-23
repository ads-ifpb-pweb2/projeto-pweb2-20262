import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { TIPOS_IMAGEM } from '../../utils/imagens'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import styles from './SeletorFoto.module.css'

export interface SeletorFotoProps {
  nome: string
  /** Foto atual do usuário (URL assinada) */
  fotoAtualUrl?: string | null
  /** Arquivo já escolhido e válido, ainda não enviado */
  arquivo: File | null
  /** Chamado com o arquivo escolhido no seletor do sistema (a validação é de quem usa) */
  onEscolher: (arquivo: File) => void
  onRemover: () => void
  erro?: string | null
  desabilitado?: boolean
}

/** Escolhe uma foto e mostra a pré-visualização antes de enviar */
export function SeletorFoto({ nome, fotoAtualUrl, arquivo, onEscolher, onRemover, erro, desabilitado }: SeletorFotoProps) {
  const entrada = useRef<HTMLInputElement>(null)
  const [previa, setPrevia] = useState<string | null>(null)

  useEffect(() => {
    if (!arquivo) {
      setPrevia(null)
      return
    }
    const url = URL.createObjectURL(arquivo)
    setPrevia(url)
    return () => URL.revokeObjectURL(url)
  }, [arquivo])

  function aoMudar(e: ChangeEvent<HTMLInputElement>) {
    const escolhido = e.target.files?.[0]
    e.target.value = '' // permite escolher o mesmo arquivo de novo
    if (escolhido) onEscolher(escolhido)
  }

  return (
    <div className={styles.seletor}>
      <Avatar nome={nome} fotoUrl={previa ?? fotoAtualUrl} tamanho="lg" />
      <div className={styles.controles}>
        <input
          ref={entrada}
          type="file"
          className={styles.oculto}
          accept={TIPOS_IMAGEM.join(',')}
          aria-label="Selecionar foto de perfil"
          onChange={aoMudar}
          disabled={desabilitado}
        />
        <div className={styles.botoes}>
          <Button type="button" variante="secundario" disabled={desabilitado} onClick={() => entrada.current?.click()}>
            {fotoAtualUrl || arquivo ? 'Trocar foto' : 'Escolher foto'}
          </Button>
          {arquivo && (
            <Button type="button" variante="secundario" disabled={desabilitado} onClick={onRemover}>
              Cancelar escolha
            </Button>
          )}
        </div>
        {arquivo && <span className={styles.arquivo}>Selecionada: {arquivo.name}</span>}
        <span className={styles.dica}>JPEG, PNG ou WebP, até 5 MB.</span>
        {erro && <span className={styles.erro} role="alert">{erro}</span>}
      </div>
    </div>
  )
}
