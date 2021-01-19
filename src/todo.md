- add masonry
- `npm install masonry-layout --save`
- also use imagesLoaded
- `npm install imagesloaded --save`
- docs: https://masonry.desandro.com/options.html

```js
// init Masonry
var grid = document.getElemenById("grid").masonry({
  // options...
});
// layout Masonry after each image loads
grid.imagesLoaded().progress(function () {
  grid.masonry("layout");
});
```

## GOOD IDEA!!!

Slideshow queue - quickly and easily add images to a 'now playing queue' that can be viewed in a repeating slideshow

- Let user configure timing, fade style/duration, support images from both e6 and derpi
- potentially allow users to download a zip of images that existed in this queue

- make searchbox enter key work: https://stackoverflow.com/a/155263

- modals: https://www.muicss.com/docs/v1/css-js/overlay

- use either jquery (will benefit masonry kind of) or some other method of including html so we can have header.html and footer.html outside pages

```js
$(function () {
  // these will insert into div id="header"/"footer"
  $("#header").load("header.html");
  $("#footer").load("footer.html");
});
```

- use csswand for animations
- https://www.csswand.dev

- implement settings page w/ cookie config saving
- implement gdpr cookie notice

  - https://medium.com/better-programming/implement-a-cookie-consent-notification-within-5-minutes-82c845c55487
  - https://github.com/osano/cookieconsent

- add auto-convert function for e621 <-> derpi tags
