import { Database } from "../Database";
import { App } from "cordova-firebase-core/index";

describe("[Database]", () => {

  it ("should create a new instance in native side", (done) => {

    const app: App = new App("hello", {
      hello: "world",
      databaseURL: "https://dummy.firebaseio.com/"
    });
    app._one("ready", () => {
      const db: Database = new Database(app, app.options);
      db._trigger("fireAppReady");

      db._one("ready", () => {
        expect(db.app).toBe(app);
        done();
      });
    });

  });

});
