/* =======================================================================
   sync.js  —  optional LIVE SHARED progress for the Exotics ER trackers.

   When this is filled in and hosted next to the tracker files, everyone who
   opens the site reads and writes the SAME data, and changes appear for other
   viewers within about a second.

   If you leave it blank, the pages keep working exactly as before, with each
   person's progress saved only in their own browser.

   ------------------------------------------------------------------------
   ONE-TIME SETUP (about 5 minutes, free, no credit card):

   1. Go to https://console.firebase.google.com  ->  "Add project".
      Give it a name (e.g. "exotics-er"), accept defaults, create it.

   2. In the left menu choose  Build -> Realtime Database -> "Create Database".
      Pick any location, then choose "Start in TEST MODE" and enable.
      (Test mode lets anyone read/write — fine for an internal tracker. You
       can lock it down later with Firebase Authentication.)

   3. Click the gear icon (top left) -> "Project settings".
      Scroll to "Your apps", click the web icon  </>  , register an app
      (any nickname, you do NOT need Hosting). Firebase shows a config object
      called  firebaseConfig  with apiKey, authDomain, databaseURL, etc.

   4. Copy those values into the firebaseConfig block below. The important one
      is  databaseURL  (it ends in  .firebaseio.com  or  .firebasedatabase.app ).

   5. Upload this sync.js together with index.html and the tracker files to
      your repository, commit, and you're live.
   ======================================================================= */

window.ProgramSync = (function () {

  // ====== PASTE YOUR FIREBASE CONFIG BETWEEN THE BRACES ======
  const firebaseConfig = {
    // apiKey: "AIza............................",
    // authDomain: "your-project.firebaseapp.com",
    // databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    // projectId: "your-project",
    // appId: "1:1234567890:web:abcdef123456"
  };

  // Everyone using the SAME room id shares the SAME data.
  // Change it (to anything) if you ever want a separate, independent space.
  const ROOM = "exotics-er";
  // ===========================================================

  let db = null, on = false;
  try {
    if (firebaseConfig && firebaseConfig.databaseURL && window.firebase) {
      firebase.initializeApp(firebaseConfig);
      db = firebase.database();
      on = true;
    }
  } catch (e) {
    on = false;
    console.warn("ProgramSync disabled:", e && e.message);
  }

  function ref(key) {
    // Store each logical key's value as a single JSON string leaf, so there
    // are never any illegal-character problems with nested keys.
    return db.ref("rooms/" + ROOM + "/" + encodeURIComponent(key));
  }

  return {
    enabled: function () { return on; },

    write: function (key, value) {
      if (!on) return;
      try { ref(key).set(JSON.stringify(value)); } catch (e) {}
    },

    // onChange(obj)  — obj is the parsed value, or null if nothing stored yet.
    subscribe: function (key, onChange) {
      if (!on) return;
      ref(key).on("value", function (snap) {
        const raw = snap.val();
        let obj = null;
        if (raw != null) { try { obj = JSON.parse(raw); } catch (e) { obj = null; } }
        onChange(obj);
      });
    }
  };
})();
