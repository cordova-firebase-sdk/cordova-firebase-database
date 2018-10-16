exports.defineAutoTests = function () {

  var config = {
    apiKey: "AIzaSyA898h_Ez99cQUfmhkAVKT2BmivNhHm_3Y",
    databaseURL: "https://geofire-test-34492.firebaseio.com"
  };
  var app, database;
  describe('FirebaseCore (plugin.firebase.app)', function () {

    it('plugin.firebase.app should exist', function () {
        expect(plugin.firebase.app).toBeDefined();
    });
    it('app = plugin.firebase.initializeApp() should be fine', function () {
        expect(plugin.firebase.initializeApp).toBeDefined();
        app = plugin.firebase.initializeApp(config);
        expect(app !== null).toBe(true);
    });
    it('database = app.database() should be fine', function () {
        database = app.database();
        expect(database !== null).toBe(true);
    });
  });

};
