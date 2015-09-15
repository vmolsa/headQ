var $q = require('./index.js');

function echo0() {
  var req = $q.defer();
  
  setTimeout(function() {
    req.notify('Hello World from echo0');
  }, 200);  
  
  setTimeout(function() {
    req.resolve('OK');
  }, 2000);
  
  return req;
}

function echo1() {
  return $q(function(resolve, reject, notify) {
    notify('Hello World from echo1');
    
    setTimeout(function() {
      resolve('OK');
    }, 2000);
  });
}

function echo2() {
  var req = $q.defer();
  
  setTimeout(function() {
    req.notify('Hello World from echo2');
  }, 200);
  
  setTimeout(function() {
    req.resolve('OK');
  }, 2000);
  
  return req;
}

function echo3() {
  return $q(function(resolve, reject, notify) {
    notify('Hello World from echo3');
    
    setTimeout(function() {
      resolve('OK');
    }, 2000);
  });
}

function onRes(arg) {
  console.log(arg);
}

function onErr(error) {
  console.log(error);
}

function onMsg(message) {
  console.log(message);
}

var req0 = echo0().then(onRes, onErr, onMsg).finally(function() {
  console.log('req0 Done!');
});

var req1 = echo1().then(onRes, onErr, onMsg).finally(function() {
  console.log('req1 Done!');
});

var req2 = echo2().then(onRes, onErr, onMsg).finally(function() {
  console.log('req2 Done!');
});

var req3 = echo3().then(onRes, onErr, onMsg).finally(function() {
  console.log('req3 Done!');
});

var all = $q.all([ req0, req1, req2, req3 ]);

all.then(function(args) {
  console.log(args);
});

all.finally(function() {
  console.log('All Done!');
}, onMsg);

$q.when($q.reject('Hello World!').catch(function(error) {
  console.log('Error:', error);
})).finally(function() {
  console.log('Error Test Success!');
});

$q.when('hello World!').then(function(data) {
  console.log('Data:', data);
});