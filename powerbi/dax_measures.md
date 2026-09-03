# Medidas DAX

Crie uma tabela vazia chamada `_Medidas` e armazene nela as medidas abaixo. Os nomes consideram o modelo descrito em [`data_model.md`](data_model.md).

```DAX
Impressoes =
SUM ( fato_desempenho_campanha[impressoes] )

Cliques =
SUM ( fato_desempenho_campanha[cliques] )

Leads =
SUM ( fato_desempenho_campanha[leads] )

Conversoes =
SUM ( fato_desempenho_campanha[conversoes] )

Novos Clientes =
SUM ( fato_desempenho_campanha[novos_clientes] )

Investimento =
SUM ( fato_desempenho_campanha[investimento] )

Receita Atribuida =
SUM ( fato_desempenho_campanha[receita_atribuida] )

Orcamento Planejado =
SUM ( fato_desempenho_campanha[orcamento_diario] )

Lucro Atribuido =
[Receita Atribuida] - [Investimento]

CTR =
DIVIDE ( [Cliques], [Impressoes], 0 )

Taxa Lead =
DIVIDE ( [Leads], [Cliques], 0 )

Taxa Conversao =
DIVIDE ( [Conversoes], [Leads], 0 )

Taxa Novo Cliente =
DIVIDE ( [Novos Clientes], [Conversoes], 0 )

CPC =
DIVIDE ( [Investimento], [Cliques], 0 )

CPL =
DIVIDE ( [Investimento], [Leads], 0 )

CPA =
DIVIDE ( [Investimento], [Conversoes], 0 )

ROAS =
DIVIDE ( [Receita Atribuida], [Investimento], 0 )

ROI =
DIVIDE ( [Lucro Atribuido], [Investimento], 0 )

Ticket Medio =
DIVIDE ( [Receita Atribuida], [Conversoes], 0 )

Utilizacao Orcamento =
DIVIDE ( [Investimento], [Orcamento Planejado], 0 )

Receita Mes Anterior =
CALCULATE ( [Receita Atribuida], DATEADD ( dim_data[data], -1, MONTH ) )

Variacao Receita MoM =
DIVIDE ( [Receita Atribuida] - [Receita Mes Anterior], [Receita Mes Anterior] )

Receita Acumulada =
TOTALYTD ( [Receita Atribuida], dim_data[data] )

Investimento Acumulado =
TOTALYTD ( [Investimento], dim_data[data] )

Ranking Canal por ROAS =
RANKX ( ALLSELECTED ( dim_canal[canal] ), [ROAS], , DESC, DENSE )

Status Meta =
VAR MetaCPA = 250
VAR MetaROAS = 3
VAR MetaROI = 2
RETURN
    IF (
        [CPA] <= MetaCPA && [ROAS] >= MetaROAS && [ROI] >= MetaROI,
        "Acima da meta",
        "Revisar"
    )
```

## Formatação recomendada

| Medida | Formato |
|---|---|
| Investimento, Receita Atribuída, Lucro, CPC, CPL, CPA e Ticket Médio | `R$ #,##0.00` |
| CTR, taxas, ROI, utilização e variação | `0.0%` |
| ROAS | `0.00x` |
| Volumes e ranking | `#,##0` |

Use `DIVIDE` em vez do operador `/` para tratar denominadores iguais a zero sem quebrar os visuais.
