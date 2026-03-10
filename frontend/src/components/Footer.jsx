import { Hospital } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-surface-800 bg-surface-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-white">
              <Hospital className="h-5 w-5 text-primary-400" />
              <span className="font-semibold">SaludREPS</span>
            </div>
            <p className="mt-3 text-sm text-surface-400">
              Consulta de Prestadores de Servicios de Salud del portal de datos abiertos del gobierno colombiano.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-surface-300">Producto</h4>
            <ul className="space-y-2 text-sm text-surface-400">
              <li><a href="/dashboard" className="no-underline text-surface-400 hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="/explorador" className="no-underline text-surface-400 hover:text-white transition-colors">Explorador</a></li>
              <li><a href="/docs" className="no-underline text-surface-400 hover:text-white transition-colors">Documentación</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-surface-300">Recursos</h4>
            <ul className="space-y-2 text-sm text-surface-400">
              <li><a href="https://www.datos.gov.co" target="_blank" rel="noopener noreferrer" className="no-underline text-surface-400 hover:text-white transition-colors">Datos.gov.co</a></li>
              <li><a href="https://www.datos.gov.co/Salud-y-Protecci-n-Social/Prestadores-de-Servicios-de-Salud/ugc5-acjp" target="_blank" rel="noopener noreferrer" className="no-underline text-surface-400 hover:text-white transition-colors">Dataset Original</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-surface-300">Tech Stack</h4>
            <ul className="space-y-2 text-sm text-surface-400">
              <li>FastAPI + MySQL</li>
              <li>React + Vite</li>
              <li>Tailwind CSS</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-surface-800 pt-6 text-center text-sm text-surface-500">
          Datos abiertos del gobierno colombiano &middot; {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
