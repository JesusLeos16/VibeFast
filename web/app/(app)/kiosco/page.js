import { redirect } from "next/navigation"
import { getAcademyContext } from "@/lib/kickiie/academy"
import KioscoScanner from "@/components/kickiie/KioscoScanner"

export const metadata = { title: "Kiosco" }

export default async function KioscoPage() {
  const { academia, membership } = await getAcademyContext()
  if (!membership) redirect("/setup")

  return <KioscoScanner academiaNombre={academia.nombre} />
}
