// Google Sheets Tool Script Editor

// Eventbrite API importer for Google Sheets
// __ Description: Google Sheet Script that allows the user to search for Eventbrite events with precision and high granularity.
// __ Status: Prototype
// __ Author: Remy Thellier
// __ Email: remythellier@gmail.com
// __ Licence: MIT

var EVENTBRITE_KEY = 'XXXXXXXXXXXXXXX';
var EVENTBRITEPRIVATE_KEY = 'XXXXXXXXXXXXXXX';
var ss = SpreadsheetApp.getActiveSpreadsheet();
var searchSheet = ss.getSheetByName('eventbriteSearch');
var eventbriteSheet = ss.getSheetByName('eventbriteEvents');
var allIds = [];

function onOpen() {
    SpreadsheetApp.getUi()
      .createMenu('Calendar')
      .addItem('Retrieve categories from Eventbrite...', 'getEventbriteCats')
      .addItem('Retrieve sub-categories from Eventbrite...', 'getEventbriteSubCats')
      .addItem('Retrieve events from Eventbrite...', 'getEventbriteData')
      .addItem('Get precise Eventbrite cost...', 'getAllcost')
      .addToUi();
}

function getEventbriteCats(){
    searchSheet.getRange('C9:DZ9').clearContent();
    searchSheet.getRange('C10:DZ10').clearContent();
    searchSheet.getRange('C11:DZ10').clearContent();
    var url = 'https://www.eventbriteapi.com/v3/categories/?token='+ EVENTBRITE_KEY;
    try {
        let response = UrlFetchApp.fetch(url);
        let responseData = response.getContentText();
        let json = JSON.parse(responseData);
        let itemsNb = (parseInt(json.pagination.object_count));
        searchSheet.getRange(10,1).setValue(itemsNb)
        for (i = 1; i < itemsNb; i++) {
            searchSheet.getRange(9,2+i).setValue(json.categories[i].name);
            searchSheet.getRange(10,2+i).setValue(json.categories[i].id);
        }
    } catch (e) {
        Logger.log(e);
        return ["Error:", e];
  }  
}

function getEventbriteSubCats(){
    searchSheet.getRange('C13:DZ13').clearContent();
    searchSheet.getRange('C14:DZ14').clearContent();
    searchSheet.getRange('C15:DZ15').clearContent();
    let categoriesNb = searchSheet.getRange(10,1).getValue();
    let currentCol = 3;
    if (categoriesNb !== "") {
        for (i = 1; i < categoriesNb; i++) {
            if (searchSheet.getRange(11,2+i).getValue() == "YES"){
                let catId = searchSheet.getRange(10,2+i).getValue();
                let caturl = 'https://www.eventbriteapi.com/v3/categories/'+ catId +'/?token='+ EVENTBRITE_KEY;
                try {
                    let response = UrlFetchApp.fetch(caturl);
                    let responseData = response.getContentText();
                    let json = JSON.parse(responseData);
                    json.subcategories.forEach(function(subCat) {
                        searchSheet.getRange(13,currentCol).setValue(subCat.name);
                        searchSheet.getRange(14,currentCol).setValue(subCat.id);
                        currentCol = currentCol+1;
                    });
                } catch (e) {
                    Logger.log(e);
                    return ["Error:", e];
                }
            }
        }
    }
}

function getEventbriteData(currentItem) {
    let search = {};
    search.keyword = searchSheet.getRange(2,2).getValue();
    if (search.keyword !== ""){
        search.Qkeyword = "&q=" + search.keyword;
    } else { 
        search.Qkeyword = "";
    };
    search.location = searchSheet.getRange(3,2).getValue();
  	if (search.location !== ""){
        search.Qlocation = "&location.address=" + search.location;
    } else { 
        search.Qlocation = "";
    };
    search.within = searchSheet.getRange(4,2).getValue();
    if (search.within !== ""){
        search.Qwithin = "&location.within=" + search.within;
    } else { 
        search.Qwithin = "";
    };
    search.price = searchSheet.getRange(5,2).getValue();
    if (search.price !== ""){
        search.Qprice = "&price=" + search.price;
    } else {
        search.Qprice = ""
    };
    search.startDate = searchSheet.getRange(6,2).getValue();
    if (search.startDate !== ""){
        search.QstartDate = "&start_date.range_start=" + search.startDate;
    } else {
        search.QstartDate = "";
    };
    search.endDate = searchSheet.getRange(7,2).getValue();
    if (search.endDate !== ""){
        search.QendDate = "&start_date.range_end=" + search.endDate;
    } else {
        search.QendDate = "";
    };
    let n = 0;
    search.categories = "";
    while (searchSheet.getRange(9, 3+n).getValue() !== ""){
        if (searchSheet.getRange(11, 3+n).getValue() == "YES"){
            if (search.categories !== "") {
                search.categories = search.categories + "%2C";
            }
            search.categories = search.categories + searchSheet.getRange(10,3+n).getValue();
        }
        n++;
    }
    if (search.categories !== ""){
        search.Qcategories = "&categories=" + search.categories;
    } else {
        search.Qcategories = "";
    };
    search.subCategories = "";
    let m = 0;
    while (searchSheet.getRange(13,3+m).getValue() !== "") {
        if (searchSheet.getRange(15,3+m).getValue() == "YES"){
            if (search.subCategories !== "") {
                search.subCategories = search.subCategories + "%2C";
            }
            search.subCategories = search.subCategories + searchSheet.getRange(14,3+m).getValue();
        }
        m++;
    }
    if (search.subCategories !== ""){
        search.QsubCategories ="&subcategories="+search.subCategories;
    } else {
        search.QsubCategories = "";
    };
    if (search.QsubCategories !== ""){
        search.QallCategories = search.QsubCategories;
    } else {
        search.QallCategories = search.QCategories;
    };
    let o = 5;
    while (eventbriteSheet.getRange(o,2).getValue() !== "") {
        allIds[eventbriteSheet.getRange(o, 2).getValue().toString()] = "true";
        Logger.log(o + " value "+ eventbriteSheet.getRange(o, 2).getValue() + " " + allIds[eventbriteSheet.getRange(o, 2).getValue()]);
        o++;
    }
    search.Qpage = "";
    let page = 0;
    let page_count = 1;
    while (page != page_count) {
        let pagination = eventbriteRequest(allIds, o,search.Qkeyword, search.Qlocation, search.Qwithin, search.QallCategories, search.Qprice, search.QstartDate, search.QendDate,search.Qpage, search.location);
        o = pagination.o;
        page_count = pagination.page_count;
        Logger.log("page_count " + page_count);
        page = pagination.page_number + 1;
        search.Qpage = "&page=" + page;
        Logger.log("page " + page);
    }
}

function eventbriteRequest(allIds, o,Qkeyword, Qlocation, Qwithin, QallCategories, Qprice, QstartDate, QendDate, Qpage, location){
    // URL and params eventbrite API request
    let url = 'https://www.eventbriteapi.com/v3/events/search/?' + Qkeyword + '&sort_by=date'
                                                               + Qlocation
                                                               + Qwithin
                                                               + QallCategories
                                                               + Qprice
                                                               + QstartDate
                                                               + Qpage
                                                               + QendDate + '&include_all_series_instances=on&include_unavailable_events=on&token=' + EVENTBRITE_KEY;
    Logger.log(url);
    try {
        let response = UrlFetchApp.fetch(url); 
        let responseData = response.getContentText();
        let json = JSON.parse(responseData);
        json.events.forEach(function(event) {
            let myid = "id"+event.id.toString();
            Logger.log("allid "+ myid + allIds[myid]);
            if (allIds[myid] !== "true") {
                eventbriteSheet.getRange(o,1).setValue(location);
                eventbriteSheet.getRange(o,2).setValue("id"+event.id);
                eventbriteSheet.getRange(o,3).setValue(event.name.text);
                eventbriteSheet.getRange(o,4).setValue(event.description.text);
                eventbriteSheet.getRange(o,5).setValue(event.url);
                eventbriteSheet.getRange(o,8).setValue(event.start.local);
                eventbriteSheet.getRange(o,9).setValue(event.end.local);
                eventbriteSheet.getRange(o,6).setValue(event.resource_uri);
                let isFree = "false";
                if (event.is_free == false){
                    isFree = "not free";
                } else {
                    isFree = "free";
                };
                eventbriteSheet.getRange(o,7).setValue(isFree);
                o++;
            }
        });
        json.pagination.o = o;
        return json.pagination;
    } catch (e) {
        Logger.log(e);
        return ["Error:", e];
    } 
}

function getAllcost(){
    let p = 5;
    while (eventbriteSheet.getRange(p,2).getValue() !== "") {
        if (eventbriteSheet.getRange(p,7).getValue() == "not free"){
            if (eventbriteSheet.getRange(p,11).getValue() == ""){
                let url = eventbriteSheet.getRange(p,6).getValue() + 'ticket_classes/?token=' + EVENTBRITEPRIVATE_KEY;
                Logger.log(url);
                try {
                    let response = UrlFetchApp.fetch(url); 
                    let responseData = response.getContentText();
                    let json = JSON.parse(responseData);
                    eventbriteSheet.getRange(p,11).setValue(json.ticket_classes[0].cost.display);
                } catch (e) {
                    Logger.log(e);
                    return ["Error:", e];
                } 
            }
        } else {
            eventbriteSheet.getRange(p,11).setValue("$0");
        }   
        p++;
    }
}