# Metodologia analítica

## 1. Problema de negócio

Uma equipe de marketing precisa decidir onde manter, reduzir ou aumentar investimento. Para isso, não basta observar receita isoladamente: o canal também deve ser comparado por volume, eficiência de conversão, custo de aquisição e retorno.

As perguntas centrais são:

1. Qual canal traz mais conversões e receita?
2. Qual canal utiliza melhor o investimento?
3. Quais campanhas estão abaixo das metas de CPA, ROAS e ROI?
4. Como o desempenho muda ao longo do ano?
5. Onde existe oportunidade de realocação de orçamento?

## 2. Fonte e natureza dos dados

A base é **sintética**, criada exclusivamente para portfólio e estudo. Ela não representa uma empresa real e não contém informações pessoais. O gerador usa semente fixa (`2026`), tornando o resultado reproduzível.

O período vai de 1º de janeiro a 31 de dezembro de 2025. A granularidade é campanha/dia, com 12 campanhas, 5 canais e 4.380 registros.

Foram incorporados comportamentos plausíveis:

- variação de volume em fins de semana;
- sazonalidade mensal, com maior intensidade em novembro e dezembro;
- diferenças de CTR, CPC, conversão e ticket por campanha;
- distribuição entre regiões e dispositivos;
- separação entre clientes novos e conversões totais.

## 3. Processo de preparação

1. Definição das campanhas e parâmetros de desempenho.
2. Geração determinística de métricas diárias.
3. Validação da integridade do funil: impressões ≥ cliques ≥ leads ≥ conversões ≥ novos clientes.
4. Exportação para CSV.
5. Carga em modelo dimensional SQLite.
6. Construção de views e consultas analíticas.
7. Criação de workbook Excel com fórmulas, metas, formatação condicional e gráficos.
8. Especificação do modelo, medidas e páginas do Power BI.

## 4. Indicadores

| Indicador | Fórmula | Interpretação |
|---|---|---|
| CTR | Cliques / Impressões | Capacidade do anúncio de gerar tráfego |
| Taxa de lead | Leads / Cliques | Eficiência da página/oferta em gerar contatos |
| Taxa de conversão | Conversões / Leads | Eficiência em transformar leads em vendas |
| CPC | Investimento / Cliques | Custo por acesso gerado |
| CPL | Investimento / Leads | Custo por lead |
| CPA | Investimento / Conversões | Custo por conversão |
| ROAS | Receita atribuída / Investimento | Receita bruta gerada por unidade monetária investida |
| ROI | (Receita − Investimento) / Investimento | Retorno líquido do investimento de mídia |

ROAS e ROI não são equivalentes. Um ROAS de 3,0x representa R$ 3,00 de receita para cada R$ 1,00 investido; sob a premissa simplificada deste projeto, o ROI correspondente é 200%.

## 5. Metas gerenciais

- CTR ≥ 2,5%;
- taxa de conversão ≥ 15%;
- CPA ≤ R$ 250;
- ROAS ≥ 3,0x;
- ROI ≥ 200%.

As metas são parâmetros didáticos. Em um projeto real, elas devem considerar margem de contribuição, ciclo de venda, cancelamentos, atribuição e valor do cliente ao longo do tempo.

## 6. Limitações e cuidados

- Receita atribuída não comprova causalidade; ela depende do modelo de atribuição.
- O ROI considera apenas investimento de mídia, sem custo do produto, equipe, agência, impostos ou descontos.
- Email apresenta baixo custo no cenário sintético, o que eleva seu retorno relativo.
- Não há sobreposição de audiência ou conversões multitoque.
- Uma decisão real deveria utilizar margem, LTV, CAC, qualidade do lead e significância estatística.

Essas limitações devem ser mencionadas em entrevistas: demonstram que o dashboard apoia decisões, mas não substitui contexto financeiro e desenho experimental.
