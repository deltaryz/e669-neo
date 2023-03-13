// e669-neo
// © 2022 Cameron Seid

const Packery = require('packery');
const imagesLoaded = require('imagesLoaded');

// gonna try not to use this if i can help it
// import * as $ from "jquery";

export enum API {
  E621,
  DERPIBOORU,
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
export let currentQuery = new URLSearchParams(window.location.search); // use .get(), .has()
let searchBox: HTMLInputElement;
let selectorE621: HTMLElement;
let selectorDerpibooru: HTMLElement;
let websiteDropdownImg: HTMLElement;

// keep currentApi variable in sync with URL parameters
let updateApiFromQuery = function () {
  if (currentQuery.has("api")) {
    switch (currentQuery.get("api").toUpperCase()) {
      case "DERPIBOORU":
        currentApi = API.DERPIBOORU;
        break;
      case "E621":
        currentApi = API.E621;
        break;
      default:
        currentApi = API.E621;
        break;
    }
  }
}

updateApiFromQuery();

// grab header.html and insert to div
fetch("header.html")
  .then((data) => data.text()) // parse text
  .then(function (text) {

    // redunantly run this again because async bullshit 
    updateApiFromQuery();

    document.getElementById("header").innerHTML = text

    // set up our dom elements
    selectorE621 = document.getElementById("selectorE621");
    selectorDerpibooru = document.getElementById("selectorDerpibooru");
    websiteDropdownImg = document.getElementById("websiteDropdown");
    searchBox = document.getElementById("searchBox") as HTMLInputElement;

    switch (currentApi) {
      case API.DERPIBOORU:
        websiteDropdownImg.setAttribute("src", "assets/derpi-icon.png");
        break;
      case API.E621:
        websiteDropdownImg.setAttribute("src", "assets/e621-icon.png");
        break;
    }

    // switch to e621 api when clicked
    selectorE621.onclick = function () {
      currentQuery.set("api", "E621");
      currentQuery.set("search", searchBox.value)

      // reload page with new parameters
      location.href =
        window.location.toString().split("?")[0] +
        "?" +
        currentQuery.toString();
    };

    // switch to derpi api when clicked
    selectorDerpibooru.onclick = function () {
      currentQuery.set("api", "derpibooru");
      currentQuery.set("search", searchBox.value)

      // reload page with new parameters
      location.href =
        window.location.toString().split("?")[0] +
        "?" +
        currentQuery.toString();
    };

    // put the search query into the searchbox
    if (currentQuery.has("search")) {
      searchBox.value = currentQuery.get("search");
    }

  })

// automatically populate results if there is a search query
if (currentQuery.has("search")) {

  // this will be an e6 search
  if (currentApi = API.E621) {

  }

}

// initialize the Packery grid
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

// TODO: create post.ts object with fields for all relevant variables
// use this for type checking: https://jvilk.com/MakeTypes/

