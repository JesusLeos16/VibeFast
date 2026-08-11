import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { NextResponse } from "next/server"
import { getAcademyContext } from "@/lib/kickiie/academy"
import { cintaLabel } from "@/lib/kickiie/cintas"

export const runtime = "nodejs"

const LEGAL_PLACEHOLDER = `
PLACEHOLDER LEGAL — Este documento no ha sido revisado por un abogado.
El tutor o responsable legal declara, bajo protesta de decir verdad, que
autoriza la participación del alumno en las actividades de la academia,
acepta los riesgos inherentes a la práctica de artes marciales, y se
compromete a informar cualquier condición médica relevante.
Al firmar, acepta el tratamiento de datos personales para fines de
gestión académica y asistencia (placeholder de aviso de privacidad).
`.trim()

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
    .select(
      "id, nombre, cinta, fecha_nacimiento, familias(nombre, tutores(nombre, telefono, es_principal))"
    )
    .eq("id", id)
    .eq("academia_id", academia.id)
    .maybeSingle()

  if (!alumno) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  }

  const tutores = alumno.familias?.tutores || []
  const principal =
    tutores.find((t) => t.es_principal) || tutores[0] || null

  const pdf = await PDFDocument.create()
  const page = pdf.addPage([612, 792])
  const font = await pdf.embedFont(StandardFonts.HelveticaBold)
  const fontReg = await pdf.embedFont(StandardFonts.Helvetica)
  let y = 740

  const line = (text, opts = {}) => {
    page.drawText(String(text || "").slice(0, 95), {
      x: opts.x ?? 50,
      y,
      size: opts.size ?? 11,
      font: opts.bold ? font : fontReg,
      color: rgb(0.1, 0.1, 0.1),
      maxWidth: opts.maxWidth ?? 500,
    })
    y -= opts.gap ?? 18
  }

  line(academia.nombre.toUpperCase(), { bold: true, size: 14, gap: 22 })
  line("Carta responsiva / consentimiento (placeholder legal)", {
    bold: true,
    size: 12,
    gap: 28,
  })
  line(`Alumno: ${alumno.nombre}`)
  line(`Cinta: ${cintaLabel(alumno.cinta)}`)
  line(`Fecha de nacimiento: ${alumno.fecha_nacimiento || "—"}`)
  line(`Familia: ${alumno.familias?.nombre || "—"}`)
  line(
    `Tutor: ${principal?.nombre || "—"} · Tel: ${principal?.telefono || "—"}`
  )
  y -= 12

  for (const paragraph of LEGAL_PLACEHOLDER.split("\n")) {
    const words = paragraph.trim().split(/\s+/)
    let buf = ""
    for (const w of words) {
      const test = buf ? `${buf} ${w}` : w
      if (test.length > 85) {
        line(buf, { size: 10, gap: 14 })
        buf = w
      } else {
        buf = test
      }
    }
    if (buf) line(buf, { size: 10, gap: 14 })
    y -= 6
  }

  y -= 30
  line("Firma del tutor / responsable: _______________________________", {
    size: 10,
  })
  line("Nombre: _________________ Fecha: _________", { size: 10 })
  y -= 20
  line("Firma del staff: _______________________________", { size: 10 })
  y -= 40
  line(
    "Este texto es plantilla editable / placeholder. Revisión legal pendiente.",
    { size: 8, gap: 12 }
  )

  const bytes = await pdf.save()
  const filename = `responsiva-${alumno.nombre.replace(/\s+/g, "-").toLowerCase()}.pdf`

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
