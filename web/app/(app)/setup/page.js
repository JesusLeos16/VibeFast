import { redirect } from "next/navigation"
import { getAcademyContext } from "@/lib/kickiie/academy"
import { claimRoninAction } from "../familias/actions"

export const metadata = { title: "Configurar academia" }

export default async function SetupPage() {
  const { user, membership, academia } = await getAcademyContext()
  if (!user) redirect("/login")
  if (membership && academia) redirect("/dashboard")

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sin academia asignada</h1>
        <p className="mt-2 text-sm leading-relaxed text-base-content/70">
          Kickiie F1 aísla los datos por academia. Si eres el fundador de{" "}
          <strong>Ronin Defense</strong> y aún no hay miembros, reclama el rol de
          administrador con un clic. Si la academia ya tiene admin, pide que te
          inviten (F2+).
        </p>
      </div>

      <form action={claimRoninAction}>
        <button type="submit" className="btn btn-primary">
          Soy admin de Ronin Defense
        </button>
      </form>

      <p className="text-xs text-base-content/50">
        Requiere migración <code>009_f1_kickiie_nucleo.sql</code> aplicada en
        Supabase (<code>npx supabase db push</code> o SQL Editor).
      </p>
    </div>
  )
}
