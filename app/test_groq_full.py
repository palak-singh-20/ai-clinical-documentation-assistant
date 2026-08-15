import os
from dotenv import load_dotenv
from openai import OpenAI

from app.models.patient_history import PatientHistory


load_dotenv(override=True)


client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)


schema = PatientHistory.model_json_schema()


print("Testing full PatientHistory schema...")
print("API KEY:", bool(os.getenv("GROQ_API_KEY")))


response = client.chat.completions.create(
    model="openai/gpt-oss-120b",

    messages=[
        {
            "role": "user",
            "content": """
Extract the patient information from this consultation.

Patient ID: DEMO-001

Chief complaint:
Persistent cough for 5 days.

Symptoms:
The patient reports a cough that is worse at night.

Allergies:
The patient reports no known medication allergies.

No other information was documented.
""",
        }
    ],

    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "patient_history",
            "strict": True,
            "schema": schema,
        },
    },
    reasoning_effort="low",
    temperature=0.6,
)


print("\nSUCCESS!")
print(response.choices[0].message.content)