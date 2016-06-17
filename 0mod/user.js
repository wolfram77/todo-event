/* USER - manages user information */
/* db: id, pass, score, pic, name, age, sex, phone, place, geox, geoy, tags, details */
/* fn: signup, signoff, signin, id, get, update */

// required modules
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');


// define
module.exports = function(z, db) {
	var o = new EventEmitter();

	// sign up
	o.signup = function(vals, fn) {
		db.insert('user', vals, function(errs, grows) {
			if(fn) fn({'status': (errs[0]? 'err': 'ok'), 'res': vals});
		});
	};


	// sign off
	o.signoff = function(key, fn) {
		if(typeof key==='string') db.delete('user_signin', {'user': key});
		else db.delete('user_signin', {'id': key});
		if(fn) fn({'status': 'ok'});
	};


	// sign in
	o.signin = function(req, fn) {
		o.signoff(req.id);
		db.select('user', req, function(errs, grows) {
			if(grows[0].length!==1) {
				if(fn) fn({'status': 'err'});
				return;
			}
			var signin = {'id': _.now(), 'user': req.id};
			db.insert('user_signin', signin);
			if(fn) fn({'status': 'ok', 'res': signin});
		});
	};


	// get id from key
	o.id = function(key, fn) {
		db.select('user_signin', {'id': key}, function(errs, grows) {
			if(grows[0].length!==1) { if(fn) fn(null); }
			else if(fn) fn(grows[0].user);
		});
	};


	// get
	o.get = function(flt, fn) {
		db.select('user', flt, function(errs, grows) {
			if(fn) fn({'status': 'ok', 'res': z.gather({}, grows[0])});
		});
	};


	// update
	o.update = function(flt, vals, fn) {
		db.update('user', {'flt': flt, 'vals': vals}, function(errs, grows) {
			if(fn) fn({'status': (errs[0]? 'err': 'ok')});
		});
	};

	
	// prepare
	db.create('user', ['id TEXT %p', 'pass %T', 'type %T', 'score %i', 'name %T', 'age %I', 'sex %T', 'phone %t', 'details %t']);
	db.create('user_login', ['id INTEGER %p', 'user %T']);

	// ready
	console.log('user> ready!');
	return o;
};
