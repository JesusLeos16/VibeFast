// ============================================================
// Kickiie · config.js
// ------------------------------------------------------------
// Diseño de referencia: Stitch "Kickiie Martial Arts Manager"
// pantalla "Rediseño Editorial y Táctil" (kickiie_redesign.html)
// ============================================================

const config = {
  app: {
    name: "Kickiie",
    description:
      "Gestión para academias de artes marciales con credenciales físicas QR: asistencia automática, portal de familias y panel del instructor.",
    domain: "kickiie.com",
    locale: "es",
    defaultUrl: "http://localhost:3000",
  },

  brand: {
    primary: "#C92A2A",
    logoText: "Kickiie",
    // Wordmark PNG actual = variante oscura (fondo negro). Navbar usa texto tipográfico.
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
    waitlist: false,
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
      { label: "Product", href: "#product" },
      { label: "The Card", href: "#card" },
      { label: "Dojos", href: "#dojos" },
      { label: "FAQ", href: "#faq" },
    ],
    navCta: { label: "Get Started", href: "#cierre" },
    navLogin: { label: "Login", href: "/login" },
    hero: {
      eyebrow: "Gestión para academias de artes marciales",
      title: "Una tarjeta. Toda tu academia.",
      subtitle:
        "Kickiie convierte una credencial física con QR en el pase de lista, el portal de los papás y el orgullo de tus alumnos.",
      cta: { label: "Crear mi academia" },
      card: {
        memberLabel: "MIEMBRO",
        memberName: "Carlos Silva",
        memberDetail: "Dojo Central • Cinturón Azul",
      },
    },
    comparacion: {
      id: "product",
      imprime: {
        title: "Lo que se imprime.",
        body: "Solo lo permanente: nombre, foto, QR y logo de la academia. Kickiie genera el diseño en PDF; tú lo mandas a imprimir en PVC, una vez por alumno.",
        items: [
          { icon: "Check", label: "Archivo listo para imprenta local" },
          { icon: "Check", label: "Un QR estático, misma tarjeta para siempre" },
        ],
      },
      cambia: {
        title: "Lo que vive en Kickiie.",
        body: "Grado, asistencias, racha, exámenes y comunicación con familias. Todo se actualiza en el software — sin volver a imprimir la tarjeta.",
        items: [
          { icon: "RefreshCw", label: "Datos en tiempo real" },
          { icon: "CreditCard", label: "Portal de familias y panel del instructor" },
        ],
      },
    },
    bento: {
      id: "dojos",
      title: "Todo lo que tu academia necesita, en un solo lugar.",
      items: [
        {
          id: "alumnos",
          icon: "Users",
          title: "Gestión de Alumnos",
          body: "Perfiles, grupos, grado actual y notas. La base del sistema desde la que sale todo lo demás.",
          tags: ["ASISTENCIA", "GRADOS"],
          image: "/kickiie/alumnos.png",
          span: "large",
        },
        {
          id: "kiosco",
          icon: "Monitor",
          title: "Kiosco",
          body: "Registro de asistencia en un escaneo. Rápido y sin fricción.",
          image: "/kickiie/kiosco.png",
          span: "small",
        },
        {
          id: "tarjetas",
          icon: "Badge",
          title: "Generador de credenciales",
          body: "Diseño automático con QR por alumno, exportable en PDF para PVC. No vendemos tarjetas: te damos el archivo para que imprimas donde prefieras.",
          image: "/kickiie/generador-credenciales.png",
          span: "small",
        },
        {
          id: "familias",
          icon: "UsersRound",
          title: "Portal de Familias",
          body: "Un espacio privado para padres. Seguimiento de progreso, comunicaciones importantes y gestión de cuotas en un solo lugar.",
          image: "/kickiie/portal-familias.png",
          span: "wide",
        },
      ],
    },
    regla: {
      id: "card",
      quote: "El kiosco nunca rechaza a un alumno.",
      attribution: "— La Regla de Oro de Kickiie",
    },
    finalCta: {
      id: "cierre",
      title: "Pon tu academia en orden.",
      subtitle:
        "Configura tu dojo, registra alumnos y deja que el pase de lista se haga solo. La credencial física es el ritual de entrada; Kickiie es el software que la hace funcionar.",
      cta: { label: "Crear mi academia", href: "#cierre" },
    },
    waitlist: {
      eyebrow: "Acceso anticipado",
      title: "Sé de las primeras academias.",
      subtitle: "Déjanos tu correo y te avisamos en cuanto Kickiie esté listo para tu dojo.",
      successMessage: "¡Listo! Te avisamos en cuanto haya novedades.",
      buttonLabel: "Quiero entrar",
      placeholder: "tu@email.com",
    },
    footer: {
      tagline: "Una tarjeta. Toda tu academia.",
      links: [
        { label: "Política de privacidad", href: "#" },
        { label: "Términos de servicio", href: "#" },
        { label: "Contactar soporte", href: "#" },
        { label: "Seguimiento de envío", href: "#" },
      ],
      copyright: "© 2026 Kickiie.",
    },
    problem: { eyebrow: "", title: "", subtitle: "", items: [] },
    features: {
      eyebrow: "",
      title: "",
      subtitle: "",
      items: [
        {
          icon: "ScanLine",
          title: "Kiosco de asistencia",
          body: "El alumno escanea su tarjeta al llegar y el pase de lista se hace solo, con hora exacta.",
        },
        {
          icon: "Users",
          title: "Portal de familias",
          body: "Los papás entran con su correo autorizado y ven asistencias, racha del mes y grado de sus hijos.",
        },
        {
          icon: "IdCard",
          title: "Credenciales físicas",
          body: "Imprime tarjetas PVC con QR para cada alumno: un objeto que dice 'pertenezco a esta academia'.",
        },
      ],
    },
    faq: {
      eyebrow: "Preguntas frecuentes",
      title: "Dudas comunes de academias y familias",
      items: [
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
