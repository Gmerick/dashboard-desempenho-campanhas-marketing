"""Gera uma base sintética e reproduzível de desempenho de campanhas."""

from __future__ import annotations

import csv
import math
import random
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "campaign_performance.csv"
SEED = 2026

CAMPAIGNS = [
    {"id": "GGL-001", "name": "Pesquisa Marca", "channel": "Google Ads", "objective": "Conversoes", "audience": "Alta intencao", "impressions": 4_500, "ctr": .070, "lead_rate": .155, "sale_rate": .32, "cpc": 2.80, "ticket": 850, "new_share": .68},
    {"id": "GGL-002", "name": "Pesquisa Generica", "channel": "Google Ads", "objective": "Conversoes", "audience": "Intencao ampla", "impressions": 7_200, "ctr": .043, "lead_rate": .105, "sale_rate": .24, "cpc": 4.20, "ticket": 980, "new_share": .82},
    {"id": "GGL-003", "name": "Performance Max", "channel": "Google Ads", "objective": "Receita", "audience": "Multicanal", "impressions": 11_500, "ctr": .026, "lead_rate": .082, "sale_rate": .20, "cpc": 3.45, "ticket": 920, "new_share": .77},
    {"id": "MET-001", "name": "Remarketing Social", "channel": "Meta Ads", "objective": "Conversoes", "audience": "Visitantes do site", "impressions": 19_000, "ctr": .029, "lead_rate": .118, "sale_rate": .27, "cpc": 1.75, "ticket": 720, "new_share": .43},
    {"id": "MET-002", "name": "Prospeccao Interesses", "channel": "Meta Ads", "objective": "Leads", "audience": "Interesses", "impressions": 26_000, "ctr": .016, "lead_rate": .071, "sale_rate": .16, "cpc": 2.15, "ticket": 690, "new_share": .88},
    {"id": "MET-003", "name": "Publico Lookalike", "channel": "Meta Ads", "objective": "Leads", "audience": "Semelhantes", "impressions": 22_000, "ctr": .020, "lead_rate": .087, "sale_rate": .19, "cpc": 2.05, "ticket": 710, "new_share": .84},
    {"id": "LNK-001", "name": "Demo B2B", "channel": "LinkedIn Ads", "objective": "Leads", "audience": "Decisores B2B", "impressions": 7_500, "ctr": .009, "lead_rate": .095, "sale_rate": .15, "cpc": 9.80, "ticket": 3_200, "new_share": .91},
    {"id": "LNK-002", "name": "Webinar Executivo", "channel": "LinkedIn Ads", "objective": "Leads", "audience": "Liderancas", "impressions": 6_200, "ctr": .012, "lead_rate": .145, "sale_rate": .11, "cpc": 8.20, "ticket": 2_600, "new_share": .89},
    {"id": "TTK-001", "name": "Video Descoberta", "channel": "TikTok Ads", "objective": "Alcance", "audience": "Publico jovem", "impressions": 38_000, "ctr": .021, "lead_rate": .038, "sale_rate": .10, "cpc": 1.15, "ticket": 460, "new_share": .92},
    {"id": "TTK-002", "name": "Criadores e Reviews", "channel": "TikTok Ads", "objective": "Conversoes", "audience": "Engajados", "impressions": 31_000, "ctr": .026, "lead_rate": .052, "sale_rate": .13, "cpc": 1.55, "ticket": 540, "new_share": .87},
    {"id": "EML-001", "name": "Oferta Base Ativa", "channel": "Email Marketing", "objective": "Receita", "audience": "Clientes ativos", "impressions": 24_000, "ctr": .118, "lead_rate": .180, "sale_rate": .12, "cpc": .10, "ticket": 610, "new_share": .12},
    {"id": "EML-002", "name": "Nutricao de Leads", "channel": "Email Marketing", "objective": "Conversoes", "audience": "Leads em nutricao", "impressions": 18_000, "ctr": .082, "lead_rate": .120, "sale_rate": .08, "cpc": .10, "ticket": 640, "new_share": .39},
]

REGIONS = ["Sudeste", "Sul", "Nordeste", "Centro-Oeste", "Norte"]
REGION_WEIGHTS = [0.45, 0.18, 0.22, 0.09, 0.06]
DEVICES = ["Mobile", "Desktop", "Tablet"]
DEVICE_WEIGHTS = [0.66, 0.29, 0.05]
MONTH_FACTORS = {1: .82, 2: .88, 3: .98, 4: 1.00, 5: 1.04, 6: 1.02, 7: .96, 8: 1.03, 9: 1.08, 10: 1.14, 11: 1.36, 12: 1.22}


def binomial(rng: random.Random, trials: int, probability: float) -> int:
    """Amostra binomial eficiente por aproximação normal quando n é grande."""
    if trials <= 0:
        return 0
    mean = trials * probability
    variance = trials * probability * (1 - probability)
    sampled = round(rng.gauss(mean, math.sqrt(max(variance, 0.01))))
    return max(0, min(trials, sampled))


def generate_rows(seed: int = SEED) -> list[dict[str, object]]:
    rng = random.Random(seed)
    rows: list[dict[str, object]] = []
    current = date(2025, 1, 1)
    end = date(2025, 12, 31)

    while current <= end:
        weekday_factor = 0.78 if current.weekday() >= 5 else 1.0
        for campaign in CAMPAIGNS:
            season = MONTH_FACTORS[current.month]
            volume_noise = max(0.60, rng.gauss(1.0, 0.12))
            impressions = round(campaign["impressions"] * season * weekday_factor * volume_noise)
            ctr = max(0.001, campaign["ctr"] * rng.gauss(1.0, 0.09))
            clicks = binomial(rng, impressions, ctr)
            leads = binomial(rng, clicks, max(0.01, campaign["lead_rate"] * rng.gauss(1.0, 0.10)))
            conversions = binomial(rng, leads, max(0.01, campaign["sale_rate"] * rng.gauss(1.0, 0.12)))
            new_customers = binomial(rng, conversions, campaign["new_share"])

            if campaign["channel"] == "Email Marketing":
                spend = impressions * 0.02 + clicks * campaign["cpc"] + 100
                budget = campaign["impressions"] * 0.02 + campaign["impressions"] * campaign["ctr"] * campaign["cpc"] + 120
            else:
                spend = clicks * campaign["cpc"] * max(0.82, rng.gauss(1.0, 0.06))
                budget = campaign["impressions"] * campaign["ctr"] * campaign["cpc"] * 1.08

            revenue = conversions * campaign["ticket"] * max(0.78, rng.gauss(1.0, 0.13))
            rows.append({
                "data": current.isoformat(),
                "id_campanha": campaign["id"],
                "campanha": campaign["name"],
                "canal": campaign["channel"],
                "objetivo": campaign["objective"],
                "publico": campaign["audience"],
                "regiao": rng.choices(REGIONS, REGION_WEIGHTS, k=1)[0],
                "dispositivo": rng.choices(DEVICES, DEVICE_WEIGHTS, k=1)[0],
                "impressoes": impressions,
                "cliques": clicks,
                "leads": leads,
                "conversoes": conversions,
                "novos_clientes": new_customers,
                "investimento": round(spend, 2),
                "receita_atribuida": round(revenue, 2),
                "orcamento_diario": round(budget, 2),
            })
        current += timedelta(days=1)
    return rows


def main() -> None:
    rows = generate_rows()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0]), lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    investment = sum(float(row["investimento"]) for row in rows)
    revenue = sum(float(row["receita_atribuida"]) for row in rows)
    conversions = sum(int(row["conversoes"]) for row in rows)
    print(f"Base gerada: {OUTPUT}")
    print(f"Registros: {len(rows):,} | Conversões: {conversions:,} | ROAS: {revenue / investment:.2f}x")


if __name__ == "__main__":
    main()
