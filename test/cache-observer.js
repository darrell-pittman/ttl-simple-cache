"use strict"
debugger;

var expect = require("chai").expect
var util = require('./util')

var simpleCache = require("../index")

describe("Cache Observer Test", function(){
  
  describe("Cache size after clean", function(){
    it("should be 0", function(done){
      let cache = new simpleCache.Cache(util.newCountingGetter())
      
      let ttl = new simpleCache.TimeToLive(.01)

      let observer = new simpleCache.CacheObserver(ttl).cleanInterval(.01)   
     
      observer.start(cache) 

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

      let ttl = new simpleCache.TimeToLive(.01)
      let observer = new simpleCache.CacheObserver(ttl).cleanInterval(.02)

      observer.start(cache)
      
      cache.get("key1").then(function(data){
        setTimeout(function(){
          util.check(done, () => expect(1).to.equal(cache.size))  
        }, 15)        
      })  
      
    })    
  })
 
  
  
  describe("Non-cleaning Stop", function(){
    it("should prevent refresh", function(done){
      
      let cache = new simpleCache.Cache(util.newCountingGetter())

      let ttl = new simpleCache.TimeToLive(.01)
      
      let observer = new simpleCache.CacheObserver(ttl)
      
      observer.start(cache)
      
      cache.get("key1").then(function(data){
        observer.stop(cache)
        setTimeout(function(){
          cache.get("key1").then(function(result){
            util.check(done, () => expect(result).to.equal('Number of Gets: 1'))            
          })
        }, 15)
        
      })  
      
    })    
  })
  
  describe("Cleaning Stop", function(){
    it("should prevent refresh", function(done){
      
      let cache = new simpleCache.Cache(util.newCountingGetter())

      let ttl = new simpleCache.TimeToLive(.01)
      
      let observer = new simpleCache.CacheObserver(ttl).cleanInterval(.02)
      
      observer.start(cache)
      
      cache.get("key1").then(function(data){
        observer.stop(cache)
        setTimeout(function(){
          cache.get("key1").then(function(result){
            util.check(done, () => expect(result).to.equal('Number of Gets: 1'))            
          })
        }, 25)        
      })  
      
    })    
  }) 

  describe("Setting AllowStaleGet without cleanInterval", function(){
    it("should throw exception", function(){
      
      let ttl = new simpleCache.TimeToLive(.01)
      
      expect(new simpleCache.CacheObserver(ttl).allowStaleGet).to.throw(Error)
      
    })
    
  }) 
  
  describe("Setting AllowStaleGet", function(){
    it("should return invalid value before clean fires", function(done){
      

      let cache = new simpleCache.Cache(util.newCountingGetter())

      let ttl = new simpleCache.TimeToLive(.01)
      
      let observer = new simpleCache.CacheObserver(ttl).cleanInterval(.02).allowStaleGet()

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
  
  
  describe("Setting AllowStaleGet", function(){
    it("should return new value after clean fires", function(done){
      

      let cache = new simpleCache.Cache(util.newCountingGetter())

      let ttl = new simpleCache.TimeToLive(.01)
      
      let observer = new simpleCache.CacheObserver(ttl).cleanInterval(.02).allowStaleGet()

      observer.start(cache)      

      cache.get("key1").then(function(data){
        setTimeout(function(){
          cache.get("key1").then(function(result){
            util.check(done, () => expect(result).to.equal('Number of Gets: 2'))            
          })
        }, 100)        
      })         
      
    })
    
  }) 
  
  
})
