CREATE VIEW vw_resumo_executivo AS
SELECT
    SUM(f.impressoes) AS impressoes,
    SUM(f.cliques) AS cliques,
    SUM(f.leads) AS leads,
    SUM(f.conversoes) AS conversoes,
    SUM(f.novos_clientes) AS novos_clientes,
    ROUND(SUM(f.investimento), 2) AS investimento,
    ROUND(SUM(f.receita_atribuida), 2) AS receita,
    ROUND(1.0 * SUM(f.cliques) / NULLIF(SUM(f.impressoes), 0), 4) AS ctr,
    ROUND(1.0 * SUM(f.conversoes) / NULLIF(SUM(f.leads), 0), 4) AS taxa_conversao,
    ROUND(SUM(f.investimento) / NULLIF(SUM(f.conversoes), 0), 2) AS cpa,
    ROUND(SUM(f.receita_atribuida) / NULLIF(SUM(f.investimento), 0), 2) AS roas,
    ROUND((SUM(f.receita_atribuida) - SUM(f.investimento)) / NULLIF(SUM(f.investimento), 0), 4) AS roi
FROM fato_desempenho_campanha f;

CREATE VIEW vw_desempenho_canais AS
SELECT
    ch.canal,
    SUM(f.impressoes) AS impressoes,
    SUM(f.cliques) AS cliques,
    SUM(f.leads) AS leads,
    SUM(f.conversoes) AS conversoes,
    ROUND(SUM(f.investimento), 2) AS investimento,
    ROUND(SUM(f.receita_atribuida), 2) AS receita,
    ROUND(1.0 * SUM(f.cliques) / NULLIF(SUM(f.impressoes), 0), 4) AS ctr,
    ROUND(SUM(f.investimento) / NULLIF(SUM(f.cliques), 0), 2) AS cpc,
    ROUND(SUM(f.investimento) / NULLIF(SUM(f.leads), 0), 2) AS cpl,
    ROUND(SUM(f.investimento) / NULLIF(SUM(f.conversoes), 0), 2) AS cpa,
    ROUND(SUM(f.receita_atribuida) / NULLIF(SUM(f.investimento), 0), 2) AS roas,
    ROUND((SUM(f.receita_atribuida) - SUM(f.investimento)) / NULLIF(SUM(f.investimento), 0), 4) AS roi
FROM fato_desempenho_campanha f
JOIN dim_campanha c ON c.campanha_id = f.campanha_id
JOIN dim_canal ch ON ch.canal_id = c.canal_id
GROUP BY ch.canal;

CREATE VIEW vw_desempenho_mensal AS
SELECT
    d.ano,
    d.mes,
    d.nome_mes,
    SUM(f.impressoes) AS impressoes,
    SUM(f.cliques) AS cliques,
    SUM(f.leads) AS leads,
    SUM(f.conversoes) AS conversoes,
    ROUND(SUM(f.investimento), 2) AS investimento,
    ROUND(SUM(f.receita_atribuida), 2) AS receita,
    ROUND(SUM(f.receita_atribuida) / NULLIF(SUM(f.investimento), 0), 2) AS roas,
    ROUND((SUM(f.receita_atribuida) - SUM(f.investimento)) / NULLIF(SUM(f.investimento), 0), 4) AS roi
FROM fato_desempenho_campanha f
JOIN dim_data d ON d.data_id = f.data_id
GROUP BY d.ano, d.mes, d.nome_mes;
