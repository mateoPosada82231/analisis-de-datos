import { Link } from "react-router-dom";
import {
  FileBarChart2,
  Database,
  BarChart3,
  Search,
  ArrowRight,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Database,
    title: "Datos Abiertos",
    desc: "Accede a 2000 contratos públicos desde datos.gov.co (equipo 2, offset 2000).",
  },
  {
    icon: Zap,
    title: "Consulta Directa",
    desc: "Conecta directamente con la API Socrata de datos.gov.co con filtros y paginación.",
  },
  {
    icon: BarChart3,
    title: "Estadísticas en Tiempo Real",
    desc: "Visualiza suma total, promedio, categorías por valor y categorías por estado.",
  },
  {
    icon: Search,
    title: "Explorador de Datos",
    desc: "Filtra por entidad, proveedor, estado, categoría de valor y rango monetario.",
  },
  {
    icon: Shield,
    title: "Datos Confiables",
    desc: "Información abierta del gobierno procesada con reglas de limpieza del quiz.",
  },
  {
    icon: Globe,
    title: "Cobertura Nacional",
    desc: "Contratos de múltiples entidades públicas de Colombia en una sola vista.",
  },
];

const codeExample = `// Consultar contratos del Quiz 2
const response = await fetch(
  'https://www.datos.gov.co/resource/p6dx-8zbt.json'
  + '?$limit=2000&$offset=2000'
);
const data = await response.json();
`;

export default function Home() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary-600/8 blur-3xl" />
          <div className="absolute top-40 right-0 h-[400px] w-[600px] rounded-full bg-primary-400/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-sm text-primary-300">
              <FileBarChart2 className="h-4 w-4" />
              Datos Abiertos de Colombia
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Contratos de{" "}
              <span className="bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">
                Gobierno
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-surface-400 sm:text-xl">
              Consulta, filtra y visualiza los contratos del Quiz 2 con métricas
              obligatorias, clasificación por valor y estado, y exploración
              detallada.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-medium text-white no-underline shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-500 hover:shadow-xl hover:shadow-primary-500/30"
              >
                Ver Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/explorador"
                className="inline-flex items-center gap-2 rounded-xl border border-surface-700 bg-surface-900/50 px-6 py-3 font-medium text-surface-300 no-underline transition-colors hover:border-surface-600 hover:text-white"
              >
                Explorar Datos
              </Link>
            </div>
          </div>

          {/* Code preview */}
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="overflow-hidden rounded-xl border border-surface-800 bg-surface-900/80 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-surface-800 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-surface-700" />
                <div className="h-3 w-3 rounded-full bg-surface-700" />
                <div className="h-3 w-3 rounded-full bg-surface-700" />
                <span className="ml-2 text-xs text-surface-500">
                  ejemplo.js
                </span>
              </div>
              <pre className="overflow-x-auto p-5 text-sm leading-relaxed text-surface-300">
                <code>{codeExample}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-surface-800 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Todo lo que necesitas para resolver el Quiz 2
            </h2>
            <p className="mt-4 text-lg text-surface-400">
              Consulta directa a datos.gov.co con filtros, paginación,
              estadísticas y visualización.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-surface-800 bg-surface-900/30 p-6 transition-all hover:border-primary-500/30 hover:bg-surface-900/60"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-600/10 transition-colors group-hover:bg-primary-600/20">
                  <f.icon className="h-5 w-5 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-surface-400">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Endpoints section */}
      <section className="border-t border-surface-800 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Endpoints disponibles
            </h2>
            <p className="mt-4 text-lg text-surface-400">
              Endpoint del dataset con los parámetros exactos del quiz.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl space-y-4">
            {[
              {
                method: "GET",
                path: "/resource/p6dx-8zbt.json?$limit=2000&$offset=2000",
                desc: "Consulta base del Quiz 2",
              },
              {
                method: "DATA",
                path: "entidad, nombre_del_proveedor, valor_total_adjudicacion, estado_del_procedimiento",
                desc: "Campos requeridos",
              },
              {
                method: "RULE",
                path: "valor no convertible = 0",
                desc: "Regla de normalización",
              },
              {
                method: "RULE",
                path: "Bajo / Medio / Alto + Adjudicado / No adjudicado / Otro",
                desc: "Clasificaciones del quiz",
              },
            ].map((ep) => (
              <div
                key={ep.path}
                className="flex flex-col gap-2 rounded-xl border border-surface-800 bg-surface-900/40 p-4 sm:flex-row sm:items-center sm:gap-4"
              >
                <span className="inline-flex w-fit rounded-md bg-primary-600/15 px-2.5 py-1 text-xs font-bold text-primary-300">
                  {ep.method}
                </span>
                <code className="text-sm font-medium text-white">
                  {ep.path}
                </code>
                <span className="text-sm text-surface-400 sm:ml-auto">
                  {ep.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-surface-800 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Comienza a explorar los datos
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-surface-400">
            Visualiza estadísticas, filtra contratos y revisa todos los
            resultados requeridos por el taller.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-medium text-white no-underline shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-500"
            >
              Ir al Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 rounded-xl border border-surface-700 px-6 py-3 font-medium text-surface-300 no-underline transition-colors hover:border-surface-600 hover:text-white"
            >
              Documentación
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
