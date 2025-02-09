from playwright.sync_api import sync_playwright
import json

def get_all_company_urls():
    with open('content.txt', 'r') as f:
        # Get all lines and strip whitespace
        urls = [line.strip() for line in f.readlines()]
    return urls

def get_company_name(url):
    # Extract company name from URL (part after 'companies/')
    return url.split('companies/')[-1]

def extract_tag(url):
    # Split URL by '/' and get the last part
    parts = url.split('/')
    if 'industry' in parts or 'location' in parts:
        return parts[-1]
    return None

def main():
    companies_data = []
    failed_companies = []
    
    # Get all company URLs
    urls = get_all_company_urls()
    total_companies = len(urls)
    print(f"Found {total_companies} companies to process")
    
    with sync_playwright() as p:
        # Launch the browser in headless mode
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        for index, url in enumerate(urls, 1):
            company_name = get_company_name(url)
            print(f"\nProcessing company {index}/{total_companies}: {company_name}")
            
            try:
                # Open the company page
                print(f"Opening {url}...")
                page.goto(url)
                
                # Get the title
                title = page.locator('h3.sm\\:block').first.text_content()
                
                # Get the description (first instance only)
                description = page.locator('div.prose.max-w-full.whitespace-pre-line').first.text_content()
                
                # Get all URLs under the specific div
                tag_links = page.locator('div.align-center.flex a[href^="/companies"]').all()
                tags = []
                for link in tag_links:
                    href = link.get_attribute('href')
                    tag = extract_tag(href)
                    if tag:  # Only add if it's an industry or location tag
                        tags.append(tag)
                
                # Create company dictionary
                company_data = {
                    "name": company_name,
                    "header": title,
                    "description": description,
                    "tags": tags
                }
                
                # Add to companies list
                companies_data.append(company_data)
                
                print(f"Processed company {index}/{total_companies}")
                
            except Exception as e:
                print(f"Error processing {company_name}: {str(e)}")
                failed_companies.append(company_name)
                continue
        
        browser.close()
    
    # Save all data to JSON file
    with open('companies_data.json', 'w', encoding='utf-8') as f:
        json.dump(companies_data, f, indent=2)
    
    # Print final summary
    successful = len(companies_data)
    failed = len(failed_companies)
    print(f"\nScraping completed!")
    print(f"Successfully processed: {successful}/{total_companies}")
    print(f"Failed to process: {failed}/{total_companies}")
    if failed > 0:
        print("\nFailed companies:")
        for company in failed_companies:
            print(f"- {company}")

if __name__ == "__main__":
    main() 