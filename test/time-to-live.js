"use strict"
debugger;

var expect = require("chai").expect
var util = require('./util')

var simpleCache = require("../index")




describe("Time To Live Test", function(){
  
  
  describe("Before ttl expires", function(){
    it("keys should be valid", function(done){
      let ttl = new simpleCache.TimeToLive(.01)
      ttl.valueAdded('key1')
      
      setTimeout(function(){
        util.check(done, () => expect(ttl.isInvalid('key1')).to.equal(false))
      }, 5)     
      
    })
    
  })
  
  describe("After ttl expires", function(){
    it("keys should be invalid", function(done){
      
      let ttl = new simpleCache.TimeToLive(.01)       
      ttl.valueAdded('key1')    
      
      setTimeout(function(){
        util.check(done, () => expect(ttl.isInvalid('key1')).to.equal(true))  
      }, 15)     
      
    })
    
  })
  
  describe("Setting AllowStaleGet", function(){
    it("should allow valid key after expiration is AllowStaleGet", function(done){
      
      let ttl = new simpleCache.TimeToLive(.01).allowStaleGet()       
      ttl.valueAdded('key1')    
      
      setTimeout(function(){
        util.check(done, () => expect(ttl.isInvalid('key1')).to.equal(false))  
      }, 15)     
      
    })
    
  }) 
  
  
  describe("Setting AllowStaleGet and cleaning", function(){
    it("should return invalid key", function(done){
      
      let ttl = new simpleCache.TimeToLive(.01).allowStaleGet()       
      ttl.valueAdded('key1')    
      
      setTimeout(function(){
        util.check(done, () => expect(ttl.isInvalid('key1', true)).to.equal(true))  
      }, 15)     
      
    })
    
  }) 
  
  
 
})
    
    
  
