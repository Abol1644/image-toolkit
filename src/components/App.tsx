import { useEffect, useMemo, useState } from 'react'
import type { CropRect, EditorSettings, ExportFormat, ImageFileRecord, ImageSource, ProcessedItem } from '../types'
import { useImageEditor } from '../hooks/useImageEditor'
import { useImageFiles } from '../hooks/useImageFiles'
import { downloadBlob, encodeCanvas, EXTENSIONS, isFormatSupported, processImage } from '../utils/imageExporter'
import { exportBlobsAsZip } from '../utils/zipExporter'
import type { ZipItem } from '../utils/zipExporter'
import Dropzone from './Dropzone'
import EditorPanel from './EditorPanel'
import ExportPanel from './ExportPanel'
import ImageList from './ImageList'

function stripExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(0, dot) : name
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong.'
}

export default function App() {
  const files = useImageFiles()
  const editor = useImageEditor()
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    editor.resetCrop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.activeImage?.id ?? null])

  const formatSupport = useMemo(
    () => ({
      png: true,
      jpeg: isFormatSupported('jpeg'),
      webp: isFormatSupported('webp'),
    }),
    [],
  )

  const targets = useMemo(() => {
    if (files.selectedImages.length > 0) {
      return files.selectedImages
    }
    return files.activeImage ? [files.activeImage] : []
  }, [files.selectedImages, files.activeImage])

  const settingsForTarget = (target: ImageFileRecord): EditorSettings => {
    const settings = editor.settings
    if (settings.cropMode !== 'precise' || !settings.cropRect || !files.activeImage || files.activeImage.id === target.id) {
      return settings
    }
    const swap = settings.rotation === 90 || settings.rotation === 270
    const srcW = swap ? files.activeImage.height : files.activeImage.width
    const srcH = swap ? files.activeImage.width : files.activeImage.height
    const dstW = swap ? target.height : target.width
    const dstH = swap ? target.width : target.height
    const fx = dstW / srcW
    const fy = dstH / srcH
    const cropRect: CropRect = {
      x: settings.cropRect.x * fx,
      y: settings.cropRect.y * fy,
      width: settings.cropRect.width * fx,
      height: settings.cropRect.height * fy,
    }
    return { ...settings, cropRect }
  }

  const processTarget = (target: ImageFileRecord): HTMLCanvasElement => {
    return processImage(target.source, settingsForTarget(target))
  }

  const handleExport = async (format: ExportFormat) => {
    if (busy) {
      return
    }
    if (targets.length === 0) {
      files.addError('Add or select an image to export.')
      return
    }
    setBusy('Preparing export…')
    try {
      if (format === 'pdf') {
        const { exportImagesAsPdf } = await import('../utils/pdfExporter')
        const items: ProcessedItem[] = []
        for (let i = 0; i < targets.length; i += 1) {
          setBusy(`Building PDF… ${i + 1}/${targets.length}`)
          const canvas = processTarget(targets[i])
          items.push({ canvas, name: targets[i].name, width: canvas.width, height: canvas.height })
        }
        const name = targets.length === 1 ? `${stripExtension(targets[0].name)}.pdf` : 'image-toolkit.pdf'
        await exportImagesAsPdf(items, name)
      } else if (targets.length === 1) {
        setBusy(`Exporting ${format.toUpperCase()}…`)
        const canvas = processTarget(targets[0])
        const blob = await encodeCanvas(canvas, format, editor.settings.quality)
        downloadBlob(blob, `${stripExtension(targets[0].name)}.${EXTENSIONS[format]}`)
      } else {
        const items: ZipItem[] = []
        for (let i = 0; i < targets.length; i += 1) {
          setBusy(`Zipping ${i + 1}/${targets.length}…`)
          const canvas = processTarget(targets[i])
          const blob = await encodeCanvas(canvas, format, editor.settings.quality)
          items.push({ name: `${stripExtension(targets[i].name)}.${EXTENSIONS[format]}`, blob })
        }
        await exportBlobsAsZip(items, 'image-toolkit.zip')
      }
    } catch (err) {
      files.addError(`Export failed: ${errorMessage(err)}`)
    } finally {
      setBusy(null)
    }
  }

  const applyEdits = async (ids: string[]) => {
    if (busy) {
      return
    }
    if (ids.length === 0) {
      files.addError('No images selected to apply edits to.')
      return
    }
    setBusy('Applying edits…')
    try {
      for (let i = 0; i < ids.length; i += 1) {
        setBusy(`Applying edits… ${i + 1}/${ids.length}`)
        const record = files.images.find((r) => r.id === ids[i])
        if (!record) {
          continue
        }
        const canvas = processTarget(record)
        const blob = await encodeCanvas(canvas, 'png', 1)
        const url = URL.createObjectURL(blob)
        let source: ImageSource = canvas
        if (typeof createImageBitmap === 'function') {
          try {
            source = await createImageBitmap(canvas)
          } catch {
            source = canvas
          }
        }
        files.replaceSource(ids[i], source, url, canvas.width, canvas.height)
      }
      editor.resetEdits()
    } catch (err) {
      files.addError(`Apply failed: ${errorMessage(err)}`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Image Toolkit</h1>
        <p className="tagline">Private, in-browser image editing — nothing leaves your device.</p>
      </header>

      <Dropzone onFiles={files.addFiles} disabled={busy !== null} />

      {files.errors.length > 0 && (
        <div className="error-banner" role="alert">
          {files.errors.map((msg, i) => (
            <div key={`${i}-${msg}`} className="error-item">
              <span>{msg}</span>
              <button type="button" className="icon-button" onClick={() => files.dismissError(i)} aria-label="Dismiss">
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <main className="app-main">
        <aside className="app-side">
          <ImageList
            images={files.images}
            selected={files.selected}
            activeId={files.activeId}
            disabled={busy !== null}
            onActivate={files.setActiveId}
            onToggle={files.toggleSelect}
            onRemove={files.removeImage}
            onSelectAll={files.selectAll}
            onClearSelection={files.clearSelection}
          />
        </aside>

        <section className="app-editor">
          <EditorPanel
            image={files.activeImage}
            settings={editor.settings}
            busy={busy !== null}
            onUpdate={editor.update}
            onReset={editor.resetEdits}
          />
        </section>

        <aside className="app-export">
          <ExportPanel
            settings={editor.settings}
            busy={busy}
            selectedCount={files.selected.length}
            totalCount={files.images.length}
            hasSelection={files.selected.length > 0}
            formatSupport={formatSupport}
            onUpdate={editor.update}
            onExport={handleExport}
            onApplySelected={() => applyEdits(files.selected)}
            onApplyAll={() => applyEdits(files.images.map((r) => r.id))}
          />
        </aside>
      </main>

      <footer className="app-footer">
        <p>All processing happens locally in your browser. Your images are never uploaded.</p>
      </footer>
    </div>
  )
}
