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


};
