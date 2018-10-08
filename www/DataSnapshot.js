


var LZString = require('./LZString');

/*******************************************************************************
 * @name DataSnapshot
 ******************************************************************************/
function DataSnapshot(ref, nativeResults) {
  var self = this;

  Object.defineProperty(self, 'ref', {
    value: ref
  });
  Object.defineProperty(self, 'key', {
    value: nativeResults.key
  });
  Object.defineProperty(self, '_nativeResults', {
    value: nativeResults,
    enumerable: false
  });
}

DataSnapshot.prototype.forEach = function(action) {
  var values = JSON.parse(this._nativeResults.exportVal);
  var keys = Object.keys(values);
  keys = this.sortFunc(keys);
  var sortedValues = keys.map(function(key) {
    return values[key];
  });
  sortedValues.forEach(action);
};


DataSnapshot.prototype.getPriority = function() {
  return this._nativeResults.getPriority;
};

DataSnapshot.prototype.hasChild = function(path) {
  var values = JSON.parse(this._nativeResults.exportVal);
  return path in values;
};

DataSnapshot.prototype.hasChildren = function() {
  var values = JSON.parse(this._nativeResults.exportVal);
  var keys = Object.keys(values);
  var key;
  for (var i = 0; i < keys.length; i++) {
    key = keys[i];
    if (typeof values[key] === 'object') {
      return true;
    }
  }
  return false;
};

DataSnapshot.prototype.numChildren = function() {
  return this._nativeResults.numChildren;
};
DataSnapshot.prototype.exportVal = function() {
  return JSON.parse(LZString.decompress(this._nativeResults.exportVal));
};
DataSnapshot.prototype.val = function() {
  return JSON.parse(LZString.decompress(this._nativeResults.val));
};
DataSnapshot.prototype.toJson = function() {
  throw new Error('not implemented');
};


module.exports = DataSnapshot;
