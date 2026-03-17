const BASE = "https://www.datos.gov.co/resource/p6dx-8zbt.json";
const LIMIT = 2000;
const OFFSET = 2000;

const UMBRAL_BAJO = 50_000_000;
const UMBRAL_MEDIO = 200_000_000;

let contractsPromise = null;

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function safeText(value) {
  if (value === null || value === undefined) return "No disponible";
  const text = String(value).trim();
  return text && text !== "None" && text !== "nan" ? text : "No disponible";
}

function safeNumber(value) {
  const parsed = Number.parseFloat(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function categoriaValor(valor) {
  if (valor < UMBRAL_BAJO) return "Bajo";
  if (valor <= UMBRAL_MEDIO) return "Medio";
  return "Alto";
}

function categoriaEstado(estado) {
  const normalized = normalizeText(estado);

  if (
    normalized.includes("adjudic") ||
    normalized.includes("seleccion") ||
    normalized.includes("aceptad")
  ) {
    return "Adjudicado";
  }

  if (
    normalized.includes("no adjud") ||
    normalized.includes("desierto") ||
    normalized.includes("cancel") ||
    normalized.includes("revoc")
  ) {
    return "No adjudicado";
  }

  return "Otro estado";
}

export function formatMoneyCompact(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function formatMoneyFull(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

async function fetchRawQuizData() {
  const url = new URL(BASE);
  url.searchParams.set("$limit", String(LIMIT));
  url.searchParams.set("$offset", String(OFFSET));

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`No se pudo consultar la API (${response.status})`);
  }
  return response.json();
}

function processContracts(rawData) {
  return rawData.map((item) => {
    const estado = safeText(item.estado_del_procedimiento);
    const valor = safeNumber(item.valor_total_adjudicacion);

    return {
      entidad: safeText(item.entidad),
      nombre_del_proveedor: safeText(item.nombre_del_proveedor),
      estado_del_procedimiento: estado,
      valor_total_adjudicacion: valor,
      categoria_valor: categoriaValor(valor),
      categoria_estado: categoriaEstado(estado),
    };
  });
}

export async function getQuizContracts() {
  if (!contractsPromise) {
    contractsPromise = fetchRawQuizData().then(processContracts);
  }
  return contractsPromise;
}

export function getQuizSummary(contracts) {
  const total = contracts.length;
  const sumaTotal = contracts.reduce(
    (acc, item) => acc + item.valor_total_adjudicacion,
    0,
  );
  const valoresValidos = contracts
    .map((item) => item.valor_total_adjudicacion)
    .filter((value) => value > 0);
  const sumaValidos = valoresValidos.reduce((acc, value) => acc + value, 0);
  const promedio = valoresValidos.length
    ? sumaValidos / valoresValidos.length
    : 0;
  const conValorCero = contracts.filter(
    (item) => item.valor_total_adjudicacion === 0,
  ).length;

  return {
    total,
    sumaTotal,
    promedio,
    validos: valoresValidos.length,
    conValorCero,
  };
}

export function groupByCategoriaValor(contracts) {
  return ["Bajo", "Medio", "Alto"].map((name) => ({
    name,
    total: contracts.filter((item) => item.categoria_valor === name).length,
  }));
}

export function groupByCategoriaEstado(contracts) {
  return ["Adjudicado", "No adjudicado", "Otro estado"].map((name) => ({
    name,
    total: contracts.filter((item) => item.categoria_estado === name).length,
  }));
}

export function applyQuizFilters(contracts, filters) {
  return contracts.filter((item) => {
    const entidadOk =
      !filters.entidad ||
      item.entidad.toLowerCase().includes(filters.entidad.toLowerCase());
    const proveedorOk =
      !filters.proveedor ||
      item.nombre_del_proveedor
        .toLowerCase()
        .includes(filters.proveedor.toLowerCase());
    const estadoOk =
      !filters.categoriaEstado ||
      item.categoria_estado === filters.categoriaEstado;
    const estadoOriginalOk =
      !filters.estadoOriginal ||
      item.estado_del_procedimiento === filters.estadoOriginal;
    const valorOk =
      !filters.categoriaValor ||
      item.categoria_valor === filters.categoriaValor;
    const minOk =
      filters.minValor === "" ||
      item.valor_total_adjudicacion >= Number(filters.minValor);
    const maxOk =
      filters.maxValor === "" ||
      item.valor_total_adjudicacion <= Number(filters.maxValor);
    return (
      entidadOk &&
      proveedorOk &&
      estadoOk &&
      estadoOriginalOk &&
      valorOk &&
      minOk &&
      maxOk
    );
  });
}
