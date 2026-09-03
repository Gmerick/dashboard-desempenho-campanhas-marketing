PRAGMA foreign_keys = ON;

DROP VIEW IF EXISTS vw_resumo_executivo;
DROP VIEW IF EXISTS vw_desempenho_canais;
DROP VIEW IF EXISTS vw_desempenho_mensal;
DROP TABLE IF EXISTS fato_desempenho_campanha;
DROP TABLE IF EXISTS dim_campanha;
DROP TABLE IF EXISTS dim_canal;
DROP TABLE IF EXISTS dim_data;

CREATE TABLE dim_data (
    data_id INTEGER PRIMARY KEY,
    data TEXT NOT NULL UNIQUE,
    ano INTEGER NOT NULL,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    nome_mes TEXT NOT NULL,
    trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
    dia_semana TEXT NOT NULL
);

CREATE TABLE dim_canal (
    canal_id INTEGER PRIMARY KEY,
    canal TEXT NOT NULL UNIQUE,
    tipo_midia TEXT NOT NULL
);

CREATE TABLE dim_campanha (
    campanha_id INTEGER PRIMARY KEY,
    id_campanha TEXT NOT NULL UNIQUE,
    campanha TEXT NOT NULL,
    canal_id INTEGER NOT NULL,
    objetivo TEXT NOT NULL,
    publico TEXT NOT NULL,
    FOREIGN KEY (canal_id) REFERENCES dim_canal(canal_id)
);

CREATE TABLE fato_desempenho_campanha (
    desempenho_id INTEGER PRIMARY KEY,
    data_id INTEGER NOT NULL,
    campanha_id INTEGER NOT NULL,
    regiao TEXT NOT NULL,
    dispositivo TEXT NOT NULL,
    impressoes INTEGER NOT NULL CHECK (impressoes >= 0),
    cliques INTEGER NOT NULL CHECK (cliques >= 0),
    leads INTEGER NOT NULL CHECK (leads >= 0),
    conversoes INTEGER NOT NULL CHECK (conversoes >= 0),
    novos_clientes INTEGER NOT NULL CHECK (novos_clientes >= 0),
    investimento REAL NOT NULL CHECK (investimento >= 0),
    receita_atribuida REAL NOT NULL CHECK (receita_atribuida >= 0),
    orcamento_diario REAL NOT NULL CHECK (orcamento_diario >= 0),
    FOREIGN KEY (data_id) REFERENCES dim_data(data_id),
    FOREIGN KEY (campanha_id) REFERENCES dim_campanha(campanha_id),
    UNIQUE (data_id, campanha_id)
);

CREATE INDEX idx_fato_data ON fato_desempenho_campanha(data_id);
CREATE INDEX idx_fato_campanha ON fato_desempenho_campanha(campanha_id);
CREATE INDEX idx_fato_regiao ON fato_desempenho_campanha(regiao);
CREATE INDEX idx_fato_dispositivo ON fato_desempenho_campanha(dispositivo);
