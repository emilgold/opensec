from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.sql import func

from app.database import Base


class WatchedCompany(Base):
    __tablename__ = "watched_companies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cik = Column(String(10), unique=True, nullable=False, index=True)
    ticker = Column(String(20), nullable=True)
    name = Column(String(255), nullable=False)
    added_at = Column(DateTime, server_default=func.now())


class CachedCompany(Base):
    __tablename__ = "cached_companies"

    cik = Column(String(10), primary_key=True)
    ticker = Column(String(20), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    sic = Column(String(10), nullable=True)
    sic_description = Column(String(255), nullable=True)
    state = Column(String(10), nullable=True)
    fiscal_year_end = Column(String(4), nullable=True)
    data_json = Column(Text, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    accession_number = Column(String(25), nullable=False, index=True)
    cik = Column(String(10), nullable=False)
    company_name = Column(String(255), nullable=True)
    form_type = Column(String(20), nullable=True)
    filing_date = Column(String(10), nullable=True)
    description = Column(Text, nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
