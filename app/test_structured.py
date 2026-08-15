import asyncio
import os

from dotenv import load_dotenv
from openai import AsyncOpenAI


load_dotenv(override=True)


client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)


async def main():

    print("Testing Groq Structured Output...")
    print("API KEY LOADED:", bool(os.getenv("GROQ_API_KEY")))

    response = await client.chat.completions.create(
        model="openai/gpt-oss-120b",

        messages=[
            {
                "role": "user",
                "content": """
                Extract the patient information.

                Patient ID: DEMO-001
                Chief complaint: Persistent cough for 5 days.
                """
            }
        ],

        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "patient_test",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "patient_id": {
                            "type": "string"
                        },
                        "chief_complaint": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "patient_id",
                        "chief_complaint"
                    ],
                    "additionalProperties": False
                }
            }
        }
    )

    print("\nSUCCESS!")
    print(response.choices[0].message.content)


asyncio.run(main())