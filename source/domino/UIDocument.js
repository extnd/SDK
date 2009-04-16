
/** 
 * @class Ext.nd.UIDocument
 * Provides JavaScript access to an object that mimics NotesUIDocument in Lotuscript.
 * This object is created from the UIDocument agent within the notes database and
 * provides values specific to the document unid passed to the agent.
 * You cannot create an instance of this object, and all properties are read-only.
 * @singleton
 */
Ext.nd.UIDocument.prototype = {
	/**
	 * HTML Form dom node for the notes form (first form on the page).
	 * @type {Object}
	 */
	form: frm,
	/**
	 * True for editing, false for reading.
	 * @type {Boolean}
	 */
	editMode: false,
	/**
	 * same as @ISNEWDOC.
	 * @type {Boolean}
	 */
	isNewDoc: false,
	/**
	 * first listed name of the form.
	 * @type {String}
	 */
	formName: 'CategoryTest1',
	/**
	 * {@link Ext.nd.UIDocument.Document} object
	 * @type {Object}
	 */
	document: {}
};

/**
 * @class Ext.nd.UIDocument.Document
 * all properties are read-only.
 * @singleton
 */
Ext.nd.UIDocument.Document.prototype = {
	/**
	 * document created on datetime.
	 * @type {String}
	 */
	created: "2/23/2007 1:24:25 PM",
	/**
	 * document last accessed datetime.
	 * @type {String}
	 */
	lastAccessed: "2/10/2008 1:42:49 PM",
	/**
	 * document last modified datetime
	 * @type {String}
	 */
	lastModified: "2/10/2008 1:42:49 PM",
	/**
	 * document note id.
	 * @type String
	 */
	noteID: "93A",
	/**
	 * document unique id.
	 * @type String
	 */
	universalID: "0035EF08F21EFB058525728B00651CF8",
	/**
	 * Items array, contains objects with all of the fields and values
	 * from the document.<br/>
	 * Example item: {"name" : "subject", "type": 1280, "values" : ["Some subject"]}
	 * @type Array
	 */
	items: [{
		"name": "$WebFlags",
		"type": 1280,
		"values": []
	}]
}
