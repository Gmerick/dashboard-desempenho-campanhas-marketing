# Especificação do dashboard no Power BI

## Página 1 — Visão executiva

- Segmentadores: período, canal, campanha e região.
- Cartões: Investimento, Receita Atribuída, Conversões, ROAS e ROI.
- Gráfico combinado: investimento e receita por mês.
- Barras horizontais: ROAS por canal.
- Matriz: canal, investimento, receita, conversões, CPA, ROAS, ROI e status.
- Caixa de texto: principais recomendações de alocação.

## Página 2 — Funil e conversão

- Funil: impressões → cliques → leads → conversões → novos clientes.
- Cartões: CTR, taxa de lead, taxa de conversão, CPA.
- Barras: conversões por canal e por campanha.
- Matriz com formatação condicional para CTR, CPA e taxa de conversão.

## Página 3 — Eficiência de mídia

- Dispersão: investimento no eixo X, receita no eixo Y, conversões no tamanho e canal na legenda.
- Barras: CPA e ROAS por campanha.
- Tabela: orçamento planejado, investimento real e utilização do orçamento.
- Segmentadores: objetivo, dispositivo e público.

## Página 4 — Detalhamento

- Série temporal diária com drill-down para mês.
- Matriz por região, dispositivo, campanha e canal.
- Tooltip com CTR, CPC, CPL, CPA, ROAS e ROI.
- Botão para limpar filtros e navegação para a página executiva.

## Identidade visual

Use o arquivo [`theme_marketing.json`](theme_marketing.json). O roxo representa análise e mídia; verde sinaliza desempenho acima da meta; vermelho sinaliza necessidade de revisão; o fundo azul-marinho dá contraste aos cartões executivos.

## Interações

- Mantenha interação entre os gráficos e a matriz.
- Desabilite somente interações que criem ambiguidade na leitura dos cartões.
- Use título dinâmico com o período selecionado.
- Adicione tooltip explicando ROAS e ROI: ROAS considera receita bruta atribuída; ROI considera o retorno líquido após o investimento de mídia.
