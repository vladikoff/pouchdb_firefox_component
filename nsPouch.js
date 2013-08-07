const {classes: Cc, interfaces: Ci, results: Cr, utils: Cu} = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource:///modules/pouchdb/pouchdb.jsm");

function pouchDbHandler() {
  this.Pouch = Pouch;
  this.wrappedJSObject = this;
}

pouchDbHandler.prototype = {
  classDescription:  "PouchDb Handler",
  classID:           Components.ID("{d647ff9b-ac4c-4d0e-8fbd-484765be5550}"),
  contractID:        "@pouchdb.com/component;1",
  QueryInterface:    XPCOMUtils.generateQI([Components.interfaces.nsIPouchDbHandler])
};

this.NSGetFactory = XPCOMUtils.generateNSGetFactory([
  pouchDbHandler
]);