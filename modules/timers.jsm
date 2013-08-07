var EXPORTED_SYMBOLS = ['setTimeout', 'clearTimeout'];

// Last timer id.
var lastID = 0;

const { TYPE_ONE_SHOT, TYPE_REPEATING_SLACK } = Components.classes["@mozilla.org/timer;1"]
  .createInstance(Components.interfaces.nsITimer);
const Timer = Components.Constructor('@mozilla.org/timer;1', 'nsITimer');
const timers = Object.create(null);
function setTimer(type, callback, delay, ...args) {
  let id = ++ lastID;
  let timer = timers[id] = Timer();
  timer.initWithCallback({
    notify: function notify() {
      try {
        if (type === TYPE_ONE_SHOT)
          delete timers[id];
        callback.apply(null, args);
      }
      catch(error) {
        console.exception(error);
      }
    }
  }, Math.max(delay || MIN_DELAY), type);
  return id;
}

function unsetTimer(id) {
  let timer = timers[id];
  delete timers[id];
  if (timer) timer.cancel();
}

const setTimeout = setTimer.bind(null, TYPE_ONE_SHOT);
const clearTimeout = unsetTimer.bind(null);
