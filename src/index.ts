// e669-neo
// © 2023 Cameron Seid

let defaultCorsProxy = "https://cors.e669.fun/";

// Reads a cookie from the browser
let readCookie = function (key: string): string | null {

  if (
    document.cookie.split(";").some((item) => item.trim().startsWith(key + "="))
  ) {
    // cookie exists, return text
    return document.cookie.substring(document.cookie.indexOf(key) + key.length + 1).split(";")[0];
  } else {
    // cookie does not exist, return null
    return null
  }

}

// TODO: GDPR notice about this
// Writes a cookie to the browser
let writeCookie = function (key: string, value: string) {
  document.cookie = key + "=" + value + "; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
}

// this generic post object allows us to interface with posts regardless of which API they came from
// TODO: tags should be its own object (interface?) with some per-tag metadata (category, button color)
class Post {
  constructor(
    public fileUrl: string, // direct link to file
    public pageUrl: string, // page URL on original site
    public previewUrl: string, // smallest preview
    public sampleUrl: string, // middle preview
    public hasSample: boolean, // does it have a sample? fallback to preview if not
    public fileType: string, // file extension
    public width: number, // width
    public height: number, // height
  ) { }
}

// init user settings, reading from cookies if they exist
let userSettings = new Map<string, string>([
  // Results per page
  ["pageSize", readCookie('pageSize') || "30"],
  // Grid size on small screens
  ["gridSizeSmall", readCookie('gridSizeSmall') || "49"],
  // Grid size on large screens
  ["gridSizeLarge", readCookie('gridSizeLarge') || "23.5"],
  // Allow 18+ results
  ["disableAgeRestrict", readCookie('disableAgeRestrict') || "false"],
  // URL of cors proxy (https://github.com/Rob--W/cors-anywhere)
  // PORT=8765 CORSANYWHERE_WHITELIST="https://e669.fun" node server.js
  ["corsProxy", readCookie('corsProxy') || defaultCorsProxy],
  // will the grid show full res or preview?
  ["previewSize", readCookie('previewSize') || "full"],
  // Derpibooru API key
  ["derpiApiKey", readCookie('derpiApiKey') || ""],
]);

console.log(userSettings);

// for each value in userSettings, write a cookie
let writeSettingsToCookies = function () {
  console.log("Writing settings to cookies", userSettings);
  userSettings.forEach(function (value, key, map) {
    writeCookie(key, value);
  })
}

// Maps the number of columns to the grid size value necessary to achieve it
let gridSizeReference = new Map<number, string>([
  [1, "100"],
  [2, "49"],
  [3, "32"],
  [4, "23.5"],
  [5, "18.4"],
]);

const Packery = require('packery');
const imagesLoaded = require('imagesLoaded');
const overlay = require('muicss/lib/js/overlay');

// global variables
// i have no fucking idea why but if i try to remove the 'export' on this,
// imagesLoaded fails to load. 
export let currentQuery = new URLSearchParams(window.location.search); // use .get(), .has()
let currentPage: number = parseInt(currentQuery.get("page") || "1"); // default to 1
currentQuery.set("page", currentPage.toString());

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

enum API {
  E621,
  DERPIBOORU,
}

let currentApi: API = API.E621;

// reload page with new parameters
let reloadPage = function () {

  let newLocation = window.location.toString();
  newLocation = newLocation.replace('/#', '/'); // sometimes we get a # at the end that fucks things up

  location.href =
    newLocation.split("?")[0] +
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
      // TODO: reset to defaults button

      // clone the settings modal to a temporary copy
      // we have to do this because mui deletes it when we close the modal
      let settingsActive = settingsModal.cloneNode(true) as HTMLElement;
      document.body.appendChild(settingsActive);
      settingsActive.hidden = false;

      // grab the fields from the copy
      let pageSizeInput = settingsActive.querySelector("#pageSizeInput") as HTMLInputElement;
      let saveSettingsButton = settingsActive.querySelector("#saveSettings") as HTMLButtonElement;
      let ageRestrictSettingInput = settingsActive.querySelector("#ageRestrictSettingInput") as HTMLInputElement;
      let corsProxyInput = settingsActive.querySelector("#corsProxyInput") as HTMLInputElement;
      let largeDisplayButtons = Array.from(settingsActive.querySelectorAll("input[name='largeDisplayColumns']")) as HTMLInputElement[];
      let smallDisplayButtons = Array.from(settingsActive.querySelectorAll("input[name='smallDisplayColumns']")) as HTMLInputElement[];
      let imageSizeButtons = Array.from(settingsActive.querySelectorAll("input[name='imageSize']")) as HTMLInputElement[];
      let derpiApiKeyInput = settingsActive.querySelector("#derpiApiKeyInput") as HTMLInputElement;

      // populate the inputs with the existing settings
      pageSizeInput.value = userSettings.get("pageSize") || "30";
      corsProxyInput.value = userSettings.get("corsProxy") || defaultCorsProxy;
      derpiApiKeyInput.value = userSettings.get("derpiApiKey") || "";

      let ageRestrictSetting = false;
      if (userSettings.get("disableAgeRestrict") === 'true') {
        ageRestrictSetting = true;
      }

      ageRestrictSettingInput.checked = ageRestrictSetting;

      // do this when we close the settings
      let closeSettings = function () {

        // check pageSize and make sure it's within a valid range
        let pageSizeValue = parseInt(pageSizeInput.value);
        if (pageSizeValue < 0) pageSizeValue = 0;
        if (pageSizeValue > 320) pageSizeValue = 320; // this is e621's upper limit
        // TODO: check this while doing the search
        // TODO: check this against derpi's limit

        // check the large display columns buttons
        let largeDisplayValue: number = 0;
        for (const radioButton of largeDisplayButtons) {
          if (radioButton.checked) {
            largeDisplayValue = parseInt(radioButton.value);
            break;
          }
        }

        // check the small display columns buttons
        let smallDisplayValue: number = 0;
        for (const radioButton of smallDisplayButtons) {
          if (radioButton.checked) {
            smallDisplayValue = parseInt(radioButton.value);
            break;
          }
        }

        // check the preview size buttons
        let imageSizeValue: string = "full";
        for (const radioButton of imageSizeButtons) {
          if (radioButton.checked) {
            imageSizeValue = radioButton.value;
            break;
          }
        }

        // make sure the CORS proxy URL has a slash at the end
        let corsProxyValue = corsProxyInput.value;
        if (!corsProxyValue.endsWith('/')) corsProxyValue += '/';

        // update settings object
        userSettings.set("pageSize", pageSizeValue.toString());
        userSettings.set("disableAgeRestrict", ageRestrictSettingInput.checked.toString());
        userSettings.set("corsProxy", corsProxyValue);
        userSettings.set("gridSizeLarge", gridSizeReference.get(largeDisplayValue) || "23.5");
        userSettings.set("gridSizeSmall", gridSizeReference.get(smallDisplayValue) || "49");
        userSettings.set("previewSize", imageSizeValue);
        userSettings.set("derpiApiKey", derpiApiKeyInput.value);

        // write these into the cookies
        writeSettingsToCookies();

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
let search: string = currentQuery.get("search") || "";
if (search != "") {

  console.log("Search query found: " + search);

  // this will be an e6 search
  if (currentApi == API.E621) {
    // TODO: separate common tasks into functions for easy porting to other APIs

    // TODO: use user's API key from settings
    let url =
      "https://e621.net/posts.json?page=" + currentPage
      + "&limit=" + userSettings.get("pageSize")
      + "&tags=" + search.replace(/ /g, '%20')

    // add the rating:safe tag if the user hasn't allowed 18+ results
    if (!(userSettings.get("disableAgeRestrict") === 'true')) {
      console.log("User has not enabled 18+ content. Adding safe tag...");
      url += "%20rating:safe";
    }

    console.log("Request URL: " + url);

    // TODO: detect when this finishes so a loading wheel can be displayed
    // display the wheel as soon as we detect a search, hide it once packery is populated

    // send the request
    fetch(userSettings.get("corsProxy") + url)
      .then(function (response) {
        return response.json();
      })
      .then(function (results) {
        resultsE621 = results.posts;

        if (resultsE621.length < 1) showError(new Error("No results received."));

        // cycle through each result
        for (let i = 0; i < resultsE621.length; i++) {

          let currentPost = new Post(
            resultsE621[i].file.url,
            "https://e621.net/posts/" + resultsE621[i].id,
            resultsE621[i].preview.url,
            resultsE621[i].sample.url,
            resultsE621[i].sample.has,
            resultsE621[i].file.ext,
            resultsE621[i].file.width,
            resultsE621[i].file.height
          )

          const imgElement = document.createElement("img");
          imgElement.classList.add("outline", "drophover", "grid-item");

          // SWFs and webms don't show in <img> tags, so we handle those separately
          switch (currentPost.fileType) {
            case "swf":
            case "webm":
              // TODO: overlay to indicate this is a webm
              if (currentPost.hasSample) {
                imgElement.setAttribute("src", currentPost.sampleUrl);
              } else {
                // SWF files will display "Flash"
                imgElement.setAttribute("src", currentPost.previewUrl);
              }
              break;
            default:
              // check user setting for image size
              if (userSettings.get("previewSize") == "full") {
                imgElement.setAttribute("src", currentPost.fileUrl);
              } else {
                imgElement.setAttribute("src", currentPost.sampleUrl);
              }
              break;
          }

          // set up the post view modal
          imgElement.onclick = function () {
            console.log(currentPost);

            // TODO: construct the HTML elements with a method of the Post class
          }

          // add to grid
          imageDiv.appendChild(imgElement);
        }

        // TODO: move everything below here into a generic function that can be called from the other API handlers

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
  if (isMobile()) {
    resizeGrid(userSettings.get("gridSizeSmall") + "%");
  } else {
    resizeGrid(userSettings.get("gridSizeLarge") + "%");
  }

  // Add an event listener for the resize event
  window.addEventListener('resize', function (event) {

    if (!isMobile()) {
      resizeGrid(userSettings.get("gridSizeLarge") + "%");
    } else {
      resizeGrid(userSettings.get("gridSizeSmall") + "%");
    }

    pckry.layout();
  });

}
