import JSZip from 'jszip'
import { downloadBlob } from './imageExporter'

export interface ZipItem {
  name: string
  blob: Blob
}

export async function exportBlobsAsZip(items: ZipItem[], zipName: string): Promise<void> {
  const zip = new JSZip()
  for (const item of items) {
    zip.file(item.name, item.blob)
  }
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  downloadBlob(blob, zipName)
}
