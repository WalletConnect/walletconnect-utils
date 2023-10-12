/**
 * Source: https://git.coolaj86.com/coolaj86/local-storage.js/src/branch/local-storage/lib/localStorage.js
 */

/* eslint-disable */

(function() {
  "use strict";

  let db;

  function LocalStorage() {}
  db = LocalStorage;

  db.prototype.getItem = function(key) {
    if (this.hasOwnProperty(key)) {
      return String(this[key]);
    }
    return null;
  };

  db.prototype.setItem = function(key, val) {
    this[key] = String(val);
  };

  db.prototype.removeItem = function(key) {
    delete this[key];
  };

  db.prototype.clear = function() {
    const self = this;
    Object.keys(self).forEach(function(key) {
      self[key] = undefined;
      delete self[key];
    });
  };

  db.prototype.key = function(i) {
    i = i || 0;
    return Object.keys(this)[i];
  };

  db.prototype.__defineGetter__("length", function() {
    return Object.keys(this).length;
  });

  try {
    if (typeof global !== "undefined" && global.localStorage) {
      module.exports = global.localStorage;
    } else if (typeof window !== "undefined" && window.localStorage) {
      module.exports = window.localStorage;
    } else {
      module.exports = new LocalStorage();
    }
  } catch {
    // In Incognito mode, accessing window.localStorage may thorw an error
    module.exports = new LocalStorage();
  }
})();
