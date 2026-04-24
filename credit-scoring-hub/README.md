# Credit Scoring Hub

Multi-service starter for a credit scoring demo:

- `ml-service`: FastAPI inference service with a simple train script
- `backend`: Express + Prisma API
- `frontend`: React + Vite + Tailwind UI
- `telegram-bot`: Aiogram bot that calls the backend API

## Run with Docker

```bash
docker compose up --build
```

Open:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080/api/health`
- ML service: `http://localhost:8000/health`

## Notes

- The backend automatically runs `prisma db push` on container start.
- The ML service can work without a trained `model.pkl`; it falls back to a simple heuristic score.
- Replace `BOT_TOKEN` before starting the Telegram bot in production.
