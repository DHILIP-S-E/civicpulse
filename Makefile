.PHONY: install test lint run-backend run-frontend docker-up docker-down

install:
	pip install -r backend/requirements.txt
	cd frontend && npm install

test:
	cd backend && pytest tests/ -v
	cd frontend && npm run build

run-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

run-frontend:
	cd frontend && npm run dev

docker-up:
	docker-compose up --build -d

docker-down:
	docker-compose down

validate:
	python scripts/validate_environment.py

verify-aws:
	python scripts/verify_aws_resources.py

