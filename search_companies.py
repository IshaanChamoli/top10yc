from openai import OpenAI
from pinecone import Pinecone
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

def init_clients():
    """Initialize OpenAI and Pinecone clients."""
    openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    pinecone_client = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
    return openai_client, pinecone_client

def get_embedding(client, text):
    """Get embedding for the search query."""
    response = client.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

def search_companies(query, top_k=5):
    """Search for companies based on the query."""
    # Initialize clients
    openai_client, pinecone_client = init_clients()
    
    # Get index
    index = pinecone_client.Index(os.getenv('PINECONE_INDEX_NAME'))
    
    # Get query embedding
    print("\nGenerating embedding for your search query...")
    query_embedding = get_embedding(openai_client, query)
    
    # Search Pinecone
    print("Searching for relevant companies...")
    search_results = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True
    )
    
    return search_results.matches

def display_results(results):
    """Display search results in a readable format."""
    print("\n=== Search Results ===\n")
    
    for i, match in enumerate(results, 1):
        print(f"#{i} Company: {match.metadata['name']}")
        print(f"Similarity Score: {match.score:.4f}")
        print(f"Header: {match.metadata['header']}")
        print(f"Description: {match.metadata['description'][:200]}...")  # Show first 200 chars
        print(f"Tags: {', '.join(match.metadata['tags'])}")
        print(f"Logo URL: {match.metadata['logo_url']}")
        print("-" * 80 + "\n")

def main():
    print("Welcome to YC Companies Search!")
    print("You can search for companies based on any criteria (technology, industry, description, etc.)")
    
    while True:
        # Get search query
        query = input("\nEnter your search query (or 'quit' to exit): ")
        
        if query.lower() == 'quit':
            print("Thanks for using YC Companies Search!")
            break
        
        try:
            # Get number of results
            try:
                k = int(input("How many results would you like to see? (default: 5): ") or 5)
            except ValueError:
                print("Invalid input, using default value of 5")
                k = 5
            
            # Search and display results
            results = search_companies(query, top_k=k)
            display_results(results)
            
        except Exception as e:
            print(f"An error occurred: {str(e)}")
            continue

if __name__ == "__main__":
    main() 