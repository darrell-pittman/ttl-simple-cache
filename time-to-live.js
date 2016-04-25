"use strict"


const privateProps = new WeakMap();

function TimeToLive(ttlSeconds) {
  
  privateProps.set(this, {
    
    ttlMilleseconds : ttlSeconds * 1000,
    
    allowStaleGet : false,
    
    keys : new Map(),
    
    isExpired : function(key, cache) {
      if(this.keys.has(key)) {
        let time = new Date().getTime() - this.keys.get(key)
        return (time > this.ttlMilleseconds)
      }
      return false;
    }
  })   
}

TimeToLive.prototype.valueAdded = function(key){
  let props = privateProps.get(this)
  props.keys.set(key, new Date().getTime())
}

TimeToLive.prototype.isInvalid = function(key, cleaning) {
  let props = privateProps.get(this)
  if( !!cleaning ||!props.allowStaleGet) {
    return props.isExpired(key)
  } else {
    return false
  }
}
  

TimeToLive.prototype.allowStaleGet = function() {
  let props = privateProps.get(this)
  props.allowStaleGet = true
  return this
}

module.exports = TimeToLive