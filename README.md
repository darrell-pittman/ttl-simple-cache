#simple-cache



A simple async cache. A valueGetter(err, result) function is supplied to Cache constructor. This function is responsible for providing values for keys when key is not found in cache.

Eg:


```
var Cache = require('simple-cache').Cache

var cache = new Cache(function valueGetter(key, resume){
  //Here is where you would make a REST request for example 
  //and then call resume with err or result
  //
  //For this example we are just using a timeout to simulate async
  
  setTimeout(function(){
    resume(null, `Result for ${key}`)
  }, 100)
});

cache.get('key').then(function(result){
  console.log(result) //result = 'Result for key'
}).catch(function(err){
  //if valueGetter hands an err to resume then 
  //this catch will recieve error.
  console.log(err)
})

//this call will not call valueGetter as 'key' already in cache
cache.get('key').then(function(result){
  console.log(result) //result = 'Result for key'
})

```

If you don't set set a TimeToLive (explained below) on Cache then cached values are permanent unless removed by calling cache.remove(key).

Concurrent get calls for the same key that is not in the cache will result in only one call to valueGetter and all concurrent get Promises will be resolved with the same retrieved value.

#### Constructor

**Cache(valueGetter):** 
* valueGetter(key, resume) is a function that will retrieve a value for key.  resume(err, result) is a callback function to be called when value is retrieved.


#### Methods

**get(key):** 
* returns a Promise which will provide the value already in the cache or the value returned by valueGetter if key not in cache.

**set(key, value):** 
* Manually sets a cached value for key.

**remove(key):** 
* Removes cached value for key

**has(key):** 
* Returns true if key in cache

**invalidate():** 
* empties cache

### Properties
**size:** 
* ReadOnly. Returns number of items in cache

### Events

**beforeGet:** 
* Fires when cache.get is called. Fires before value is retrieved from cache or retrieved from valueGetter

**afterSet:** 
* Fires when cache.set is called and when value retrieved from valueGetter is added to cache.

**beforeRemove:** 
* Fires before item removed from Cache


## Time To Live

A TimeToLive object is also provided.  It uses cache events to remove expired items from cache.  It can be set up with just a Time To Live or it can also have a Clean Interval.  A key will maintain its value in the cache until Time To Live expires. When cache.get is called, if key is older than Time To Live then key is removed and valueGetter will be called to get new value.

If you don't set a Clean Interval, an expired key will not be removed from cache until the next get for the key is called.

If a Clean Interval is set, all expired keys will be removed when the Clean Interval fires.

While setting Clean Interval, you can set AllowStaleGet.  This will make Cache.get perform better as it doesn't check expired. Expired keys are then removed only when the Clean Interval fires.  The consequence of this is that Cache.get can return an expired value between the time that the key is expired and when the Clean Interval fires.

**No Clean Interval Eg:**


```
var simpleCache = require('simple-cache')


function newCountingGetter() {
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
    resume(null,`Number of Gets: ${increment(key)}`)
  }

}

var cache = new simpleCache.Cache(newCountingGetter());

//Set Time To Live (in seconds)
var ttl = new simleCache.TimeToLive(10).start(cache); 

cache.get('key').then(function(result){
  console.log(result) //result = Number of Gets: 1
})

//Wait until 'key' expires and then retrieve it again.  'key' will
//be expired so 'key' will be removed from cache and valueGetter 
//will be called to get new value for 'key'
setTimeout(function(){
  //'key' is still in cache here but it is expired. cache.get will 
  //get a new value and set it in cache
  cache.get('key').then(function(result){
    console.log(result) //result = Number of Gets: 2
  })
}, 20000)

```

Note:  In the example above, TimeToLive has no Clean Interval so even though key expires, it will not be removed from cache until cache.get('key') is called.



**Clean Interval Eg:**

```
var cache = new simpleCache.Cache(newCountingGetter());

//Set Time To Live and CleanInterval (in seconds)
var ttl = new simleCache.TimeToLive(10)
            .cleanInterval(20)
            .start(cache); 


cache.get('key').then(function(result){
  console.log(result) //result = Number of Gets: 1
})

//Wait for Clean Interval
setTimeout(function(){
  //cache.size = 0 here.  Clean Interval fired and 'key' was 
  //expired so it was removed.
  cache.get('key').then(function(result){
    console.log(result) //result = Number of Gets: 2
  })
}, 30000)
```

**Clean Interval with allowStaleGet Eg:**

```
var cache = new simpleCache.Cache(newCountingGetter());

//Set Time To Live and CleanInterval (in seconds)
var ttl = new simleCache.TimeToLive(10)
            .cleanInterval(20, true)
            .start(cache); 


cache.get('key').then(function(result){
  console.log(result) //result = Number of Gets: 1
})

//Before Clean Interval
setTimeout(function(){
  //cache.size = 1 here.  'key' is expired but clean interval
  //hasn't fired.
  cache.get('key').then(function(result){
    console.log(result) //result = Number of Gets: 1
  })
}, 15000)

//Wait for Clean Interval
setTimeout(function(){
  //cache.size = 0 here.  Clean Interval fired and 'key' was 
  //expired so it was removed.
  cache.get('key').then(function(result){
    console.log(result) //result = Number of Gets: 2
  })
}, 30000)
```

#### Constructor
**TimeToLive(ttlSeconds):** 
* ttlSeconds is the life of a key in the cache.  Keys are invalidated after ttlSeconds expires. If cache.get is called for an expired key, a new value will be retrieved.

#### Methods
**cleanInterval(cleanIntervalSeconds, allowStaleGet):** 
* Sets up a clean interval that will remove expired keys when interval fires. If allowStaleGet = true, then Cache.get will perform better as it doesn't check if key is expired, however, stale values will be returned between the time that the key expires and when the Clean Interval fires. Returns 'this' so that a TimeToLive can be setup like:  
  
  let ttl = new TimeToLive(10).cleanInterval(20).start(cache).  

**start(cache):** 
* starts monitoring supplied cache for expired keys. Returns 'this'.

**stop(cache):** 
* stops monitoring supplied cache for expired keys. Returns 'this'.