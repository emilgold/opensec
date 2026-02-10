from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "OpenSEC"
    database_url: str = "sqlite+aiosqlite:///./data/opensec.db"
    edgar_user_agent: str = "OpenSEC/1.0 (opensource@opensec.local)"
    edgar_base_url: str = "https://www.sec.gov"
    edgar_data_url: str = "https://data.sec.gov"
    edgar_efts_url: str = "https://efts.sec.gov/LATEST"
    cache_ttl_seconds: int = 3600
    request_delay_seconds: float = 0.11  # SEC rate limit: 10 req/sec

    class Config:
        env_prefix = "OPENSEC_"


settings = Settings()
