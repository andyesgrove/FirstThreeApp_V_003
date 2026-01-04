import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

def scrape_next_fixture():
    """Scrape the next fixture from AFC Whyteleafe website"""
    
    url = "https://www.afcwhyteleafe.com/mens-first-team/mens-first-team-fixtures/"
    
    try:
        # Fetch the webpage
        response = requests.get(url)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the fixtures table
        table = soup.find('table')
        if not table:
            print("Could not find fixtures table")
            return None
        
        # Find all fixture rows
        rows = table.find_all('tr')
        
        # Look for the next upcoming fixture (one without a result)
        for row in rows[1:]:  # Skip header row
            cells = row.find_all('td')
            if len(cells) < 6:
                continue
            
            date_venue = cells[0].get_text(strip=True)
            opponent = cells[2].get_text(strip=True)
            result = cells[3].get_text(strip=True)
            
            # If there's no result, it's an upcoming fixture
            if not result or result == '':
                # Determine if home or away
                home_away = cells[1].get_text(strip=True)
                is_home = (home_away == 'H')
                
                # Extract date and time if available
                date_parts = date_venue.split()
                
                # Parse the fixture data
                if is_home:
                    home_team = "AFC Whyteleafe"
                    away_team = opponent
                    venue = "Church Road"
                else:
                    home_team = opponent
                    away_team = "AFC Whyteleafe"
                    venue = f"{opponent}'s Ground"
                
                # Try to extract kick-off time from result cell if it contains "KO:"
                time = "3:00 PM"  # Default
                ko_text = result
                if "KO:" in ko_text:
                    time_part = ko_text.split("KO:")[-1].strip()
                    # Convert 24h to 12h format if needed
                    try:
                        time_24 = datetime.strptime(time_part, "%H:%M")
                        time = time_24.strftime("%I:%M %p").lstrip('0')
                    except:
                        time = time_part
                
                fixture_data = {
                    "homeTeam": home_team,
                    "awayTeam": away_team,
                    "date": date_venue,
                    "time": time,
                    "venue": venue
                }
                
                return fixture_data
        
        print("No upcoming fixtures found")
        return None
        
    except Exception as e:
        print(f"Error scraping fixture: {e}")
        return None

def save_to_json(fixture_data, filename="next-fixture.json"):
    """Save fixture data to JSON file"""
    if fixture_data:
        with open(filename, 'w') as f:
            json.dump(fixture_data, f, indent=2)
        print(f"Saved fixture data to {filename}")
        print(json.dumps(fixture_data, indent=2))
    else:
        print("No fixture data to save")

if __name__ == "__main__":
    print("Scraping AFC Whyteleafe fixtures...")
    fixture = scrape_next_fixture()
    
    if fixture:
        save_to_json(fixture)
        print("\nSuccess! Upload 'next-fixture.json' to your GitHub repository.")
    else:
        print("\nFailed to scrape fixture data")