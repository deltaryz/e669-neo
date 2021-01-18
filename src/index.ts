// e669-neo
// © 2020 Cameron Seid

export enum API {
  E621,
  DERPIBOORU,
}

export enum LOCATION {
  INDEX,
  SETTINGS,
}

// global variables
export let currentApi = API.E621;
export let currentLocation: LOCATION;
export let currentQuery = new URLSearchParams(window.location.search); // use .get(), .has()

// TODO: maybe have a different script for settings...? perhaps?
if (window.location.toString().includes("settings.html")) {
  // we are on settings page
  currentLocation = LOCATION.SETTINGS;
} else if (window.location.toString().includes("index.html")) {
  // we are on index/search page
  currentLocation = LOCATION.INDEX;
}

// grab the elements from the webpage
let searchBox = document.getElementById("searchBox"); // TODO: press enter on box to search
let selectorE621 = document.getElementById("selectorE621");
let selectorDerpibooru = document.getElementById("selectorDerpibooru");
let websiteDropdownImg = document.getElementById("websiteDropdown");

// set the current API to e621 when user clicks the dropdown
selectorE621.onclick = function () {
  currentApi = API.E621;
  websiteDropdownImg.setAttribute("src", "assets/e621-icon.png");
};

// set the current API to Derpibooru when user clicks the dropdown
selectorDerpibooru.onclick = function () {
  currentApi = API.DERPIBOORU;
  websiteDropdownImg.setAttribute("src", "assets/derpi-icon.png");
};

// automatically switch with URL parameter
switch (currentQuery.get("api").toUpperCase()) {
  case "DERPIBOORU":
    currentApi = API.DERPIBOORU;
    websiteDropdownImg.setAttribute("src", "assets/derpi-icon.png");
    break;
  case "E621":
    currentApi = API.E621;
    websiteDropdownImg.setAttribute("src", "assets/e621-icon.png");
    break;
}

switch (currentLocation) {
  case LOCATION.SETTINGS:
    // keep this separate so we don't hijack the settings page
    break;
  case LOCATION.INDEX:
    // TODO: check URL parameters for search and populate results
    // TODO: create post.ts object with fields for all relevant variables
    // use this for type checking: https://jvilk.com/MakeTypes/
    break;
}
