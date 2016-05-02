"use strict"

const privateProps = new WeakMap();


function LRU (maxSize) {
  privateProps.set(this, {
    maxSize : maxSize,
    allowStaleGet : false,
    keys : [],
    invalidKeys : []
  })
}

LRU.prototype.valueAdded = function(key) {
  let props = privateProps.get(this)
  let keys = props.keys
  let invalidKeys = props.invalidKeys
  
  if (keys.length == props.maxSize) {
    invalidKeys.push(keys.pop())
  }
  keys.unshift(key)  
}

LRU.prototype.isInvalid = function(key) {
  let props = privateProps.get(this)
  let keys = props.keys
  let invalidKeys = props.invalidKeys
  
  
  let invalid = false
  let idx = props.invalidKeys.indexOf(key)
  if (idx >= 0){
    invalidKeys.splice(idx,1)
    invalid = true
  }

  if(!invalid) {
    idx = keys.indexOf(key)
    if(idx > 0){
      let item = keys.splice(idx,1)[0]
      keys.unshift(item)
    }
  }

  return invalid
  
}

module.exports = LRU
