### Derpibooru & E621 API Cheat Sheet
### Written by deltaryz

# Derpibooru
## URL Parameters
* `key` - [API Key](https://derpibooru.org/registrations/edit)
* `page` - displayed page
* `per_page` - # of results per page
* `q` - current search query (same syntax as site)
* `sd` - sort direction (default descending)
* `sf` - sort field (default image id)

## API URL
`https://derpibooru.org/api/v1/json/search/images`

## JSON Structure
- `images:` (array, each element contains the following:)
  - `format`
    - `jpg`, `png`, `gif`
  - `representations:`
    - `full, large, medium,`
    - `small, tall, thumb,`
    - `thumb_small, thumb_tiny`
    - contents are direct image URLs
    - use `full` for original
  - `asprect_ratio`
    - as number
  - `tags:`
    - array of strings
  - `created_at`
    - example: `2021-01-17T04:01:13`
    - format: `YYYY-MM-DDTHH:MM:SS`
  - `description`
  - `upvotes`
  - `downvotes`
  - `score`
  - `id`
  - `height`
  - `width`
- `total` (# of total results)

  `images.length` should correspond to the page size.
  
  Several fields have been omitted, as they are probably irrelevant to e669's functionality.

# e621
## URL Parameters
* `login` - username
* `api_key` - api key

## API URL
`https://e621.net/posts.json`
