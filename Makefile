.PHONY: data database test

data:
	python scripts/generate_data.py

database:
	python database/build_database.py

test:
	python -m unittest discover -s tests -v
