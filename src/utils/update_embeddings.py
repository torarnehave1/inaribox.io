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
openai.api_key = OPENAI_API_KEY

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client['your_database_name']
collection = db['your_collection_name']

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

# Function to calculate similarity between embeddings
def cosine_similarity(embedding1, embedding2):
    embedding1, embedding2 = np.array(embedding1), np.array(embedding2)
    return np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2))

# Function to retrieve documents with similar embeddings
def find_similar_documents(query_text, threshold=0.8):
    query_embedding = get_embedding(query_text)
    similar_docs = []

    # Iterate over documents in the collection
    for doc in collection.find({"embedding": {"$exists": True}}):
        doc_embedding = doc["embedding"]
        similarity = cosine_similarity(query_embedding, doc_embedding)
        
        if similarity >= threshold:
            similar_docs.append((doc["_id"], doc["text"], similarity))
    
    similar_docs.sort(key=lambda x: x[2], reverse=True)  # Sort by similarity
    return similar_docs

# Example usage
if __name__ == "__main__":
    # Example document to add or update
    document_id = "example_id"
    text = "This is an example text to embed."
    
    # Update or insert embedding
    update_embedding(document_id, text)
    
    # Find similar documents to a query
    query = "Find similar documents to this example query."
    similar_docs = find_similar_documents(query)

    print("Similar documents:")
    for doc_id, doc_text, similarity in similar_docs:
        print(f"ID: {doc_id}, Similarity: {similarity:.2f}, Text: {doc_text}")
