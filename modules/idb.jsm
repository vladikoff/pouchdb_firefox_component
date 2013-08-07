const {classes: Cc, interfaces: Ci, results: Cr, utils: Cu} = Components;
var EXPORTED_SYMBOLS = ['indexedDB', 'IDBTransaction', 'IDBKeyRange'];

// database context for indexedDB
var dbContext = this;

// TODO
const id = "testing";

// placeholder, copied from bootstrap.js
let sanitizeId = function(id){
  let uuidRe =
    /^\{([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\}$/;

  let domain = id.
    toLowerCase().
    replace(/@/g, "-at-").
    replace(/\./g, "-dot-").
    replace(uuidRe, "$1");

  return domain
};

const PSEUDOURI = "indexeddb://" + sanitizeId(id) // https://bugzilla.mozilla.org/show_bug.cgi?id=779197

// Injects `indexedDB` to `dbContext` scope.
Cc["@mozilla.org/dom/indexeddb/manager;1"].
  getService(Ci.nsIIndexedDatabaseManager).
  initWindowless(dbContext);


// Use XPCOM because `require("./url").URL` doesn't expose the raw uri object.
let principaluri = Cc["@mozilla.org/network/io-service;1"].
  getService(Ci.nsIIOService).
  newURI(PSEUDOURI, null, null);


let principal = Cc["@mozilla.org/scriptsecuritymanager;1"].
  getService(Ci.nsIScriptSecurityManager).
  getCodebasePrincipal(principaluri);
/////////////////////

indexedDB = dbContext.indexedDB;

indexedDB = Object.freeze({
  open: indexedDB.openForPrincipal.bind(indexedDB, principal),
  deleteDatabase: indexedDB.deleteForPrincipal.bind(indexedDB, principal),
  cmp: indexedDB.cmp
});
IDBTransaction = Ci.nsIIDBTransaction;
IDBKeyRange = dbContext.IDBKeyRange;