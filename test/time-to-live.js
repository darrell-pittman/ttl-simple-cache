"use strict"
debugger;

var expect = require("chai").expect
var util = require('./util')

var simpleCache = require("../index")




describe("Time To Live Test", function(){
  
  describe("Retrieve before ttl expires", function(){
    it("only calls cache getter once", function(done){
      
     let cache = new simpleCache.Cache(util.newCountingGetter())

      let ttl = new simpleCache.TimeToLive(.01)

      ttl.start(cache)

      cache.get("key1").then(function(data){
        
        setTimeout(function(){
          cache.get("key1").then(function(result){
            util.check(done, () => expect(result).to.equal('Number of Gets: 1'))
          })
        }, 5)
        
      })  
      
    })
    
  })
  
  describe("Retrieve after ttl expires", function(){
    it("calls cache getter again", function(done){
      
      let cache = new simpleCache.Cache(util.newCountingGetter())

      let ttl = new simpleCache.TimeToLive(.01)

      ttl.start(cache)
      
      cache.get("key1").then(function(data){
        setTimeout(function(){
          cache.get("key1").then(function(result){
            util.check(done, () => expect(result).to.equal('Number of Gets: 2'))            
          })
        }, 15)
        
      })  
      
    })
    
  })
  
  describe("Cache size after clean", function(){
    it("should be 0", function(done){
      
      let cache = new simpleCache.Cache(util.newCountingGetter())

      let ttl = new simpleCache.TimeToLive(.01).cleanInterval(.01)

      ttl.start(cache)
      
      cache.get("key1").then(function(data){
        setTimeout(function(){
          util.check(done, () => expect(0).to.equal(cache.size))          
        }, 25)        
      })  
      
    })
    
  })
  
  
  describe("Cache size before clean", function(){
    it("should be 1", function(done){
      
      let cache = new simpleCache.Cache(util.newCountingGetter())

      let ttl = new simpleCache.TimeToLive(.01).cleanInterval(.02)

      ttl.start(cache)
      
      cache.get("key1").then(function(data){
        setTimeout(function(){
          util.check(done, () => expect(1).to.equal(cache.size))  
        }, 15)        
      })  
      
    })
    
  })
  
  
  describe("Stop", function(){
    it("should prevent refresh", function(done){
      
      let cache = new simpleCache.Cache(util.newCountingGetter())

      let ttl = new simpleCache.TimeToLive(.01)

      ttl.start(cache)
      
      cache.get("key1").then(function(data){
        ttl.stop(cache)
        setTimeout(function(){
          cache.get("key1").then(function(result){
            util.check(done, () => expect(result).to.equal('Number of Gets: 1'))            
          })
        }, 15)
        
      })  
      
    })
    
  })

})
    
    
  
