Ext.nd.ACCESS_LEVELS = {
 0 : "No Access", 
 1 : "Depositor", 
 2 : "Reader", 
 3 : "Author", 
 4 : "Editor", 
 5 : "Designer", 
 6 : "Manager"
}
/**
 * @class Ext.nd.Session
 * Provides JavaScript access to an object that mimics NotesSession in Lotuscript.
 * This object is created from the Session.js agent within the notes database.
 * You cannot create an instance of this object, and all properties are read-only.
 * @singleton
 */
Ext.nd.Session.prototype = {
 /**
  * Array of objects containing information about the available addressbooks
  * @type {Array}
  */
 addressBooks : [{
 "acl" : {}, 
 "aclActivityLog" : [""], 
 "currentAccessLevel" : 0, 
 "parent" : Ext.nd.Session , 
 "server" : "CN=Web/O=BlueCuda", 
 "fileName" : "names.nsf", 
 "filePath" : "names.nsf", 
 "webFilePath" : "/names.nsf/", 
 "title" : ""}
], 
 /**
  * common user name
  * @type {String}
  */
 commonUserName : "Anonymous",
 /**
  * effectice user name
  * @type {String}
  */
 effectiveUserName : "Anonymous",
 /** 
  * current database
  * @type {Object}
  */
currentDatabase : {
 "acl" : {}, 
 "aclActivityLog" : ["02/22/2008 05:10:55 PM Jack Ratcliff/BlueCuda updated Notes Admin",
"02/22/2008 05:10:35 PM Jack Ratcliff/BlueCuda updated role Test1",
"02/22/2008 05:10:29 PM Jack Ratcliff/BlueCuda updated role Test3",
"02/22/2008 05:10:26 PM Jack Ratcliff/BlueCuda updated role Test2",
"02/22/2008 05:10:21 PM Jack Ratcliff/BlueCuda updated role Test",
"02/13/2008 10:46:35 PM Jack Ratcliff/BlueCuda updated -Default-",
"02/13/2008 10:46:18 PM Jack Ratcliff/BlueCuda updated -Default-",
"02/13/2008 10:44:40 PM Jack Ratcliff/BlueCuda updated -Default-",
"02/13/2008 10:44:12 PM Jack Ratcliff/BlueCuda updated -Default-",
"02/13/2008 10:43:54 PM Jack Ratcliff/BlueCuda updated -Default-",
"01/21/2008 11:47:01 PM Rich Waters/Rich-Waters updated -Default-",
"01/20/2008 10:55:20 AM Rich Waters/Rich-Waters updated -Default-",
"05/21/2007 09:21:18 PM Jack Ratcliff/BlueCuda updated ExtNDAdmin",
"05/21/2007 09:21:12 PM Jack Ratcliff/BlueCuda added ExtNDAdmin",
"04/28/2007 07:27:34 PM Jack Ratcliff/BlueCuda added Web/BlueCuda",
"04/28/2007 07:27:34 PM Jack Ratcliff/BlueCuda updated NotesOSS2/NotesOSS",
"04/20/2007 10:42:59 AM Nathan T Freeman/NotesOSS deleted web/BlueCuda",
"04/20/2007 10:42:54 AM Nathan T Freeman/NotesOSS added NotesOSS2/NotesOSS",
"04/20/2007 10:42:54 AM Nathan T Freeman/NotesOSS updated web/BlueCuda",
"04/20/2007 08:55:40 AM Bruce Elgort/Sharepoint updated Domino EXT Team"], 
 "currentAccessLevel" : 4, 
 "parent" : Ext.nd.Session , 
 "server" : "CN=Web/O=BlueCuda", 
 "fileName" : "extnd2_b1.nsf", 
 "filePath" : "extnd\\extnd2_b1.nsf", 
 "webFilePath" : "/extnd/extnd2_b1.nsf/", 
 "title" : "Ext.nd Beta 1", 
 "fileFormat" : 43, 
 "created" : "1/30/2008 4:18:50 PM", 
 "designTemplateName" : "", 
 "isDB2" : false, 
 "httpURL" : "http://web.bluecuda.com/__852573E0007514A8.nsf?OpenDatabase", 
 "replicaID" : "852573E0007514A8", 
 "isDocumentLockingEnabled" : false, 
 "isDesignLockingEnabled" : true, 
 "size" : 22282240, 
 "sizeQuota" : 0, 
 "sizeWarning" : 0, 
 "percentUsed" : 47.1}, 
 "notesBuildVersion" : 261, 
 "notesVersion" : "Release 7.0.1|January 17, 2006", 
 "platform" : "Windows/32", 
 "serverName" : "CN=Web/O=BlueCuda", 
 "userGroupNameList" : [], 
 "userName" : "Anonymous", 
 "userNameList" : [{"abbreviated" : "Anonymous", "addr821" : "Anonymous", "common" : "Anonymous"}, 
{"abbreviated" : "CN=Web/O=BlueCuda", "addr821" : "CN=Web/O=BlueCuda", "common" : "CN=Web/O=BlueCuda"}], 
 "userRoles" : [""]
}
