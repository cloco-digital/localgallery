import './style.css'

const folderInput = document.getElementById('folder-input') as HTMLInputElement
const gallery = document.getElementById('gallery') as HTMLDivElement
const overlay = document.getElementById('overlay') as HTMLDivElement
const overlayImg = document.getElementById('overlay-img') as HTMLImageElement

let images: File[] = []
let currentIndex = 0

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
})
