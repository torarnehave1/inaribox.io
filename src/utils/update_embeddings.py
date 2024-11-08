import os
from openai import OpenAI
from pymongo import MongoClient
from dotenv import load_dotenv
import pandas as pd
import numpy as np

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MONGO_URL = 'mongodb+srv://torarnehave:Q3AYMtCA62tOWNk1@cluster0.wcbzj0t.mongodb.net/slowyounet'

# Initialize OpenAI API client
client = OpenAI(api_key=OPENAI_API_KEY)

# Connect to MongoDB
print("MONGO_URL:", MONGO_URL)  # Debug line to verify MONGO_URL value
client_mongo = MongoClient(MONGO_URL)
db = client_mongo['slowyounet']
collection = db['embeddings']

# Define function to get embeddings using the specified OpenAI client
def get_embedding(text, model="text-embedding-3-small"):
    text = text.replace("\n", " ")  # Preprocess text to remove newlines
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

# Function to process the index.html file and insert into MongoDB
def process_html_file():
    file_path = "public/index.html"  # Relative path for GitHub Actions
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Insert file content and corresponding embedding into MongoDB
        document_id = "index_html"
        update_embedding(document_id, content)

    except Exception as e:
        print(f"An error occurred while processing the HTML file: {e}")

# Function to export embeddings from MongoDB to CSV for analysis
def export_embeddings_to_csv():
    docs = list(collection.find({"embedding": {"$exists": True}}))
    if not docs:
        print("No embeddings found in MongoDB.")
        return
    
    # Create DataFrame with embeddings
    df = pd.DataFrame(docs)
    df['embedding'] = df['embedding'].apply(lambda x: np.array(x))  # Convert to numpy arrays if needed
    df.to_csv('output/embedded_docs.csv', index=False)
    print("Embeddings exported to 'output/embedded_docs.csv'")

# Example usage
if __name__ == "__main__":
    # Process and insert index.html content and embedding into MongoDB
    process_html_file()
    
    # Optional: Export embeddings to CSV
    export_embeddings_to_csv()
