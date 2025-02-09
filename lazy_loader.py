from playwright.sync_api import sync_playwright
from urllib.parse import urljoin
import os

def get_next_filename():
    base_name = "content"
    counter = ""
    
    while True:
        filename = f"{base_name}{counter}.txt"
        if not os.path.exists(filename):
            return filename
        # If content.txt exists, try content1.txt, then content2.txt, etc.
        counter = "1" if counter == "" else str(int(counter) + 1)

def main():
    url = "https://www.ycombinator.com/companies"
    
    with sync_playwright() as p:
        # Launch the browser
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            # Open YC companies page
            print(f"Opening {url}...")
            page.goto(url)
            print("Page loaded! Ready to scrape.")
            
            # Wait for scrape command
            while True:
                command = input("Type 'scrape' to save all URLs (or 'quit' to exit): ").lower()
                if command == 'scrape':
                    # Get all links from the page
                    links = page.locator('a')
                    count = links.count()
                    urls = set()  # Using set to avoid duplicates
                    
                    # Extract href from each link
                    for i in range(count):
                        try:
                            href = links.nth(i).get_attribute('href')
                            if href:
                                # Convert relative URLs to absolute URLs
                                absolute_url = urljoin(page.url, href)
                                urls.add(absolute_url)
                        except Exception as e:
                            continue
                    
                    # Get next available filename
                    filename = get_next_filename()
                    
                    # Save URLs to file
                    with open(filename, 'w', encoding='utf-8') as f:
                        for url in sorted(urls):
                            f.write(url + '\n')
                    
                    print(f"Found {len(urls)} unique URLs and saved to {filename}!")
                    break
                elif command == 'quit':
                    break
            
        finally:
            browser.close()

if __name__ == "__main__":
    main() 