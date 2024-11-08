import os
import openai
from pymongo import MongoClient
from dotenv import load_dotenv
import numpy as np

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")

# Initialize OpenAI API
client = openai.OpenAI(api_key=OPENAI_API_KEY)

# Connect to MongoDB
client_mongo = MongoClient(MONGO_URI)
db = client_mongo['slowyounet']
collection = db['embeddings']

# Define function to get embeddings from OpenAI
def get_embedding(text, model="text-embedding-3-small"):
    text = text.replace("\n", " ")
    response = client.embeddings.create(input=[text], model=model)
    return response.data[0].embedding

# Function to update or insert embeddings in MongoDB
def update_embedding(document_id, text):
    embedding = get_embedding(text)
    result = collection.update_one(
        {"_id": document_id},
        {"$set": {"embedding": embedding, "text": text}},
        upsert=True
    )
    if result.matched_count > 0:
        print(f"Updated embedding for document ID: {document_id}")
    else:
        print(f"Inserted new embedding for document ID: {document_id}")

# Example usage
if __name__ == "__main__":
    document_id = "example_id"
    text = "This is an example text to embed."
    
    update_embedding(document_id, text)
