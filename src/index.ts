// e669-neo
// © 2023 Cameron Seid

// URL of cors proxy (https://github.com/Rob--W/cors-anywhere)
// PORT=8765 CORSANYWHERE_WHITELIST="https://e669.fun" node server.js
// include trailing slash in URL
let corsProxy = "http://floof.zone:8765/";
// TODO: add setting to override cors proxy URL

// TODO: add these to settings panel
// How big should each page of results be?
let pageSize = 30; // TODO: override this with URL parameter
let gridSizeSmall = "23.5";
let gridSizeLarge = "49";

// grid size reference
// value - number of columns
// 18.4 - 5
// 23.5 - 4
// 32 - 3
// 49 - 2

const Packery = require('packery');
const imagesLoaded = require('imagesLoaded');
const overlay = require('muicss/lib/js/overlay');

// Reads a cookie from the browser
let readCookie = function (key: string): string {
  return document.cookie.substring(document.cookie.indexOf(key) + key.length + 1).split(";")[0];
}

// TODO: GDPR notice about this
// Writes a cookie to the browser
let writeCookie = function (key: string, value: string) {
  document.cookie = key + "=" + value + "; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
}

// global variables
export let currentApi: API;
export let currentQuery = new URLSearchParams(window.location.search); // use .get(), .has()
export let currentPage: number = parseInt(currentQuery.get("page") as string);
// default to 1
if (!currentPage) {
  currentPage = 1;
  currentQuery.set("page", currentPage.toString());
}

let searchBox: HTMLInputElement;
let errorBox: HTMLElement = document.getElementById("errorbox") as HTMLElement;
let selectorE621: HTMLElement;
let selectorDerpibooru: HTMLElement;
let selectorSettings: HTMLElement;
let websiteDropdownImg: HTMLElement;
let settingsModal: HTMLElement;

let imageDiv: HTMLElement = document.getElementById("images") as HTMLElement;

let pageSwitcher: HTMLElement = document.getElementById("pageSwitcher") as HTMLElement;
let pageSwitcherBottom: HTMLElement = document.getElementById("pageSwitcherBottom") as HTMLElement;
let pageNumberDisplay: HTMLElement = document.getElementById("pageNumberDisplay") as HTMLElement;

// these will be defined later because of how we copy the div
let pageNext: NodeListOf<HTMLElement>;
let pagePrevious: NodeListOf<HTMLElement>;

let hithere: HTMLElement = document.getElementById("hithere") as HTMLElement;

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
    let currentQueryString: string = currentQuery.get("api") as string;
    switch (currentQueryString.toUpperCase()) {
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
    let header: HTMLElement = document.getElementById("header") as HTMLElement;
    header.innerHTML = text

    // set up our dom elements
    selectorE621 = document.getElementById("selectorE621") as HTMLElement;
    selectorDerpibooru = document.getElementById("selectorDerpibooru") as HTMLElement;
    selectorSettings = document.getElementById("selectorSettings") as HTMLElement;
    websiteDropdownImg = document.getElementById("websiteDropdown") as HTMLElement;
    searchBox = document.getElementById("searchBox") as HTMLInputElement;
    settingsModal = document.getElementById("settingsModal") as HTMLElement;

    // funny secret message
    hithere.innerHTML = "hi there ;)";

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

    // show settings modal when we click this
    selectorSettings.onclick = function () {

      // clone the settings modal to a temporary copy
      // we have to do this because mui deletes it when we close the modal
      let settingsActive = settingsModal.cloneNode(true) as HTMLElement;
      document.body.appendChild(settingsActive);
      settingsActive.hidden = false;

      // grab the fields from the copy
      let resultsPerPageInput = settingsActive.querySelector("#resultsPerPageInput") as HTMLInputElement;
      let saveSettingsButton = settingsActive.querySelector("#saveSettings") as HTMLButtonElement;
      let ageRestrictSettingInput = settingsActive.querySelector("#ageRestrictSettingInput") as HTMLInputElement;

      // populate the inputs with the existing settings
      // TODO: move this outside globally so we can figure this out on load
      let resultsPerPageValue = parseInt(readCookie("resultsPerPage"));
      console.log("Read resultsPerPage with value: " + resultsPerPageValue);
      if (!resultsPerPageValue) resultsPerPageValue = 30;
      resultsPerPageInput.value = resultsPerPageValue.toString();

      let ageRestrictSetting = false;
      if (readCookie("disableAgeRestrict") === 'true') {
        ageRestrictSetting = true;
      }
      console.log("Read disableAgeRestrict with value: " + ageRestrictSetting)
      ageRestrictSettingInput.checked = ageRestrictSetting;

      // do this when we close the settings
      let closeSettings = function () {
        // testSetting
        resultsPerPageValue = parseInt(resultsPerPageInput.value);
        if (resultsPerPageValue < 0) resultsPerPageValue = 0;
        if (resultsPerPageValue > 320) resultsPerPageValue = 320; // this is e621's upper limit
        // TODO: check this against derpi's limit
        console.log("Saving resultsPerPage with value: " + resultsPerPageValue);
        writeCookie("resultsPerPage", resultsPerPageValue.toString());

        // disableAgeRestrict
        console.log("Saving disableAgeRestrict with value: " + ageRestrictSettingInput.checked);
        writeCookie("disableAgeRestrict", ageRestrictSettingInput.checked.toString());

        // this will only be necessary for certain changes
        // reloadPage()
      }

      // overlay('off') will call closeSettings()
      saveSettingsButton.onclick = function () { overlay('off'); };

      // show the modal
      overlay('on', {
        'onclose': closeSettings,
      }, settingsActive);
    }

    // put the search query into the searchbox
    if (currentQuery.has("search")) {
      searchBox.value = currentQuery.get("search") as string;
    }

  })

// automatically populate results if there is a search query
let search = currentQuery.get("search") as string;
if (currentQuery.has("search") && search != "") {

  console.log("Search query found: " + search);

  // this will be an e6 search
  if (currentApi == API.E621) {
    // TODO: separate common tasks into functions for easy porting to other APIs

    // TODO: use user's API key from settings
    let url =
      "https://e621.net/posts.json?page=" + currentPage
      + "&limit=" + pageSize
      + "&tags=" + search.replace(/ /g, '%20')

    // add the rating:safe tag if the user hasn't allowed 18+ results
    if (!(readCookie("disableAgeRestrict") === 'true')) {
      console.log("User has not enabled 18+ content. Adding safe tag...");
      url += "%20rating:safe";
    }

    console.log("Request URL: " + url);

    // TODO: detect when this finishes so a loading wheel can be displayed
    // display the wheel as soon as we detect a search, hide it once packery is populated

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

          // TODO: handle filetypes that don't show in <img> tags
          // TODO: user setting to display full res or preview
          htmlString +=
            "<img class=\"outline drophover grid-item\" src=\"" + currentImage.file.url + "\">"
        }

        // prepare the page switchers
        pageSwitcher.style.display = "flex";
        pageSwitcherBottom.style.display = "flex";
        pageNumberDisplay.innerHTML = currentPage.toString();

        // copy the page switcher below the image grid
        pageSwitcherBottom.innerHTML = pageSwitcher.innerHTML;

        // gather all of the page switcher buttons
        pageNext = document.getElementsByName("pageNext");
        pagePrevious = document.getElementsByName("pagePrevious");

        // make the page buttons work
        for (let i = 0; i < pageNext.length; i++) {
          pageNext[i].onclick = function (event) {
            currentQuery.set("page", (++currentPage).toString());
            reloadPage();
          }
        }

        for (let i = 0; i < pagePrevious.length; i++) {
          pagePrevious[i].onclick = function (event) {
            currentQuery.set("page", (--currentPage).toString());
            reloadPage();
          }
        }

        // shove all of the images into the grid
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

