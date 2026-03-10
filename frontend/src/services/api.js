const BASE = 'https://www.datos.gov.co/resource/ugc5-acjp.json';

async function socrataRequest(params = {}) {
  const url = new URL(BASE);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') url.searchParams.set(k, v);
  });

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function getPrestadores(filters = {}) {
  const params = {
    $limit: filters.limit || 25,
    $offset: filters.offset || 0,
    $order: 'nombre_prestador',
  };

  const whereClauses = [];
  if (filters.departamento) whereClauses.push(`depa_nombre='${filters.departamento}'`);
  if (filters.municipio) whereClauses.push(`upper(muni_nombre) like upper('%${filters.municipio}%')`);
  if (filters.nombre) whereClauses.push(`upper(nombre_prestador) like upper('%${filters.nombre}%')`);
  if (filters.naturaleza) whereClauses.push(`naju_nombre='${filters.naturaleza}'`);
  if (filters.clase) whereClauses.push(`clpr_nombre='${filters.clase}'`);
  if (whereClauses.length) params.$where = whereClauses.join(' AND ');

  const data = await socrataRequest(params);

  // Get total count with same filters
  const countParams = { $select: 'count(*) as total' };
  if (params.$where) countParams.$where = params.$where;
  const countRes = await socrataRequest(countParams);
  const total = Number(countRes[0]?.total || 0);

  return { data, total };
}

export async function getEstadisticasPorDepto() {
  return socrataRequest({
    $select: 'depa_nombre, count(*) as total',
    $group: 'depa_nombre',
    $order: 'total DESC',
  });
}

export async function getEstadisticasPorClase() {
  return socrataRequest({
    $select: 'clpr_nombre, count(*) as total',
    $group: 'clpr_nombre',
    $order: 'total DESC',
  });
}

export async function getEstadisticasPorNaturaleza() {
  return socrataRequest({
    $select: 'naju_nombre, count(*) as total',
    $group: 'naju_nombre',
    $order: 'total DESC',
  });
}

export async function getDepartamentos() {
  const data = await socrataRequest({
    $select: 'depa_nombre',
    $group: 'depa_nombre',
    $order: 'depa_nombre',
  });
  return data.map((d) => d.depa_nombre).filter(Boolean);
}

export async function getTotalPrestadores() {
  const res = await socrataRequest({ $select: 'count(*) as total' });
  return Number(res[0]?.total || 0);
}
