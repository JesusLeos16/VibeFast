import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { marcarInactivos60d } from "@/lib/kickiie/inactividad"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Cron diario: Authorization: Bearer $CRON_SECRET
 * También acepta ?secret= para pruebas locales.
 */
export async function GET(request) {
  const secret = process.env.CRON_SECRET
  const auth = request.headers.get("authorization") || ""
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : ""
  const q = new URL(request.url).searchParams.get("secret") || ""

  if (!secret || (bearer !== secret && q !== secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json(
      { error: "Falta SUPABASE_SERVICE_ROLE_KEY o URL" },
      { status: 500 }
    )
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const result = await marcarInactivos60d(supabase)
  return NextResponse.json(result)
}
