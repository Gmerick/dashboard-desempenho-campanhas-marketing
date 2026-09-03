import csv
import sqlite3
import tempfile
import unittest
from pathlib import Path

from database.build_database import build_database
from scripts.generate_data import generate_rows

ROOT = Path(__file__).resolve().parents[1]


class MarketingDashboardTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with (ROOT / "data" / "campaign_performance.csv").open(encoding="utf-8", newline="") as file:
            cls.rows = list(csv.DictReader(file))

    def test_dataset_dimensions_and_nonnegative_metrics(self):
        self.assertEqual(len(self.rows), 4_380)
        self.assertEqual(len({row["id_campanha"] for row in self.rows}), 12)
        self.assertEqual(len({row["canal"] for row in self.rows}), 5)
        for row in self.rows:
            for field in ("impressoes", "cliques", "leads", "conversoes", "investimento", "receita_atribuida"):
                self.assertGreaterEqual(float(row[field]), 0)

    def test_generation_is_deterministic(self):
        generated = generate_rows()
        self.assertEqual(str(generated[0]["data"]), self.rows[0]["data"])
        self.assertEqual(str(generated[-1]["receita_atribuida"]), self.rows[-1]["receita_atribuida"])

    def test_funnel_integrity(self):
        for row in self.rows:
            self.assertLessEqual(int(row["cliques"]), int(row["impressoes"]))
            self.assertLessEqual(int(row["leads"]), int(row["cliques"]))
            self.assertLessEqual(int(row["conversoes"]), int(row["leads"]))
            self.assertLessEqual(int(row["novos_clientes"]), int(row["conversoes"]))

    def test_sql_model_and_views(self):
        with tempfile.TemporaryDirectory() as tmp:
            db_path = Path(tmp) / "test.db"
            build_database(db_path=db_path)
            with sqlite3.connect(db_path) as connection:
                fact_count = connection.execute("SELECT COUNT(*) FROM fato_desempenho_campanha").fetchone()[0]
                channel_count = connection.execute("SELECT COUNT(*) FROM vw_desempenho_canais").fetchone()[0]
                roas = connection.execute("SELECT roas FROM vw_resumo_executivo").fetchone()[0]
            self.assertEqual(fact_count, 4_380)
            self.assertEqual(channel_count, 5)
            self.assertGreater(roas, 1)

    def test_excel_artifact_exists(self):
        workbook = ROOT / "outputs" / "e1212207ff9f" / "dashboard_campanhas_marketing.xlsx"
        self.assertTrue(workbook.exists())
        self.assertGreater(workbook.stat().st_size, 100_000)


if __name__ == "__main__":
    unittest.main()
