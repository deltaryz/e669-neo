// e669-neo
// © 2020 Cameron Seid

// imports
import $ from "jquery";

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

$(document).ready(function () {
  $("#header").load("assets/header.html", function () {
    // we have to make sure to write the header's code in here since it loads separately
    selectorE621 = $("#selectorE621")[0];
    selectorDerpibooru = $("#selectorDerpibooru")[0];
    websiteDropdownImg = $("#websiteDropdown")[0];

    selectorE621.onclick = function () {
      websiteDropdownImg.setAttribute("src", "assets/e621-icon.png");
      currentApi = API.E621;
      currentQuery.set("api", "E621");
      location.href =
        window.location.toString().split("?")[0] +
        "?" +
        currentQuery.toString();
    };

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
  });

  // TODO: maybe have a different script for settings...? perhaps?
  if (window.location.toString().includes("settings.html")) {
    // we are on settings page
    currentLocation = LOCATION.SETTINGS;
  } else {
    // we are on index/search page
    currentLocation = LOCATION.INDEX;
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
});
