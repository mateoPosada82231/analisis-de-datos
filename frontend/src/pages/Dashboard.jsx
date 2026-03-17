import { useState, useEffect } from "react";
import { BarChart3, Sigma, Scale, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  getQuizContracts,
  getQuizSummary,
  groupByCategoriaValor,
  groupByCategoriaEstado,
  formatMoneyCompact,
  formatMoneyFull,
} from "../services/api";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

const CHART_COLORS = [
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#2563eb",
  "#1d4ed8",
  "#bfdbfe",
  "#1e40af",
  "#dbeafe",
  "#1e3a8a",
  "#eff6ff",
  "#38bdf8",
  "#0ea5e9",
  "#0284c7",
  "#0369a1",
  "#075985",
];

function CustomTooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-surface-700 bg-surface-800 px-4 py-3 shadow-xl">
      <p className="mb-1 text-sm font-medium text-white">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs text-surface-300">
          Contratos: {Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getQuizContracts()
      .then((rows) => {
        if (cancelled) return;
        setContracts(rows);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="pt-24">
        <Loader text="Cargando estadísticas..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 px-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  const summary = getQuizSummary(contracts);

  const barData = groupByCategoriaValor(contracts).map((item) => ({
    ...item,
    total: Number(item.total),
  }));

  const pieData = groupByCategoriaEstado(contracts).map((item) => ({
    ...item,
    value: Number(item.total),
  }));

  const topEntidades = Object.entries(
    contracts.reduce((acc, item) => {
      const key = item.entidad;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .map(([entidad, total]) => ({ entidad, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">Dashboard Quiz 2</h1>
          <p className="mt-2 text-surface-400">
            Resumen de 2000 contratos del dataset del gobierno (offset 2000),
            con las métricas requeridas.
          </p>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={BarChart3}
            label="Total contratos"
            value={summary.total.toLocaleString()}
          />
          <StatCard
            icon={Sigma}
            label="Suma total"
            value={formatMoneyCompact(summary.sumaTotal)}
            sub={formatMoneyFull(summary.sumaTotal)}
          />
          <StatCard
            icon={Scale}
            label="Promedio (> 0)"
            value={formatMoneyCompact(summary.promedio)}
            sub={`${formatMoneyFull(summary.promedio)} · ${summary.validos.toLocaleString()} contratos con valor válido`}
          />
          <StatCard
            icon={AlertCircle}
            label="Contratos con valor 0"
            value={summary.conValorCero.toLocaleString()}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-6 lg:col-span-2">
            <h3 className="mb-6 text-lg font-semibold text-white">
              Contratos por categoría de valor
            </h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    type="number"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    width={120}
                  />
                  <Tooltip content={<CustomTooltipContent />} />
                  <Bar
                    dataKey="total"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    name="Contratos"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-6">
            <h3 className="mb-6 text-lg font-semibold text-white">
              Contratos por estado
            </h3>
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
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#f1f5f9",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
                    formatter={(value) => (
                      <span className="text-surface-300">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-surface-800 bg-surface-900/50 p-6">
          <h3 className="mb-6 text-lg font-semibold text-white">
            Top 10 entidades por número de contratos
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topEntidades}
                margin={{ left: 20, right: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="entidad"
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip content={<CustomTooltipContent />} />
                <Bar
                  dataKey="total"
                  fill="#60a5fa"
                  radius={[4, 4, 0, 0]}
                  name="Contratos"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Conteo por categoría de valor
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-800 text-surface-400">
                    <th className="px-4 py-3 font-medium">Categoría</th>
                    <th className="px-4 py-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {barData.map((item) => (
                    <tr
                      key={item.name}
                      className="border-b border-surface-800/50"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-right text-primary-400">
                        {item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-surface-800 bg-surface-900/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Conteo por categoría de estado
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-800 text-surface-400">
                    <th className="px-4 py-3 font-medium">Categoría</th>
                    <th className="px-4 py-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pieData.map((item) => (
                    <tr
                      key={item.name}
                      className="border-b border-surface-800/50"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-right text-primary-400">
                        {item.value.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
