import config from "@/config"

export default function Logo({ className = "text-[1.35rem] md:text-[1.5rem]" }) {
  return (
    <span
      className={`font-heading inline-flex items-baseline font-extrabold leading-none tracking-tighter ${className}`}
      aria-label={config.brand.logoText}
    >
      <span className="text-base-content">Kick</span>
      <span className="text-primary">ii</span>
      <span className="text-base-content">e</span>
    </span>
  )
}
