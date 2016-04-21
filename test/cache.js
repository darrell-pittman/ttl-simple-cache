"use strict"

var expect    = require("chai").expect;
var Cache = require('../index').Cache
var util = require('./util')

describe("Cache Test", function(){
  
  describe("Get", function(){
    it(" should return correct value", function(done){
      
      let cache = new Cache(util.validCacheGetter)

      cache.get("key-test").then(function(data){
        util.check(done, () => expect(data).to.equal('Retrieved Result: key-test')) 
      })  
      
    })
    
  })
  
  describe("Get multiple times", function(){
    it("should return correct value", function(done){
      
      let cache = new Cache(util.validCacheGetter)

      cache.get("key-test1").then(function(data){
        return cache.get('key-test2')
      }).then(function(data){
        return cache.get('key-test1')
      }).then(function(data){
        util.check(done, () => expect(data).to.equal('Retrieved Result: key-test1'))
      })
      
    })
    
  })
  
  describe("Concurrent gets", function(){
    it("should only use one call to valueGetter", function(done){
      
      let cache = new Cache(util.newCountingGetter(100))

      cache.get("key-test").then(function(data){
        return data
      })
      
      cache.get("key-test").then(function(data){
        return data
      })
      
      cache.get("key-test").then(function(data){
        util.check(done, () => expect(data).to.equal('Number of Gets: 1'))
      })
      
      
      
    })
    
  })
  
  describe("Remove", function(){
    it("should cause a refresh", function(done){
      
      let cache = new Cache(util.newCountingGetter())

      cache.get("key-test").then(function(data){
        cache.remove('key-test')
        return cache.get('key-test')
      }).then(function(data){
        util.check(done, () => expect(data).to.equal('Number of Gets: 2'))
      })
      
    })
    
  })
  
  describe("Has", function(){
    it("should return true for cached key", function(done){
      
      let cache = new Cache(util.validCacheGetter)

      cache.get("key-test").then(function(data){
        util.check(done, () => expect(true).to.equal(cache.has('key-test')))
      })
      
    })
    
  })
  
  describe("Has", function(){
    it("should return false for non-cached key", function(done){
      
      let cache = new Cache(util.validCacheGetter)

      cache.get("key-test").then(function(data){
        util.check(done, () => expect(false).to.equal(cache.has('key-test-1')))
      })
      
    })
    
  })
  
  describe("Manual Set", function(){
    it("should return correct value", function(done){
      
      let cache = new Cache(util.newCountingGetter())
      cache.set('key-test', 'manual')
      cache.get("key-test").then(function(data){
        util.check(done, () => expect(data).to.equal('manual'))
      })
      
    })
    
  })
  
    
  describe("Size", function(){
    it("return correct value", function(done){
      
      let cache = new Cache(util.validCacheGetter)

      cache.get("key-test1").then(function(data){
        return cache.get('key-test2')
      }).then(function(data){
        return cache.get('key-test3')
      }).then(function(data){
        util.check(done, () => expect(cache.size).to.equal(3))
      })
      
    })
    
  })
  
  describe("Size", function(){
    it("is readonly", function(){

      let cache = new Cache(util.validCacheGetter)

      expect(()=>cache.size=1).to.throw();

    })

  })
  
  describe("Invalidate", function(){
    it("should empty cache", function(done){

      let cache = new Cache(util.validCacheGetter)

      cache.get('key').then(function(result){
        cache.invalidate()
        util.check(done, () => expect(cache.size).to.equal(0))
      })

    })

  })
  
})