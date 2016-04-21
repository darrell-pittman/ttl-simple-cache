"use strict"

function ValueCollection(){
  this.items = new Map();
  
}

ValueCollection.prototype.set= function (key, value) {
  if(this.items.has(key)){
    this.items.get(key).push(value)      
  } else {
    this.items.set(key,[value])      
  }
  return this.items.get(key)
}

ValueCollection.prototype.map= function (key, callback) {
   if(this.items.has(key)) {      
      var values = this.items.get(key)
      values.map(callback)      
    }
}

ValueCollection.prototype.remove = function (key) {
    if(this.items.has(key)) {
      this.items.delete(key)
    }
}

module.exports = ValueCollection

