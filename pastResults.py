import csv
import time
import json
import requests
from datetime import datetime, date, timedelta

# File paths for CSV and JSON
output_file_csv = 'eurojackpot_data.csv'
output_file_json = 'eurojackpot_data.json'

# Function to get all Fridays and Tuesdays (draw days)


def get_fridays_and_tuesdays(start_year, end_date):
    draw_dates = []
    current_date = date(start_year, 1, 1)

    while current_date <= end_date:
        if current_date.weekday() in [1, 4]:  # Tuesday = 1, Friday = 4
            draw_dates.append(current_date.strftime('%Y-%m-%d'))
        current_date += timedelta(days=1)

    return draw_dates

# Function to get all draw dates from 2012 until today


def get_all_draw_dates():
    start_year = 2012
    end_date = date.today()
    return get_fridays_and_tuesdays(start_year, end_date)


# Create a list to store the past data (for JSON export)
past_data = []

# Open CSV file for writing
with open(output_file_csv, 'w', newline='') as csvfile:
    csv_writer = csv.writer(csvfile)
    csv_writer.writerow(['Date', 'Main Numbers', 'Bonus Numbers'])

    # Loop through each draw date
    for draw_date in get_all_draw_dates():
        if datetime.strptime(draw_date, '%Y-%m-%d').date() > date.today():
            break

        # Make a request to fetch EuroJackpot data for the given draw date
        r = requests.get(
            f"https://www.eurojackpot.com/wlinfo/WL_InfoService?client=jsn&gruppe=ZahlenUndQuoten&ewGewsum=ja&historie=ja&spielart=EJ&adg=ja&lang=en&datum={draw_date}")

        if r.status_code != 200:
            print(
                f"Error fetching data for date {draw_date}: HTTP {r.status_code}")
            continue  # Skip to next draw date if there's an issue

        try:
            data = r.json()  # Try parsing the JSON response
        except requests.exceptions.JSONDecodeError:
            print(f"Error decoding JSON for date {draw_date}")
            continue  # Skip to next date on decoding error

        main_numbers = []
        bonus_numbers = []

        # Loop through the draw data to find main and bonus numbers
        for draw in data.get("zahlen", {}).get("hauptlotterie", {}).get("ziehungen", []):
            if draw['bezeichnung'] == "5 of 50":
                main_numbers = draw.get('zahlenSortiert', [])
            elif draw['bezeichnung'] in ["2 of 8", "2 of 10", "2 of 12"]:
                bonus_numbers = draw.get('zahlenSortiert', [])

        if not main_numbers or not bonus_numbers:
            print(f"Skipping {draw_date} due to missing numbers")
            continue  # Skip if numbers are missing

        # Write the date, main numbers, and bonus numbers to CSV
        csv_writer.writerow([draw_date, ','.join(
            map(str, main_numbers)), ','.join(map(str, bonus_numbers))])

        # Prepare the data for JSON output (required format for JS)
        past_data.append({
            'date': draw_date,
            'numbers': main_numbers,
            'starNumbers': bonus_numbers
        })

        print(
            f"Date: {draw_date}, Main numbers: {main_numbers}, Bonus numbers: {bonus_numbers}")

        # Add a delay to avoid overloading the server with requests
        time.sleep(1)  # Delay of 1 second between requests

# Write the data to a JSON file
with open(output_file_json, 'w') as jsonfile:
    json.dump(past_data, jsonfile)

print(f"\nData has been written to {output_file_csv} and {output_file_json}")
