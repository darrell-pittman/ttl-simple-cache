"use strict"


const privateProps = new WeakMap();

function TimeToLive(ttlSeconds) {
  
  privateProps.set(this, {
    
    ttlMilleseconds : ttlSeconds * 1000,
    
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

TimeToLive.prototype.isInvalid = function(key) {
  let props = privateProps.get(this)
  return props.isExpired(key)  
}
  


module.exports = TimeToLive
