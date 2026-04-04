import { useState, useRef, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { useT } from '../../hooks/useT'
import { Avatar } from '../ui/Avatar'
import { lastMsgPreview } from '../../lib/utils'

export function ContactList() {
  const contacts = useStore(s => s.contacts)
  const messages = useStore(s => s.messages)
  const unread = useStore(s => s.unread)
  const activeChat = useStore(s => s.activeChat)
  const setActiveChat = useStore(s => s.setActiveChat)
  const setSidebarOpen = useStore(s => s.setSidebarOpen)
  const renameContact = useStore(s => s.renameContact)
  const deleteContact = useStore(s => s.deleteContact)

  const t = useT()
  const [menuPubkey, setMenuPubkey] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)

  // Close menu on outside click
  useEffect(() => {
    if (!menuPubkey) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPubkey(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuPubkey])

  useEffect(() => {
    if (renaming) renameInputRef.current?.focus()
  }, [renaming])

  const handleClick = (c: { pubkey: string; name: string }) => {
    if (menuPubkey || renaming) return
    const chatId = 'dm:' + c.pubkey
    setActiveChat({ type: 'dm', id: c.pubkey, name: c.name, chatId })
    setSidebarOpen(false)
  }

  const openMenu = (e: React.MouseEvent, pubkey: string) => {
    e.stopPropagation()
    setMenuPubkey(menuPubkey === pubkey ? null : pubkey)
  }

  const startRename = (pubkey: string, currentName: string) => {
    setMenuPubkey(null)
    setRenaming(pubkey)
    setRenameValue(currentName)
  }

  const commitRename = (pubkey: string) => {
    const trimmed = renameValue.trim()
    if (trimmed) renameContact(pubkey, trimmed)
    setRenaming(null)
  }

  const handleDelete = (pubkey: string, name: string) => {
    setMenuPubkey(null)
    if (confirm(t('list.deleteConfirm', { name }))) {
      deleteContact(pubkey)
    }
  }

  const items = Object.values(contacts)

  if (!items.length) {
    return (
      <div className="sidebar-empty">
        {t('contact.empty')}<br />{t('contact.emptySub')}
      </div>
    )
  }

  return (
    <>
      {items.map(c => {
        const chatId = 'dm:' + c.pubkey
        const isActive = activeChat?.chatId === chatId
        const ub = unread[chatId] || 0
        const msgs = messages[chatId] || []
        const isMenuOpen = menuPubkey === c.pubkey
        const isRenaming = renaming === c.pubkey

        return (
          <div
            key={c.pubkey}
            className={`contact-item${isActive ? ' active' : ''}`}
            onClick={() => handleClick(c)}
            style={{ position: 'relative' }}
          >
            <Avatar name={c.name} />
            <div className="contact-info">
              {isRenaming ? (
                <input
                  ref={renameInputRef}
                  className="rename-input"
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitRename(c.pubkey)
                    if (e.key === 'Escape') setRenaming(null)
                  }}
                  onBlur={() => commitRename(c.pubkey)}
                  onClick={e => e.stopPropagation()}
                  maxLength={30}
                  style={{ background: 'var(--surface2)', border: '1px solid var(--accent)', borderRadius: 4, color: 'var(--text)', padding: '0.1rem 0.35rem', fontSize: '0.88rem', width: '100%' }}
                />
              ) : (
                <div className="contact-name">{c.name}</div>
              )}
              <div className="contact-sub">{lastMsgPreview(msgs)}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
              {ub > 0 && <div className="unread-badge">{ub}</div>}
              <button
                className="btn icon-btn"
                style={{ opacity: 0.5, fontSize: '0.8rem', padding: '0.2rem 0.35rem' }}
                onClick={e => openMenu(e, c.pubkey)}
                title={t('list.options')}
              >
                ⋯
              </button>
            </div>

            {isMenuOpen && (
              <div
                ref={menuRef}
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute', right: 8, top: '100%', zIndex: 100,
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 8, overflow: 'hidden', minWidth: 140,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                }}
              >
                <button
                  style={{ display: 'block', width: '100%', padding: '0.55rem 0.9rem', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '0.82rem' }}
                  onClick={() => startRename(c.pubkey, c.name)}
                >
                  ✏️ {t('list.rename')}
                </button>
                <button
                  style={{ display: 'block', width: '100%', padding: '0.55rem 0.9rem', textAlign: 'left', background: 'none', border: 'none', color: '#e07070', cursor: 'pointer', fontSize: '0.82rem' }}
                  onClick={() => handleDelete(c.pubkey, c.name)}
                >
                  🗑 {t('list.delete')}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
