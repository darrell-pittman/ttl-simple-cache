"use strict"

module.exports = {
  check : (done, f) => {
    try {
      f()
      done()
    } catch (e) {
      done(e)
    }
  },
  newCountingGetter : (delay) => {
    var counter = new Map();

    function increment(key) {
      if(!counter.has(key)){
        counter.set(key, 0)
      }
      let count = +counter.get(key)
      counter.set(key, ++count)
      return counter.get(key)
    }

    return function(key, resume) {
      setTimeout(function(){
        resume(null,`Number of Gets: ${increment(key)}`)
      }, delay||0)      
    }
  },
  validCacheGetter : (key, resume) => {
  
    let result = `Retrieved Result: ${key}`
    resume(null, result)

  }
  
}