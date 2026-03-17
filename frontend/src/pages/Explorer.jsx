import { useState, useEffect, useCallback } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";
import { getQuizContracts, applyQuizFilters } from "../services/api";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

export default function Explorer() {
  const [allContracts, setAllContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [estadoOptions, setEstadoOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    entidad: "",
    proveedor: "",
    categoriaEstado: "",
    estadoOriginal: "",
    categoriaValor: "",
    minValor: "",
    maxValor: "",
    limit: 25,
    offset: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getQuizContracts();
      setAllContracts(data);
      setFilteredContracts(data);
      setEstadoOptions(
        [...new Set(data.map((item) => item.estado_del_procedimiento))]
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b)),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const updated = { ...filters, offset: 0 };
    setFilters(updated);
    setFilteredContracts(applyQuizFilters(allContracts, updated));
  };

  const handleClear = () => {
    const cleared = {
      entidad: "",
      proveedor: "",
      categoriaEstado: "",
      estadoOriginal: "",
      categoriaValor: "",
      minValor: "",
      maxValor: "",
      limit: 25,
      offset: 0,
    };
    setFilters(cleared);
    setFilteredContracts(allContracts);
  };

  const goToPage = (newOffset) => {
    setFilters((prev) => ({ ...prev, offset: newOffset }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const total = filteredContracts.length;
  const currentPage = Math.floor(filters.offset / filters.limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));
  const visibleContracts = filteredContracts.slice(
    filters.offset,
    filters.offset + filters.limit,
  );

  const hasActiveFilters =
    filters.entidad ||
    filters.proveedor ||
    filters.categoriaEstado ||
    filters.estadoOriginal ||
    filters.categoriaValor ||
    filters.minValor ||
    filters.maxValor;

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Explorador de Contratos
            </h1>
            <p className="mt-2 text-surface-400">
              Busca y filtra los 2000 registros procesados para el quiz.
              {!loading && (
                <span className="ml-1 text-primary-400">
                  {total.toLocaleString()} contratos encontrados
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
              {/* Entidad */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-surface-400">
                  Entidad
                </label>
                <input
                  type="text"
                  value={filters.entidad}
                  onChange={(e) =>
                    setFilters({ ...filters, entidad: e.target.value })
                  }
                  placeholder="Ej: Alcaldía, Ministerio..."
                  className="w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2.5 text-sm text-white placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Proveedor */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-surface-400">
                  Proveedor
                </label>
                <input
                  type="text"
                  value={filters.proveedor}
                  onChange={(e) =>
                    setFilters({ ...filters, proveedor: e.target.value })
                  }
                  placeholder="Nombre del proveedor..."
                  className="w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2.5 text-sm text-white placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-surface-400">
                  Estado (categoría)
                </label>
                <select
                  value={filters.categoriaEstado}
                  onChange={(e) =>
                    setFilters({ ...filters, categoriaEstado: e.target.value })
                  }
                  className="w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2.5 text-sm text-white placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Todos</option>
                  <option value="Adjudicado">Adjudicado</option>
                  <option value="No adjudicado">No adjudicado</option>
                  <option value="Otro estado">Otro estado</option>
                </select>
              </div>

              {/* Categoría valor */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-surface-400">
                  Categoría de valor
                </label>
                <select
                  value={filters.categoriaValor}
                  onChange={(e) =>
                    setFilters({ ...filters, categoriaValor: e.target.value })
                  }
                  className="w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2.5 text-sm text-white outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Todas</option>
                  <option value="Bajo">Bajo</option>
                  <option value="Medio">Medio</option>
                  <option value="Alto">Alto</option>
                </select>
              </div>

              {/* Estado original */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-surface-400">
                  Estado original
                </label>
                <select
                  value={filters.estadoOriginal}
                  onChange={(e) =>
                    setFilters({ ...filters, estadoOriginal: e.target.value })
                  }
                  className="w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2.5 text-sm text-white outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Todos</option>
                  {estadoOptions.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mínimo */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-surface-400">
                  Valor mínimo
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.minValor}
                  onChange={(e) =>
                    setFilters({ ...filters, minValor: e.target.value })
                  }
                  placeholder="0"
                  className="w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2.5 text-sm text-white placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Máximo */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-surface-400">
                  Valor máximo
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.maxValor}
                  onChange={(e) =>
                    setFilters({ ...filters, maxValor: e.target.value })
                  }
                  placeholder="Sin límite"
                  className="w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2.5 text-sm text-white placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
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
                      <th className="whitespace-nowrap px-4 py-3 font-medium text-surface-400">
                        Código
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium text-surface-400">
                        Entidad
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium text-surface-400">
                        Proveedor
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium text-surface-400">
                        Estado original
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium text-surface-400">
                        Cat. estado
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium text-surface-400">
                        Cat. valor
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium text-right text-surface-400">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleContracts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-12 text-center text-surface-500"
                        >
                          No se encontraron contratos con los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      visibleContracts.map((r, i) => (
                        <tr
                          key={`${r.entidad}-${r.nombre_del_proveedor}-${filters.offset + i}`}
                          className="border-b border-surface-800/50 transition-colors hover:bg-surface-800/30"
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-surface-500">
                            {filters.offset + i + 1}
                          </td>
                          <td
                            className="max-w-[280px] truncate px-4 py-3 text-white"
                            title={r.entidad}
                          >
                            {r.entidad}
                          </td>
                          <td
                            className="max-w-[240px] truncate px-4 py-3 text-surface-300"
                            title={r.nombre_del_proveedor}
                          >
                            {r.nombre_del_proveedor}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-surface-300">
                            {r.estado_del_procedimiento}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-surface-300">
                            {r.categoria_estado}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-surface-300">
                            {r.categoria_valor}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-primary-400">
                            $
                            {r.valor_total_adjudicacion.toLocaleString(
                              undefined,
                              { maximumFractionDigits: 2 },
                            )}
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
                  Mostrando {filters.offset + 1}–
                  {Math.min(filters.offset + filters.limit, total)} de{" "}
                  {total.toLocaleString()} contratos
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      goToPage(Math.max(0, filters.offset - filters.limit))
                    }
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
                    disabled={filters.offset + filters.limit >= total}
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
