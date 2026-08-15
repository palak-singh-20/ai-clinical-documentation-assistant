from app.pipeline import process_consultation


consultation = """
Patient ID: DEMO-002

Chief complaint:
Fever and sore throat for 3 days.

Symptoms:
The patient reports fever, sore throat, fatigue, and difficulty swallowing.

Allergies:
The patient is allergic to penicillin.

Medical history:
The patient has a history of asthma.

Medications:
The patient currently takes salbutamol inhaler as needed.

Family history:
Mother has diabetes.

Social history:
The patient does not smoke and does not drink alcohol.
"""


print("\n>>> TESTING FULL CLINICAL DOCUMENTATION PIPELINE...\n")

result = process_consultation(consultation)

print("\n>>> PIPELINE SUCCESSFUL!\n")

print("\n===== PATIENT HISTORY =====")
print(result["patient_history"])

print("\n===== CLINICAL SUMMARY =====")
print(result["clinical_summary"])

print("\n===== DOCUMENTATION QUALITY =====")
print(result["documentation_quality"])

print("\n===== DOCUMENTATION COMPLETENESS =====")
print(result["documentation_completeness"])

print("\n===== FINAL DOCUMENTATION =====")
print(result["final_documentation"])