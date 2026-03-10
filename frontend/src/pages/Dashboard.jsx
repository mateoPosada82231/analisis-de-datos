import { useState, useEffect } from 'react';
import { BarChart3, Building2, MapPin, Scale } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getEstadisticasPorDepto, getEstadisticasPorClase, getEstadisticasPorNaturaleza, getTotalPrestadores } from '../services/api';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const CHART_COLORS = [
  '#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1d4ed8',
  '#bfdbfe', '#1e40af', '#dbeafe', '#1e3a8a', '#eff6ff',
  '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985',
];

export default function Dashboard() {
  const [porDepto, setPorDepto] = useState(null);
  const [porClase, setPorClase] = useState(null);
  const [porNaturaleza, setPorNaturaleza] = useState(null);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getEstadisticasPorDepto(),
      getEstadisticasPorClase(),
      getEstadisticasPorNaturaleza(),
      getTotalPrestadores(),
    ])
      .then(([deptoRes, claseRes, natRes, totalRes]) => {
        if (cancelled) return;
        setPorDepto(deptoRes);
        setPorClase(claseRes);
        setPorNaturaleza(natRes);
        setTotal(totalRes);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="pt-24"><Loader text="Cargando estadísticas…" /></div>;
  if (error) return <div className="pt-24 px-4"><ErrorMessage message={error} /></div>;

  const totalDeptos = porDepto?.length || 0;
  const topDepto = porDepto?.[0] || {};
  const totalClases = porClase?.length || 0;

  // Charts data
  const barData = (porDepto || [])
    .slice(0, 15)
    .map((d) => ({
      name: d.depa_nombre || 'Sin dato',
      total: Number(d.total),
    }));

  const pieData = (porNaturaleza || []).map((d) => ({
    name: d.naju_nombre || 'Sin dato',
    value: Number(d.total),
  }));

  const claseBarData = (porClase || []).map((d) => ({
    name: d.clpr_nombre || 'Sin dato',
    total: Number(d.total),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-surface-700 bg-surface-800 px-4 py-3 shadow-xl">
        <p className="mb-1 text-sm font-medium text-white">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} className="text-xs text-surface-300">
            Prestadores: {Number(p.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-surface-400">
            Estadísticas del Registro Especial de Prestadores de Servicios de Salud (REPS).
          </p>
        </div>

        {/* Stats cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Building2} label="Total prestadores" value={total?.toLocaleString() || '—'} />
          <StatCard icon={MapPin} label="Departamentos" value={totalDeptos} />
          <StatCard
            icon={BarChart3}
            label="Mayor concentración"
            value={Number(topDepto.total || 0).toLocaleString()}
            sub={topDepto.depa_nombre}
          />
          <StatCard icon={Scale} label="Clases de prestador" value={totalClases} />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Bar chart */}
          <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-6 lg:col-span-2">
            <h3 className="mb-6 text-lg font-semibold text-white">
              Prestadores por departamento (Top 15)
            </h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    width={120}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Prestadores" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie chart - naturaleza */}
          <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-6">
            <h3 className="mb-6 text-lg font-semibold text-white">Naturaleza jurídica</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    stroke="#0f172a"
                    strokeWidth={2}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                    formatter={(value) => <span className="text-surface-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Clase bar chart */}
        <div className="mt-6 rounded-xl border border-surface-800 bg-surface-900/50 p-6">
          <h3 className="mb-6 text-lg font-semibold text-white">Distribución por clase de prestador</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={claseBarData} margin={{ left: 20, right: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Prestadores" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 rounded-xl border border-surface-800 bg-surface-900/50 p-6">
          <h3 className="mb-6 text-lg font-semibold text-white">Resumen por departamento</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-800 text-surface-400">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Departamento</th>
                  <th className="px-4 py-3 font-medium text-right">Prestadores</th>
                </tr>
              </thead>
              <tbody>
                {(porDepto || []).map((d, i) => (
                  <tr
                    key={i}
                    className="border-b border-surface-800/50 transition-colors hover:bg-surface-800/30"
                  >
                    <td className="px-4 py-3 text-surface-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-white">{d.depa_nombre || '—'}</td>
                    <td className="px-4 py-3 text-right text-primary-400">{Number(d.total).toLocaleString()}</td>
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
