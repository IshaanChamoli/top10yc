from openai import OpenAI
import json
from dotenv import load_dotenv
import os
from pinecone import Pinecone

# Load environment variables from .env file
load_dotenv()

def load_companies(limit=None):
    """Load companies from the JSON file."""
    with open('companies_data.json', 'r', encoding='utf-8') as f:
        companies = json.load(f)
        return companies[:limit] if limit else companies  # Return all if no limit

def create_company_text(company):
    """Combine company data into a single text string."""
    tags_text = " | ".join(company['tags']) if company['tags'] else ""
    # Cleaner format without labels, just content separated by newlines
    return f"""{company['name']}
{company['header']}
{company['description']}
{tags_text}"""

def init_pinecone():
    """Initialize Pinecone client and return index."""
    pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
    return pc.Index(os.getenv('PINECONE_INDEX_NAME'))

def main():
    # Check if required environment variables exist
    required_vars = ['OPENAI_API_KEY', 'PINECONE_API_KEY', 'PINECONE_INDEX_NAME']
    for var in required_vars:
        if not os.getenv(var):
            print(f"Error: {var} not found in .env file")
            return

    # Initialize OpenAI and Pinecone clients
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    index = init_pinecone()
    
    # Load ALL companies (removed limit)
    companies = load_companies()
    
    print(f"Processing {len(companies)} companies...\n")
    
    successful_uploads = 0
    failed_uploads = 0
    
    for i, company in enumerate(companies, 1):
        # Create combined text
        company_text = create_company_text(company)
        
        print(f"\n=== Company {i}/{len(companies)}: {company['name']} ===")
        print("Text being sent to OpenAI:")
        print(company_text)
        print("\nGenerating embedding...")
        
        try:
            # Get embedding
            response = client.embeddings.create(
                input=company_text,
                model="text-embedding-3-small"
            )
            
            embedding = response.data[0].embedding
            
            # Prepare vector with metadata
            vector = {
                "id": company['name'],  # Using company name as ID
                "values": embedding,
                "metadata": {
                    "full_text": company_text,  # The combined text used for embedding
                    "name": company['name'],
                    "header": company['header'],
                    "description": company['description'],
                    "tags": company['tags'],  # This will be stored as a list
                    "logo_url": company.get('logo_url')  # Using get() in case logo_url is missing
                }
            }
            
            # Upsert single vector to Pinecone
            print(f"Upserting to Pinecone...")
            index.upsert(vectors=[vector])
            print("Successfully uploaded to Pinecone!")
            successful_uploads += 1
            
            print(f"First 10 numbers of the embedding:")
            print(embedding[:10])
            
        except Exception as e:
            print(f"Error processing company {company['name']}: {str(e)}")
            failed_uploads += 1
            continue
    
    # Print final summary
    print(f"\nProcessing completed!")
    print(f"Successfully uploaded: {successful_uploads}/{len(companies)}")
    print(f"Failed uploads: {failed_uploads}/{len(companies)}")

if __name__ == "__main__":
    main() 