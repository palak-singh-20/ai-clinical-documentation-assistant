from dotenv import load_dotenv
import os

from openai import AsyncOpenAI
import asyncio

load_dotenv(override=True)

client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)


async def main():

    print("Testing Groq...")
    print("API KEY LOADED:", bool(os.getenv("GROQ_API_KEY")))

    response = await client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "user",
                "content": "Say hello in one sentence."
            }
        ],
    )

    print("\nSUCCESS!")
    print(response.choices[0].message.content)


asyncio.run(main())