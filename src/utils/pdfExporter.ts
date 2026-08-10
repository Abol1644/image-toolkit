import { jsPDF } from 'jspdf'
import type { ProcessedItem } from '../types'
import { canvasToDataUrl, downloadBlob, hasAlpha } from './imageExporter'

export async function exportImagesAsPdf(items: ProcessedItem[], fileName: string): Promise<void> {
  let pdf: jsPDF | null = null
  for (const item of items) {
    const { canvas, width, height } = item
    const usePng = hasAlpha(canvas)
    const data = canvasToDataUrl(canvas, usePng ? 'png' : 'jpeg', usePng ? undefined : 0.92)
    const orientation = width >= height ? 'landscape' : 'portrait'
    if (!pdf) {
      pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [width, height],
        hotfixes: ['px_scaling'],
        compress: true,
      })
    } else {
      pdf.addPage([width, height], orientation)
    }
    pdf.addImage(data, 0, 0, width, height)
  }
  if (pdf) {
    const blob = pdf.output('blob')
    downloadBlob(blob, fileName)
  }
}
