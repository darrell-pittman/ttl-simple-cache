"use strict"


const privateProps = new WeakMap();

function TimeToLive(ttlSeconds) {
  
  privateProps.set(this, {
    ttlMilleseconds : ttlSeconds * 1000,
    allowStaleGet : false
  }) 
  
  var keys = new Map()
  
  var isExpired = (key, cache) => {
    if(keys.has(key)) {
      let time = new Date().getTime() - keys.get(key)
      return (time > privateProps.get(this).ttlMilleseconds)
    }
    return false;
  }
  
  this.valueAdded = function(key){
    keys.set(key, new Date().getTime())
  }
  
  this.isInvalid = function(key, cleaning) {
    let props = privateProps.get(this)
    if( !!cleaning ||!props.allowStaleGet) {
      return isExpired(key)
    } else {
      return false
    }
  }
  
  
  
}

TimeToLive.prototype.allowStaleGet = function() {
  let props = privateProps.get(this)
  props.allowStaleGet = true
  return this
}

module.exports = TimeToLive