from fastapi import APIRouter, HTTPException
from backend.core.state import controllers

router = APIRouter()
update = controllers["update"]

@router.get("/version")
def get_version():
    try:
        return update.get_current_version()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/check")
def check_updates():
    try:
        return {"updateAvailable": update.is_update_available()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/apply")
def apply_update():
    try:
        return {"updateApplied": update.full_update()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
