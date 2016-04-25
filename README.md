#simple-cache



A simple async cache. A valueGetter(err, result) function is supplied to Cache constructor. This function is responsible for providing values for keys when key is not found in cache.

Eg:


```
var Cache = require('ttl-simple-cache').Cache

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

A CacheObserver is provider that can be used to manage cached values. If you don't use a CacheObserver (explained below) on Cache then cached values are permanent unless removed by calling cache.remove(key).

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

**keys:** 
* ReadOnly. Returns an iterator for the keys in the cache

### Events

**beforeGet:** 
* Fires when cache.get is called. Fires before value is retrieved from cache or retrieved from valueGetter

**afterSet:** 
* Fires when cache.set is called and when value retrieved from valueGetter is added to cache.

**beforeRemove:** 
* Fires before item removed from Cache


##CacheObserver

A CacheObserver can be used to manage cached values. Different algorithms can be supplied to the CacheObserver.  The algorithm must expose two public functions:
1. valueAdded(key). This will be called when a value is added to the cache. No return value.
1. isInvalid(key, cleaning). This will be called to determine if key is still valid.  The cleaning parameter identifies whether the CacheObserver is currently in a cleaning cycle or is it responding to a Cache.get.  Returns true if key is invalid.  


The observer can be set with a clean interval.  When the clean interval fires, all keys in the cache will be checked for validity by calling algorithm.isValid(key, true). The keys will be checked in chunks of  chunkSize so as not to block too long.  ChunkSize defaults to 10 but can be set to a different value.

###Constructor
**CacheObserver(algorithm)**
* Sets this observer to use the supplied algorithm to manage cached values

###Methods

**cleanInterval(intervalSeconds)**
* Sets the cleanInterval in seconds.  When this interval fires, all invalid keys will be removed from cache. Note: Invalid keys a determined by the supplied algorithm. Returns 'this' so observer can be setup like:  
let observer = new CacheObserver(algorithm).cleanInterval(100)

**chunkSize(chunkSize)**
* Sets the chunk size for the cleaning cycle.  Defaults to 10.  During the clean cycle, key validity will be checked in batches of chunkSize to avoid blocking. Returns 'this' so observer can be setup like:  
let observer = new CacheObserver(algorithm).cleanInterval(100).chunkSize(100)

**start(cache)**
* Starts managing keys in supplied Cache. Returns 'this' so observer can be setup like:  
let observer = new CacheObserver(algorithm).start()


**stop()**
* Stops managing keys. Returns 'this'.


## Time To Live

A TimeToLive object is also provided. This is an algorithm that can be used with a CacheObserver to invalidate cache keys that have been in the cache longer than the set 'Time To Live'. For efficiency, it has an AllowStaleGet property.  If this is set then stale values can be returned from the cache until the CacheObserver clean interval fires.  With this property set, the expiration is checked only on the cleaning cycle, not on Cache.get.  This property should not be set unless the CacheObserver has a clean interval.

###Constructor
**TimeToLive(ttlSeconds)**
* Items in Cache will be invalidated after ttlSeconds.


##Methods
**allowStaleGet**
* Sets allowStateGet to true. Key validity will now only be checked during the CacheObserver clean cycle and not on Cache.get(key). Invalid values can be returned from the Cache until the clean cycle fires. Do not set this property unless the CacheObserver has a clean interval set.


```
var simpleCache = require('ttl-simple-cache')


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
var ttl = new simpleCache.TimeToLive(10)

var observer = new simpleCache.CacheObserver(ttl).start(cache)

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

Note:  In the example above, observer has no Clean Interval so even though key expires, it will not be removed from cache until cache.get('key') is called.



**Clean Interval Eg:**

```

var cache = new simpleCache.Cache(newCountingGetter());

//Set Time To Live and CleanInterval (in seconds)
var ttl = new simpleCache.TimeToLive(10)

var observer = new simpleCache.CacheObserver(ttl)
  .cleanInterval(20).start(cache)

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

//Set Time To Live (in seconds) and allow stale get
var ttl = new simpleCache.TimeToLive(10).allowStaleGet()

//Set Clean Interval (in seconds) and start observing cache
var observer = new simpleCache.CacheObserver(ttl)
  .cleanInterval(20).start(cache)

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

