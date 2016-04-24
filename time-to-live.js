"use strict"


const privateProps = new WeakMap();

function TimeToLive(ttlSeconds) {
  
  privateProps.set(this, {
    ttlMilleseconds : ttlSeconds * 1000
  }) 
  
  var map = new Map();
  
  var cleaning = false
  
  var getCacheMap = (cache) => {
    if(!map.has(cache)){
      map.set(cache, new Map())
    }
    return map.get(cache)
  }
  
  var isExpired = (key, cache) => {
    let cacheMap = getCacheMap(cache)
    if(cacheMap.has(key)) {
      let time = new Date().getTime() - cacheMap.get(key)
      return (time > privateProps.get(this).ttlMilleseconds)
    }
    return false;
  }
  
  var remove = (key, cache) => {
    getCacheMap(cache).delete(key)
    cache.remove(key)
  }
  
  var beforeGet = (key, cache, force) => {
    force = !!force || !privateProps.get(this).allowStaleGet
    if (force){
      if (isExpired(key, cache)) {
        remove(key, cache)
      }
    }
  }
  
  
  var afterSet = (key, cache) => {
    getCacheMap(cache).set(key, new Date().getTime())
  }
  
  function clean(cache) {
    let cacheMap = getCacheMap(cache)
    cacheMap.forEach(function(value, key){
      setImmediate(function(){
        beforeGet(key, cache, true)
      })
    })    
  }

  this.start = function(cache){
    cache.on('beforeGet', beforeGet);
    cache.on('afterSet', afterSet);
    let cleanIntervalMilleseconds = privateProps.get(this).cleanIntervalMilleseconds
    cleaning = (cleanIntervalMilleseconds && +cleanIntervalMilleseconds > 0) 
    var _clean = () => {
      if(cleaning) {
        clean(cache)      
        setTimeout(_clean, cleanIntervalMilleseconds)
      }
    }
    
    if(cleaning){
      setTimeout( _clean, privateProps.get(this))
    }
    return this
  }
  
  this.stop = function(cache){
    cache.removeListener('beforeGet', beforeGet);
    cache.removeListener('afterSet', afterSet);
    cleaning = false
    return this
  }
  
}

TimeToLive.prototype.cleanInterval = function(cleanIntervalSeconds, allowStaleGet) {
  let props = privateProps.get(this)
  props.cleanIntervalMilleseconds = cleanIntervalSeconds * 1000
  props.allowStaleGet = !!cleanIntervalSeconds && !!allowStaleGet
  return this
}

module.exports = TimeToLive