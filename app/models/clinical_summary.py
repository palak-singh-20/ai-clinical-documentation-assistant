from pydantic import BaseModel


class ClinicalSummary(BaseModel):
    patient_id: str
    clinical_summary: str
    documented_symptoms: list[str]
    documented_allergies: list[str]
    relevant_history: list[str]
    current_medications: list[str]
    missing_information: list[str]