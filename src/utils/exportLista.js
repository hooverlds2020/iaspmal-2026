// Exportación de constancias: Excel (hojas por categoría) y PDF (secciones por categoría)
// getCat(row) devuelve el nombre legible de la categoría

export const COLUMNAS = [
  { key: 'participant_name', label: 'Participante' },
  { key: 'participant_email', label: 'Correo' },
  { key: 'folio', label: 'Folio' },
  { key: 'presentation_title', label: 'Título' },
  { key: 'symposium_title', label: 'Simposio' },
  { key: 'verified', label: 'Verificada', fmt: v => (v ? 'Sí' : 'No') },
];

const val = (row, c) => (c.fmt ? c.fmt(row[c.key]) : row[c.key] ?? '');
const ordenar = arr => [...arr].sort((a, b) =>
  String(a.participant_name || '').localeCompare(String(b.participant_name || ''), 'es'));

function agrupar(rows, getCat) {
  const grupos = {};
  rows.forEach(r => {
    const cat = getCat(r) || 'Sin categoría';
    (grupos[cat] ||= []).push(r);
  });
  Object.keys(grupos).forEach(k => { grupos[k] = ordenar(grupos[k]); });
  return grupos;
}

function nombreHoja(nombre, usados) {
  const base = String(nombre).replace(/[\[\]:*?/\\]/g, '').slice(0, 31).trim() || 'Hoja';
  let n = base, i = 2;
  while (usados.has(n)) { n = base.slice(0, 28) + ' ' + i++; }
  usados.add(n);
  return n;
}

const aFila = (r, cols, cat) => {
  const o = {};
  if (cat !== undefined) o['Categoría'] = cat;
  cols.forEach(c => { o[c.label] = val(r, c); });
  return o;
};

export async function exportarExcel(rows, getCat, nombreArchivo = 'constancias', porCategoria = true, cols = COLUMNAS) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  const usados = new Set();
  const anchos = [{ wch: 26 }, { wch: 34 }, { wch: 32 }, { wch: 24 }, { wch: 60 }, { wch: 50 }, { wch: 11 }];

  const agregarHoja = (datos, nombre, conCat) => {
    const ws = XLSX.utils.json_to_sheet(datos);
    ws['!cols'] = conCat ? anchos : anchos.slice(1);
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja(nombre, usados));
  };

  if (!porCategoria) {
    agregarHoja(ordenar(rows).map(r => aFila(r, cols)), 'Lista', false);
  } else {
    const grupos = agrupar(rows, getCat);
    const cats = Object.keys(grupos).sort((a, b) => grupos[b].length - grupos[a].length);
    const resumen = [['Categoría', 'Total'], ...cats.map(c => [c, grupos[c].length]), ['TOTAL', rows.length]];
    const wsR = XLSX.utils.aoa_to_sheet(resumen);
    wsR['!cols'] = [{ wch: 45 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsR, nombreHoja('Resumen', usados));
    agregarHoja(ordenar(rows).map(r => aFila(r, cols, getCat(r))), 'Todas', true);
    cats.forEach(c => agregarHoja(grupos[c].map(r => aFila(r, cols)), c, false));
  }
  XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
}

const escH = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

export function exportarPDF(rows, getCat, titulo = 'Constancias', porCategoria = true, cols = COLUMNAS) {
  const fecha = new Date().toLocaleDateString('es-MX');
  const tabla = lista => `
<table><thead><tr><th class="n">#</th>${cols.map(c => `<th>${escH(c.label)}</th>`).join('')}</tr></thead>
<tbody>${lista.map((r, i) => `<tr><td class="n">${i + 1}</td>${cols.map(c => `<td>${escH(val(r, c))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

  let cuerpo;
  if (!porCategoria) {
    cuerpo = `<h1>${escH(titulo)}</h1><p class="meta">XVII Congreso IASPM-AL 2026 · ${rows.length} registros · ${fecha}</p>${tabla(ordenar(rows))}`;
  } else {
    const grupos = agrupar(rows, getCat);
    const cats = Object.keys(grupos).sort((a, b) => grupos[b].length - grupos[a].length);
    cuerpo = `
<h1>${escH(titulo)}</h1>
<p class="meta">XVII Congreso IASPM-AL 2026 · ${fecha}</p>
<table class="indice"><thead><tr><th>Categoría</th><th class="n">Total</th></tr></thead><tbody>
${cats.map(c => `<tr><td>${escH(c)}</td><td class="n">${grupos[c].length}</td></tr>`).join('')}
<tr class="total"><td>TOTAL</td><td class="n">${rows.length}</td></tr></tbody></table>
${cats.map(c => `<section><h2>${escH(c)} <span>(${grupos[c].length})</span></h2>${tabla(grupos[c])}</section>`).join('')}`;
  }

  const w = window.open('', '_blank');
  if (!w) { alert('Permite las ventanas emergentes para generar el PDF.'); return; }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escH(titulo)}</title>
<style>
body{font-family:Arial,sans-serif;font-size:9.5px;margin:0;color:#222}
h1{font-size:18px;margin:0 0 4px;color:#1e3a5f}
h2{font-size:14px;color:#1e3a5f;border-bottom:2px solid #1e3a5f;padding-bottom:4px;margin:0 0 8px}
h2 span{font-weight:normal;color:#666}
.meta{color:#666;margin:0 0 14px}
section{page-break-before:always}
table{width:100%;border-collapse:collapse}
thead{display:table-header-group}
tr{page-break-inside:avoid}
th,td{border:1px solid #ccc;padding:4px 6px;text-align:left;vertical-align:top}
th{background:#1e3a5f;color:#fff}
tr:nth-child(even) td{background:#f5f5f5}
td.n,th.n{text-align:center;width:30px}
.indice{width:60%}
.total td{font-weight:bold;background:#e8edf3 !important}
@page{size:letter landscape;margin:10mm}
</style></head><body>${cuerpo}</body></html>`);
  w.document.close();
  w.onload = () => { w.focus(); w.print(); };
}
