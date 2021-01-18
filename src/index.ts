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
export let currentQuery = new URLSearchParams(window.location.search); // use currentQuery.get("param")

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

// set the current API to e621
selectorE621.onclick = function () {
  currentApi = API.E621;
  websiteDropdownImg.setAttribute("src", "assets/e621-icon.png");
};

// set the current API to Derpibooru
selectorDerpibooru.onclick = function () {
  currentApi = API.DERPIBOORU;
  websiteDropdownImg.setAttribute("src", "assets/derpi-icon.png");
};

switch (currentLocation) {
  case LOCATION.SETTINGS:
    break;
  case LOCATION.INDEX:
    // TODO: check URL parameters for search and populate results
    break;
}
