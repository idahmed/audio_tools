import JSZip from 'jszip'
import { downloadBlob } from '@/lib/audio'

export async function downloadZip(files, zipName = 'audio.zip') {
  const zip = new JSZip()
  files.forEach(({ name, blob }) => {
    zip.file(name, blob)
  })
  const blob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(blob, zipName)
}
