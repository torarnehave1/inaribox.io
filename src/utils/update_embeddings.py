import os
import openai
from pymongo import MongoClient
from dotenv import load_dotenv
import numpy as np

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MONGO_URL = os.getenv("MONGO_URL")

# Initialize OpenAI API
openai.api_key = OPENAI_API_KEY

# Connect to MongoDB
print("MONGO_URL:", MONGO_URL)  # Temporary debug line to verify the value of MONGO_URI


client = MongoClient(MONGO_URL)
db = client['slowyounet']
collection = db['embeddings']

# Define function to get embeddings from OpenAI
def get_embedding(text, model="text-embedding-ada-002"):
    response = openai.Embedding.create(input=text, model=model)
    return response['data'][0]['embedding']

# Function to update or insert embeddings in MongoDB
def update_embedding(document_id, text):
    embedding = get_embedding(text)
    result = collection.update_one(
        {"_id": document_id},  # Look up by document ID
        {"$set": {"embedding": embedding, "text": text}},  # Update or insert embedding
        upsert=True  # Insert if not found
    )
    if result.matched_count > 0:
        print(f"Updated embedding for document ID: {document_id}")
    else:
        print(f"Inserted new embedding for document ID: {document_id}")

# Read and process the contents of index.html
def process_html_file():
    # Update the file path to relative within the repo
    file_path = "public/index.html"  # Relative path for GitHub Actions
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()

        # Insert the file content and corresponding embedding into MongoDB
        document_id = "index_html"  # Unique identifier for this document
        update_embedding(document_id, content)

    except Exception as e:
        print(f"An error occurred while processing the HTML file: {e}")

# Example usage
if __name__ == "__main__":
    # Process and insert index.html content and embedding into MongoDB
    process_html_file()
