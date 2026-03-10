import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getPrestadores, getDepartamentos } from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

export default function Explorer() {
  const [records, setRecords] = useState(null);
  const [deptos, setDeptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    departamento: '',
    municipio: '',
    nombre: '',
    naturaleza: '',
    limit: 25,
    offset: 0,
  });

  const fetchData = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const [data, deptosRes] = await Promise.all([
        getPrestadores(params),
        deptos.length ? Promise.resolve(deptos) : getDepartamentos(),
      ]);
      setRecords(data);
      if (!deptos.length) setDeptos(deptosRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [deptos.length]);

  useEffect(() => {
    fetchData(filters);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const newFilters = { ...filters, offset: 0 };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const handleClear = () => {
    const cleared = { departamento: '', municipio: '', nombre: '', naturaleza: '', limit: 25, offset: 0 };
    setFilters(cleared);
    fetchData(cleared);
  };

  const goToPage = (newOffset) => {
    const updated = { ...filters, offset: newOffset };
    setFilters(updated);
    fetchData(updated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentPage = Math.floor(filters.offset / filters.limit) + 1;
  const totalPages = records ? Math.ceil(records.total / filters.limit) : 0;

  const hasActiveFilters = filters.departamento || filters.municipio || filters.nombre || filters.naturaleza;

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Explorador de Prestadores</h1>
            <p className="mt-2 text-surface-400">
              Busca y filtra prestadores de servicios de salud.
              {records && (
                <span className="ml-1 text-primary-400">
                  {records.total.toLocaleString()} prestadores encontrados
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-900/50 px-4 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:border-surface-600 hover:text-white sm:self-auto"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                !
              </span>
            )}
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <form
            onSubmit={handleSearch}
            className="mb-6 rounded-xl border border-surface-800 bg-surface-900/50 p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Departamento */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-surface-400">Departamento</label>
                <select
                  value={filters.departamento}
                  onChange={(e) => setFilters({ ...filters, departamento: e.target.value })}
                  className="w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2.5 text-sm text-white outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Todos</option>
                  {deptos.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Municipio */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-surface-400">Municipio</label>
                <input
                  type="text"
                  value={filters.municipio}
                  onChange={(e) => setFilters({ ...filters, municipio: e.target.value })}
                  placeholder="Buscar municipio…"
                  className="w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2.5 text-sm text-white placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Nombre prestador */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-surface-400">Nombre prestador</label>
                <input
                  type="text"
                  value={filters.nombre}
                  onChange={(e) => setFilters({ ...filters, nombre: e.target.value })}
                  placeholder="Buscar prestador…"
                  className="w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2.5 text-sm text-white placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Naturaleza */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-surface-400">Naturaleza jurídica</label>
                <select
                  value={filters.naturaleza}
                  onChange={(e) => setFilters({ ...filters, naturaleza: e.target.value })}
                  className="w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2.5 text-sm text-white outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Todas</option>
                  <option value="Pública">Pública</option>
                  <option value="Privada">Privada</option>
                  <option value="Mixta">Mixta</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-500"
              >
                <Search className="h-4 w-4" />
                Buscar
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-2 rounded-lg border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-400 transition-colors hover:text-white"
                >
                  <X className="h-4 w-4" />
                  Limpiar
                </button>
              )}
            </div>
          </form>
        )}

        {/* Content */}
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <>
            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-surface-800 bg-surface-900/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-surface-800 bg-surface-900/80">
                      <th className="whitespace-nowrap px-4 py-3 font-medium text-surface-400">Código</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium text-surface-400">Prestador</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium text-surface-400">Departamento</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium text-surface-400">Municipio</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium text-surface-400">Clase</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium text-surface-400">Naturaleza</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium text-surface-400">Nivel</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium text-surface-400 text-center">
                        Habilitado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.data.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-surface-500">
                          No se encontraron prestadores con los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      records.data.map((r, i) => (
                        <tr
                          key={r.codigo_habilitacion || i}
                          className="border-b border-surface-800/50 transition-colors hover:bg-surface-800/30"
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-surface-500">{r.codigo_habilitacion || '—'}</td>
                          <td className="max-w-[250px] truncate px-4 py-3 text-white" title={r.nombre_prestador}>
                            {r.nombre_prestador || '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-surface-300">{r.depa_nombre || '—'}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-surface-300">{r.muni_nombre || '—'}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-surface-300">{r.clpr_nombre || '—'}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-surface-300">{r.naju_nombre || '—'}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-center text-surface-300">{r.nivel || '—'}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-center">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.habilitado === 'SI' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                              {r.habilitado || '—'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-surface-500">
                  Mostrando {filters.offset + 1}–{Math.min(filters.offset + filters.limit, records.total)}{' '}
                  de {records.total.toLocaleString()} prestadores
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(Math.max(0, filters.offset - filters.limit))}
                    disabled={filters.offset === 0}
                    className="inline-flex items-center gap-1 rounded-lg border border-surface-700 px-3 py-2 text-sm text-surface-400 transition-colors hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </button>
                  <span className="px-3 text-sm text-surface-400">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(filters.offset + filters.limit)}
                    disabled={filters.offset + filters.limit >= records.total}
                    className="inline-flex items-center gap-1 rounded-lg border border-surface-700 px-3 py-2 text-sm text-surface-400 transition-colors hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
