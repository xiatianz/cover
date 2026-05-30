import { reactive, ref } from 'vue'
import { defaultConfig } from '../config'

/* ── Off-screen canvas factory ───────────────────────── */
function makeLayer(w, h) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const x = c.getContext('2d', { alpha: true, colorSpace: 'srgb' })
  x.imageSmoothingEnabled = true
  x.imageSmoothingQuality = 'high'
  return { c, x }
}

/* ── Module-level singletons ─────────────────────────── */
let { c: bgCanvas,   x: bgCtx }   = makeLayer(1000, 500)
let { c: txtCanvas,  x: txtCtx }  = makeLayer(1000, 500)
let { c: wmCanvas,   x: wmCtx }   = makeLayer(1000, 500)
let { c: sqCanvas,   x: sqCtx }   = makeLayer(1000, 500)

let canvas = null
let ctx = null
const imgCache = new Map()

/* ── Reactive state ──────────────────────────────────── */
export const state = reactive({
  bgImageUrl: null,
  squareImageUrl: null,
  bgColor: '#ffffff',
  bgGradient: null,  // [color1, color2] or null
  textColor: '#eeeeee',
  watermarkColor: '#dddddd',
  iconColor: '#eeeeee',
  rotation: 0,
  shadowColor: '#646464',
  shadowBlur: 120,
  shadowOffsetX: 1,
  shadowOffsetY: 1,
  shadowStrength: 60,
  watermark: defaultConfig.watermark,
  textSize: 120,
  lineHeight: 1,
  text3D: 0,
  squareSize: 300,
  text: defaultConfig.text,
  bgBlur: 3,
  iconBgSize: 0,
  selectedFont: defaultConfig.fontFamily,
  isFontMenuOpen: false,
  hasMultipleLines: false,
  canvasScale: 1,
  baseWidth: 1000,
  baseHeight: 500,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  iconOffsetX: 0,
  iconOffsetY: 0
})

/* ── Undo / Redo ─────────────────────────────────────── */
const undoStack = ref([])
const redoStack = ref([])
export const canUndo = ref(false)
export const canRedo = ref(false)

const SNAPSHOT_KEYS = [
  'bgColor','bgGradient','textColor','watermarkColor','iconColor','rotation',
  'shadowColor','shadowStrength','watermark','textSize','lineHeight',
  'text3D','squareSize','text','bgBlur','iconBgSize','selectedFont',
  'iconOffsetX','iconOffsetY'
]

function snapshot() {
  const s = {}
  SNAPSHOT_KEYS.forEach(k => s[k] = state[k])
  return s
}

export function takeSnapshot() {
  undoStack.value.push(snapshot())
  if (undoStack.value.length > 60) undoStack.value.shift()
  redoStack.value = []
  canUndo.value = undoStack.value.length > 0
  canRedo.value = false
}

function restoreSnapshot(s) {
  SNAPSHOT_KEYS.forEach(k => { state[k] = s[k] })
  state.hasMultipleLines = state.text.includes('\n')
  drawAll()
}

export function undo() {
  if (!undoStack.value.length) return
  redoStack.value.push(snapshot())
  restoreSnapshot(undoStack.value.pop())
  canUndo.value = undoStack.value.length > 0
  canRedo.value = true
}

export function redo() {
  if (!redoStack.value.length) return
  undoStack.value.push(snapshot())
  restoreSnapshot(redoStack.value.pop())
  canUndo.value = true
  canRedo.value = redoStack.value.length > 0
}

/* ── Image loader ────────────────────────────────────── */
function loadImg(file, cb) {
  if (imgCache.has(file)) return cb(imgCache.get(file))
  const r = new FileReader()
  r.onload = e => { imgCache.set(file, e.target.result); cb(e.target.result) }
  r.readAsDataURL(file)
}

/* ── Layer resizing ──────────────────────────────────── */
function resizeLayers(w, h) {
  ;[bgCanvas, txtCanvas, wmCanvas, sqCanvas].forEach(c => { c.width = w; c.height = h })
}

/* ── Update dispatcher ───────────────────────────────── */
export function updatePreview(type, event) {
  const map = {
    bg:             () => updateBgImage(event),
    bgColor:        () => { state.bgColor = event.target.value; state.bgImageUrl = null; state.bgGradient = null; drawBg() },
    bgGradient:     () => { state.bgGradient = event; state.bgImageUrl = null; drawBg() },
    textColor:      () => { state.textColor = event.target.value; drawTxt() },
    watermarkColor: () => { state.watermarkColor = event.target.value; drawWm() },
    square:         () => updateSqImage(event),
    rotation:       () => { state.rotation = event.target.value; drawSq() },
    text:           () => { state.text = event.target.value || defaultConfig.text; state.hasMultipleLines = state.text.includes('\n'); drawTxt() },
    watermark:      () => { state.watermark = event.target.value; drawWm() },
    textSize:       () => { state.textSize = event.target.value; drawTxt() },
    squareSize:     () => { state.squareSize = event.target.value; drawSq() },
    bgBlur:         () => debounceBgBlur(event),
    iconColor:      () => { state.iconColor = event.target.value; drawSq() },
    iconBgSize:     () => { state.iconBgSize = Number(event.target.value); drawSq() },
    font:           () => {
      state.selectedFont = event.target.value
      const font = `600 ${state.textSize * state.canvasScale}px ${event.target.value}`
      document.fonts.load(font).then(() => { drawTxt(); drawWm() }).catch(() => { drawTxt(); drawWm() })
    },
    lineHeight:     () => drawTxt(),
    text3D:         () => { state.text3D = event.target.value; drawTxt() },
    shadowColor:    () => { state.shadowColor = event.target.value; drawSq() },
    shadowStrength: () => { state.shadowBlur = state.shadowStrength * 2; state.shadowOffsetX = 0; state.shadowOffsetY = 0; drawSq() },
    resize:         () => handleResize()
  }
  map[type]?.()
}

/* ── Background ──────────────────────────────────────── */
function updateBgImage(event) {
  const f = event.target.files?.[0]
  if (!f) return
  loadImg(f, url => { state.bgImageUrl = url; drawBg() })
}

let bgBlurTimer = null
function debounceBgBlur(event) {
  state.bgBlur = event.target.value
  clearTimeout(bgBlurTimer)
  bgBlurTimer = setTimeout(drawBg, 16)
}

function drawBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height)
  bgCtx.imageSmoothingEnabled = true
  bgCtx.imageSmoothingQuality = 'high'

  if (state.bgImageUrl) {
    const img = new Image()
    img.onload = () => {
      const rs = Math.max(3, Math.min(8, 1200 / Math.min(bgCanvas.width, bgCanvas.height)))
      const tmp = document.createElement('canvas')
      const tx = tmp.getContext('2d', { alpha: true })
      tmp.width = bgCanvas.width * rs; tmp.height = bgCanvas.height * rs
      tx.imageSmoothingEnabled = true; tx.imageSmoothingQuality = 'high'
      const sc = Math.max(tmp.width / img.width, tmp.height / img.height)
      const w = img.width * sc, h = img.height * sc
      if (state.bgBlur > 0) tx.filter = `blur(${state.bgBlur * rs}px)`
      tx.drawImage(img, (tmp.width - w) / 2, (tmp.height - h) / 2, w, h)
      tx.filter = 'none'
      bgCtx.drawImage(tmp, 0, 0, tmp.width, tmp.height, 0, 0, bgCanvas.width, bgCanvas.height)
      compose()
    }
    img.src = state.bgImageUrl
  } else {
      if (state.bgGradient && state.bgGradient.length >= 2) {
        const grad = bgCtx.createLinearGradient(0, 0, bgCanvas.width, bgCanvas.height)
        state.bgGradient.forEach((c, i) => grad.addColorStop(i / (state.bgGradient.length - 1), c))
        bgCtx.fillStyle = grad
        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height)
      } else if (state.bgColor && state.bgColor !== 'transparent') {
        bgCtx.fillStyle = state.bgColor
        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height)
      }
      compose()
    }
}

/* ── Icon / square ───────────────────────────────────── */
function updateSqImage(event) {
  const f = event.target.files?.[0]
  if (!f) return
  loadImg(f, url => { state.squareImageUrl = url; drawSq() })
}

function drawSq() {
  sqCtx.clearRect(0, 0, sqCanvas.width, sqCanvas.height)
  sqCtx.imageSmoothingEnabled = true
  sqCtx.imageSmoothingQuality = 'high'

  if (!state.squareImageUrl) { compose(); return }

  const img = new Image()
  img.onload = () => {
    const sc = state.canvasScale
    const total = state.squareSize * sc
    const bw = 20 * sc, sz = total - 2 * bw, r = 30 * sc
    const bx = (sqCanvas.width - total) / 2, by = (sqCanvas.height - total) / 2

    const tmp = document.createElement('canvas')
    tmp.width = total; tmp.height = total
    const tx = tmp.getContext('2d')
    tx.imageSmoothingEnabled = true; tx.imageSmoothingQuality = 'high'

    // icon background
    if (state.iconBgSize > 0) {
      const p = state.iconBgSize
      tx.fillStyle = state.iconColor
      tx.beginPath()
      tx.moveTo(r + bw - p, bw - p)
      tx.arcTo(total - bw + p, bw - p, total - bw + p, r + bw - p, r)
      tx.arcTo(total - bw + p, total - bw + p, total - r - bw + p, total - bw + p, r)
      tx.arcTo(bw - p, total - bw + p, bw - p, total - r - bw + p, r)
      tx.arcTo(bw - p, bw - p, r + bw - p, bw - p, r)
      tx.closePath(); tx.fill()
    }

    // clip & draw image
    tx.save(); tx.beginPath()
    tx.moveTo(r + bw, bw)
    tx.arcTo(total - bw, bw, total - bw, r + bw, r)
    tx.arcTo(total - bw, total - bw, total - r - bw, total - bw, r)
    tx.arcTo(bw, total - bw, bw, total - r - bw, r)
    tx.arcTo(bw, bw, r + bw, bw, r)
    tx.closePath(); tx.clip()

    const iar = img.width / img.height
    const sw = iar > 1 ? sz : sz * iar
    const sh = iar > 1 ? sz / iar : sz
    tx.drawImage(img, bw + (sz - sw) / 2, bw + (sz - sh) / 2, sw, sh)
    tx.restore()

    sqCtx.save()
    sqCtx.shadowColor = state.shadowColor
    sqCtx.shadowBlur = state.shadowBlur * sc
    sqCtx.shadowOffsetX = state.shadowOffsetX * sc
    sqCtx.shadowOffsetY = state.shadowOffsetY * sc

    const ix = bx + state.iconOffsetX, iy = by + state.iconOffsetY
    sqCtx.translate(ix + total / 2, iy + total / 2)
    sqCtx.rotate(state.rotation * Math.PI / 180)
    sqCtx.translate(-(ix + total / 2), -(iy + total / 2))
    sqCtx.drawImage(tmp, ix, iy, total, total)
    sqCtx.restore()
    compose()
  }
  img.src = state.squareImageUrl
}

/* ── Text ────────────────────────────────────────────── */
function drawTxt() {
  txtCtx.clearRect(0, 0, txtCanvas.width, txtCanvas.height)
  txtCtx.imageSmoothingEnabled = true; txtCtx.imageSmoothingQuality = 'high'

  const cs = getComputedStyle(document.documentElement)
  const font = state.selectedFont
    ? `${state.selectedFont}, ${cs.fontFamily}`
    : cs.fontFamily
  const fs = state.textSize * state.canvasScale
  txtCtx.font = `600 ${fs}px ${font}`
  txtCtx.fillStyle = state.textColor
  txtCtx.textAlign = 'center'
  txtCtx.textBaseline = 'middle'

  if (state.text3D > 0) {
    txtCtx.shadowColor = 'rgba(0,0,0,.4)'
    txtCtx.shadowBlur = state.text3D * 0.5 * state.canvasScale
    txtCtx.shadowOffsetX = state.text3D * state.canvasScale
    txtCtx.shadowOffsetY = state.text3D * state.canvasScale
  } else {
    txtCtx.shadowColor = 'transparent'
    txtCtx.shadowBlur = 0; txtCtx.shadowOffsetX = 0; txtCtx.shadowOffsetY = 0
  }

  const lines = state.text.split('\n')
  const lh = fs * state.lineHeight
  const sy = (txtCanvas.height - lh * lines.length) / 2 + lh / 2
  lines.forEach((l, i) => txtCtx.fillText(l, txtCanvas.width / 2, sy + i * lh))
  compose()
}

/* ── Watermark ───────────────────────────────────────── */
function drawWm() {
  wmCtx.clearRect(0, 0, wmCanvas.width, wmCanvas.height)
  wmCtx.imageSmoothingEnabled = true; wmCtx.imageSmoothingQuality = 'high'

  const cs = getComputedStyle(document.documentElement)
  const fontMap = { MaoMaoTi: 'ZCOOL KuaiLe', KeAiTi: 'Ma Shan Zheng', ShouXieTi: 'ZCOOL QingKe HuangYou', KaTongTi: 'ZCOOL XiaoWei' }
  const af = fontMap[state.selectedFont] || state.selectedFont
  const font = af ? `${af}, ${cs.fontFamily}` : cs.fontFamily
  const fs = 14 * state.canvasScale, pad = 20 * state.canvasScale
  wmCtx.font = `italic ${fs}px ${font}`
  wmCtx.fillStyle = state.watermarkColor
  wmCtx.textAlign = 'right'
  wmCtx.fillText(state.watermark, wmCanvas.width - pad, wmCanvas.height - pad)
  compose()
}

/* ── Compose layers ──────────────────────────────────── */
function compose() {
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bgCanvas, 0, 0)
  ctx.drawImage(txtCanvas, 0, 0)
  ctx.drawImage(sqCanvas, 0, 0)
  ctx.drawImage(wmCanvas, 0, 0)
}

/* ── Draw all ────────────────────────────────────────── */
export function drawAll() { drawBg(); drawTxt(); drawWm(); drawSq() }

/* ── Resize handler ──────────────────────────────────── */
function handleResize() {
  state.iconOffsetX = 0; state.iconOffsetY = 0
  if (canvas) {
    state.canvasScale = Math.min(canvas.width / state.baseWidth, canvas.height / state.baseHeight)
    resizeLayers(canvas.width, canvas.height)
  }
  drawAll()
}

export function updateCanvasSizes(w, h) {
  resizeLayers(w, h)
}

/* ── Icon drag ───────────────────────────────────────── */
function mousePos(e) {
  const r = canvas.getBoundingClientRect()
  return { x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height }
}
function touchPos(e) {
  const r = canvas.getBoundingClientRect(), t = e.touches[0]
  return { x: (t.clientX - r.left) * canvas.width / r.width, y: (t.clientY - r.top) * canvas.height / r.height }
}
function hitIcon(x, y) {
  if (!state.squareImageUrl) return false
  const ts = state.squareSize * state.canvasScale
  const bx = (canvas.width - ts) / 2 + state.iconOffsetX
  const by = (canvas.height - ts) / 2 + state.iconOffsetY
  return x >= bx && x <= bx + ts && y >= by && y <= by + ts
}

function onDown(e) {
  const p = mousePos(e)
  if (hitIcon(p.x, p.y)) {
    state.isDragging = true; state.dragStartX = p.x; state.dragStartY = p.y
    canvas.style.cursor = 'grabbing'; e.preventDefault()
  }
}
function onMove(e) {
  const p = mousePos(e)
  if (!state.isDragging) { canvas.style.cursor = hitIcon(p.x, p.y) && state.squareImageUrl ? 'grab' : 'default'; return }
  const ts = state.squareSize * state.canvasScale
  const half = (canvas.width - ts) / 2
  state.iconOffsetX = Math.max(-half, Math.min(half, state.iconOffsetX + p.x - state.dragStartX))
  state.iconOffsetY = Math.max(-half, Math.min(half, state.iconOffsetY + p.y - state.dragStartY))
  state.dragStartX = p.x; state.dragStartY = p.y; drawSq(); e.preventDefault()
}
function onUp() { state.isDragging = false; if (canvas) canvas.style.cursor = 'default' }

function tStart(e) {
  const p = touchPos(e)
  if (hitIcon(p.x, p.y)) { e.preventDefault(); state.isDragging = true; state.dragStartX = p.x; state.dragStartY = p.y }
}
function tMove(e) {
  if (!state.isDragging) return; e.preventDefault()
  const p = touchPos(e)
  const ts = state.squareSize * state.canvasScale, half = (canvas.width - ts) / 2
  state.iconOffsetX = Math.max(-half, Math.min(half, state.iconOffsetX + p.x - state.dragStartX))
  state.iconOffsetY = Math.max(-half, Math.min(half, state.iconOffsetY + p.y - state.dragStartY))
  state.dragStartX = p.x; state.dragStartY = p.y; drawSq()
}
function tEnd(e) { if (state.isDragging) e.preventDefault(); state.isDragging = false }

/* ── Initialize ──────────────────────────────────────── */
export function initialize() {
  canvas = document.getElementById('canvasPreview')
  if (!canvas) { console.error('Canvas not found'); return }
  ctx = canvas.getContext('2d', { alpha: true, colorSpace: 'srgb' })
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'

  canvas.addEventListener('mousedown', onDown)
  canvas.addEventListener('mousemove', onMove)
  canvas.addEventListener('mouseup', onUp)
  canvas.addEventListener('mouseleave', onUp)
  canvas.addEventListener('touchstart', tStart, { passive: false })
  canvas.addEventListener('touchmove', tMove, { passive: false })
  canvas.addEventListener('touchend', tEnd, { passive: false })

  drawAll()
}

/* ── Save helpers ────────────────────────────────────── */
export function saveImage(format, quality = 1) {
  if (!canvas) return
  const ts = Date.now()
  if (format === 'svg') {
    const svg = `<?xml version="1.0"?><svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg"><image href="${canvas.toDataURL('image/png')}" width="${canvas.width}" height="${canvas.height}"/></svg>`
    dl(new Blob([svg], { type: 'image/svg+xml' }), `Cover-Wave-${ts}.svg`)
    return
  }
  if (format === 'ico') {
    const tc = document.createElement('canvas'); tc.width = 256; tc.height = 256
    tc.getContext('2d').drawImage(canvas, 0, 0, 256, 256)
    tc.toBlob(b => dl(b, `Cover-Wave-${ts}.ico`), 'image/png')
    return
  }
  const mime = format === 'jpg' ? 'image/jpeg' : 'image/png'
  canvas.toBlob(b => dl(b, `Cover-Wave-${ts}.${format === 'jpg' ? 'jpg' : 'png'}`), mime, quality)
}

function dl(blob, name) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = name; a.click()
  URL.revokeObjectURL(a.href)
}

export async function copyToClipboard() {
  if (!canvas) return false
  try {
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'))
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    return true
  } catch { return false }
}
