import { useCallback, useMemo, useState } from 'react'
import type { ImageFileRecord, ImageSource } from '../types'
import { closeSource, loadImageSource, sourceHeight, sourceWidth } from '../utils/imageLoader'

let idCounter = 0

function createId(): string {
  idCounter += 1
  return `img-${Date.now().toString(36)}-${idCounter}`
}

export function useImageFiles() {
  const [images, setImages] = useState<ImageFileRecord[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const addError = useCallback((message: string) => {
    setErrors((prev) => [...prev, message])
  }, [])

  const dismissError = useCallback((index: number) => {
    setErrors((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const addFiles = useCallback(
    async (files: File[]) => {
      const newRecords: ImageFileRecord[] = []
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          addError(`${file.name}: not an image file.`)
          continue
        }
        try {
          const source = await loadImageSource(file)
          const url = URL.createObjectURL(file)
          newRecords.push({
            id: createId(),
            name: file.name,
            file,
            url,
            width: sourceWidth(source),
            height: sourceHeight(source),
            source,
          })
        } catch (err) {
          addError(`${file.name}: ${err instanceof Error ? err.message : 'could not be loaded.'}`)
        }
      }
      if (newRecords.length > 0) {
        setImages((prev) => [...prev, ...newRecords])
        setSelected((prev) => [...prev, ...newRecords.map((r) => r.id)])
        setActiveId((prev) => prev ?? newRecords[0].id)
      }
    },
    [addError],
  )

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const record = prev.find((r) => r.id === id)
      if (record) {
        closeSource(record.source)
        URL.revokeObjectURL(record.url)
      }
      return prev.filter((r) => r.id !== id)
    })
    setSelected((prev) => prev.filter((sid) => sid !== id))
    setActiveId((prev) => (prev === id ? null : prev))
  }, [])

  const replaceSource = useCallback(
    (id: string, source: ImageSource, url: string, width: number, height: number) => {
      setImages((prev) =>
        prev.map((r) => {
          if (r.id !== id) {
            return r
          }
          closeSource(r.source)
          URL.revokeObjectURL(r.url)
          return { ...r, source, url, width, height }
        }),
      )
    },
    [],
  )

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }, [])

  const selectAll = useCallback(() => {
    setSelected(images.map((r) => r.id))
  }, [images])

  const clearSelection = useCallback(() => {
    setSelected([])
  }, [])

  const activeImage = useMemo(() => images.find((r) => r.id === activeId) ?? null, [images, activeId])

  const selectedImages = useMemo(() => images.filter((r) => selected.includes(r.id)), [images, selected])

  return {
    images,
    selected,
    activeId,
    activeImage,
    selectedImages,
    errors,
    addFiles,
    removeImage,
    replaceSource,
    toggleSelect,
    selectAll,
    clearSelection,
    setActiveId,
    addError,
    dismissError,
  }
}
