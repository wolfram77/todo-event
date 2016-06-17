/* EVENT - manages event information */
/* db: id(t), x, y, type, factor, details */
/* fn: create, get, update, groupadd, groupremove, groupget, groupupdate, contribadd, contribremove, contribget, contribremove */

// required modules
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');


// define
module.exports = function(z, db, user) {
	var o = new EventEmitter();

	// create
	// to use with loc specifier
	o.create = function(vals, fn) {
		db.insert('event', vals, function(errs, grows) {
			if(fn) fn({'status': (errs[0]? 'err': 'ok')});
		});
	};


	// get
	o.get = function(flt, fn) {
		db.select('event', flt, function(errs, grows) {
			if(fn) fn({'status': 'ok', 'res': z.gather({}, grows[0])});
		});
	};


	// update
	o.update = function(flt, vals, fn) {
		db.update('event', {'flt': flt, 'vals': vals}, function(errs, grows) {
			if(fn) fn({'status': (errs[0]? 'err': 'ok')});
		});
	};


	// add group member
	o.groupadd = function(vals, fn) {
		db.insert('event_group', vals, function(errs, grows) {
			if(fn) fn({'status': (errs[0]? 'err': 'ok')});
		});
	};


	// remove group member
	o.groupremove = function(flt, fn) {
		db.delete('event_group', flt, function(errs, grows) {
			if(fn) fn({'status': (errs[0]? 'err': 'ok')});
		});
	};


	// get group
	o.groupget = function(flt, fn) {
		console.log('event.groupget> %j', flt);
		db.select('event_group', flt, function(errs, grows) {
			if(fn) fn({'status': 'ok', 'res': z.gather({}, grows[0])});
		});
	};


	// update group member
	o.groupupdate = function(flt, vals, fn) {
		db.update('event_group', {'flt': flt, 'vals': vals}, function(errs, grows) {
			if(fn) fn({'status': (errs[0]? 'err': 'ok')});
		});
	};


	// add contrib
	o.contribadd = function(vals, fn) {
		db.insert('event_contrib', vals, function(errs, grows) {
			if(fn) fn({'status': (errs[0]? 'err': 'ok')});
		});
	};


	// remove contrib
	o.contribremove = function(flt, fn) {
		db.delete('event_contrib', flt, function(errs, grows) {
			if(fn) fn({'status': (errs[0]? 'err': 'ok')});
		});
	};


	// get contrib
	o.contribget = function(flt, fn) {
		db.select('event_contrib', flt, function(errs, grows) {
			if(fn) fn({'status': 'ok', 'res': z.gather({}, grows[0])});
		});
	};


	// update contrib
	o.contribupdate = function(flt, vals, fn) {
		db.update('event_contrib', {'flt': flt, 'vals': vals}, function(errs, grows) {
			if(fn) fn({'status': (errs[0]? 'err': 'ok')});
		});
	};


	// prepare
	db.create('event', ['id INTEGER %p', 'x %R', 'y %R', 'type %T', 'factor %r', 'details %t']);
	db.create('event_group', ['event %I', 'user %I', 'type %T', 'details %t']);
	db.create('event_contrib', ['event %I', 'user %I', 'type %T', 'details %t']);

	// ready
	console.log('event> ready!');
	return o;
};
