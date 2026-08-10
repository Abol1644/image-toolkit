import type { CropMode, CropPreset, CropRect, EditorSettings, ImageFileRecord, Rotation } from '../types'
import { CROP_ASPECTS, centerCropRect } from '../utils/imageCrop'
import { computeOutputSize } from '../utils/imageExporter'
import CropArea from './CropArea'

interface EditorPanelProps {
  image: ImageFileRecord | null
  settings: EditorSettings
  busy: boolean
  onUpdate: (patch: Partial<EditorSettings>) => void
  onReset: () => void
}

const PRESETS: { value: CropPreset; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
  { value: '16:9', label: '16:9' },
]

const CROP_MODES: { value: CropMode; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'precise', label: 'Precise' },
  { value: 'center', label: 'Center' },
]

export default function EditorPanel({ image, settings, busy, onUpdate, onReset }: EditorPanelProps) {
  if (!image) {
    return (
      <div className="editor editor-empty">
        <p>Upload an image to start editing.</p>
      </div>
    )
  }

  const swap = settings.rotation === 90 || settings.rotation === 270
  const postW = swap ? image.height : image.width
  const postH = swap ? image.width : image.height
  const aspect = CROP_ASPECTS[settings.cropPreset]

  let rect: CropRect
  let interactive = false
  let hideOverlay = true
  if (settings.cropMode === 'precise') {
    rect = settings.cropRect ?? { x: 0, y: 0, width: postW, height: postH }
    interactive = true
    hideOverlay = false
  } else if (settings.cropMode === 'center') {
    rect = centerCropRect(postW, postH, aspect)
    hideOverlay = false
  } else {
    rect = { x: 0, y: 0, width: postW, height: postH }
  }

  const output = computeOutputSize(image.source, settings)

  const clampDim = (value: number) => (Number.isFinite(value) && value > 0 ? value : 1)

  const setDimension = (which: 'width' | 'height', value: number) => {
    const v = clampDim(value)
    if (settings.lockAspect && postW > 0 && postH > 0) {
      if (which === 'width') {
        onUpdate({ targetWidth: v, targetHeight: Math.max(1, Math.round(v * (postH / postW))) })
      } else {
        onUpdate({ targetWidth: Math.max(1, Math.round(v * (postW / postH))), targetHeight: v })
      }
    } else {
      onUpdate(which === 'width' ? { targetWidth: v } : { targetHeight: v })
    }
  }

  const rotateBy = (dir: 1 | -1) => {
    const rotation = ((((settings.rotation + dir * 90) % 360) + 360) % 360) as Rotation
    onUpdate({ rotation, cropRect: null })
  }

  return (
    <div className="editor">
      <header className="editor-header">
        <h2 title={image.name}>{image.name}</h2>
        <span className="editor-dims">
          {image.width} × {image.height}
        </span>
        <button type="button" className="button button-ghost" onClick={onReset} disabled={busy}>
          Reset edits
        </button>
      </header>

      <div className="editor-preview">
        <CropArea
          image={image}
          rotation={settings.rotation}
          flipH={settings.flipH}
          flipV={settings.flipV}
          rect={rect}
          aspect={aspect}
          interactive={interactive}
          hideOverlay={hideOverlay}
          maxWidth={1000}
          maxHeight={620}
          onRectChange={(next) => onUpdate({ cropRect: next })}
        />
      </div>

      <div className="editor-controls">
        <section className="control-group">
          <h3>Resize</h3>
          <div className="segmented">
            <button
              type="button"
              className={settings.resizeMode === 'dimensions' ? 'active' : ''}
              onClick={() => onUpdate({ resizeMode: 'dimensions' })}
              disabled={busy}
            >
              Dimensions
            </button>
            <button
              type="button"
              className={settings.resizeMode === 'percent' ? 'active' : ''}
              onClick={() => onUpdate({ resizeMode: 'percent' })}
              disabled={busy}
            >
              Percent
            </button>
          </div>
          {settings.resizeMode === 'dimensions' ? (
            <div className="dim-row">
              <label>
                W
                <input
                  type="number"
                  min={1}
                  value={settings.targetWidth}
                  onChange={(e) => setDimension('width', Number(e.target.value))}
                  disabled={busy}
                />
              </label>
              <label>
                H
                <input
                  type="number"
                  min={1}
                  value={settings.targetHeight}
                  onChange={(e) => setDimension('height', Number(e.target.value))}
                  disabled={busy}
                />
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={settings.lockAspect}
                  onChange={(e) => onUpdate({ lockAspect: e.target.checked })}
                  disabled={busy}
                />
                Lock ratio
              </label>
            </div>
          ) : (
            <div className="dim-row">
              <input
                type="range"
                min={1}
                max={500}
                value={settings.percent}
                onChange={(e) => onUpdate({ percent: Number(e.target.value) })}
                disabled={busy}
              />
              <input
                type="number"
                min={1}
                max={500}
                value={settings.percent}
                onChange={(e) => onUpdate({ percent: Number(e.target.value) })}
                disabled={busy}
              />
            </div>
          )}
          <p className="hint">
            Output: {output.width} × {output.height}px
          </p>
        </section>

        <section className="control-group">
          <h3>Rotate &amp; Flip</h3>
          <div className="btn-row">
            <button type="button" onClick={() => rotateBy(-1)} disabled={busy}>
              ⟲ 90°
            </button>
            <button type="button" onClick={() => rotateBy(1)} disabled={busy}>
              ⟳ 90°
            </button>
            <button
              type="button"
              className={settings.flipH ? 'active' : ''}
              onClick={() => onUpdate({ flipH: !settings.flipH, cropRect: null })}
              disabled={busy}
            >
              Flip H
            </button>
            <button
              type="button"
              className={settings.flipV ? 'active' : ''}
              onClick={() => onUpdate({ flipV: !settings.flipV, cropRect: null })}
              disabled={busy}
            >
              Flip V
            </button>
          </div>
        </section>

        <section className="control-group">
          <h3>Crop</h3>
          <div className="segmented">
            {CROP_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                className={settings.cropMode === mode.value ? 'active' : ''}
                onClick={() => onUpdate({ cropMode: mode.value })}
                disabled={busy}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <label className="select-row">
            Ratio
            <select
              value={settings.cropPreset}
              onChange={(e) => onUpdate({ cropPreset: e.target.value as CropPreset })}
              disabled={settings.cropMode === 'none' || busy}
            >
              {PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <p className="hint">
            Precise: drag inside to move, corner handles to resize, double-click for full image. Center: batch crop.
          </p>
        </section>
      </div>
    </div>
  )
}
