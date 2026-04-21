import React, { FC, useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Retool } from '@tryretool/custom-component-support'
import styles from './KanbanBoard.module.css'

/* ── Types ── */

type Priority = 'low' | 'medium' | 'high' | 'critical'

type CardAssignee = {
  id?: string
  name?: string
  color?: string
  avatar?: string
}

type KanbanCard = {
  id: string
  title: string
  description?: string
  column: string
  priority?: Priority
  assignees?: CardAssignee[]
  tags?: string[]
  dueDate?: string
}

type KanbanColumn = {
  id: string
  name: string
  color?: string
  limit?: number
}

type RetoolUser = {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  profilePhotoUrl?: string
}

type ResolvedUser = {
  name: string
  color: string
  photoUrl?: string
}

/* ── Constants ── */

const PRIORITY_COLORS: Record<Priority, string> = {
  low: '#64748B',
  medium: '#F59E0B',
  high: '#EF4444',
  critical: '#DC2626',
}

const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'todo', name: 'To Do', color: '#64748B' },
  { id: 'in_progress', name: 'In Progress', color: '#3B82F6' },
  { id: 'in_review', name: 'In Review', color: '#F59E0B' },
  { id: 'done', name: 'Done', color: '#10B981' },
]

const AVATAR_COLORS = [
  '#9B72CF', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#8B5CF6', '#06B6D4',
]

const MAX_AVATARS_CARD = 3

/* ── Helpers ── */

function hashColor(str: string): string {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function isOverdue(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr) < today
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/* ── Avatar ── */

const Avatar: React.FC<{
  user: ResolvedUser
  size?: number
  borderColor?: string
}> = ({ user, size = 22, borderColor = '#1A1D24' }) => {
  const [imgFailed, setImgFailed] = useState(false)

  if (user.photoUrl && !imgFailed) {
    return (
      <div
        className={styles.avatar}
        style={{ width: size, height: size, background: user.color, borderColor }}
        title={user.name}
      >
        <img
          src={user.photoUrl}
          alt={user.name}
          className={styles.avatarImg}
          onError={() => setImgFailed(true)}
        />
      </div>
    )
  }

  return (
    <div
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: size * 0.35, background: user.color, borderColor }}
      title={user.name}
    >
      {getInitials(user.name)}
    </div>
  )
}

/* ── Card Detail Modal ── */

const CardModal: React.FC<{
  card: KanbanCard
  currentColumnId: string
  columns: KanbanColumn[]
  resolveAssignee: (a: CardAssignee) => ResolvedUser
  onClose: () => void
  onMoveTo: (colId: string) => void
}> = ({ card, currentColumnId, columns, resolveAssignee, onClose, onMoveTo }) => {
  const priorityColor = card.priority ? PRIORITY_COLORS[card.priority] : null
  const currentCol = columns.find(c => c.id === currentColumnId)
  const overdue = card.dueDate && isOverdue(card.dueDate)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            {card.priority && (
              <span className={styles.modalPriorityBadge} style={{ color: priorityColor!, borderColor: priorityColor! }}>
                {PRIORITY_LABELS[card.priority] || card.priority}
              </span>
            )}
            {currentCol && (
              <span className={styles.modalColumnBadge} style={{ color: currentCol.color || '#64748B' }}>
                <span className={styles.modalColumnDot} style={{ background: currentCol.color || '#64748B' }} />
                {currentCol.name}
              </span>
            )}
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <h2 className={styles.modalTitle}>{card.title}</h2>

        {card.description ? (
          <div className={styles.modalSection}>
            <div className={styles.modalSectionLabel}>Description</div>
            <p className={styles.modalDescription}>{card.description}</p>
          </div>
        ) : (
          <p className={styles.modalDescriptionEmpty}>No description provided.</p>
        )}

        {card.dueDate && (
          <div className={styles.modalSection}>
            <div className={styles.modalSectionLabel}>Due date</div>
            <div className={`${styles.modalDueDate} ${overdue ? styles.modalDueDateOverdue : ''}`}>
              {overdue ? '⚠ Overdue · ' : ''}{formatDate(card.dueDate)}
            </div>
          </div>
        )}

        {card.tags && card.tags.length > 0 && (
          <div className={styles.modalSection}>
            <div className={styles.modalSectionLabel}>Tags</div>
            <div className={styles.tagList}>
              {card.tags.map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
        )}

        {card.assignees && card.assignees.length > 0 && (
          <div className={styles.modalSection}>
            <div className={styles.modalSectionLabel}>Assignees</div>
            <div className={styles.modalAssigneeList}>
              {card.assignees.map((a, i) => {
                const user = resolveAssignee(a)
                return (
                  <div key={i} className={styles.modalAssigneeRow}>
                    <Avatar user={user} size={30} borderColor="#1E2130" />
                    <span className={styles.modalAssigneeName}>{user.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className={styles.modalSection}>
          <div className={styles.modalSectionLabel}>Move to</div>
          <div className={styles.modalMoveButtons}>
            {columns.map(col => {
              const isActive = col.id === currentColumnId
              return (
                <button
                  key={col.id}
                  className={`${styles.moveBtn} ${isActive ? styles.moveBtnActive : ''}`}
                  style={isActive ? { borderColor: col.color || '#64748B', color: col.color || '#64748B' } : undefined}
                  onClick={() => { if (!isActive) onMoveTo(col.id) }}
                  disabled={isActive}
                >
                  <span className={styles.moveBtnDot} style={{ background: col.color || '#64748B' }} />
                  {col.name}
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

/* ── Main Component ── */

export const KanbanBoard: FC = () => {
  Retool.useComponentSettings({ defaultWidth: 960, defaultHeight: 600 })

  const [rawCards] = Retool.useStateArray({
    name: 'cards',
    label: 'Cards',
    description: 'Array of cards: { id, title, description?, column, priority?, assignees?, tags?, dueDate? }',
    defaultValue: [],
  })

  const [rawColumns] = Retool.useStateArray({
    name: 'columns',
    label: 'Columns',
    description: 'Array of columns: { id, name, color?, limit? }. Leave empty to use default columns.',
    defaultValue: [],
  })

  const [rawUsers] = Retool.useStateArray({
    name: 'users',
    label: 'Users',
    description: 'Retool users for avatar photos: { id, firstName, lastName, profilePhotoUrl }',
    defaultValue: [],
  })

  const [allowDrag] = Retool.useStateBoolean({
    name: 'allowDrag',
    label: 'Allow drag & drop',
    defaultValue: true,
  })

  const [, setSelectedCard] = Retool.useStateObject({
    name: 'selectedCard',
    label: 'Selected Card',
    description: 'Last clicked card object',
    defaultValue: null,
  })

  const [, setMovedCard] = Retool.useStateObject({
    name: 'movedCard',
    label: 'Moved Card',
    description: 'Most recently moved card, with its new column id',
    defaultValue: null,
  })

  const onCardClick = Retool.useEventCallback({ name: 'cardClick' })
  const onCardMoved = Retool.useEventCallback({ name: 'cardMoved' })

  /* ── Data ── */

  const columns = useMemo<KanbanColumn[]>(() => {
    const cols = Array.isArray(rawColumns) ? (rawColumns as KanbanColumn[]) : []
    return cols.length > 0 ? cols : DEFAULT_COLUMNS
  }, [rawColumns])

  const cards = useMemo<KanbanCard[]>(() => {
    return Array.isArray(rawCards) ? (rawCards as KanbanCard[]) : []
  }, [rawCards])

  const cardMap = useMemo(() => {
    const m = new Map<string, KanbanCard>()
    cards.forEach(c => m.set(String(c.id), c))
    return m
  }, [cards])

  const userMap = useMemo(() => {
    const m = new Map<string, RetoolUser>()
    if (Array.isArray(rawUsers)) {
      ;(rawUsers as RetoolUser[]).forEach(u => { if (u.id) m.set(String(u.id), u) })
    }
    return m
  }, [rawUsers])

  /* ── Card order ── */

  const buildOrder = useCallback((cs: KanbanCard[], cols: KanbanColumn[]) => {
    const order: Record<string, string[]> = {}
    cols.forEach(c => { order[c.id] = [] })
    cs.forEach(card => {
      const colId = String(card.column)
      if (!order[colId]) order[colId] = []
      order[colId].push(String(card.id))
    })
    return order
  }, [])

  const [cardOrder, setCardOrder] = useState<Record<string, string[]>>(() =>
    buildOrder(cards, columns)
  )

  const [localColMap, setLocalColMap] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {}
    cards.forEach(c => { m[String(c.id)] = String(c.column) })
    return m
  })

  const prevSigRef = useRef('')
  useEffect(() => {
    const sig = cards.map(c => `${c.id}:${c.column}`).join(',')
    if (sig !== prevSigRef.current) {
      prevSigRef.current = sig
      setCardOrder(buildOrder(cards, columns))
      const m: Record<string, string> = {}
      cards.forEach(c => { m[String(c.id)] = String(c.column) })
      setLocalColMap(m)
    }
  }, [cards, columns, buildOrder])

  /* ── Modal state ── */

  const [expandedEntry, setExpandedEntry] = useState<{ card: KanbanCard; colId: string } | null>(null)

  /* ── Drag state ── */

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropColId, setDropColId] = useState<string | null>(null)
  const [dropBeforeId, setDropBeforeId] = useState<string | null>(null)
  const dragRef = useRef<{ cardId: string; sourceCol: string } | null>(null)

  /* ── Assignee resolver ── */

  const resolveAssignee = useCallback((a: CardAssignee): ResolvedUser => {
    const retoolUser = a.id ? userMap.get(String(a.id)) : undefined
    const name = retoolUser
      ? [retoolUser.firstName, retoolUser.lastName].filter(Boolean).join(' ') || retoolUser.email || String(a.id)
      : a.name || String(a.id || 'User')
    return {
      name,
      color: a.color || hashColor(name),
      photoUrl: retoolUser?.profilePhotoUrl || a.avatar,
    }
  }, [userMap])

  /* ── Move card ── */

  const moveCard = useCallback((cardId: string, sourceCol: string, targetCol: string, beforeId: string | null = null) => {
    setCardOrder(prev => {
      const next: Record<string, string[]> = {}
      Object.keys(prev).forEach(k => { next[k] = [...prev[k]] })
      next[sourceCol] = (next[sourceCol] || []).filter(id => id !== cardId)
      const targetList = next[targetCol] || []
      if (beforeId && targetList.includes(beforeId)) {
        targetList.splice(targetList.indexOf(beforeId), 0, cardId)
      } else {
        targetList.push(cardId)
      }
      next[targetCol] = targetList
      return next
    })
    setLocalColMap(prev => ({ ...prev, [cardId]: targetCol }))
    const card = cardMap.get(cardId)
    if (card) {
      setMovedCard({ ...card, column: targetCol })
      onCardMoved()
    }
  }, [cardMap, setMovedCard, onCardMoved])

  /* ── Drag handlers (on the drag handle, not the card) ── */

  const handleDragStart = useCallback((e: React.DragEvent, cardId: string, sourceCol: string) => {
    e.dataTransfer.effectAllowed = 'move'
    // Show the parent card as the drag ghost
    const cardEl = (e.currentTarget as HTMLElement).closest('[data-card]') as HTMLElement | null
    if (cardEl) e.dataTransfer.setDragImage(cardEl, 20, 20)
    dragRef.current = { cardId, sourceCol }
    setTimeout(() => setDraggingId(cardId), 0)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggingId(null)
    setDropColId(null)
    setDropBeforeId(null)
    dragRef.current = null
  }, [])

  const handleColDragOver = useCallback((e: React.DragEvent, colId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropColId(colId)
    setDropBeforeId(null)
  }, [])

  const handleCardDragOver = useCallback((e: React.DragEvent, colId: string, cardId: string) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setDropColId(colId)
    setDropBeforeId(cardId)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetCol: string) => {
    e.preventDefault()
    const data = dragRef.current
    if (!data) return
    const { cardId, sourceCol } = data
    const before = dropBeforeId
    moveCard(cardId, sourceCol, targetCol, before)
    setDraggingId(null)
    setDropColId(null)
    setDropBeforeId(null)
    dragRef.current = null
  }, [dropBeforeId, moveCard])

  /* ── Card click (plain onClick — no draggable on the card itself) ── */

  const handleCardClick = useCallback((card: KanbanCard, colId: string) => {
    setExpandedEntry({ card, colId })
    setSelectedCard(card)
    onCardClick()
  }, [setSelectedCard, onCardClick])

  /* ── Modal move ── */

  const handleModalMove = useCallback((targetColId: string) => {
    if (!expandedEntry) return
    const cardId = String(expandedEntry.card.id)
    const sourceCol = localColMap[cardId] || expandedEntry.colId
    if (sourceCol === targetColId) return
    moveCard(cardId, sourceCol, targetColId, null)
    setExpandedEntry(prev => prev ? { ...prev, colId: targetColId } : null)
  }, [expandedEntry, localColMap, moveCard])

  /* ── Render ── */

  return (
    <div className={styles.root}>
      <div className={styles.board}>
        {columns.map(col => {
          const colColor = col.color || '#64748B'
          const colCardIds = cardOrder[col.id] || []
          const colCards = colCardIds
            .map(id => cardMap.get(id))
            .filter((c): c is KanbanCard => c != null)
          const isOver = dropColId === col.id
          const atLimit = col.limit != null && colCards.length >= col.limit

          return (
            <div
              key={col.id}
              className={`${styles.column} ${isOver ? styles.columnOver : ''}`}
              onDragOver={e => handleColDragOver(e, col.id)}
              onDrop={e => handleDrop(e, col.id)}
            >
              <div className={styles.columnHeader}>
                <div className={styles.columnAccent} style={{ background: colColor }} />
                <span className={styles.columnName}>{col.name}</span>
                <span
                  className={`${styles.columnCount} ${atLimit ? styles.columnCountLimit : ''}`}
                  style={atLimit ? undefined : { color: colColor }}
                >
                  {colCards.length}{col.limit != null ? `/${col.limit}` : ''}
                </span>
              </div>

              <div className={styles.cardList}>
                {colCards.map(card => {
                  const isDragging = draggingId === String(card.id)
                  const isDropTarget = dropColId === col.id && dropBeforeId === String(card.id)
                  const visibleAssignees = (card.assignees || []).slice(0, MAX_AVATARS_CARD)
                  const extraAssignees = (card.assignees?.length || 0) - MAX_AVATARS_CARD
                  const overdue = card.dueDate && isOverdue(card.dueDate)
                  const priorityColor = card.priority ? PRIORITY_COLORS[card.priority] : 'transparent'

                  return (
                    <React.Fragment key={card.id}>
                      {isDropTarget && <div className={styles.dropIndicator} />}

                      {/* Card: NOT draggable — clean onClick works perfectly */}
                      <div
                        data-card
                        className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
                        onClick={() => handleCardClick(card, col.id)}
                        onDragOver={e => handleCardDragOver(e, col.id, String(card.id))}
                        style={{ borderLeft: `3px solid ${priorityColor}` }}
                      >
                        <div className={styles.cardTop}>
                          <div className={styles.cardMain}>
                            {card.priority && (
                              <div className={styles.priorityBadge} style={{ color: priorityColor }}>
                                {PRIORITY_LABELS[card.priority] || card.priority}
                              </div>
                            )}
                            <div className={styles.cardTitle}>{card.title}</div>
                            {card.description && (
                              <div className={styles.cardDescription}>{card.description}</div>
                            )}
                            {card.tags && card.tags.length > 0 && (
                              <div className={styles.tagList}>
                                {card.tags.map(tag => (
                                  <span key={tag} className={styles.tag}>{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Drag handle — only this is draggable */}
                          {allowDrag && (
                            <div
                              className={styles.dragHandle}
                              draggable
                              onDragStart={e => handleDragStart(e, String(card.id), col.id)}
                              onDragEnd={handleDragEnd}
                              onClick={e => e.stopPropagation()}
                              title="Drag to move"
                            >
                              <DragIcon />
                            </div>
                          )}
                        </div>

                        <div className={styles.cardFooter}>
                          {card.dueDate ? (
                            <span className={`${styles.dueDate} ${overdue ? styles.dueDateOverdue : ''}`}>
                              {overdue ? '⚠ ' : ''}{formatDateShort(card.dueDate)}
                            </span>
                          ) : <span />}

                          {visibleAssignees.length > 0 && (
                            <div className={styles.avatarList}>
                              {visibleAssignees.map((a, i) => (
                                <Avatar key={i} user={resolveAssignee(a)} size={22} />
                              ))}
                              {extraAssignees > 0 && (
                                <div
                                  className={styles.avatar}
                                  style={{ width: 22, height: 22, fontSize: 8, background: '#334155' }}
                                  title={`+${extraAssignees} more`}
                                >
                                  +{extraAssignees}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  )
                })}

                {dropColId === col.id && !dropBeforeId && (
                  <div className={styles.dropIndicator} />
                )}

                {colCards.length === 0 && dropColId !== col.id && (
                  <div className={styles.emptyCol}>Drop cards here</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {expandedEntry && (
        <CardModal
          card={expandedEntry.card}
          currentColumnId={localColMap[String(expandedEntry.card.id)] || expandedEntry.colId}
          columns={columns}
          resolveAssignee={resolveAssignee}
          onClose={() => setExpandedEntry(null)}
          onMoveTo={handleModalMove}
        />
      )}
    </div>
  )
}

/* ── Drag handle icon ── */

const DragIcon: React.FC = () => (
  <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="4" cy="3" r="1.5" fill="currentColor" />
    <circle cx="8" cy="3" r="1.5" fill="currentColor" />
    <circle cx="4" cy="8" r="1.5" fill="currentColor" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    <circle cx="4" cy="13" r="1.5" fill="currentColor" />
    <circle cx="8" cy="13" r="1.5" fill="currentColor" />
  </svg>
)
