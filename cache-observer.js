"use strict"

//Private

const assert = require('assert')
var Chunker = require('iterator-chunker')



var _allowStaleGet = false
var _intervalMilliseconds = -1
var _chunkSize = 10
var _algorithm, _cache


function beforeGet (key, cache, cleaning) {
  if( !!cleaning ||!_allowStaleGet) {
    if(_algorithm.isInvalid(key)) {
      cache.remove(key)
    } 
  }
}

function isCleaning() {
  return (_intervalMilliseconds && (_intervalMilliseconds > 0))
}

function afterSet (key, cache) {
  _algorithm.valueAdded(key)
}


function clean () {
  if(_intervalMilliseconds > 0) {
    
    let chunker = new Chunker(_chunkSize)
    
    chunker.on('chunk', function(chunk) {
      chunk.forEach(function(key){
        beforeGet(key, _cache, true)
      })
    })
    
    chunker.on('done', function() {
      setTimeout(function(){
        clean()
      }, _intervalMilliseconds)
    })
    
    chunker.chunk(_cache.keys)
    
  }
}

//Public

function CacheObserver(algorithm){ 
  _algorithm = algorithm  
}

CacheObserver.prototype.start = function (cache) {
  _cache = cache
  cache.on('beforeGet', beforeGet)
  cache.on('afterSet', afterSet)
  if(isCleaning()){
    setTimeout(function(){
      clean()
    }, _intervalMilliseconds)
  }
  return this
}

CacheObserver.prototype.stop = function () {
  _cache.removeListener('beforeGet', beforeGet)
  _cache.removeListener('afterSet', afterSet) 
  _intervalMilliseconds = -1
  _allowStaleGet = false
  return this
}

CacheObserver.prototype.cleanInterval = function (intervalSeconds) {
  _intervalMilliseconds = intervalSeconds * 1000
  return this
}

CacheObserver.prototype.chunkSize = function (chunkSize) {
  _chunkSize = chunkSize
  return this
}

CacheObserver.prototype.allowStaleGet = function() {
  
  assert(isCleaning(),'allowStaleGet cannot be set without a cleanInterval')
  _allowStaleGet = true
  return this
}

module.exports = CacheObserver
