import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

export default function MarketingLayout({ children }) {
  return (
    <div className="grain flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-24 md:pt-28">{children}</main>
      <Footer />
    </div>
  )
}
