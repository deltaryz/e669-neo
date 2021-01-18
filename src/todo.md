- add masonry
- `npm install masonry-layout --save`
- also use imagesLoaded
- `npm install imagesloaded --save`
- docs: https://masonry.desandro.com/options.html

```js
// init Masonry
var grid = document.getElemenById('grid').masonry({
  // options...
});
// layout Masonry after each image loads
grid.imagesLoaded().progress( function() {
  grid.masonry('layout');
});
```

- use csswand for animations
- https://www.csswand.dev

- implement settings page w/ cookie config saving
- implement gdpr cookie notice
  - https://medium.com/better-programming/implement-a-cookie-consent-notification-within-5-minutes-82c845c55487
  - https://github.com/osano/cookieconsent

- add auto-convert function for e621 <-> derpi tags
