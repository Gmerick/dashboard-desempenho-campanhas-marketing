# Como apresentar em uma entrevista

## Pitch de 60 segundos

> Eu desenvolvi um projeto de análise de desempenho de campanhas para responder onde o orçamento de marketing gera mais valor. Modelei uma base diária de 12 campanhas e 5 canais, com 4.380 registros. No SQL, construí um esquema estrela e views para consolidar o funil, custos e retorno. No Excel, criei um dashboard executivo com metas editáveis, análises por canal, campanha e mês. Para o Power BI, documentei o modelo, as medidas DAX e quatro páginas de análise. O resultado mostrou ROAS total de 9,48x e ROI de 848%, com Email Marketing liderando eficiência e TikTok exigindo revisão. Também deixei testes automatizados e geração reprodutível dos dados para que o projeto possa ser auditado.

## Demonstração de 5 minutos

### 1. Contexto — 30 segundos

Explique a decisão: comparar canais, descobrir desperdício e orientar realocação de verba. Informe que os dados são sintéticos e reproduzíveis; isso evita qualquer dúvida sobre confidencialidade.

### 2. Arquitetura — 45 segundos

Mostre o fluxo CSV → SQL → Excel/Power BI. Destaque a granularidade campanha/dia e o esquema estrela. Explique por que métricas devem ser medidas calculadas a partir de somas, e não médias de percentuais por linha.

### 3. Dashboard — 90 segundos

Mostre os cartões de investimento, receita, conversões, ROAS e ROI. Em seguida, compare os canais:

- Email Marketing: ROAS 30,94x e CPA R$ 19,75;
- Google Ads: ROAS 8,00x;
- Meta Ads: ROAS 7,62x;
- LinkedIn Ads: ROAS 5,24x, porém CPA R$ 554,17;
- TikTok Ads: ROAS 2,01x, abaixo da meta de 3,0x.

Explique que escala e eficiência devem ser vistas juntas. Email lidera retorno, mas a comparação exige cautela porque é mídia própria e alcança uma base já conhecida.

### 4. Recomendação — 60 segundos

Proponha uma decisão controlada:

- manter Email como motor de eficiência;
- preservar Google e Meta, priorizando campanhas de marca e remarketing;
- revisar LinkedIn pelo CPA alto, considerando o ticket B2B e a qualidade do lead;
- reduzir ou redesenhar TikTok, especialmente `Video Descoberta`, antes de escalar;
- validar mudanças por experimento e acompanhar margem/LTV, não só receita.

### 5. Engenharia e qualidade — 45 segundos

Mostre que a base pode ser recriada com um comando, o banco possui chaves e índices, as consultas usam divisão segura, e os testes verificam integridade do funil e totais básicos. Isso demonstra preocupação com confiabilidade, não apenas estética.

## Perguntas que podem surgir

**Por que usar ROAS e ROI?**

ROAS mede receita bruta por investimento de mídia. ROI desconta o investimento e facilita comunicar retorno líquido. Ambos ainda precisam ser combinados com margem.

**Por que o resultado do Email é tão alto?**

O cenário assume uma base própria, baixo custo de contato e maior intenção. Em dados reais eu separaria custo de plataforma, criação, CRM e possíveis descontos.

**Você aumentaria verba no melhor canal imediatamente?**

Não. O retorno pode cair com saturação. Eu faria realocação incremental, com grupo de controle e limites de CPA/ROAS.

**Como trataria atribuição?**

Eu documentaria janela e modelo, compararia last click com uma visão multitoque e faria testes de incrementalidade quando possível.

**Por que modelo estrela?**

Ele separa métricas de descrições, simplifica filtros, melhora desempenho e reduz ambiguidade no Power BI.

**O que você faria em uma segunda versão?**

Incluiria margem, LTV, CAC, cohort de aquisição, qualidade de lead, metas por canal e forecast de orçamento.

## Pontos para enfatizar no currículo

- modelagem dimensional e SQL analítico;
- construção de KPIs de marketing e funil;
- Excel com fórmulas, metas e gráficos;
- especificação de dashboard e medidas DAX;
- análise orientada a decisão e comunicação executiva;
- testes de dados e reprodutibilidade.
