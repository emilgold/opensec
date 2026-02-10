from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.database import get_db
from app.models import WatchedCompany, Bookmark
from app.schemas import WatchlistEntry, WatchlistAdd, BookmarkEntry, BookmarkAdd

router = APIRouter(prefix="/api/watchlist", tags=["watchlist"])


@router.get("", response_model=list[WatchlistEntry])
async def get_watchlist(db: AsyncSession = Depends(get_db)):
    """Get all watched companies."""
    result = await db.execute(
        select(WatchedCompany).order_by(WatchedCompany.added_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=WatchlistEntry)
async def add_to_watchlist(entry: WatchlistAdd, db: AsyncSession = Depends(get_db)):
    """Add a company to the watchlist."""
    existing = await db.execute(
        select(WatchedCompany).where(WatchedCompany.cik == entry.cik)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Company already in watchlist")

    company = WatchedCompany(cik=entry.cik, ticker=entry.ticker, name=entry.name)
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return company


@router.delete("/{cik}")
async def remove_from_watchlist(cik: str, db: AsyncSession = Depends(get_db)):
    """Remove a company from the watchlist."""
    result = await db.execute(
        delete(WatchedCompany).where(WatchedCompany.cik == cik)
    )
    await db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Company not in watchlist")
    return {"detail": "Removed from watchlist"}


@router.get("/check/{cik}")
async def check_watchlist(cik: str, db: AsyncSession = Depends(get_db)):
    """Check if a company is in the watchlist."""
    result = await db.execute(
        select(WatchedCompany).where(WatchedCompany.cik == cik)
    )
    exists = result.scalar_one_or_none() is not None
    return {"watched": exists}


# Bookmarks endpoints
@router.get("/bookmarks", response_model=list[BookmarkEntry])
async def get_bookmarks(db: AsyncSession = Depends(get_db)):
    """Get all bookmarks."""
    result = await db.execute(
        select(Bookmark).order_by(Bookmark.created_at.desc())
    )
    return result.scalars().all()


@router.post("/bookmarks", response_model=BookmarkEntry)
async def add_bookmark(entry: BookmarkAdd, db: AsyncSession = Depends(get_db)):
    """Bookmark a filing."""
    bookmark = Bookmark(**entry.model_dump())
    db.add(bookmark)
    await db.commit()
    await db.refresh(bookmark)
    return bookmark


@router.delete("/bookmarks/{bookmark_id}")
async def remove_bookmark(bookmark_id: int, db: AsyncSession = Depends(get_db)):
    """Remove a bookmark."""
    result = await db.execute(
        delete(Bookmark).where(Bookmark.id == bookmark_id)
    )
    await db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return {"detail": "Bookmark removed"}
