import { ExternalLink, BookOpen, Code, Server } from "lucide-react";

const endpoints = [
  {
    method: "GET",
    path: "/resource/p6dx-8zbt.json?$limit=2000&$offset=2000",
    desc: "Consultar los 2000 registros asignados al Equipo 2 para el Quiz 2.",
    params: [
      {
        name: "entidad",
        type: "string",
        desc: "Entidad contratante (extraer y mostrar)",
      },
      {
        name: "nombre_del_proveedor",
        type: "string",
        desc: "Proveedor adjudicado (extraer y mostrar)",
      },
      {
        name: "valor_total_adjudicacion",
        type: "number",
        desc: "Valor a convertir a numérico (0 si falla)",
      },
      {
        name: "estado_del_procedimiento",
        type: "string",
        desc: "Estado (por defecto: No disponible)",
      },
      {
        name: "categoria_valor",
        type: "enum",
        desc: "Bajo / Medio / Alto según umbrales del quiz",
      },
      {
        name: "categoria_estado",
        type: "enum",
        desc: "Adjudicado / No adjudicado / Otro estado",
      },
    ],
  },
];

const campos = [
  { name: "entidad", desc: "Entidad contratante" },
  { name: "nombre_del_proveedor", desc: "Nombre del proveedor" },
  { name: "valor_total_adjudicacion", desc: "Valor monetario del contrato" },
  { name: "estado_del_procedimiento", desc: "Estado informado en la fuente" },
  { name: "categoria_valor", desc: "Clasificación: Bajo, Medio, Alto" },
  {
    name: "categoria_estado",
    desc: "Clasificación: Adjudicado, No adjudicado, Otro estado",
  },
];

export default function Docs() {
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">Documentación</h1>
          <p className="mt-2 text-surface-400">
            Referencia del dataset y reglas de procesamiento del Quiz 2.
          </p>
          <a
            href="https://www.datos.gov.co/resource/p6dx-8zbt.json?$limit=2000&$offset=2000"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-primary-400 no-underline hover:text-primary-300"
          >
            <ExternalLink className="h-4 w-4" />
            Ver dataset en datos.gov.co
          </a>
        </div>

        {/* Info cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-5">
            <Server className="mb-3 h-5 w-5 text-primary-400" />
            <h3 className="font-medium text-white">Base URL</h3>
            <code className="mt-1 block text-sm text-surface-400 break-all">
              https://www.datos.gov.co/resource/p6dx-8zbt.json?$limit=2000&$offset=2000
            </code>
          </div>
          <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-5">
            <Code className="mb-3 h-5 w-5 text-primary-400" />
            <h3 className="font-medium text-white">Formato</h3>
            <p className="mt-1 text-sm text-surface-400">
              JSON (Socrata Open Data API)
            </p>
          </div>
          <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-5">
            <BookOpen className="mb-3 h-5 w-5 text-primary-400" />
            <h3 className="font-medium text-white">Fuente</h3>
            <p className="mt-1 text-sm text-surface-400">
              datos.gov.co (p6dx-8zbt) — Contratación pública
            </p>
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-6">
          {endpoints.map((ep) => (
            <div
              key={ep.path}
              className="rounded-xl border border-surface-800 bg-surface-900/50 p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-md bg-primary-600/15 px-2.5 py-1 text-xs font-bold text-primary-300">
                  {ep.method}
                </span>
                <code className="text-sm font-medium text-white">
                  {ep.path}
                </code>
              </div>
              <p className="mt-3 text-sm text-surface-400">{ep.desc}</p>

              {ep.params.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-surface-800 text-surface-500">
                        <th className="py-2 pr-4 font-medium">Parámetro</th>
                        <th className="py-2 pr-4 font-medium">Tipo</th>
                        <th className="py-2 font-medium">Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ep.params.map((p) => (
                        <tr
                          key={p.name}
                          className="border-b border-surface-800/50"
                        >
                          <td className="py-2 pr-4">
                            <code className="text-primary-400">{p.name}</code>
                          </td>
                          <td className="py-2 pr-4 text-surface-500">
                            {p.type}
                          </td>
                          <td className="py-2 text-surface-400">{p.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Campos del dataset */}
        <div className="mt-10 rounded-xl border border-surface-800 bg-surface-900/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Campos del dataset
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-800 text-surface-500">
                  <th className="py-2 pr-4 font-medium">Campo</th>
                  <th className="py-2 font-medium">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {campos.map((c) => (
                  <tr key={c.name} className="border-b border-surface-800/50">
                    <td className="py-2 pr-4">
                      <code className="text-primary-400">{c.name}</code>
                    </td>
                    <td className="py-2 text-surface-400">{c.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
