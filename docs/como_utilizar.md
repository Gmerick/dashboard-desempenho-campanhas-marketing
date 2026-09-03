# Como utilizar o projeto

## Pré-requisitos

- Python 3.10 ou superior;
- SQLite 3, opcional para abrir o banco pelo terminal;
- Excel 2019, Microsoft 365 ou aplicativo compatível;
- Power BI Desktop para construir o relatório interativo.

O fluxo principal não depende de pacotes Python externos.

## Execução rápida

Na raiz do repositório:

```bash
python scripts/generate_data.py
python database/build_database.py
python -m unittest discover -s tests -v
```

Ou use:

```bash
make data
make database
make test
```

O primeiro comando recria o CSV com os mesmos números. O segundo gera `database/marketing_campaigns.db`. O terceiro valida dimensões, integridade do funil, modelo SQL e presença do workbook.

## Excel

1. Abra `outputs/e1212207ff9f/dashboard_campanhas_marketing.xlsx`.
2. Comece pela aba **Dashboard**.
3. Use **Analise_Canais** para comparar CTR, conversão, CPA, ROAS e ROI.
4. Use **Analise_Mensal** para avaliar sazonalidade e variações de receita.
5. Use **Analise_Campanhas** para encontrar campanhas a escalar ou revisar.
6. Altere as células amarelas em **Metas_Dicionario** para testar novos critérios.
7. Consulte **Dados_Campanhas** para auditar os registros de origem.

As análises usam fórmulas e referências internas. Se o Excel solicitar atualização, habilite o recálculo do arquivo.

## SQL

Crie o banco:

```bash
python database/build_database.py
```

Abra no terminal:

```bash
sqlite3 database/marketing_campaigns.db
```

Dentro do SQLite:

```sql
.headers on
.mode column
SELECT * FROM vw_resumo_executivo;
SELECT * FROM vw_desempenho_canais ORDER BY roas DESC;
.read database/analytics_queries.sql
```

O arquivo `database/analytics_queries.sql` contém 12 análises prontas, incluindo funil, orçamento, sazonalidade, regiões, dispositivos e recomendações.

## Power BI

1. Gere o banco SQLite ou importe diretamente o CSV.
2. Siga os relacionamentos de `powerbi/data_model.md`.
3. Crie as medidas de `powerbi/dax_measures.md`.
4. Importe `powerbi/theme_marketing.json` em **Exibir > Temas > Procurar temas**.
5. Monte as quatro páginas descritas em `powerbi/dashboard_layout.md`.
6. Valide os totais do Power BI contra a view `vw_resumo_executivo`.

Totais esperados para conferência:

| Indicador | Resultado |
|---|---:|
| Investimento | R$ 3.882.917,82 |
| Receita atribuída | R$ 36.818.895,31 |
| Conversões | 51.090 |
| ROAS | 9,48x |
| ROI | 848,23% |

## Adaptação para dados reais

Substitua o CSV mantendo os nomes e tipos de colunas. Caso a origem possua outros campos, ajuste o esquema SQL, a carga e as medidas. Antes de divulgar resultados, documente moeda, fuso horário, janela de atribuição, tratamento de estornos e regra usada para identificar conversões.
