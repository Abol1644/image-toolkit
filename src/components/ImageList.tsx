import type { ImageFileRecord } from '../types'

interface ImageListProps {
  images: ImageFileRecord[]
  selected: string[]
  activeId: string | null
  disabled: boolean
  onActivate: (id: string) => void
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onSelectAll: () => void
  onClearSelection: () => void
}

export default function ImageList({
  images,
  selected,
  activeId,
  disabled,
  onActivate,
  onToggle,
  onRemove,
  onSelectAll,
  onClearSelection,
}: ImageListProps) {
  return (
    <div className="image-list">
      <header className="list-header">
        <h2>
          Images <span className="count">{images.length}</span>
        </h2>
        <div className="btn-row">
          <button className="button button-ghost" onClick={onSelectAll} disabled={disabled || images.length === 0}>
            Select all
          </button>
          <button className="button button-ghost" onClick={onClearSelection} disabled={disabled || selected.length === 0}>
            Clear
          </button>
        </div>
      </header>
      {images.length === 0 ? (
        <p className="empty-note">Drop images above to get started.</p>
      ) : (
        <ul className="thumb-grid">
          {images.map((img) => {
            const isActive = img.id === activeId
            const isSelected = selected.includes(img.id)
            return (
              <li key={img.id}>
                <div className={`thumb ${isActive ? 'active' : ''}`}>
                  <img src={img.url} alt={img.name} draggable={false} onClick={() => onActivate(img.id)} />
                  <button
                    type="button"
                    className={`thumb-check ${isSelected ? 'on' : ''}`}
                    onClick={() => onToggle(img.id)}
                    aria-label={isSelected ? `Deselect ${img.name}` : `Select ${img.name}`}
                    disabled={disabled}
                  >
                    {isSelected ? '✓' : ''}
                  </button>
                  <button
                    type="button"
                    className="thumb-remove"
                    onClick={() => onRemove(img.id)}
                    aria-label={`Remove ${img.name}`}
                    disabled={disabled}
                  >
                    ×
                  </button>
                  <span className="thumb-dims">
                    {img.width}×{img.height}
                  </span>
                </div>
                <p className="thumb-name" title={img.name}>
                  {img.name}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
