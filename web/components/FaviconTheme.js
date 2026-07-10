"use client"

import { useCallback, useEffect } from "react"
import config from "@/config"

const MARK = config.brand.logoIconMarkSrc || "/kickiie/logo-icon-mark.png"
const BG_LIGHT = "#F9F7F2"
const BG_DARK = "#18181B"
const INVERT_FILTER = "invert(1) hue-rotate(180deg) saturate(0.92)"

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function shouldUseDark() {
  const theme = document.documentElement.getAttribute("data-theme")
  if (theme === "vibefast-dark") return true
  if (theme === "vibefast") return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export default function FaviconTheme() {
  const renderFavicon = useCallback((dark) => {
    let link = document.querySelector('link[rel="icon"][data-kickiie-dynamic]')
    if (!link) {
      link = document.createElement("link")
      link.rel = "icon"
      link.setAttribute("data-kickiie-dynamic", "true")
      document.head.appendChild(link)
    }

    const img = new Image()
    img.onload = () => {
      const size = 32
      const pad = size * 0.05
      const radius = size * 0.22
      const canvas = document.createElement("canvas")
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      roundRect(ctx, 0, 0, size, size, radius)
      ctx.fillStyle = dark ? BG_DARK : BG_LIGHT
      ctx.fill()

      ctx.save()
      roundRect(ctx, 0, 0, size, size, radius)
      ctx.clip()
      if (dark) ctx.filter = INVERT_FILTER
      ctx.drawImage(img, pad, pad, size - pad * 2, size - pad * 2)
      ctx.restore()

      link.href = canvas.toDataURL("image/png")
      link.type = "image/png"
    }
    img.src = MARK
  }, [])

  useEffect(() => {
    const update = () => renderFavicon(shouldUseDark())
    update()

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    mq.addEventListener("change", update)

    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })

    return () => {
      mq.removeEventListener("change", update)
      observer.disconnect()
    }
  }, [renderFavicon])

  return null
}
