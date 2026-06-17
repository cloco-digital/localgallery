import './style.css'

const folderInput = document.getElementById('folder-input') as HTMLInputElement
const gallery = document.getElementById('gallery') as HTMLDivElement
const overlay = document.getElementById('overlay') as HTMLDivElement
const overlayImg = document.getElementById('overlay-img') as HTMLImageElement

let images: File[] = []
let currentIndex = 0
let tallMode = false

const STORAGE_KEY = 'localgallery_rotations'

const IMAGE_TYPES = new Set([
  'image/apng',
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/heic',
])

function isImage(file: File): boolean {
  if (IMAGE_TYPES.has(file.type)) return true
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' ||
         ext === 'webp' || ext === 'svg' || ext === 'bmp' || ext === 'avif' ||
         ext === 'heic' || ext === 'tiff' || ext === 'tif'
}

function sortByMtime(files: File[]): File[] {
  return [...files].sort((a, b) => (a.lastModified || 0) - (b.lastModified || 0))
}

function getFileHash(file: File): string {
  return `${file.name}|${file.size}|${file.lastModified}`
}

function getRotations(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function setRotation(hash: string, deg: number) {
  const rotations = getRotations()
  rotations[hash] = deg
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rotations))
}

function getRotation(file: File): number {
  return getRotations()[getFileHash(file)] || 0
}

function isTall(width: number, height: number): boolean {
  return height > width
}

function getDisplayRotation(storedDeg: number, isTallImage: boolean): number {
  return storedDeg + (tallMode && isTallImage ? 90 : 0)
}

function applyThumbnailRotation(img: HTMLImageElement, file: File, isTallImg: boolean) {
  const stored = getRotation(file)
  const total = getDisplayRotation(stored, isTallImg)
  img.style.setProperty('--rotation', `${total}deg`)
}

function applyOverlayRotation(file: File, isTallImg: boolean) {
  const stored = getRotation(file)
  const total = getDisplayRotation(stored, isTallImg)
  overlayImg.style.transform = `rotate(${total}deg)`
  if (total === 90 || total === 270) {
    overlayImg.style.maxWidth = '100vh'
    overlayImg.style.maxHeight = '100vw'
  } else {
    overlayImg.style.maxWidth = ''
    overlayImg.style.maxHeight = ''
  }
}

function rotateCurrentImage() {
  if (images.length === 0) return
  const file = images[currentIndex]
  const hash = getFileHash(file)
  const currentDeg = getRotation(file)
  const newDeg = (currentDeg + 90) % 360
  setRotation(hash, newDeg)

  const isTallImg = isTall(overlayImg.naturalWidth, overlayImg.naturalHeight)
  applyOverlayRotation(file, isTallImg)

  const thumb = gallery.querySelector(`.thumb[data-index="${currentIndex}"] img`) as HTMLImageElement | null
  if (thumb) {
    const isThumbTall = isTall(thumb.naturalWidth, thumb.naturalHeight)
    applyThumbnailRotation(thumb, file, isThumbTall)
  }
}

function toggleTallMode() {
  tallMode = !tallMode
  renderGallery()
  if (!overlay.classList.contains('hidden')) {
    const file = images[currentIndex]
    const isTallImg = isTall(overlayImg.naturalWidth, overlayImg.naturalHeight)
    applyOverlayRotation(file, isTallImg)
  }
}

function toggleBrowserFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    overlay.requestFullscreen()
  }
}

function renderGallery() {
  gallery.innerHTML = ''
  for (let i = 0; i < images.length; i++) {
    const file = images[i]
    const url = URL.createObjectURL(file)

    const wrapper = document.createElement('div')
    wrapper.className = 'thumb'
    wrapper.dataset.index = String(i)

    const img = document.createElement('img')
    img.src = url
    img.alt = file.name
    img.loading = 'lazy'

    applyThumbnailRotation(img, file, false)

    img.onload = () => {
      const isTallImg = isTall(img.naturalWidth, img.naturalHeight)
      applyThumbnailRotation(img, file, isTallImg)
    }

    wrapper.appendChild(img)
    wrapper.addEventListener('click', () => openFullscreen(i))
    gallery.appendChild(wrapper)
  }
}

function openFullscreen(index: number) {
  if (images.length === 0) return
  currentIndex = index
  updateOverlayImage()
  overlay.classList.remove('hidden')
}

function closeFullscreen() {
  overlay.classList.add('hidden')
  if (document.fullscreenElement) {
    document.exitFullscreen()
  }
  // Clear stale transform so the next open starts clean
  overlayImg.style.transform = ''
  overlayImg.style.maxWidth = ''
  overlayImg.style.maxHeight = ''
}

function prevImage() {
  if (images.length === 0) return
  currentIndex = (currentIndex - 1 + images.length) % images.length
  updateOverlayImage()
}

function nextImage() {
  if (images.length === 0) return
  currentIndex = (currentIndex + 1) % images.length
  updateOverlayImage()
}

function updateOverlayImage() {
  const file = images[currentIndex]
  const url = URL.createObjectURL(file)

  // Reset transform immediately so the old image doesn't flash
  // with the previous rotation while the new one loads.
  overlayImg.style.transform = ''
  overlayImg.style.maxWidth = ''
  overlayImg.style.maxHeight = ''

  overlayImg.onload = () => {
    const isTallImg = isTall(overlayImg.naturalWidth, overlayImg.naturalHeight)
    applyOverlayRotation(file, isTallImg)
  }
  overlayImg.src = url
}

folderInput.addEventListener('change', () => {
  const files = Array.from(folderInput.files || [])
  images = sortByMtime(files.filter(isImage))
  renderGallery()
})

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeFullscreen()
})

document.addEventListener('keydown', (e) => {
  if (overlay.classList.contains('hidden')) return
  if (e.key === 'Escape') closeFullscreen()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'r' || e.key === 'R') {
    e.preventDefault()
    rotateCurrentImage()
  }
  if (e.key === 'f' || e.key === 'F') {
    e.preventDefault()
    toggleBrowserFullscreen()
  }
  if (e.key === 't' || e.key === 'T') {
    e.preventDefault()
    toggleTallMode()
  }
})
