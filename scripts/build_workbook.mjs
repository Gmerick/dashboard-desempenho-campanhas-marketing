import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const csvPath = `${projectRoot}/data/campaign_performance.csv`;
const outputDir = `${projectRoot}/outputs/e1212207ff9f`;
const previewDir = `${projectRoot}/reports`;

const csv = await fs.readFile(csvPath, "utf8");
const lines = csv.trim().split(/\r?\n/);
const headers = lines[0].split(",");
const numericColumns = new Set(["impressoes", "cliques", "leads", "conversoes", "novos_clientes", "investimento", "receita_atribuida", "orcamento_diario"]);
const rawRows = lines.slice(1).map((line) => {
  const values = line.split(",");
  return headers.map((header, index) => {
    if (header === "data") return new Date(`${values[index]}T00:00:00Z`);
    if (numericColumns.has(header)) return Number(values[index]);
    return values[index];
  });
});

const workbook = Workbook.create();
workbook.comments.setSelf({ displayName: "Erick Gomes" });
const dashboard = workbook.worksheets.add("Dashboard");
const channelAnalysis = workbook.worksheets.add("Analise_Canais");
const monthlyAnalysis = workbook.worksheets.add("Analise_Mensal");
const campaignAnalysis = workbook.worksheets.add("Analise_Campanhas");
const sourceData = workbook.worksheets.add("Dados_Campanhas");
const goals = workbook.worksheets.add("Metas_Dicionario");

const colors = {
  navy: "#0F172A",
  purple: "#7C3AED",
  teal: "#14B8A6",
  orange: "#F59E0B",
  red: "#DC2626",
  green: "#16A34A",
  light: "#F8FAFC",
  slate: "#64748B",
  border: "#CBD5E1",
  white: "#FFFFFF",
  yellow: "#FEF3C7",
};

function titleBand(sheet, range, title, subtitle) {
  sheet.getRange(range).merge();
  const anchor = range.split(":")[0];
  sheet.getRange(anchor).values = [[`${title}\n${subtitle}`]];
  sheet.getRange(range).format = {
    fill: colors.navy,
    font: { color: colors.white, bold: true, size: 18 },
    verticalAlignment: "center",
    wrapText: true,
  };
  sheet.getRange(range).format.rowHeight = 30;
}

function styleHeader(range) {
  range.format = {
    fill: colors.purple,
    font: { color: colors.white, bold: true },
    verticalAlignment: "center",
    horizontalAlignment: "center",
    wrapText: true,
    borders: { preset: "outside", style: "thin", color: colors.border },
  };
  range.format.rowHeight = 30;
}

function styleKpi(sheet, labelRange, valueRange, label, formula, format, accent) {
  sheet.getRange(labelRange).merge();
  sheet.getRange(valueRange).merge();
  const labelCell = labelRange.split(":")[0];
  const valueCell = valueRange.split(":")[0];
  sheet.getRange(labelCell).values = [[label]];
  sheet.getRange(valueCell).formulas = [[formula]];
  sheet.getRange(labelRange).format = {
    fill: accent,
    font: { color: colors.white, bold: true, size: 10 },
    horizontalAlignment: "center",
    verticalAlignment: "center",
  };
  sheet.getRange(valueRange).format = {
    fill: colors.white,
    font: { color: colors.navy, bold: true, size: 20 },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    borders: { preset: "outside", style: "thin", color: colors.border },
  };
  sheet.getRange(valueRange).setNumberFormat(format);
}

// Fonte de dados intacta
sourceData.showGridLines = false;
sourceData.getRange(`A1:P${rawRows.length + 1}`).values = [headers, ...rawRows];
styleHeader(sourceData.getRange("A1:P1"));
sourceData.getRange(`A2:A${rawRows.length + 1}`).setNumberFormat("yyyy-mm-dd");
sourceData.getRange(`I2:M${rawRows.length + 1}`).setNumberFormat("#,##0");
sourceData.getRange(`N2:P${rawRows.length + 1}`).setNumberFormat('"R$" #,##0.00');
sourceData.getRange(`A1:P${rawRows.length + 1}`).format.font.size = 9;
sourceData.freezePanes.freezeRows(1);
sourceData.freezePanes.freezeColumns(2);
const dataTable = sourceData.tables.add(`A1:P${rawRows.length + 1}`, true, "DadosCampanhas");
dataTable.style = "TableStyleMedium4";
sourceData.getRange("A:P").format.columnWidth = 14;
sourceData.getRange("B:B").format.columnWidth = 12;
sourceData.getRange("C:F").format.columnWidth = 21;
sourceData.getRange("N:P").format.columnWidth = 18;

// Metas e dicionário
goals.showGridLines = false;
titleBand(goals, "A1:H2", "METAS E DICIONÁRIO", "Premissas editáveis e definições dos indicadores");
goals.getRange("A4:D4").values = [["Métrica", "Meta", "Unidade", "Uso"]];
styleHeader(goals.getRange("A4:D4"));
goals.getRange("A5:D9").values = [
  ["CTR", 0.025, "%", "Eficiência do anúncio em gerar cliques"],
  ["Taxa de conversão", 0.15, "%", "Conversões divididas por leads"],
  ["CPA", 250, "R$", "Custo máximo por conversão"],
  ["ROAS", 3, "x", "Receita atribuída dividida pelo investimento"],
  ["ROI", 2, "%", "Retorno líquido sobre o investimento"],
];
goals.getRange("B5:B6").setNumberFormat("0.0%");
goals.getRange("B7:B7").setNumberFormat('"R$" #,##0');
goals.getRange("B8:B8").setNumberFormat('0.00"x"');
goals.getRange("B9:B9").setNumberFormat("0.0%");
goals.getRange("B5:B9").format.fill = colors.yellow;
goals.getRange("B5:B9").format.font = { color: colors.navy, bold: true };
goals.getRange("A12:H12").values = [["Campo", "Definição", "Campo", "Definição", "Campo", "Definição", "Campo", "Definição"]];
styleHeader(goals.getRange("A12:H12"));
goals.getRange("A13:H16").values = [
  ["Impressões", "Exibições dos anúncios", "Cliques", "Interações que abriram o destino", "Leads", "Contatos qualificados", "Conversões", "Vendas atribuídas"],
  ["Investimento", "Custo de mídia e operação", "Receita", "Receita atribuída à campanha", "CTR", "Cliques / impressões", "CPC", "Investimento / cliques"],
  ["CPL", "Investimento / leads", "CPA", "Investimento / conversões", "ROAS", "Receita / investimento", "ROI", "(Receita - investimento) / investimento"],
  ["Atribuição", "Simulação last-click", "Período", "01/01/2025 a 31/12/2025", "Fonte", "Base sintética", "Atualização", "Gerada com semente 2026"],
];
goals.getRange("A4:H16").format.borders = { preset: "inside", style: "thin", color: colors.border };
goals.getRange("A:H").format.columnWidth = 19;
goals.getRange("B:B").format.columnWidth = 16;
goals.getRange("D:D").format.columnWidth = 34;
goals.getRange("F:F").format.columnWidth = 28;
goals.getRange("H:H").format.columnWidth = 27;
goals.getRange("A13:H16").format.wrapText = true;
workbook.comments.addThread({ cell: goals.getRange("B8") }, "Meta demonstrativa. Em um caso real, deve ser definida conforme margem, atribuição e estratégia do negócio.");

// Análise por canal
channelAnalysis.showGridLines = false;
titleBand(channelAnalysis, "A1:P2", "DESEMPENHO POR CANAL", "Agregações calculadas com SUMIFS a partir da base intacta");
const channelHeaders = ["Canal", "Impressões", "Cliques", "Leads", "Conversões", "Novos clientes", "Investimento", "Receita", "CTR", "CPC", "CPL", "Tx. conversão", "CPA", "ROAS", "ROI", "Status"];
channelAnalysis.getRange("A4:P4").values = [channelHeaders];
styleHeader(channelAnalysis.getRange("A4:P4"));
const channels = ["Email Marketing", "Google Ads", "LinkedIn Ads", "Meta Ads", "TikTok Ads"];
channelAnalysis.getRange("A5:A9").values = channels.map((value) => [value]);
const metricColumns = ["I", "J", "K", "L", "M", "N", "O"];
for (let index = 0; index < metricColumns.length; index++) {
  const destinationColumn = String.fromCharCode("B".charCodeAt(0) + index);
  channelAnalysis.getRange(`${destinationColumn}5`).formulas = [[`=SUMIFS('Dados_Campanhas'!$${metricColumns[index]}$2:$${metricColumns[index]}$${rawRows.length + 1},'Dados_Campanhas'!$D$2:$D$${rawRows.length + 1},$A5)`]];
  channelAnalysis.getRange(`${destinationColumn}5:${destinationColumn}9`).fillDown();
}
channelAnalysis.getRange("I5").formulas = [["=IFERROR(C5/B5,0)"]]; channelAnalysis.getRange("I5:I9").fillDown();
channelAnalysis.getRange("J5").formulas = [["=IFERROR(G5/C5,0)"]]; channelAnalysis.getRange("J5:J9").fillDown();
channelAnalysis.getRange("K5").formulas = [["=IFERROR(G5/D5,0)"]]; channelAnalysis.getRange("K5:K9").fillDown();
channelAnalysis.getRange("L5").formulas = [["=IFERROR(E5/D5,0)"]]; channelAnalysis.getRange("L5:L9").fillDown();
channelAnalysis.getRange("M5").formulas = [["=IFERROR(G5/E5,0)"]]; channelAnalysis.getRange("M5:M9").fillDown();
channelAnalysis.getRange("N5").formulas = [["=IFERROR(H5/G5,0)"]]; channelAnalysis.getRange("N5:N9").fillDown();
channelAnalysis.getRange("O5").formulas = [["=IFERROR((H5-G5)/G5,0)"]]; channelAnalysis.getRange("O5:O9").fillDown();
channelAnalysis.getRange("P5").formulas = [["=IF(AND(M5<='Metas_Dicionario'!$B$7,N5>='Metas_Dicionario'!$B$8,O5>='Metas_Dicionario'!$B$9),\"Acima da meta\",\"Abaixo da meta\")"]]; channelAnalysis.getRange("P5:P9").fillDown();
channelAnalysis.getRange("A10").values = [["TOTAL"]];
for (const col of ["B", "C", "D", "E", "F", "G", "H"]) channelAnalysis.getRange(`${col}10`).formulas = [[`=SUM(${col}5:${col}9)`]];
for (const [col, formula] of Object.entries({I:"=IFERROR(C10/B10,0)",J:"=IFERROR(G10/C10,0)",K:"=IFERROR(G10/D10,0)",L:"=IFERROR(E10/D10,0)",M:"=IFERROR(G10/E10,0)",N:"=IFERROR(H10/G10,0)",O:"=IFERROR((H10-G10)/G10,0)"})) channelAnalysis.getRange(`${col}10`).formulas = [[formula]];
channelAnalysis.getRange("P10").values = [["Portfólio"]];
channelAnalysis.getRange("A10:P10").format = { fill: "#EDE9FE", font: { bold: true, color: colors.navy }, borders: { preset: "doubleBottom", style: "thin", color: colors.purple } };
channelAnalysis.getRange("B5:F10").setNumberFormat("#,##0");
channelAnalysis.getRange("G5:H10").setNumberFormat('"R$" #,##0');
channelAnalysis.getRange("I5:I10").setNumberFormat("0.00%");
channelAnalysis.getRange("J5:K10").setNumberFormat('"R$" #,##0.00');
channelAnalysis.getRange("L5:L10").setNumberFormat("0.00%");
channelAnalysis.getRange("M5:M10").setNumberFormat('"R$" #,##0.00');
channelAnalysis.getRange("N5:N10").setNumberFormat('0.00"x"');
channelAnalysis.getRange("O5:O10").setNumberFormat("0.0%");
channelAnalysis.getRange("O5:O9").conditionalFormats.add("colorScale", { colors: ["#FEE2E2", "#FEF3C7", "#DCFCE7"], thresholds: ["min", "50%", "max"] });
channelAnalysis.getRange("P5:P9").conditionalFormats.add("containsText", { text: "Acima", format: { fill: "#DCFCE7", font: { color: colors.green, bold: true } } });
channelAnalysis.getRange("P5:P9").conditionalFormats.add("containsText", { text: "Abaixo", format: { fill: "#FEE2E2", font: { color: colors.red, bold: true } } });
channelAnalysis.freezePanes.freezeRows(4);
channelAnalysis.getRange("A:P").format.columnWidth = 14;
channelAnalysis.getRange("A:A").format.columnWidth = 21;
channelAnalysis.getRange("G:H").format.columnWidth = 18;
channelAnalysis.getRange("J:O").format.columnWidth = 16;
channelAnalysis.getRange("P:P").format.columnWidth = 18;

// Análise mensal
monthlyAnalysis.showGridLines = false;
titleBand(monthlyAnalysis, "A1:H2", "EVOLUÇÃO MENSAL", "Investimento, receita e eficiência ao longo de 2025");
monthlyAnalysis.getRange("A4:H4").values = [["Início do mês", "Mês", "Investimento", "Receita", "Conversões", "ROAS", "ROI", "Variação receita"]];
styleHeader(monthlyAnalysis.getRange("A4:H4"));
const monthNames = ["Jan 2025", "Fev 2025", "Mar 2025", "Abr 2025", "Mai 2025", "Jun 2025", "Jul 2025", "Ago 2025", "Set 2025", "Out 2025", "Nov 2025", "Dez 2025"];
monthlyAnalysis.getRange("A5:A16").values = monthNames.map((_, index) => [new Date(Date.UTC(2025, index, 1))]);
monthlyAnalysis.getRange("B5:B16").values = monthNames.map((value) => [value]);
monthlyAnalysis.getRange("C5").formulas = [[`=SUMIFS('Dados_Campanhas'!$N$2:$N$${rawRows.length + 1},'Dados_Campanhas'!$A$2:$A$${rawRows.length + 1},\">=\"&$A5,'Dados_Campanhas'!$A$2:$A$${rawRows.length + 1},\"<\"&DATE(YEAR($A5),MONTH($A5)+1,1))`]]; monthlyAnalysis.getRange("C5:C16").fillDown();
monthlyAnalysis.getRange("D5").formulas = [[`=SUMIFS('Dados_Campanhas'!$O$2:$O$${rawRows.length + 1},'Dados_Campanhas'!$A$2:$A$${rawRows.length + 1},\">=\"&$A5,'Dados_Campanhas'!$A$2:$A$${rawRows.length + 1},\"<\"&DATE(YEAR($A5),MONTH($A5)+1,1))`]]; monthlyAnalysis.getRange("D5:D16").fillDown();
monthlyAnalysis.getRange("E5").formulas = [[`=SUMIFS('Dados_Campanhas'!$L$2:$L$${rawRows.length + 1},'Dados_Campanhas'!$A$2:$A$${rawRows.length + 1},\">=\"&$A5,'Dados_Campanhas'!$A$2:$A$${rawRows.length + 1},\"<\"&DATE(YEAR($A5),MONTH($A5)+1,1))`]]; monthlyAnalysis.getRange("E5:E16").fillDown();
monthlyAnalysis.getRange("F5").formulas = [["=IFERROR(D5/C5,0)"]]; monthlyAnalysis.getRange("F5:F16").fillDown();
monthlyAnalysis.getRange("G5").formulas = [["=IFERROR((D5-C5)/C5,0)"]]; monthlyAnalysis.getRange("G5:G16").fillDown();
monthlyAnalysis.getRange("H5").values = [[null]];
monthlyAnalysis.getRange("H6").formulas = [["=IFERROR(D6/D5-1,0)"]]; monthlyAnalysis.getRange("H6:H16").fillDown();
monthlyAnalysis.getRange("A5:A16").setNumberFormat("yyyy-mm-dd");
monthlyAnalysis.getRange("C5:D16").setNumberFormat('"R$" #,##0');
monthlyAnalysis.getRange("E5:E16").setNumberFormat("#,##0");
monthlyAnalysis.getRange("F5:F16").setNumberFormat('0.00"x"');
monthlyAnalysis.getRange("G5:H16").setNumberFormat("0.0%");
monthlyAnalysis.getRange("H6:H16").conditionalFormats.add("colorScale", { colors: ["#FEE2E2", "#FFFFFF", "#DCFCE7"], thresholds: ["min", 0, "max"] });
monthlyAnalysis.getRange("A:H").format.columnWidth = 18;

// Análise por campanha
campaignAnalysis.showGridLines = false;
titleBand(campaignAnalysis, "A1:J2", "RANKING DE CAMPANHAS", "Comparação de eficiência e retorno por campanha");
campaignAnalysis.getRange("A4:J4").values = [["Campanha", "Canal", "Cliques", "Leads", "Conversões", "Investimento", "Receita", "CPA", "ROAS", "ROI"]];
styleHeader(campaignAnalysis.getRange("A4:J4"));
const campaigns = [
  ["Demo B2B", "LinkedIn Ads"], ["Criadores e Reviews", "TikTok Ads"], ["Nutricao de Leads", "Email Marketing"],
  ["Oferta Base Ativa", "Email Marketing"], ["Performance Max", "Google Ads"], ["Pesquisa Generica", "Google Ads"],
  ["Pesquisa Marca", "Google Ads"], ["Prospeccao Interesses", "Meta Ads"], ["Publico Lookalike", "Meta Ads"],
  ["Remarketing Social", "Meta Ads"], ["Video Descoberta", "TikTok Ads"], ["Webinar Executivo", "LinkedIn Ads"],
];
campaignAnalysis.getRange("A5:B16").values = campaigns;
for (const [dest, raw] of [["C","J"],["D","K"],["E","L"],["F","N"],["G","O"]]) {
  campaignAnalysis.getRange(`${dest}5`).formulas = [[`=SUMIFS('Dados_Campanhas'!$${raw}$2:$${raw}$${rawRows.length + 1},'Dados_Campanhas'!$C$2:$C$${rawRows.length + 1},$A5)`]];
  campaignAnalysis.getRange(`${dest}5:${dest}16`).fillDown();
}
campaignAnalysis.getRange("H5").formulas = [["=IFERROR(F5/E5,0)"]]; campaignAnalysis.getRange("H5:H16").fillDown();
campaignAnalysis.getRange("I5").formulas = [["=IFERROR(G5/F5,0)"]]; campaignAnalysis.getRange("I5:I16").fillDown();
campaignAnalysis.getRange("J5").formulas = [["=IFERROR((G5-F5)/F5,0)"]]; campaignAnalysis.getRange("J5:J16").fillDown();
campaignAnalysis.getRange("C5:E16").setNumberFormat("#,##0");
campaignAnalysis.getRange("F5:H16").setNumberFormat('"R$" #,##0');
campaignAnalysis.getRange("I5:I16").setNumberFormat('0.00"x"');
campaignAnalysis.getRange("J5:J16").setNumberFormat("0.0%");
campaignAnalysis.getRange("I5:I16").conditionalFormats.add("dataBar", { color: colors.purple, gradient: true });
campaignAnalysis.getRange("A:J").format.columnWidth = 17;
campaignAnalysis.getRange("A:A").format.columnWidth = 24;
campaignAnalysis.getRange("B:B").format.columnWidth = 20;
campaignAnalysis.getRange("F:H").format.columnWidth = 19;

// Dashboard executivo
dashboard.showGridLines = false;
dashboard.getRange("A1:P2").merge();
dashboard.getRange("A1").values = [["DASHBOARD DE DESEMPENHO DE CAMPANHAS\nVisão executiva | Período: 01/01/2025 a 31/12/2025 | Base sintética"]];
dashboard.getRange("A1:P2").format = { fill: colors.navy, font: { color: colors.white, bold: true, size: 19 }, verticalAlignment: "center", wrapText: true };
dashboard.getRange("A1:P2").format.rowHeight = 30;
styleKpi(dashboard, "A4:C4", "A5:C6", "INVESTIMENTO", "='Analise_Canais'!G10", '"R$" #,##0', colors.purple);
styleKpi(dashboard, "D4:F4", "D5:F6", "RECEITA ATRIBUÍDA", "='Analise_Canais'!H10", '"R$" #,##0', colors.teal);
styleKpi(dashboard, "G4:I4", "G5:I6", "CONVERSÕES", "='Analise_Canais'!E10", '#,##0', colors.orange);
styleKpi(dashboard, "J4:L4", "J5:L6", "ROAS", "='Analise_Canais'!N10", '0.00"x"', colors.purple);
styleKpi(dashboard, "M4:P4", "M5:P6", "ROI", "='Analise_Canais'!O10", '0.0%', colors.teal);

const roasChart = dashboard.charts.add("bar", { chartType: "bar", title: "ROAS por canal (x)", hasLegend: false });
const roasSeries = roasChart.series.add("ROAS");
roasSeries.categoryFormula = "'Analise_Canais'!$A$5:$A$9";
roasSeries.formula = "'Analise_Canais'!$N$5:$N$9";
roasSeries.fill = colors.purple;
roasChart.title = "ROAS por canal (x)";
roasChart.hasLegend = false;
roasChart.xAxis = { axisType: "textAxis", textStyle: { fontSize: 9 } };
roasChart.yAxis = { numberFormatCode: '0.0"x"' };
roasChart.setPosition("A9", "H21");

const trendChart = dashboard.charts.add("line", monthlyAnalysis.getRange("B4:D16"));
trendChart.title = "Investimento x receita por mês (R$)";
trendChart.hasLegend = true;
trendChart.xAxis = { axisType: "textAxis", textStyle: { fontSize: 9 } };
trendChart.yAxis = { numberFormatCode: 'R$ #,##0' };
trendChart.setPosition("I9", "P21");

dashboard.getRange("A24:P24").merge();
dashboard.getRange("A24").values = [["RESUMO POR CANAL"]];
dashboard.getRange("A24:P24").format = { fill: colors.navy, font: { color: colors.white, bold: true, size: 12 }, horizontalAlignment: "left" };
dashboard.getRange("A26:H26").values = [["Canal", "Investimento", "Receita", "Conversões", "CTR", "CPA", "ROAS", "Status"]];
styleHeader(dashboard.getRange("A26:H26"));
for (let row = 0; row < 5; row++) {
  const sourceRow = row + 5;
  const targetRow = row + 27;
  dashboard.getRange(`A${targetRow}:H${targetRow}`).formulas = [[
    `='Analise_Canais'!A${sourceRow}`, `='Analise_Canais'!G${sourceRow}`, `='Analise_Canais'!H${sourceRow}`,
    `='Analise_Canais'!E${sourceRow}`, `='Analise_Canais'!I${sourceRow}`, `='Analise_Canais'!M${sourceRow}`,
    `='Analise_Canais'!N${sourceRow}`, `='Analise_Canais'!P${sourceRow}`,
  ]];
}
dashboard.getRange("B27:C31").setNumberFormat('"R$" #,##0');
dashboard.getRange("D27:D31").setNumberFormat("#,##0");
dashboard.getRange("E27:E31").setNumberFormat("0.00%");
dashboard.getRange("F27:F31").setNumberFormat('"R$" #,##0');
dashboard.getRange("G27:G31").setNumberFormat('0.00"x"');
dashboard.getRange("G27:G31").conditionalFormats.add("dataBar", { color: colors.teal, gradient: true });
dashboard.getRange("H27:H31").conditionalFormats.add("containsText", { text: "Acima", format: { fill: "#DCFCE7", font: { color: colors.green, bold: true } } });
dashboard.getRange("H27:H31").conditionalFormats.add("containsText", { text: "Abaixo", format: { fill: "#FEE2E2", font: { color: colors.red, bold: true } } });
dashboard.getRange("J26:P26").merge();
dashboard.getRange("J26").values = [["LEITURA EXECUTIVA"]];
styleHeader(dashboard.getRange("J26:P26"));
dashboard.getRange("J27:P31").merge();
dashboard.getRange("J27").values = [["• Email Marketing lidera eficiência, mas depende da base própria e não deve ser comparado isoladamente à aquisição paga.\n• Google e Meta combinam escala com ROAS acima da meta.\n• LinkedIn apresenta ticket alto, porém CPA elevado.\n• TikTok gera alcance e volume, mas tem o menor retorno direto; recomenda-se revisar criativos, público e atribuição.\n• Redistribuição de verba deve considerar incrementalidade, margem e qualidade do cliente, não apenas ROAS."]];
dashboard.getRange("J27:P31").format = { fill: "#F1F5F9", font: { color: colors.navy, size: 10 }, wrapText: true, verticalAlignment: "top", borders: { preset: "outside", style: "thin", color: colors.border } };
dashboard.getRange("J27:P31").format.rowHeight = 27;
dashboard.getRange("A:P").format.columnWidth = 12;
dashboard.getRange("A:A").format.columnWidth = 21;
dashboard.getRange("B:C").format.columnWidth = 16;
dashboard.getRange("F:G").format.columnWidth = 15;
dashboard.getRange("H:H").format.columnWidth = 18;
dashboard.freezePanes.freezeRows(2);

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const inspect = await workbook.inspect({ kind: "table", range: "Dashboard!A1:P31", include: "values,formulas", tableMaxRows: 31, tableMaxCols: 16, maxChars: 10000 });
console.log(inspect.ndjson);
const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 300 }, summary: "final formula error scan" });
console.log(errors.ndjson);

const previewRanges = {
  Dashboard: "A1:P31",
  Analise_Canais: "A1:P10",
  Analise_Mensal: "A1:H16",
  Analise_Campanhas: "A1:J16",
  Dados_Campanhas: "A1:P25",
  Metas_Dicionario: "A1:H16",
};
for (const [sheetName, range] of Object.entries(previewRanges)) {
  const preview = await workbook.render({ sheetName, range, scale: sheetName === "Dashboard" ? 1.2 : 0.8, format: "png" });
  const safeName = sheetName.toLowerCase().replaceAll("_", "-");
  await fs.writeFile(`${previewDir}/${safeName}.png`, new Uint8Array(await preview.arrayBuffer()));
}

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(`${outputDir}/dashboard_campanhas_marketing.xlsx`);
console.log(`Workbook salvo em ${outputDir}/dashboard_campanhas_marketing.xlsx`);
