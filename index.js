"use strict"

var EventEmitter = require('events').EventEmitter;
var sync = require('generator-runner');
var ValueCollection = require('./value-collection')
var util = require('util');

const privateProps = new WeakMap();


function Cache (valueGetter) {
  
  EventEmitter.call(this)

  privateProps.set(this, {
    valueGetter : valueGetter,
    cache : new Map(),
    inProgress : new ValueCollection(),
    set : function(key, value, cache){
      privateProps.get(cache).cache.set(key, value)
      cache.emit('afterSet', key, cache)
    }
  }) 
    
}

util.inherits(Cache, EventEmitter)



Cache.prototype.get = function (key) {
  this.emit('beforeGet', key, this);
  var that = this
  if(this.has(key)) {
    return new Promise(resolve => resolve(privateProps.get(this).cache.get(key)));
  } else {    
    return new Promise((resolve, reject) => {
      if(privateProps.get(this).inProgress.set(key, resolve).length == 1){
        sync(function* (resume){
          try {
            var value = yield function(resume){
              privateProps.get(that).valueGetter(key, resume)
            }
            privateProps.get(that).set(key, value, that)
            privateProps.get(that).inProgress.map(key, function(cachedResolve){
              cachedResolve(value)
            })        
  
          } catch(ex) {
            reject(ex)
          } finally {
            privateProps.get(that).inProgress.remove(key)
          }
        })
      }      
    })

  }
  return value  
}

Cache.prototype.remove = function (key) {
  this.emit('beforeRemove', key, this);
  return privateProps.get(this).cache.delete(key)
}

Cache.prototype.has = function (key) {
  return privateProps.get(this).cache.has(key)
}

Cache.prototype.set = function (key, value) {
  return privateProps.get(this).set(key, value, this)
}

Cache.prototype.invalidate = function () {
  privateProps.get(this).cache.clear()
}

Object.defineProperty(Cache.prototype, 'size',{
  get : function() {
    return privateProps.get(this).cache.size
  }
})

Object.defineProperty(Cache.prototype, 'keys',{
  get : function() {
    return privateProps.get(this).cache.keys()
  }
})

module.exports = {
  Cache : Cache,
  TimeToLive : require('./time-to-live'),
  CacheObserver : require('./cache-observer')
}