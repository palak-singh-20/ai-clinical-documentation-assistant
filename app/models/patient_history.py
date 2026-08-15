from pydantic import BaseModel, Field


class PatientHistory(BaseModel):

    patient_id: str = Field(
        description="Patient identifier"
    )

    chief_complaint: str = Field(
        description="Main reason for the consultation"
    )

    symptoms: list[str] = Field(
        default_factory=list,
        description="Symptoms explicitly mentioned by the patient"
    )

    medical_history: list[str] = Field(
        default_factory=list,
        description="Previously documented medical conditions or history"
    )

    medications: list[str] = Field(
        default_factory=list,
        description="Currently documented medications"
    )

    allergies: list[str] = Field(
        default_factory=list,
        description="Documented allergies or allergy status"
    )

    family_history: list[str] = Field(
        default_factory=list,
        description="Documented family medical history"
    )

    social_history: list[str] = Field(
        default_factory=list,
        description="Documented social history"
    )

    missing_information: list[str] = Field(
        default_factory=list,
        description="Important information that was not provided"
    )