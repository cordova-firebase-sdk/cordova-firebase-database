/* eslint-env jasmine */

exports.defineAutoTests = function() {
  describe('Plugin namespace test (window.plugin)', function() {
    it('should exist', function() {
      expect(window.plugin).toBeDefined();
    });

    it('should contain "firebase" namespace', function() {
      expect(window.plugin.firebase).toBeDefined();
    });

    it('should contain "database" namespace', function() {
      expect(window.plugin.firebase.database).toBeDefined();
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
