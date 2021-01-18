// e669-neo
// © 2020 Cameron Seid

export enum API {
  E621,
  DERPIBOORU,
}

// global variables
export let currentApi = API.E621;
export let currentLocation: string;

// TODO: maybe have a different script for settings...? perhaps?
if (window.location.toString().includes("settings.html")) {
  // we are on settings page
  currentLocation = "settings";
} else if (window.location.toString().includes("index.html")) {
  // we are on index/search page
  currentLocation = "index";
}

// grab the elements from the webpage
let searchBox = document.getElementById("searchBox");
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
