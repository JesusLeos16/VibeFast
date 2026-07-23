"use client"

import { useState } from "react"
import config from "@/config"

export default function Waitlist() {
  const { eyebrow, title, subtitle, buttonLabel, placeholder, successMessage } =
    config.landing.waitlist

  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setStatus("loading")
    setError(null)
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "No pudimos guardar tu correo.")
      }
      setStatus("success")
      setEmail("")
    } catch (err) {
      setError(err.message)
      setStatus("error")
    }
  }

  return (
    <section id="waitlist" className="border-t border-base-300/70 bg-[#ebe7df] py-12 md:py-14">
      <div className="mx-auto max-w-5xl px-4 md:px-16">
        <div className="max-w-lg text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
            {eyebrow}
          </p>
          <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight md:text-[1.75rem]">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-base-content/70 md:text-base">
            {subtitle}
          </p>

          {status === "success" ? (
            <div
              role="status"
              className="mt-6 border border-success/40 bg-success/10 px-4 py-4 text-sm text-success"
            >
              {successMessage}
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
            >
              <label htmlFor="waitlist-email" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="waitlist-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                className="input input-bordered input-sm h-11 flex-1 rounded-sm"
                disabled={status === "loading"}
              />
              <button
                type="submit"
                className="btn btn-primary h-11 min-h-0 rounded-sm px-5 shadow-none"
                disabled={status === "loading"}
              >
                {status === "loading" && (
                  <span className="loading loading-spinner loading-sm" />
                )}
                {status === "loading" ? "Enviando…" : buttonLabel}
              </button>
            </form>
          )}

          {status === "error" && (
            <p role="alert" className="mt-3 text-sm text-error">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
