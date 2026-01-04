import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime

def scrape_next_fixture():
    """Scrape the next fixture from AFC Whyteleafe homepage"""
    
    url = "https://www.afcwhyteleafe.com/"
    
    try:
        # Fetch the webpage
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for the "Next match" section - try multiple approaches
        
        # Method 1: Look in the recent matches table
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all('td')
                if len(cells) >= 3:
                    opponent = cells[0].get_text(strip=True)
                    date_info = cells[1].get_text(strip=True)
                    home_away = cells[2].get_text(strip=True) if len(cells) > 2 else ''
                    
                    # Check if this is an upcoming fixture (contains date like "Tue 6 Jan")
                    if any(month in date_info for month in ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                                               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']):
                        # This is an upcoming fixture
                        is_away = 'A' in home_away or 'AWAY' in home_away.upper()
                        
                        if is_away:
                            home_team = opponent
                            away_team = "AFC Whyteleafe"
                            venue = f"{opponent}'s Ground"
                        else:
                            home_team = "AFC Whyteleafe"
                            away_team = opponent
                            venue = "Church Road"
                        
                        # Format the date
                        current_year = datetime.now().year
                        try:
                            # Try to parse the date
                            date_str = date_info
                            if not str(current_year) in date_str:
                                date_str = f"{date_info} {current_year}"
                        except:
                            date_str = date_info
                        
                        # Default time (will be updated if found)
                        time = "3:00 PM"
                        
                        fixture_data = {
                            "homeTeam": home_team,
                            "awayTeam": away_team,
                            "date": date_str,
                            "time": time,
                            "venue": venue
                        }
                        
                        print(f"Found fixture: {home_team} vs {away_team}")
                        return fixture_data
        
        # Method 2: Look for "Next match" heading and extract data
        next_match_section = soup.find(string=re.compile(r'Next match', re.IGNORECASE))
        if next_match_section:
            parent = next_match_section.find_parent()
            if parent:
                # Get all text from this section
                section_text = parent.get_text(separator='|', strip=True)
                print(f"Found next match section: {section_text}")
                
                # Parse the section
                lines = [line.strip() for line in section_text.split('|') if line.strip()]
                
                opponent = None
                venue_type = None
                time_date = None
                
                for i, line in enumerate(lines):
                    if 'vs' in line.lower() or 'The Leafe' in line:
                        # Found the teams
                        if i > 0:
                            opponent = lines[i-1]
                    elif 'AWAY' in line.upper() or 'HOME' in line.upper():
                        venue_type = line
                    elif any(char.isdigit() for char in line) and ':' in line:
                        time_date = line
                
                if opponent:
                    is_away = venue_type and 'AWAY' in venue_type.upper()
                    
                    if is_away:
                        home_team = opponent
                        away_team = "AFC Whyteleafe"
                        venue = f"{opponent}'s Ground"
                    else:
                        home_team = "AFC Whyteleafe"
                        away_team = opponent
                        venue = "Church Road"
                    
                    # Parse time and date if found
                    time = "3:00 PM"
                    date = "TBA"
                    
                    if time_date:
                        parts = time_date.split(',')
                        if len(parts) >= 2:
                            time = parts[0].strip()
                            date = parts[1].strip()
                    
                    fixture_data = {
                        "homeTeam": home_team,
                        "awayTeam": away_team,
                        "date": date,
                        "time": time,
                        "venue": venue
                    }
                    
                    print(f"Found fixture: {home_team} vs {away_team}")
                    return fixture_data
        
        print("Could not find next fixture on homepage")
        return None
        
    except Exception as e:
        print(f"Error scraping fixture: {e}")
        import traceback
        traceback.print_exc()
        return None

def save_to_json(fixture_data, filename="next-fixture.json"):
    """Save fixture data to JSON file"""
    if fixture_data:
        with open(filename, 'w') as f:
            json.dump(fixture_data, f, indent=2)
        print(f"\n✓ Saved fixture data to {filename}")
        print(json.dumps(fixture_data, indent=2))
        return True
    else:
        print("\n✗ No fixture data to save")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("AFC Whyteleafe Fixture Scraper")
    print("=" * 50)
    print("\nScraping AFC Whyteleafe website...")
    
    fixture = scrape_next_fixture()
    
    if fixture:
        if save_to_json(fixture):
            print("\n✓ Success! The next-fixture.json file has been created/updated.")
            print("✓ Upload this to your GitHub repository.")
        else:
            print("\n✗ Failed to save fixture data")
    else:
        print("\n✗ Failed to scrape fixture data")
        print("Check the error messages above for details.")