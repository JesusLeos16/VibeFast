import Hero from "@/components/landing/Hero"
import Comparacion from "@/components/landing/Comparacion"
import Bento from "@/components/landing/Bento"
import FAQ from "@/components/landing/FAQ"
import FinalCta from "@/components/landing/FinalCta"
import config from "@/config"
import Waitlist from "@/components/landing/Waitlist"

export default function HomePage() {
  return (
    <>
      <Hero />
      <Comparacion />
      <Bento />
      <FAQ />
      <FinalCta />
      {config.features.waitlist && <Waitlist />}
    </>
  )
}
