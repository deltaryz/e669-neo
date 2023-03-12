// e669-neo
// © 2022 Cameron Seid

const Packery = require('packery');
const imagesLoaded = require('imagesLoaded');
// import * as $ from "jquery";

export enum API {
  E621,
  DERPIBOORU,
}

export enum LOCATION {
  INDEX,
  SETTINGS,
}

// check if viewport dimensions are mobile-sized
let isMobile = function () {
  return window.innerWidth < 768;
}

// resize the grid of images
let resizeGrid = function (size: string) {
  const gridsizers = document.querySelectorAll(".grid-sizer");
  const griditems = document.querySelectorAll(".grid-item");
  // combine all of them together since we're doing the same thing to all of them
  const elements = Array.from(gridsizers).concat(Array.from(griditems));

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i] as HTMLElement;
    // set 'width' to the given size
    element.style.width = size;
  }
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
      // set dropdown image to e6 icon
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
      // set dropdown image to derpi icon
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

  // this is the Packery grid
  var grid = document.querySelector('.grid');
  var pckry = new Packery(grid, {
    itemSelector: '.grid-item',
    gutter: '.gutter-sizer',
    columnWidth: '.grid-sizer',
    percentPosition: true,
    transitionDuration: '0.1s',
  });

  // layout Packery after each image loads
  imagesLoaded(grid).on('progress', function () {
    pckry.layout();
  });

  // make the images larger if we have a mobile-sized window
  if (isMobile()) {
    resizeGrid("32%");
    pckry.layout();
  }

  // Add an event listener for the resize event
  window.addEventListener('resize', function (event) {

    if (isMobile()) {
      resizeGrid("32%");
    } else {
      resizeGrid("18.4%");
    }

    pckry.layout();
  });

  // TODO: check URL parameters for search and populate results
  // TODO: create post.ts object with fields for all relevant variables
  // use this for type checking: https://jvilk.com/MakeTypes/
}

