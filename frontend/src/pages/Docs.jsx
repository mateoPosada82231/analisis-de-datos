import { ExternalLink, BookOpen, Code, Server } from 'lucide-react';

const endpoints = [
  {
    method: 'GET',
    path: '/resource/ugc5-acjp.json',
    desc: 'Consultar prestadores de servicios de salud con filtros SoQL y paginación.',
    params: [
      { name: '$where', type: 'SoQL', desc: "Filtro condicional (ej: depa_nombre='ANTIOQUIA')" },
      { name: '$select', type: 'SoQL', desc: 'Campos a retornar o funciones de agregación' },
      { name: '$group', type: 'SoQL', desc: 'Agrupar resultados por campo' },
      { name: '$order', type: 'SoQL', desc: 'Ordenar resultados (ej: nombre_prestador ASC)' },
      { name: '$limit', type: 'int', desc: 'Máximo de registros (default: 1000)' },
      { name: '$offset', type: 'int', desc: 'Desplazamiento para paginación (default: 0)' },
    ],
  },
];

const campos = [
  { name: 'depa_nombre', desc: 'Nombre del departamento' },
  { name: 'muni_nombre', desc: 'Nombre del municipio' },
  { name: 'codigo_habilitacion', desc: 'Código de habilitación del prestador' },
  { name: 'nombre_prestador', desc: 'Nombre del prestador de salud' },
  { name: 'nits_nit', desc: 'NIT del prestador' },
  { name: 'razon_social', desc: 'Razón social' },
  { name: 'clpr_nombre', desc: 'Clase de prestador (ej: Instituciones - IPS)' },
  { name: 'ese', desc: 'Empresa Social del Estado (SI/NO)' },
  { name: 'direccion', desc: 'Dirección de la sede' },
  { name: 'telefono', desc: 'Teléfono de contacto' },
  { name: 'email', desc: 'Correo electrónico' },
  { name: 'nivel', desc: 'Nivel de atención (1, 2, 3)' },
  { name: 'naju_nombre', desc: 'Naturaleza jurídica (Pública, Privada, Mixta)' },
  { name: 'habilitado', desc: 'Estado de habilitación (SI/NO)' },
];

export default function Docs() {
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">Documentación</h1>
          <p className="mt-2 text-surface-400">
            Referencia del dataset de Prestadores de Servicios de Salud (REPS) — API Socrata.
          </p>
          <a
            href="https://www.datos.gov.co/Salud-y-Protecci-n-Social/Prestadores-de-Servicios-de-Salud/ugc5-acjp"
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
            <code className="mt-1 block text-sm text-surface-400 break-all">https://www.datos.gov.co/resource/ugc5-acjp.json</code>
          </div>
          <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-5">
            <Code className="mb-3 h-5 w-5 text-primary-400" />
            <h3 className="font-medium text-white">Formato</h3>
            <p className="mt-1 text-sm text-surface-400">JSON (Socrata Open Data API)</p>
          </div>
          <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-5">
            <BookOpen className="mb-3 h-5 w-5 text-primary-400" />
            <h3 className="font-medium text-white">Fuente</h3>
            <p className="mt-1 text-sm text-surface-400">datos.gov.co (ugc5-acjp) — REPS</p>
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
                <code className="text-sm font-medium text-white">{ep.path}</code>
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
                        <tr key={p.name} className="border-b border-surface-800/50">
                          <td className="py-2 pr-4">
                            <code className="text-primary-400">{p.name}</code>
                          </td>
                          <td className="py-2 pr-4 text-surface-500">{p.type}</td>
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
          <h3 className="mb-4 text-lg font-semibold text-white">Campos del dataset</h3>
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
