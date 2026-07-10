import { readFile, writeFile } from "node:fs/promises"
import { Jimp, intToRGBA } from "jimp"

const SRC = new URL("../public/kickiie/logo-icon-source.png", import.meta.url)
const OUT = new URL("../public/kickiie/logo-icon.png", import.meta.url)
const SIZE = 512
const PADDING_RATIO = 0.06 // 6% margen útil — icono grande sin pegarse al borde

const image = await Jimp.read(await readFile(SRC))

// Recorta fondo claro/transparente alrededor del símbolo
let minX = image.width
let minY = image.height
let maxX = 0
let maxY = 0

image.scan(0, 0, image.width, image.height, function (x, y, idx) {
  const { r, g, b, a } = intToRGBA(this.bitmap.data.readUInt32BE(idx))
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const isBackground = a < 20 || lum > 235
  if (!isBackground) {
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }
})

if (maxX <= minX || maxY <= minY) {
  throw new Error("No se detectó contenido en el favicon")
}

const pad = 2
minX = Math.max(0, minX - pad)
minY = Math.max(0, minY - pad)
maxX = Math.min(image.width - 1, maxX + pad)
maxY = Math.min(image.height - 1, maxY + pad)

const cropW = maxX - minX + 1
const cropH = maxY - minY + 1
const cropped = image.clone().crop({ x: minX, y: minY, w: cropW, h: cropH })

// Cuadrado con padding mínimo
const side = Math.max(cropW, cropH)
const padPx = Math.round(side * PADDING_RATIO)
const canvas = new Jimp({ width: side + padPx * 2, height: side + padPx * 2, color: 0x00000000 })
const offsetX = padPx + Math.floor((side - cropW) / 2)
const offsetY = padPx + Math.floor((side - cropH) / 2)
canvas.composite(cropped, offsetX, offsetY)

// Escala final para favicon nítido
const final = canvas.contain({ w: SIZE, h: SIZE, align: Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE })
await writeFile(OUT, await final.getBuffer("image/png"))
console.log(`OK → ${OUT.pathname} (${SIZE}x${SIZE}, crop ${cropW}x${cropH})`)
