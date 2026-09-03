"""Carrega o CSV no modelo dimensional SQLite e cria as views analíticas."""

from __future__ import annotations

import csv
import sqlite3
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "data" / "campaign_performance.csv"
DB_PATH = ROOT / "database" / "marketing_campaigns.db"
MONTHS = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
WEEKDAYS = ["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado", "Domingo"]


def build_database(csv_path: Path = CSV_PATH, db_path: Path = DB_PATH) -> Path:
    with csv_path.open(encoding="utf-8", newline="") as file:
        rows = list(csv.DictReader(file))

    db_path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(db_path) as connection:
        connection.executescript((ROOT / "database" / "schema.sql").read_text(encoding="utf-8"))

        unique_dates = sorted({row["data"] for row in rows})
        date_map: dict[str, int] = {}
        for index, iso_date in enumerate(unique_dates, start=1):
            current = date.fromisoformat(iso_date)
            date_map[iso_date] = index
            connection.execute(
                "INSERT INTO dim_data VALUES (?, ?, ?, ?, ?, ?, ?)",
                (index, iso_date, current.year, current.month, MONTHS[current.month - 1], (current.month - 1) // 3 + 1, WEEKDAYS[current.weekday()]),
            )

        channel_names = sorted({row["canal"] for row in rows})
        channel_map = {name: index for index, name in enumerate(channel_names, start=1)}
        for name, index in channel_map.items():
            media_type = "Propria" if name == "Email Marketing" else "Paga"
            connection.execute("INSERT INTO dim_canal VALUES (?, ?, ?)", (index, name, media_type))

        campaigns: dict[str, dict[str, str]] = {}
        for row in rows:
            campaigns[row["id_campanha"]] = row
        campaign_map = {campaign_id: index for index, campaign_id in enumerate(sorted(campaigns), start=1)}
        for campaign_id, index in campaign_map.items():
            row = campaigns[campaign_id]
            connection.execute(
                "INSERT INTO dim_campanha VALUES (?, ?, ?, ?, ?, ?)",
                (index, campaign_id, row["campanha"], channel_map[row["canal"]], row["objetivo"], row["publico"]),
            )

        fact_rows = []
        for index, row in enumerate(rows, start=1):
            fact_rows.append((
                index, date_map[row["data"]], campaign_map[row["id_campanha"]], row["regiao"], row["dispositivo"],
                int(row["impressoes"]), int(row["cliques"]), int(row["leads"]), int(row["conversoes"]), int(row["novos_clientes"]),
                float(row["investimento"]), float(row["receita_atribuida"]), float(row["orcamento_diario"]),
            ))
        connection.executemany("INSERT INTO fato_desempenho_campanha VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", fact_rows)
        connection.executescript((ROOT / "database" / "views.sql").read_text(encoding="utf-8"))
        connection.commit()

    return db_path


if __name__ == "__main__":
    output = build_database()
    with sqlite3.connect(output) as connection:
        summary = connection.execute("SELECT * FROM vw_resumo_executivo").fetchone()
    print(f"Banco criado: {output}")
    print(f"Resumo: {summary}")
