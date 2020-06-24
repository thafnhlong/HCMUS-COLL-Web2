const LRU = require('lru-cache');
module.exports = new LRU({
  max: 500,
  maxAge: 1000 * 60
})