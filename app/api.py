from fastapi import APIRouter
from pydantic import BaseModel

from app.pipeline import process_consultation


router = APIRouter()


class ConsultationRequest(BaseModel):
    consultation: str


@router.post("/process")
def process(request: ConsultationRequest):

    result = process_consultation(
        request.consultation
    )

    return result