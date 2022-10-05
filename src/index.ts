// e669-neo
// © 2022 Cameron Seid

export enum API {
  E621,
  DERPIBOORU,
}

export enum LOCATION {
  INDEX,
  SETTINGS,
}

// global variables
export let currentApi: API;
export let currentLocation: LOCATION;
export let currentQuery = new URLSearchParams(window.location.search); // use .get(), .has()
let searchBox: HTMLElement;
let selectorE621: HTMLElement;
let selectorDerpibooru: HTMLElement;
let websiteDropdownImg: HTMLElement;

// grab header.html and insert to div
fetch("header.html")
  .then((data) => data.text()) // parse text
  .then(function (text) {

    document.getElementById("header").innerHTML = text

    // set up our dom elements
    selectorE621 = document.getElementById("selectorE621");
    selectorDerpibooru = document.getElementById("selectorDerpibooru");
    websiteDropdownImg = document.getElementById("websiteDropdown");

    // switch to e621 api when clicked
    selectorE621.onclick = function () {
      websiteDropdownImg.setAttribute("src", "assets/e621-icon.png");
      currentApi = API.E621;
      currentQuery.set("api", "E621");
      location.href = // TODO: preserve existing searchbox contents/query
        window.location.toString().split("?")[0] +
        "?" +
        currentQuery.toString();
    };

    // switch to derpi api when clicked
    selectorDerpibooru.onclick = function () {
      currentApi = API.DERPIBOORU;
      websiteDropdownImg.setAttribute("src", "assets/derpi-icon.png");
      currentQuery.set("api", "derpibooru");
      location.href =
        window.location.toString().split("?")[0] +
        "?" +
        currentQuery.toString();
    };

    // automatically switch with URL parameter
    if (currentQuery.has("api")) {
      switch (currentQuery.get("api").toUpperCase()) {
        case "DERPIBOORU":
          currentApi = API.DERPIBOORU;
          websiteDropdownImg.setAttribute("src", "assets/derpi-icon.png");
          break;
        case "E621":
        default:
          currentApi = API.E621;
          websiteDropdownImg.setAttribute("src", "assets/e621-icon.png");
          break;
      }
    }

  })

// TODO: maybe have a different script for settings...? perhaps?
if (window.location.toString().includes("settings.html")) {
  // we are on settings page
  currentLocation = LOCATION.SETTINGS;
  // keep the image display code out of here so it doesn't mangle the settings page
} else {
  // we are on index/search page
  currentLocation = LOCATION.INDEX;
  // TODO: check URL parameters for search and populate results
  // TODO: create post.ts object with fields for all relevant variables
  // use this for type checking: https://jvilk.com/MakeTypes/
}