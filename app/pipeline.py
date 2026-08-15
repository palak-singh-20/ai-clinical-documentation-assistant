from agents import Runner

from app.agents.patient_history_agent import patient_history_agent
from app.agents.clinical_summary_agent import clinical_summary_agent
from app.agents.documentation_quality_agent import documentation_quality_agent
from app.agents.completeness_agent import completeness_agent
from app.agents.final_documentation_agent import final_documentation_agent

from app.models.patient_history import PatientHistory
from app.models.clinical_summary import ClinicalSummary


def process_consultation(consultation: str):

    # ============================================================
    # AGENT 1 — PATIENT HISTORY
    # ============================================================

    history_result = Runner.run_sync(
        patient_history_agent,
        consultation
    )

    # Agent returns JSON string
    patient_history_json = history_result.final_output

    # Convert JSON string → Pydantic PatientHistory object
    patient_history = PatientHistory.model_validate_json(
        patient_history_json
    )


    # ============================================================
    # AGENT 2 — CLINICAL SUMMARY
    # ============================================================

    summary_input = patient_history.model_dump_json()

    summary_result = Runner.run_sync(
        clinical_summary_agent,
        summary_input
    )

    summary_text = summary_result.final_output


    clinical_summary = ClinicalSummary(
        patient_id=patient_history.patient_id,
        clinical_summary=summary_text,
        documented_symptoms=patient_history.symptoms,
        documented_allergies=patient_history.allergies,
        relevant_history=patient_history.medical_history,
        current_medications=patient_history.medications,
        missing_information=patient_history.missing_information,
    )


    # ============================================================
    # AGENT 3 — DOCUMENTATION QUALITY
    # ============================================================

    quality_input = f"""
PATIENT HISTORY:

{patient_history.model_dump_json(indent=2)}

CLINICAL SUMMARY:

{clinical_summary.model_dump_json(indent=2)}
"""

    quality_result = Runner.run_sync(
        documentation_quality_agent,
        quality_input
    )

    quality_report = quality_result.final_output


    # ============================================================
    # AGENT 4 — DOCUMENTATION COMPLETENESS
    # ============================================================

    completeness_input = f"""
PATIENT HISTORY:

{patient_history.model_dump_json(indent=2)}

CLINICAL SUMMARY:

{clinical_summary.model_dump_json(indent=2)}

DOCUMENTATION QUALITY REPORT:

{quality_report}
"""

    completeness_result = Runner.run_sync(
        completeness_agent,
        completeness_input
    )

    completeness_report = completeness_result.final_output


    # ============================================================
    # AGENT 5 — FINAL DOCUMENTATION
    # ============================================================

    final_documentation_input = f"""
PATIENT HISTORY:

{patient_history.model_dump_json(indent=2)}

CLINICAL SUMMARY:

{clinical_summary.model_dump_json(indent=2)}

DOCUMENTATION QUALITY REPORT:

{quality_report}

DOCUMENTATION COMPLETENESS REPORT:

{completeness_report}
"""

    final_result = Runner.run_sync(
        final_documentation_agent,
        final_documentation_input
    )

    final_documentation = final_result.final_output


    # ============================================================
    # RETURN COMPLETE PIPELINE RESULT
    # ============================================================

    return {
        "patient_history": patient_history.model_dump(),
        "clinical_summary": clinical_summary.model_dump(),
        "documentation_quality": quality_report,
        "documentation_completeness": completeness_report,
        "final_documentation": final_documentation,
    }