from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(
    api_key = os.getenv("API_KEY"),
    base_url ="https://api.groq.com/openai/v1"
)

while True:
    user_input = input("What you want to ask me? ")
    if user_input == "quit":
        print("Bot: GoodBye")
        break
    response = client.chat.completions.create(
        model = "llama3-70b-8192",
        messages = [
            {
                "role":"system",
                "content" : "This chatbot provides clear, step-by-step recipes based only on the ingredients you enter. It won't respond to anything unrelated to food ingredients or cooking instructions."
            },
            {
                "role":"user",
                "content":user_input
            }
        ]
    )
    print("Bot: ",response.choices[0].message.content)