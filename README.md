# Eventbrite API importer for Google Sheets

Google Sheets Script that allows users to search for Eventbrite events with precision and high granularity.
As the search engine on the Eventbrite website is limited and I couldn't get the clean list of the events that I was looking for.
That's why I created this interface.
The UX can be improved but it allows to search for events with a high precision. The result of the search automatically populates a table.

You can search by:
keyword / location / distance from location / is free or not / start date / end date / category / sub-category

The information collected is: 
city / id of the event / name / description / link / API link / cost / start date / end date / is canceled or not / lowest price to attend


Here is the information that is can  for each company that appears in the first column:
Name / Homepage / Type / Short description / Country / Region / City Name / Facebook URL / Linkedin URL / Twitter URL / Crunchbase URL

For more information, the documentation of the Crunchbase API can be found following this link: https://www.eventbrite.com/platform/api

### Installing

Go to Google Sheets, open a new file, click on tools, then Script Editor and paste the script.

The first and second sheets should be set as it is on the image template.png, the 2 sheets need to be respectively named "eventbriteSearch" and "eventbriteEvents".

Add your API credentials in the code (EVENTBRITE_KEY and EVENTBRITEPRIVATE_KEY variables)

## Start

- 0/ Fill in the spreadsheet as seen on the template.png example. 
- 1/ Fill in at least the "location" and the "within" inputs.
- 2/ Click on "Calendar" in the menu and then on "retrieve categories from Eventbrite" to get the list of categories available in this area.
- 3/ Select categories by filling in the inputs with "YES".
- 4/ Click on "Calendar" in the menu and then on "retrieve sub-categories from Eventbrite" to get the list of sub-categories available in this area.
- 5/ Select sub-categories by filling in the inputs with "YES".
- 6/ Click on "Calendar" in the menu and then on "retrieve events from eventbrite", this will populate the "eventbriteEvents" sheet with the results.
- 7/ Click on "Calendar" in the menu and then on "Get precise Eventbrite cost", this will add the minimum cost of each event in the "eventbriteEvents" sheet.
- 8/ Enjoy the results!

## Testing the API

Here are exemple of URLs to test the API
- get the list of categories: https://www.eventbriteapi.com/v3/categories/?token=XXXXXXXXX
- get a list of events: https://www.eventbriteapi.com/v3//events/search/?q=keyword&sort_by=date&location.address=san+francisco&location.within=50km&categories=101%2C102&price=free&start_date.range_start=2018-02-01T00%3A00%3A00&start_date.range_end=2018-04-05T00%3A00%3A00&include_all_series_instances=on&include_unavailable_events=on&token=XXXXXXXXX

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
