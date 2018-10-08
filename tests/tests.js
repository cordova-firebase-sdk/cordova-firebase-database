/* eslint-env jasmine */

exports.defineAutoTests = function() {
  describe('IsPrime (plugin.firebase)', function () {
    it('should exist', function () {
      expect(window.plugin.firebase).toBeDefined();
    });
    it('should be function', function () {
      expect(typeof window.plugin.firebase.database).toBe('function');
    });
  });
  //
  // describe('Database class', function() {
  //
  //   var database;
  //   describe('plugin.firebase.database', function() {
  //
  //     database = plugin.firebase.database({
  //       browserConfigs: {
  //         apiKey: "AIzaSyA898h_Ez99cQUfmhkAVKT2BmivNhHm_3Y",
  //         databaseURL: "https://geofire-test-34492.firebaseio.com"
  //       }
  //     });
  //
  //     it('should ')
  //
  //   });
  // });
};
