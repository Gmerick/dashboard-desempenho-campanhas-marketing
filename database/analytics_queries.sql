-- Consultas de negócio para o projeto Dashboard de Campanhas de Marketing.
-- Compatíveis com SQLite. Execute depois de: python database/build_database.py

-- 1. Resumo executivo: volume, conversão, custos e retorno.
SELECT *
FROM vw_resumo_executivo;

-- 2. Ranking de canais por ROAS.
SELECT
    canal,
    conversoes,
    investimento,
    receita,
    cpa,
    roas,
    ROUND(roi * 100, 2) AS roi_percentual
FROM vw_desempenho_canais
ORDER BY roas DESC;

-- 3. Evolução mensal com variação de receita contra o mês anterior.
WITH mensal AS (
    SELECT
        ano,
        mes,
        nome_mes,
        investimento,
        receita,
        conversoes,
        roas,
        LAG(receita) OVER (ORDER BY ano, mes) AS receita_mes_anterior
    FROM vw_desempenho_mensal
)
SELECT
    *,
    ROUND(
        100.0 * (receita - receita_mes_anterior)
        / NULLIF(receita_mes_anterior, 0),
        2
    ) AS variacao_receita_percentual
FROM mensal
ORDER BY ano, mes;

-- 4. Ranking completo das campanhas.
SELECT
    c.id_campanha,
    c.campanha,
    ch.canal,
    c.objetivo,
    SUM(f.conversoes) AS conversoes,
    ROUND(SUM(f.investimento), 2) AS investimento,
    ROUND(SUM(f.receita_atribuida), 2) AS receita,
    ROUND(SUM(f.investimento) / NULLIF(SUM(f.conversoes), 0), 2) AS cpa,
    ROUND(SUM(f.receita_atribuida) / NULLIF(SUM(f.investimento), 0), 2) AS roas,
    ROUND(
        100.0 * (SUM(f.receita_atribuida) - SUM(f.investimento))
        / NULLIF(SUM(f.investimento), 0),
        2
    ) AS roi_percentual
FROM fato_desempenho_campanha f
JOIN dim_campanha c ON c.campanha_id = f.campanha_id
JOIN dim_canal ch ON ch.canal_id = c.canal_id
GROUP BY c.id_campanha, c.campanha, ch.canal, c.objetivo
ORDER BY roas DESC;

-- 5. Utilização do orçamento por campanha.
SELECT
    c.id_campanha,
    c.campanha,
    ch.canal,
    ROUND(SUM(f.investimento), 2) AS investimento_real,
    ROUND(SUM(f.orcamento_diario), 2) AS orcamento_planejado,
    ROUND(
        100.0 * SUM(f.investimento) / NULLIF(SUM(f.orcamento_diario), 0),
        2
    ) AS utilizacao_orcamento_percentual,
    ROUND(SUM(f.orcamento_diario) - SUM(f.investimento), 2) AS saldo_orcamento
FROM fato_desempenho_campanha f
JOIN dim_campanha c ON c.campanha_id = f.campanha_id
JOIN dim_canal ch ON ch.canal_id = c.canal_id
GROUP BY c.id_campanha, c.campanha, ch.canal
ORDER BY utilizacao_orcamento_percentual DESC;

-- 6. Eficiência por dispositivo.
SELECT
    f.dispositivo,
    SUM(f.impressoes) AS impressoes,
    SUM(f.cliques) AS cliques,
    SUM(f.conversoes) AS conversoes,
    ROUND(SUM(f.investimento), 2) AS investimento,
    ROUND(SUM(f.receita_atribuida), 2) AS receita,
    ROUND(100.0 * SUM(f.cliques) / NULLIF(SUM(f.impressoes), 0), 2) AS ctr_percentual,
    ROUND(SUM(f.investimento) / NULLIF(SUM(f.conversoes), 0), 2) AS cpa,
    ROUND(SUM(f.receita_atribuida) / NULLIF(SUM(f.investimento), 0), 2) AS roas
FROM fato_desempenho_campanha f
GROUP BY f.dispositivo
ORDER BY roas DESC;

-- 7. Eficiência regional.
SELECT
    f.regiao,
    SUM(f.conversoes) AS conversoes,
    ROUND(SUM(f.investimento), 2) AS investimento,
    ROUND(SUM(f.receita_atribuida), 2) AS receita,
    ROUND(SUM(f.investimento) / NULLIF(SUM(f.conversoes), 0), 2) AS cpa,
    ROUND(SUM(f.receita_atribuida) / NULLIF(SUM(f.investimento), 0), 2) AS roas
FROM fato_desempenho_campanha f
GROUP BY f.regiao
ORDER BY receita DESC;

-- 8. Funil por canal e taxas entre etapas.
SELECT
    ch.canal,
    SUM(f.impressoes) AS impressoes,
    SUM(f.cliques) AS cliques,
    SUM(f.leads) AS leads,
    SUM(f.conversoes) AS conversoes,
    SUM(f.novos_clientes) AS novos_clientes,
    ROUND(100.0 * SUM(f.cliques) / NULLIF(SUM(f.impressoes), 0), 2) AS taxa_clique,
    ROUND(100.0 * SUM(f.leads) / NULLIF(SUM(f.cliques), 0), 2) AS taxa_lead,
    ROUND(100.0 * SUM(f.conversoes) / NULLIF(SUM(f.leads), 0), 2) AS taxa_conversao,
    ROUND(100.0 * SUM(f.novos_clientes) / NULLIF(SUM(f.conversoes), 0), 2) AS taxa_novo_cliente
FROM fato_desempenho_campanha f
JOIN dim_campanha c ON c.campanha_id = f.campanha_id
JOIN dim_canal ch ON ch.canal_id = c.canal_id
GROUP BY ch.canal
ORDER BY conversoes DESC;

-- 9. Canais abaixo das metas de eficiência do projeto.
-- Metas: CPA <= R$ 250, ROAS >= 3, ROI >= 200%.
SELECT
    canal,
    cpa,
    roas,
    ROUND(roi * 100, 2) AS roi_percentual,
    CASE
        WHEN cpa <= 250 AND roas >= 3 AND roi >= 2 THEN 'Acima da meta'
        ELSE 'Revisar'
    END AS status
FROM vw_desempenho_canais
WHERE NOT (cpa <= 250 AND roas >= 3 AND roi >= 2)
ORDER BY roas;

-- 10. Campanhas com maior oportunidade de otimização.
WITH desempenho AS (
    SELECT
        c.id_campanha,
        c.campanha,
        ch.canal,
        SUM(f.conversoes) AS conversoes,
        SUM(f.investimento) AS investimento,
        SUM(f.receita_atribuida) AS receita,
        SUM(f.receita_atribuida) / NULLIF(SUM(f.investimento), 0) AS roas,
        SUM(f.investimento) / NULLIF(SUM(f.conversoes), 0) AS cpa
    FROM fato_desempenho_campanha f
    JOIN dim_campanha c ON c.campanha_id = f.campanha_id
    JOIN dim_canal ch ON ch.canal_id = c.canal_id
    GROUP BY c.id_campanha, c.campanha, ch.canal
)
SELECT
    id_campanha,
    campanha,
    canal,
    conversoes,
    ROUND(investimento, 2) AS investimento,
    ROUND(receita, 2) AS receita,
    ROUND(cpa, 2) AS cpa,
    ROUND(roas, 2) AS roas,
    CASE
        WHEN roas < 3 THEN 'Reduzir verba e revisar segmentacao/criativo'
        WHEN cpa > 250 THEN 'Otimizar conversao e custo de aquisicao'
        ELSE 'Manter ou escalar com teste controlado'
    END AS recomendacao
FROM desempenho
ORDER BY roas, investimento DESC;

-- 11. Comparação entre mídia paga e própria.
SELECT
    ch.tipo_midia,
    SUM(f.conversoes) AS conversoes,
    ROUND(SUM(f.investimento), 2) AS investimento,
    ROUND(SUM(f.receita_atribuida), 2) AS receita,
    ROUND(SUM(f.receita_atribuida) / NULLIF(SUM(f.investimento), 0), 2) AS roas
FROM fato_desempenho_campanha f
JOIN dim_campanha c ON c.campanha_id = f.campanha_id
JOIN dim_canal ch ON ch.canal_id = c.canal_id
GROUP BY ch.tipo_midia
ORDER BY roas DESC;

-- 12. Sazonalidade por trimestre.
SELECT
    d.ano,
    d.trimestre,
    SUM(f.conversoes) AS conversoes,
    ROUND(SUM(f.investimento), 2) AS investimento,
    ROUND(SUM(f.receita_atribuida), 2) AS receita,
    ROUND(SUM(f.receita_atribuida) / NULLIF(SUM(f.investimento), 0), 2) AS roas
FROM fato_desempenho_campanha f
JOIN dim_data d ON d.data_id = f.data_id
GROUP BY d.ano, d.trimestre
ORDER BY d.ano, d.trimestre;
