"use strict"

debugger;

var expect = require("chai").expect
var util = require('./util')

var simpleCache = require("../index")




describe("LRU Test", function(){
  
  
   describe("Retrieve before max size", function(){
    it("never invalidates keys", function(){
      let lru = new simpleCache.LRU(2)
      lru.valueAdded('key1')
      lru.valueAdded('key2')
      expect(false).to.equal(lru.isInvalid('key1'))  
      expect(false).to.equal(lru.isInvalid('key2'))  
    })    
  })
  
  
  describe("Retrieve after max size", function(){
    it("should invalidate lru keys", function(){
      let lru = new simpleCache.LRU(5)
      lru.valueAdded('key1')
      lru.valueAdded('key2')
      lru.valueAdded('key3')
      lru.valueAdded('key4')
      lru.valueAdded('key5')      
      lru.isInvalid('key5')
      lru.isInvalid('key4')
      lru.isInvalid('key3')
      lru.isInvalid('key2')      
      lru.valueAdded('key6')     
      
      expect(true).to.equal(lru.isInvalid('key1'))  
       
      lru.valueAdded('key1')
      
      expect(true).to.equal(lru.isInvalid('key5'))  
      
      lru.valueAdded('key7')
      lru.valueAdded('key8')
      
      expect(true).to.equal(lru.isInvalid('key4'))  
      expect(true).to.equal(lru.isInvalid('key3'))  
      
    })    
  })
  
  describe("AllowStaleGet", function(){
    it("should return valid key even if it has been expelled when not cleaning", function(){
      let lru = new simpleCache.LRU(2).allowStaleGet()
      lru.valueAdded('key1')
      lru.valueAdded('key2')
      lru.valueAdded('key3')
      expect(false).to.equal(lru.isInvalid('key1'))  
      expect(false).to.equal(lru.isInvalid('key2')) 
      expect(false).to.equal(lru.isInvalid('key3'))  
    })    
  })
  
  describe("AllowStaleGet", function(){
    it("should return invalid key if it has been expelled and we are cleaning", function(){
      let lru = new simpleCache.LRU(2).allowStaleGet()
      lru.valueAdded('key1')
      lru.valueAdded('key2')
      lru.valueAdded('key3')
      expect(true).to.equal(lru.isInvalid('key1', true))  
      expect(false).to.equal(lru.isInvalid('key2', true)) 
      expect(false).to.equal(lru.isInvalid('key3', true))  
    })    
  })
  
})