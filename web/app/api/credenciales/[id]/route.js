import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import QRCode from "qrcode"
import { NextResponse } from "next/server"
import { getAcademyContext } from "@/lib/kickiie/academy"
import { cintaLabel } from "@/lib/kickiie/cintas"

export const runtime = "nodejs"

/** 85 × 55 mm en puntos PDF */
const CARD_W = (85 / 25.4) * 72
const CARD_H = (55 / 25.4) * 72

export async function GET(_request, { params }) {
  const { id } = await params
  const { academia, supabase, membership, user } = await getAcademyContext()
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  if (!membership || !academia) {
    return NextResponse.json({ error: "Sin academia" }, { status: 403 })
  }

  const { data: alumno } = await supabase
    .from("alumnos")
    .select("id, nombre, cinta, qr_token, status")
    .eq("id", id)
    .eq("academia_id", academia.id)
    .maybeSingle()

  if (!alumno) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  }

  const qrPayload = alumno.qr_token
  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    margin: 1,
    width: 256,
    errorCorrectionLevel: "M",
  })
  const qrBase64 = qrDataUrl.split(",")[1]
  const qrBytes = Buffer.from(qrBase64, "base64")

  const pdf = await PDFDocument.create()
  // Hoja carta con la credencial centrada (listo para imprenta local)
  const letterW = 612
  const letterH = 792
  const page = pdf.addPage([letterW, letterH])
  const font = await pdf.embedFont(StandardFonts.HelveticaBold)
  const fontReg = await pdf.embedFont(StandardFonts.Helvetica)
  const qrImage = await pdf.embedPng(qrBytes)

  const x = (letterW - CARD_W) / 2
  const y = (letterH - CARD_H) / 2

  page.drawRectangle({
    x,
    y,
    width: CARD_W,
    height: CARD_H,
    borderColor: rgb(0.2, 0.2, 0.2),
    borderWidth: 1.5,
    color: rgb(1, 1, 1),
  })

  page.drawText(academia.nombre.toUpperCase(), {
    x: x + 10,
    y: y + CARD_H - 18,
    size: 8,
    font,
    color: rgb(0.75, 0.15, 0.15),
  })

  page.drawText(alumno.nombre, {
    x: x + 10,
    y: y + CARD_H - 38,
    size: 11,
    font,
    color: rgb(0.1, 0.1, 0.1),
    maxWidth: CARD_W * 0.55,
  })

  page.drawText(cintaLabel(alumno.cinta), {
    x: x + 10,
    y: y + CARD_H - 54,
    size: 9,
    font: fontReg,
    color: rgb(0.3, 0.3, 0.3),
  })

  page.drawText("Kickiie", {
    x: x + 10,
    y: y + 12,
    size: 7,
    font: fontReg,
    color: rgb(0.5, 0.5, 0.5),
  })

  const qrSize = 70
  page.drawImage(qrImage, {
    x: x + CARD_W - qrSize - 8,
    y: y + (CARD_H - qrSize) / 2,
    width: qrSize,
    height: qrSize,
  })

  page.drawText(`${CARD_W.toFixed(0)}×${CARD_H.toFixed(0)} pt · 85×55 mm`, {
    x: 40,
    y: 40,
    size: 8,
    font: fontReg,
    color: rgb(0.6, 0.6, 0.6),
  })

  const bytes = await pdf.save()
  const filename = `credencial-${alumno.nombre.replace(/\s+/g, "-").toLowerCase()}.pdf`

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
