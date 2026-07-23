// ============================================================
// Kickiie · config.js
// ------------------------------------------------------------
// Kickiie = sistema de gestión para academias.
// La credencial física con QR es el diferenciador de acceso,
// no el producto completo.
// ============================================================

const config = {
  app: {
    name: "Kickiie",
    description:
      "Sistema de gestión para academias de artes marciales: alumnos, asistencia automática, portal de familias y panel del instructor. La credencial física con QR es el acceso al sistema.",
    domain: "kickiie.com",
    locale: "es",
    defaultUrl: "http://localhost:3000",
  },

  brand: {
    primary: "#C92A2A",
    logoText: "Kickiie",
    logoSrc: "/kickiie/logo-wordmark.png",
    logoWordmarkDarkSrc: "/kickiie/logo-wordmark.png",
    logoIconMarkSrc: "/kickiie/logo-icon-mark.png",
    logoIconSrc: "/kickiie/logo-icon.svg",
    logoIconDarkSrc: "/kickiie/logo-icon-dark.svg",
    radius: "0.25rem",
  },

  assets: {
    heroCard: "/kickiie/hero-card.png",
    portalFamilias: "/kickiie/portal-familias.png",
    kiosco: "/kickiie/kiosco.png",
    generadorCredenciales: "/kickiie/generador-credenciales.png",
    alumnos: "/kickiie/alumnos.png",
    og: "/kickiie/og.png",
  },

  features: {
    waitlist: true,
    googleAuth: true,
    emailLogin: false,
    aiChat: true,
    toolUse: true,
    agents: true,
    mcp: true,
    rag: false,
    posthog: false,
    resend: true,
    pricing: false,
    payments: false,
    hardware: false,
  },

  ai: {
    chatModel: "gpt-4o-mini",
    structuredModel: "gpt-4o-mini",
    agentModel: "gpt-4o",
    embeddingModel: "text-embedding-3-small",
    maxTokens: 1500,
    temperature: 0.4,
  },

  email: {
    from: "Kickiie <onboarding@resend.dev>",
    replyTo: "hola@kickiie.com",
    supportEmail: "soporte@kickiie.com",
  },

  auth: {
    loginUrl: "/login",
    afterLoginUrl: "/dashboard",
    afterLogoutUrl: "/",
    providers: ["google"],
  },

  landing: {
    nav: [
      { label: "Sistema", href: "#sistema" },
      { label: "Módulos", href: "#modulos" },
      { label: "Credencial", href: "#credencial" },
      { label: "FAQ", href: "#faq" },
    ],
    navCta: { label: "Entrar a Kickiie", href: "/login" },
    navLogin: { label: "Entrar a Kickiie", href: "/login" },
    hero: {
      eyebrow: "Gestión para academias",
      title: "Tu academia, sin libretas ni caos.",
      subtitle: "Controla alumnos, asistencias y familias desde un solo lugar.",
      cta: { label: "Entrar al sistema", href: "/login" },
      card: {
        memberLabel: "MIEMBRO",
        memberName: "Carlos Silva",
        memberDetail: "Dojo Central • Cinturón Azul",
      },
    },
    features: {
      eyebrow: "Qué incluye",
      title: "Lo que necesitas para operar tu academia.",
      subtitle: "La credencial abre el acceso. Kickiie organiza lo que ocurre después.",
      primary: [
        {
          icon: "ScanLine",
          title: "Kiosco de asistencia",
          body: "El alumno escanea al llegar y queda registrado con hora exacta.",
        },
        {
          icon: "Users",
          title: "Gestión de alumnos",
          body: "Perfiles, grupos, grado y notas en un solo panel.",
        },
      ],
      secondary: [
        {
          icon: "IdCard",
          title: "Credencial física con QR",
          body: "Acceso real al kiosco; tú imprimes en PVC local.",
        },
        {
          icon: "UsersRound",
          title: "Portal de familias",
          body: "Papás ven asistencias, racha y grado sin llamarte.",
        },
        {
          icon: "TrendingUp",
          title: "Progreso y deserción",
          body: "Actúa antes de perder al alumno, no cuando ya no vuelve.",
        },
      ],
      items: [],
    },
    bento: {
      id: "modulos",
      title: "Todo el sistema, en un solo lugar.",
      items: [
        {
          id: "kiosco",
          icon: "Monitor",
          title: "Kiosco de asistencia",
          body: "El alumno llega, escanea y queda registrado con hora exacta.",
          image: "/kickiie/kiosco.png",
          span: "large",
        },
        {
          id: "alumnos",
          icon: "Users",
          title: "Gestión de alumnos",
          body: "Perfiles, grupos, grado actual y notas. La base del sistema.",
          image: "/kickiie/alumnos.png",
          span: "small",
        },
        {
          id: "tarjetas",
          icon: "RectangleHorizontal",
          title: "Credencial con QR",
          body: "Genera el archivo con QR y envíalo a tu imprenta local.",
          image: "/kickiie/generador-credenciales.png",
          span: "small",
        },
        {
          id: "familias",
          icon: "UsersRound",
          title: "Portal de familias",
          body: "Espacio privado para papás: progreso, asistencias y comunicación sin fricción.",
          image: "/kickiie/portal-familias.png",
          span: "wide",
        },
      ],
    },
    comparacion: {
      id: "credencial",
      headline: "La tarjeta abre la puerta. Kickiie es el sistema.",
      eyebrow: "Diferenciador",
      sistema: {
        title: "Lo que vive en Kickiie.",
        body: "Alumnos, grados, asistencias y familias se actualizan todos los días.",
        items: [
          "Información siempre actualizada",
          "Panel del instructor y acceso familiar",
        ],
      },
      tarjeta: {
        title: "Lo que se imprime una vez.",
        body: "Nombre, foto y QR se imprimen una vez. El sistema sigue cambiando sin reemplazar la tarjeta.",
        items: [
          "PDF listo para imprenta local",
          "El mismo QR para cada acceso",
        ],
      },
    },
    regla: {
      id: "card",
      quote: "El kiosco nunca rechaza a un alumno.",
      attribution: "— Kickiie",
    },
    finalCta: {
      id: "cierre",
      title: "Entra y pon tu academia en orden.",
      subtitle: "Gestiona alumnos y asistencias desde Kickiie.",
      cta: { label: "Entrar a Kickiie", href: "/login" },
    },
    waitlist: {
      eyebrow: "Kickiie está abriendo",
      title: "¿Tu academia quiere probar Kickiie primero?",
      subtitle: "Déjanos tu correo y te avisamos cuando abramos nuevos accesos.",
      successMessage: "¡Listo! Te avisamos en cuanto haya novedades.",
      buttonLabel: "Avisarme",
      placeholder: "correo de la academia",
    },
    footer: {
      tagline: "El sistema de gestión para academias de artes marciales.",
      links: [
        { label: "Privacidad", href: "#" },
        { label: "Términos", href: "#" },
        { label: "Soporte", href: "#" },
      ],
      copyright: "© 2026 Kickiie.",
    },
    problem: { eyebrow: "", title: "", subtitle: "", items: [] },
    faq: {
      eyebrow: "Preguntas frecuentes",
      title: "Preguntas reales antes de usar Kickiie.",
      items: [
        {
          q: "¿Kickiie es solo una tarjeta?",
          a: "No. Kickiie es el sistema de gestión (alumnos, asistencia, familias). La credencial con QR es el acceso físico al kiosco.",
        },
        {
          q: "¿Necesito comprar un lector de QR especial?",
          a: "No, cualquier celular o tablet con cámara funciona como kiosco en la entrada.",
        },
        {
          q: "¿Qué pasa si un alumno pierde su tarjeta?",
          a: "Se reimprime en cualquier imprenta local por unos pesos; su información vive en el sistema, no en la tarjeta.",
        },
        {
          q: "¿Los papás necesitan crear una cuenta?",
          a: "No, entran con el correo que la academia registró, sin contraseñas que olvidar.",
        },
        {
          q: "¿Cualquiera que escanee la tarjeta puede ver los datos de mi hijo?",
          a: "No, solo los correos autorizados por la academia tienen acceso al portal.",
        },
      ],
    },
    socialProof: { text: "", logos: [] },
    testimonials: { eyebrow: "", title: "", subtitle: "", items: [] },
    dosCaras: {},
    modulos: {},
    finalCtaLegacy: {},
  },

  pricing: {
    eyebrow: "Precios",
    title: "",
    subtitle: "",
    plans: [],
  },
}

export default config
