"use strict"

var Chunker = require('iterator-chunker')

const privateProps = new WeakMap()

function CacheObserver(algorthim){
  
  privateProps.set(this, {
    chunkSize : 10,
    intervalMilliseconds : -1,
    beforeGet : function (key, cache, cleaning) {
      if(algorthim.isInvalid(key, cleaning)) {
        cache.remove(key)
      } 
    },
    afterSet : function (key, cache) {
      algorthim.valueAdded(key)
    },
    clean : function () {
      var that = this
      if(this.intervalMilliseconds > 0) {
        
        let chunker = new Chunker(this.chunkSize)
        
        chunker.on('chunk', function(chunk) {
          chunk.forEach(function(key){
            that.beforeGet(key, that.cache, true)
          })
        })
        
        chunker.on('done', function() {
          setTimeout(function(){
            that.clean()
          }, that.intervalMilliseconds)
        })
        
        chunker.chunk(this.cache.keys)
        
      }
    }
  }) 
  
}

CacheObserver.prototype.start = function (cache) {
  let props = privateProps.get(this)
  props.cache = cache
  cache.on('beforeGet', props.beforeGet)
  cache.on('afterSet', props.afterSet)
  return this
}

CacheObserver.prototype.stop = function () {
  let props = privateProps.get(this)
  props.cache.removeListener('beforeGet', props.beforeGet)
  props.cache.removeListener('afterSet', props.afterSet) 
  props.intervalMilliseconds = -1
  return this
}

CacheObserver.prototype.cleanInterval = function (intervalISeconds) {
  let props = privateProps.get(this)
  let intervalMilliseconds = intervalISeconds * 1000
  props.intervalMilliseconds = intervalMilliseconds
  setTimeout(function(){
    props.clean()
  }, intervalMilliseconds)
  return this
}

CacheObserver.prototype.chunkSize = function (chunkSize) {
  let props = privateProps.get(this)
  props.chunkSize = chunkSize
  return this
}

module.exports = CacheObserver