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
