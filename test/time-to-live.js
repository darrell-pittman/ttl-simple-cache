"use strict"
debugger;

var expect = require("chai").expect
var util = require('./util')

var simpleCache = require("../index")




describe("Time To Live Test", function(){
  
  
  describe("Retrieve before ttl expires", function(){
    it("only calls cache getter once", function(done){
      let cache = new simpleCache.Cache(util.newCountingGetter())

      let observer = new simpleCache.CacheObserver(new simpleCache.TimeToLive(.01))

      observer.start(cache)

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
      let observer = new simpleCache.CacheObserver(ttl)
      
      observer.start(cache)
      
      cache.get("key1").then(function(data){
        setTimeout(function(){
          cache.get("key1").then(function(result){
            util.check(done, () => expect(result).to.equal('Number of Gets: 2'))            
          })
        }, 15)
        
      })  
      
    })
    
  })
  
  describe("Setting AllowStaleGet", function(){
    it("should allow stale key retrieval before cleanInterval fires", function(done){
      
      let cache = new simpleCache.Cache(util.newCountingGetter())
      let ttl = new simpleCache.TimeToLive(.01).allowStaleGet()
      let observer = new simpleCache.CacheObserver(ttl).cleanInterval(.02)     
      
     
      observer.start(cache)
      
      cache.get("key1").then(function(data){
        setTimeout(function(){
          cache.get("key1").then(function(result){
            util.check(done, () => expect(result).to.equal('Number of Gets: 1'))            
          })
        }, 15)
        
      })  
      
    })
    
  }) 
  
  
  
  
 
})
    
    
  
