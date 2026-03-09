# CyberRangeX Architecture

## Containerization

**Challenges are not individually containerized.**

| Component | Containerized? | Notes |
|-----------|----------------|-------|
| **MongoDB** | Yes | `cyber-mongo` (mongo:7) |
| **Backend (Node/Express)** | Yes | `cyberrangex-backend`. Hosts the REST API and all 24 lab routes. |
| **Test runner** | Yes | `cyberrangex-test-runner` (optional, for code-based challenges). |
| **Nginx** | Yes | Serves frontend and proxies to backend. |
| **Each of the 24 labs** | No | They run as Express routers inside the single backend process. |

All labs are in `backend/labs/*.js` and are mounted at `/lab/<name>` (e.g. `/lab/xss-basic`, `/lab/sqli-basic`). They use in-memory state, local `exec`, `multer` uploads, or simple file reads. There are no per-challenge VMs or separate Docker services.

To run: `docker compose up -d` then `docker compose exec backend npm run seed`.
