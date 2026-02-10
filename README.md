# OpenSEC

Self-hosted SEC filings browser — a local clone of [BamSEC](https://www.bamsec.com).

Browse companies, view filings, search across all SEC documents, compare filing versions, and track your watchlist — all powered by public EDGAR data.

## Features

- **Company Search** — Find companies by name or ticker symbol
- **Filing Browser** — Browse filings by type (10-K, 10-Q, 8-K, DEF 14A, etc.) with pagination
- **Filing Viewer** — Read filing documents in a clean, embedded viewer
- **Full-Text Search** — Search across all SEC filings using EDGAR's EFTS engine
- **Document Comparison** — Redline/diff between two filing versions to spot changes
- **Watchlist** — Track your favorite companies with persistent local storage
- **Self-Hosted** — Runs on your own machine, no external dependencies beyond EDGAR

## Quick Start

### Docker (Recommended)

```bash
# Clone and start
git clone <repo-url> opensec
cd opensec

# Configure your email for SEC compliance (required)
export OPENSEC_EDGAR_USER_AGENT="OpenSEC/1.0 (your-email@example.com)"

# Build and run
docker compose up -d

# Open http://localhost:3000
```

### Local Development

**Backend** (Python 3.11+):

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend** (Node 18+):

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000, proxies API to :8000
```

## Architecture

```
opensec/
├── backend/          # Python FastAPI backend
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── config.py         # Configuration
│   │   ├── database.py       # SQLite via SQLAlchemy
│   │   ├── models.py         # Database models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── routers/          # API endpoints
│   │   │   ├── companies.py  # Company search & details
│   │   │   ├── filings.py    # Filing browser & viewer
│   │   │   ├── search.py     # Full-text search
│   │   │   └── watchlist.py  # Watchlist & bookmarks
│   │   └── services/
│   │       ├── edgar.py      # SEC EDGAR API client
│   │       └── diff.py       # Document comparison
│   └── requirements.txt
├── frontend/         # React TypeScript frontend
│   ├── src/
│   │   ├── api/client.ts     # API client
│   │   ├── components/       # Reusable components
│   │   └── pages/            # Route pages
│   │       ├── Home.tsx      # Landing page
│   │       ├── Company.tsx   # Company filings browser
│   │       ├── Filing.tsx    # Filing document viewer
│   │       ├── Search.tsx    # Full-text search
│   │       ├── Compare.tsx   # Document comparison
│   │       └── Watchlist.tsx # Watchlist management
│   └── package.json
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── nginx.conf
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies/search?q=` | Search companies |
| GET | `/api/companies/{cik}` | Company details |
| GET | `/api/filings/company/{cik}` | Company filings |
| GET | `/api/filings/detail/{cik}/{accession}` | Filing details & documents |
| GET | `/api/filings/document?url=` | Proxy filing document |
| POST | `/api/filings/compare` | Compare two documents |
| GET | `/api/search?q=` | Full-text search |
| GET | `/api/search/recent` | Recent key filings |
| GET | `/api/watchlist` | Get watchlist |
| POST | `/api/watchlist` | Add to watchlist |
| DELETE | `/api/watchlist/{cik}` | Remove from watchlist |

## Data Source

All data comes from the [SEC EDGAR](https://www.sec.gov/edgar) system:

- **Company data**: `data.sec.gov/submissions/`
- **Filing documents**: `sec.gov/Archives/edgar/data/`
- **Full-text search**: `efts.sec.gov/LATEST/search-index`

The SEC requires a User-Agent header with your name and email. Configure via the `OPENSEC_EDGAR_USER_AGENT` environment variable.

## License

MIT
