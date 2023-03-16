// e669-neo
// © 2022 Cameron Seid

// URL of cors proxy (https://github.com/Rob--W/cors-anywhere)
// PORT=8765 CORSANYWHERE_WHITELIST="https://e669.fun" node server.js
// include trailing slash in URL
let corsProxy = "http://floof.zone:8765/";
// TODO: add setting to override cors proxy URL

// TODO: add these to settings panel
// How big should each page of results be?
let pageSize = 30; // TODO: override this with URL parameter
let gridSizeSmall = "23.4";
let gridSizeLarge = "49";

// grid size reference
// value - number of columns
// 18.4 - 5
// 23.4 - 4
// 32 - 3
// 49 - 2

const Packery = require('packery');
const imagesLoaded = require('imagesLoaded');

// global variables
export let currentApi: API;
export let currentQuery = new URLSearchParams(window.location.search); // use .get(), .has()
export let currentPage: number = parseInt(currentQuery.get("page"));
// default to 1
if (!currentPage) {
  currentPage = 1;
  currentQuery.set("page", currentPage.toString());
}

let searchBox: HTMLInputElement;
let errorBox = document.getElementById("errorbox");
let selectorE621: HTMLElement;
let selectorDerpibooru: HTMLElement;
let websiteDropdownImg: HTMLElement;

// results
let resultsE621;

// gonna try not to use this if i can help it
// import * as $ from "jquery";

export enum API {
  E621,
  DERPIBOORU,
}

// reload page with new parameters
let reloadPage = function () {
  location.href =
    window.location.toString().split("?")[0] +
    "?" +
    currentQuery.toString();
}

// check if viewport dimensions are mobile-sized
let isMobile = function () {
  return window.innerWidth < 768;
}

// show an error in the errorBox
let showError = function (err: Error) {
  errorBox.innerHTML +=
    "<xmp>" + err + "</xmp><br/>";
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
  } else {
    currentQuery.set("api", "E621");
    currentApi = API.E621;
  }
}

updateApiFromQuery();

// grab header.html and insert to div
fetch("header.html")
  .then((data) => data.text()) // parse text
  .then(function (text) {

    // redunantly run this again because async bullshit 
    updateApiFromQuery();

    // add header contents to page
    document.getElementById("header").innerHTML = text

    // set up our dom elements
    selectorE621 = document.getElementById("selectorE621");
    selectorDerpibooru = document.getElementById("selectorDerpibooru");
    websiteDropdownImg = document.getElementById("websiteDropdown");
    searchBox = document.getElementById("searchBox") as HTMLInputElement;

    // init searchbox
    searchBox.addEventListener("keydown", function (event) {
      // enter was pressed
      if (event.keyCode == 13) {
        currentQuery.set("search", searchBox.value)
        reloadPage();
      }
    });

    // set the image in the corner to the respective site icon
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

      reloadPage();
    };

    // switch to derpi api when clicked
    selectorDerpibooru.onclick = function () {
      currentQuery.set("api", "derpibooru");
      currentQuery.set("search", searchBox.value)

      reloadPage();
    };

    // put the search query into the searchbox
    if (currentQuery.has("search")) {
      searchBox.value = currentQuery.get("search");
    }

  })

// automatically populate results if there is a search query
let search = currentQuery.get("search");
if (currentQuery.has("search") && search != "") {

  console.log("Search query found: " + search);

  // this will be an e6 search
  if (currentApi == API.E621) {

    // TODO: use user's API key from settings
    let url = "https://e621.net/posts.json?page=" + currentPage + "&limit=" + pageSize + "&tags=" + search.replace(/ /g, '%20') + "%20rating:safe"; // TODO: support explicit results
    console.log("Request URL: " + url);

    // TODO: detect when this finishes so a loading wheel can be displayed
    // ^ i think i can just add another .then() ?
    // send the request
    fetch(corsProxy + url)
      .then(function (response) {
        return response.json();
      })
      .then(function (results) {
        resultsE621 = results.posts;

        if (resultsE621.length < 1) showError(new Error("No results received."));

        // process results into image tags

        let htmlString: string = "";
        for (let i = 0; i < resultsE621.length; i++) {
          let currentImage = resultsE621[i];

          htmlString += "<img class=\"outline drophover grid-item\" src=\"" + currentImage.file.url + "\">"
        }

        // shove all of that into the grid
        let imageDiv = document.getElementById("images");
        imageDiv.innerHTML = htmlString;

        initPackery();

      })
      .catch(function (err) {
        showError(err);
        throw err;
      });

  }

}

// This is all wrapped in a function so we can initiate it after the images have been retrieved
let initPackery = function () {

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
  if (!isMobile()) {
    resizeGrid(gridSizeSmall + "%");
  } else {
    resizeGrid(gridSizeLarge + "%");
  }

  pckry.layout();

  // Add an event listener for the resize event
  window.addEventListener('resize', function (event) {

    if (isMobile()) {
      resizeGrid(gridSizeLarge + "%");
    } else {
      resizeGrid(gridSizeSmall + "%");
    }

    pckry.layout();
  });

}

// TODO: create post.ts object with fields for all relevant variables
// use this for type checking: https://jvilk.com/MakeTypes/

