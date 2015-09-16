(function() {
  'use strict';
  
  var isArray = Array.isArray;
  
  if (!isArray) {
    isArray = function(arg) {
      return (Object.prototype.toString.call(arg) === '[object Array]');
    };
  }
  
  function isFunction(arg) {
    return (typeof(arg) === 'function');
  }
  
  function asyncCall(callback) {
    if (isFunction(setImmediate)) {
      return setImmediate(callback);
    } else {
      return setTimeout(callback, 0);
    }
  }
  
  function Promise() {
    
  }
  
  Promise.prototype.then = function(onResolve, onReject, onNotify) {
    var self = this;
    
	  if (isFunction(onResolve)) {
      if (!isArray(self.onresolve)) {
        self.onresolve = [];
      }
      
      self.onresolve.push(onResolve);
    }
      
    if (isFunction(onReject)) {
      if (!isArray(self.onreject)) {
        self.onreject = [];
      }
      
      self.onreject.push(onReject);
    }
        
    if (isFunction(onNotify)) {
      if (!isArray(self.onnotify)) {
        self.onnotify = [];
      }
      
      self.onnotify.push(onNotify);
    }
    
    return self;
  };
  
  Promise.prototype.catch = function(onError) {
	  var self = this;
    
	  if (isFunction(onError)) {
      if (!isArray(self.onreject)) {
        self.onreject = [];
      }
      
      self.onreject.push(onError);
    }
    
    return self;
  };
  
  Promise.prototype.finally = function(onResolve, onNotify) {
    var self = this;
    
    return self.then(function() {
      onResolve();
    }, function() {
      onResolve();
    }, onNotify);
  };
  
  function Defer() {
	  this.promise = new Promise();
  }
  
  Defer.prototype.then = function(onResolve, onReject, onNotify) {
    return this.promise.then(onResolve, onReject, onNotify);
  };
  
  Defer.prototype.catch = function(onError) {
    return this.promise.catch(onError);
  };
  
  Defer.prototype.finally = function(onResolve, onNotify) {
    return this.promise.finally(onResolve, onNotify);
  };
  
  Defer.prototype.resolve = function(arg) {
    var self = this;
    
    if (isArray(self.promise.onresolve)) {
      var callbacks = self.promise.onresolve;
      
      asyncCall(function() {
        callbacks.forEach(function(callback) {
          try {
            callback.call(self, arg);
          } catch(ignored) {}
        });
      });
    }
    
    self.promise.onresolve = null;
    self.promise.onreject = null;
    self.promise.onnotify = null;
    
    return self.promise;
  };
  
  Defer.prototype.reject = function(arg) {
	  var self = this;
    
    if (isArray(self.promise.onreject)) {
      var callbacks = self.promise.onreject;
      
      asyncCall(function() {
        callbacks.forEach(function(callback) {
          try {
            callback.call(self, arg);
          } catch(ignored) {}
        });
      });
    }
    
    self.promise.onresolve = null;
    self.promise.onreject = null;
    self.promise.onnotify = null;
    
    return self.promise;
  };
  
  Defer.prototype.notify = function(arg) {
	  var self = this;
    
    if (isArray(self.promise.onnotify)) {
      var callbacks = self.promise.onnotify;
      
      asyncCall(function() {
        callbacks.forEach(function(callback) {
          try {
            callback.call(self, arg);
          } catch(ignored) {}
        });
      });
    }
  };
  
  var $q = function(callback) {
    var req = new Defer();
    
    function onResolve(data) {
      req.resolve(data);
      req = null;
    }
    
    function onReject(data) {
      req.reject(data);
      req = null;
    }
    
    function onNotify(data) {
      if (req) {
        req.notify(data);
      }
    }
    
    asyncCall(function() {
      try {
        callback(onResolve, onReject, onNotify);
      } catch(error) {
        req.reject(error);
      }
    });
    
    return req.promise;
  }
  
  $q.defer = function() {
    return new Defer();
  };
  
  $q.when = function(arg, onResolve, onReject, onNotify) {
    if (arg && isFunction(arg.then)) {
      return arg.then.call(arg, onResolve, onReject, onNotify);
    }

    var req = new Defer();
    
    asyncCall(function() {
      req.resolve(arg);
    });
    
    return req.promise;
  };
  
  $q.resolve = $q.when;
  
  $q.reject = function(arg) {
    var req = new Defer();
    
    asyncCall(function() {
      req.reject(arg);
      req = null;
    });
    
    return req.promise;
  };
  
  $q.all = function(targets) {
    var req = new Defer();
    var list = targets;
    var res = [];
    var len = 0;
    
    if (targets instanceof Promise) {
      list = [ targets ]; 
    }

    try {
      len = list.length;
      
      if (len) {
        list.forEach(function(promise, index) {
          promise.then(function(arg) {
            len--;
            res[index] = arg;
            
            if (!len) {
              asyncCall(function() {
                req.resolve(res);
              });
            }
          }, function(error) {
            asyncCall(function() {
              req.reject(error);
            });
          });
        });
      } else {
        asyncCall(function() {
          req.resolve([]);
        });
      }
    } catch (error) {
      asyncCall(function() {
        req.reject(error);
      });
    }
           
    return req.promise;
  };
  
  if (typeof(exports) !== 'undefined') {
    module.exports = $q;
  } else {
    window.$q = $q;
  }
})();