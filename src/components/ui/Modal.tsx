import type { ReactNode } from 'react'

interface ModalProps {
  id: string
  children: ReactNode
}

export function Modal({ id, children }: ModalProps) {
  return (
    <div
      className="modal-overlay open"
      id={id}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          // Will be handled by parent
        }
      }}
    >
      <div className="modal">{children}</div>
    </div>
  )
}
