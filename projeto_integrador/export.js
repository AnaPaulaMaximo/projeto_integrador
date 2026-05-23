// ============================================================
// Helper de exportação de relatórios — PDF, Excel (XLSX) e CSV.
// Carrega jsPDF + AutoTable e SheetJS sob demanda via CDN.
// Uso:
//   await Export.toPDF({ titulo, colunas, linhas });
//   await Export.toExcel({ nomeArquivo, abas: [{ nome, colunas, linhas }] });
//   Export.toCSV({ nomeArquivo, colunas, linhas });
// ============================================================

(function (global) {
  const CDN = {
    jspdf:    'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
    autotable:'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js',
    sheetjs:  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  };

  const cache = {};
  function carregarScript(url) {
    if (cache[url]) return cache[url];
    cache[url] = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = url;
      s.onload  = () => resolve();
      s.onerror = () => reject(new Error('Falha ao carregar ' + url));
      document.head.appendChild(s);
    });
    return cache[url];
  }

  async function garantirJsPDF() {
    if (!global.jspdf) await carregarScript(CDN.jspdf);
    if (!global.jspdf.jsPDF.API.autoTable) await carregarScript(CDN.autotable);
  }
  async function garantirSheetJS() {
    if (!global.XLSX) await carregarScript(CDN.sheetjs);
  }

  function dataHoje() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  /** Exporta para PDF. opts: { titulo, subtitulo?, colunas: [str], linhas: [[v,...]], nomeArquivo? } */
  async function toPDF(opts) {
    await garantirJsPDF();
    const { jsPDF } = global.jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(16);
    doc.text(opts.titulo || 'Relatório', 14, 16);
    if (opts.subtitulo) {
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(opts.subtitulo, 14, 22);
      doc.setTextColor(0);
    }
    doc.setFontSize(9);
    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 14, 28);

    doc.autoTable({
      head: [opts.colunas],
      body: opts.linhas,
      startY: 32,
      theme: 'striped',
      headStyles: { fillColor: [11, 87, 208] },
      styles: { font: 'helvetica', fontSize: 9 },
    });

    const nome = (opts.nomeArquivo || `relatorio_${dataHoje()}`) + '.pdf';
    doc.save(nome);
  }

  /** Exporta para Excel. opts: { nomeArquivo?, abas: [{ nome, colunas, linhas }] } */
  async function toExcel(opts) {
    await garantirSheetJS();
    const wb = global.XLSX.utils.book_new();
    (opts.abas || []).forEach(aba => {
      const data = [aba.colunas, ...aba.linhas];
      const ws   = global.XLSX.utils.aoa_to_sheet(data);
      // largura automática mínima
      ws['!cols'] = aba.colunas.map((_, i) => {
        const max = Math.max(
          aba.colunas[i].length,
          ...aba.linhas.map(l => String(l[i] ?? '').length)
        );
        return { wch: Math.min(40, Math.max(12, max + 2)) };
      });
      global.XLSX.utils.book_append_sheet(wb, ws, (aba.nome || 'Dados').slice(0, 31));
    });
    const nome = (opts.nomeArquivo || `relatorio_${dataHoje()}`) + '.xlsx';
    global.XLSX.writeFile(wb, nome);
  }

  /** Exporta para CSV (separador ;). opts: { nomeArquivo?, colunas, linhas } */
  function toCSV(opts) {
    const escapar = v => {
      const s = String(v ?? '');
      return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const linhas = [opts.colunas, ...opts.linhas].map(l => l.map(escapar).join(';')).join('\n');
    const blob   = new Blob(['﻿' + linhas], { type: 'text/csv;charset=utf-8' });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a');
    a.href = url;
    a.download = (opts.nomeArquivo || `relatorio_${dataHoje()}`) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  global.Export = { toPDF, toExcel, toCSV };
})(window);
