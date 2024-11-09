import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get MongoDB URL from environment
MONGO_URL = os.getenv("MONGO_URL")

def test_connection():
    try:
        # Establish connection to MongoDB
        client = MongoClient(MONGO_URL)
        
        # Test the connection by listing databases
        db_names = client.list_database_names()
        print("Successfully connected to MongoDB!")
        print("Databases:", db_names)
    except Exception as e:
        print("Connection failed:", e)

# Run the test
if __name__ == "__main__":
    test_connection()
