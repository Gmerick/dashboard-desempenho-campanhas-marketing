# Dicionário de dados

## Arquivo de origem

`data/campaign_performance.csv`

| Campo | Tipo | Descrição | Exemplo |
|---|---|---|---|
| `data` | data | Dia da observação | `2025-01-01` |
| `id_campanha` | texto | Identificador estável da campanha | `GGL-001` |
| `campanha` | texto | Nome da campanha | `Pesquisa Marca` |
| `canal` | texto | Canal de aquisição | `Google Ads` |
| `objetivo` | texto | Objetivo principal | `Conversoes` |
| `publico` | texto | Segmento principal | `Alta intencao` |
| `regiao` | texto | Região atribuída à observação | `Sudeste` |
| `dispositivo` | texto | Dispositivo predominante | `Mobile` |
| `impressoes` | inteiro | Exibições dos anúncios | `4073` |
| `cliques` | inteiro | Cliques/interações de acesso | `272` |
| `leads` | inteiro | Contatos qualificados | `45` |
| `conversoes` | inteiro | Vendas/conversões atribuídas | `12` |
| `novos_clientes` | inteiro | Conversões de novos clientes | `7` |
| `investimento` | decimal | Custo de mídia no dia | `773.58` |
| `receita_atribuida` | decimal | Receita atribuída às conversões | `8565.99` |
| `orcamento_diario` | decimal | Limite de orçamento planejado | `952.56` |

## Chaves e granularidade

- Chave natural composta: `data` + `id_campanha`.
- Uma linha representa o resultado de uma campanha em um dia.
- `id_campanha` identifica 12 campanhas e `canal` identifica 5 canais.

## Regras de qualidade

- métricas de volume e valores financeiros não podem ser negativos;
- cliques não podem superar impressões;
- leads não podem superar cliques;
- conversões não podem superar leads;
- novos clientes não podem superar conversões;
- cada combinação data/campanha deve ser única.

## Tabelas SQL

| Tabela | Papel | Granularidade |
|---|---|---|
| `dim_data` | Calendário | Um registro por dia |
| `dim_canal` | Canais e tipo de mídia | Um registro por canal |
| `dim_campanha` | Cadastro de campanha | Um registro por campanha |
| `fato_desempenho_campanha` | Métricas de desempenho | Campanha/dia |
