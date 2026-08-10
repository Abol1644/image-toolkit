import type { EditorSettings, ExportFormat, ImageFormat } from '../types'

interface ExportPanelProps {
  settings: EditorSettings
  busy: string | null
  selectedCount: number
  totalCount: number
  hasSelection: boolean
  formatSupport: Record<ImageFormat, boolean>
  onUpdate: (patch: Partial<EditorSettings>) => void
  onExport: (format: ExportFormat) => void
  onApplySelected: () => void
  onApplyAll: () => void
}

const FORMATS: { value: ImageFormat; label: string }[] = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
]

export default function ExportPanel({
  settings,
  busy,
  selectedCount,
  totalCount,
  hasSelection,
  formatSupport,
  onUpdate,
  onExport,
  onApplySelected,
  onApplyAll,
}: ExportPanelProps) {
  const hasImages = totalCount > 0
  const qualityVisible = settings.format === 'jpeg' || settings.format === 'webp'

  return (
    <div className="export-panel">
      <h2>Export</h2>
      <p className="hint">
        {selectedCount > 1
          ? `${selectedCount} images selected — ZIP or one multi-page PDF.`
          : 'One image — direct download. Multiple images — ZIP or one multi-page PDF.'}
      </p>
      <div className="segmented export-formats">
        {FORMATS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={settings.format === f.value ? 'active' : ''}
            disabled={!formatSupport[f.value]}
            title={formatSupport[f.value] ? '' : `${f.label} not supported by this browser`}
            onClick={() => onUpdate({ format: f.value })}
          >
            {f.label}
          </button>
        ))}
        <button
          type="button"
          className={settings.format === 'pdf' ? 'active' : ''}
          onClick={() => onUpdate({ format: 'pdf' })}
        >
          PDF
        </button>
      </div>
      {qualityVisible && (
        <div className="dim-row">
          <span className="hint">Quality</span>
          <input
            type="range"
            min={10}
            max={100}
            value={Math.round(settings.quality * 100)}
            onChange={(e) => onUpdate({ quality: Number(e.target.value) / 100 })}
          />
          <span className="quality-value">{Math.round(settings.quality * 100)}%</span>
        </div>
      )}
      <button
        type="button"
        className="button button-primary"
        disabled={busy !== null || !hasImages}
        onClick={() => onExport(settings.format)}
      >
        {busy ?? 'Export'}
      </button>

      <hr />

      <h3>Batch apply</h3>
      <button
        type="button"
        className="button"
        disabled={busy !== null || !hasSelection}
        onClick={onApplySelected}
      >
        Apply edits to selected
      </button>
      <button type="button" className="button" disabled={busy !== null || !hasImages} onClick={onApplyAll}>
        Apply edits to all
      </button>
      <p className="hint">
        Apply bakes resize, rotate, flip, crop and format settings into the images so you can keep editing the result.
      </p>
    </div>
  )
}
