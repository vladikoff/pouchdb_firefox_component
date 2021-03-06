var EXPORTED_SYMBOLS = ['XMLHttpRequest'];
var exports = {};

const {classes: Cc, interfaces: Ci, results: Cr, utils: Cu} = Components;
// injects `memory`
Cu.import("resource:///modules/pouchdb/memory.jsm");

var requests = [];

// Events on XHRs that we should listen for, so we know when to remove
// a request from our private list.
const TERMINATE_EVENTS = ["load", "error", "abort"];

// Read-only properties of XMLHttpRequest objects that we want to
// directly delegate to.
const READ_ONLY_PROPS = ["readyState", "responseText", "responseXML",
  "status", "statusText"];

// Methods of XMLHttpRequest that we want to directly delegate to.
const DELEGATED_METHODS = ["abort", "getAllResponseHeaders",
  "getResponseHeader", "overrideMimeType",
  "send", "sendAsBinary", "setRequestHeader",
  "open"];

var getRequestCount = exports.getRequestCount = function getRequestCount() {
  return requests.length;
};

var XMLHttpRequest = exports.XMLHttpRequest = function XMLHttpRequest() {
  let self = this;
  let req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"]
    .createInstance(Ci.nsIXMLHttpRequest);
  // For the sake of simplicity, don't tie this request to any UI.
  req.mozBackgroundRequest = true;

  memory.track(req, "XMLHttpRequest");

  this._req = req;
  this._orsc = null;
  this._cleanup = this._cleanup.bind(this);

  requests.push(this);

  TERMINATE_EVENTS.forEach(function(name) {
    self._req.addEventListener(name, self._cleanup, false);
  });
};

XMLHttpRequest.prototype = {
  _cleanup: function _cleanup() {
    this.onreadystatechange = null;

    let index = requests.indexOf(this);
    if (index != -1) {
      let self = this;
      TERMINATE_EVENTS.forEach(function(name) {
        self._req.removeEventListener(name, self._cleanup, false);
      });
      requests.splice(index, 1);
    }
  },
  _unload: function _unload() {
    this._req.abort();
    this._cleanup();
  },
  addEventListener: function addEventListener(name, func) {
    this._req.addEventListener(name, func);
  },
  removeEventListener: function removeEventListener(name, func) {
    this._req.removeEventListener(name, func);
  },
  set upload(newValue) {
    throw new Error("not implemented");
  },
  forceAllowThirdPartyCookie: function forceAllowThirdPartyCookie() {
    if (this._req.channel instanceof Ci.nsIHttpChannelInternal)
      this._req.channel.forceAllowThirdPartyCookie = true;
  },
  get onreadystatechange() {
    return this._orsc;
  },
  set onreadystatechange(cb) {
    this._orsc = cb;
    if (cb) {
      var self = this;
      this._req.onreadystatechange = function() {
        try {
          self._orsc.apply(self, arguments);
        }
        catch (e) {
          console.exception(e);
        }
      };
    }
    else {
      this._req.onreadystatechange = null;
    }
  }
};

READ_ONLY_PROPS.forEach(
  function(name) {
    XMLHttpRequest.prototype.__defineGetter__(
      name,
      function() {
        return this._req[name];
      });
  });

DELEGATED_METHODS.forEach(
  function(name) {
    XMLHttpRequest.prototype[name] = function() {
      return this._req[name].apply(this._req, arguments);
    };
  });
