import Hero from "@/components/landing/Hero"
import Features from "@/components/landing/Features"
import Bento from "@/components/landing/Bento"
import Comparacion from "@/components/landing/Comparacion"
import FAQ from "@/components/landing/FAQ"
import FinalCta from "@/components/landing/FinalCta"
import config from "@/config"
import Waitlist from "@/components/landing/Waitlist"

export default function HomePage() {
  return (
    <>
      <Hero />
      <div id="sistema">
        <Features />
      </div>
      <Bento />
      <Comparacion />
      <FAQ />
      <FinalCta />
      {config.features.waitlist && <Waitlist />}
    </>
  )
}
