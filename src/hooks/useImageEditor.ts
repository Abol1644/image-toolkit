import { useCallback, useState } from 'react'
import type { EditorSettings } from '../types'

const DEFAULT_SETTINGS: EditorSettings = {
  resizeMode: 'percent',
  targetWidth: 800,
  targetHeight: 600,
  lockAspect: true,
  percent: 100,
  rotation: 0,
  flipH: false,
  flipV: false,
  cropMode: 'none',
  cropPreset: 'free',
  cropRect: null,
  format: 'png',
  quality: 0.9,
}

export function useImageEditor() {
  const [settings, setSettings] = useState<EditorSettings>({ ...DEFAULT_SETTINGS })

  const update = useCallback((patch: Partial<EditorSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetCrop = useCallback(() => {
    setSettings((prev) => ({ ...prev, cropMode: 'none', cropRect: null }))
  }, [])

  const resetEdits = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      resizeMode: 'percent',
      percent: 100,
      rotation: 0,
      flipH: false,
      flipV: false,
      cropMode: 'none',
      cropRect: null,
    }))
  }, [])

  return { settings, update, resetCrop, resetEdits }
}
