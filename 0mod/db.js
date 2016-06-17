/* DB - manages db operations */
/* fn: expand, filter, batch, create, drop, insert, delete, select, update */

// required modules
var sqlite3 = require('sqlite3');
var _ = require('lodash');


// define
module.exports = function(z) {
	var o = new sqlite3.Database('data/data.db');

	// expand % abbreviations
	o.expand = function(cmd) {
		return z.mreplace(cmd, {
			'%I': 'INTEGER NOT NULL',
			'%i': 'INTEGER DEFAULT 0',
			'%R': 'REAL NOT NULL',
			'%r': 'REAL DEFAULT 0',
			'%T': 'TEXT NOT NULL',
			'%t': 'TEXT DEFAULT \'\'',
			'%B': 'BLOB NOT NULL',
			'%b': 'BLOB',
			'%p': 'PRIMARY KEY'
		});
	};


	// create filter (where part)
	o.filter = function(flt) {
		var cmd = '', vals = [];
		for(var k in flt) {
			var v = flt[k], tv = typeof v;
			if(tv==='number' || tv==='string') {
				var f = k + (k.search(/[><=:%#]/g)==-1? ' =' : '');
				f = z.mreplace(f, {':': ' NOT', '%': ' LIKE', '#': ' REGEXP'});
				cmd += ' AND '+f+' ?';
				vals.push(v);
				continue;
			}
			if(_.isArray(v)) {
				cmd += ' AND '+k+' IN ('+z.array([], v.length, '?').join()+')';
				z.apush(vals, v);
			}
			else for(var ck in v) {
				cmd += ' AND '+k+ck+'?';
				vals.push(v[ck]);
			}
		}
		cmd = cmd.length==0? cmd : ' WHERE'+cmd.substring(4);
		return {'cmd': cmd, 'vals': vals};
	};


	// batch execute
	// fn = (errs, grows)
	o.batch = function(stmts, fn) {
		var errs = [], grows = [];
		o.serialize(function() {
			for(var s=0; s<stmts.length; s++) (function(s, stmt) {
				o.all(stmt.cmd, stmt.vals, function(err, rows) {
					if(err) errs[s] = err;
					grows[s] = rows;
				});
			})(s, stmts[s]);
			o.run('PRAGMA no_op', function() {
				if(fn) fn(errs, grows);
			});
		});
	};


	// create table
	o.create = function(tab, flds, sfx) {
		for(var f=0, cols=[]; f<flds.length; f++)
			cols.push(o.expand(flds[f]));
		o.run('CREATE TABLE IF NOT EXISTS '+tab+'('+cols.join()+')'+(sfx||''));
	};


	// drop table
	o.drop = function(tab) {
		o.run('DROP TABLE IF EXISTS '+tab);
	};


	// insert rows
	o.insert = function(tab, gvals, fn) {
		var stmts = [];
		if(!_.isArray(gvals)) gvals = [gvals];
		for(var gv=0; gv<gvals.length; gv++) {
			var keys = _.keys(gvals[gv]);
			var cmd = 'INSERT INTO '+tab+'('+keys.join()+') VALUES ('+z.fjoin(keys, '$%i')+')';
			stmts.push({'cmd': cmd, 'vals': z.krename({}, gvals[gv], '$%i')});
		}
		o.batch(stmts, fn);
	};


	// delete rows
	o.delete = function(tab, flts, fn) {
		var stmts = [];
		if(!_.isArray(flts)) flts = [flts];
		for(var f=0; f<flts.length; f++) {
			var stmt = o.filter(flts[f]);
			stmt.cmd = 'DELETE FROM '+tab+stmt.cmd;
			stmts.push(stmt);
		}
		o.batch(stmts, fn);
	};


	// select rows
	o.select = function(tab, flts, fn) {
		var stmts = [];
		if(!_.isArray(flts)) flts = [flts];
		for(var f=0; f<flts.length; f++) {
			var stmt = o.filter(flts[f]);
			stmt.cmd = 'SELECT * FROM '+tab+stmt.cmd;
			stmts.push(stmt);
		}
		o.batch(stmts, fn);
	};


	// update rows
	o.update = function(tab, acts, fn) {
		var stmts = [];
		if(!_.isArray(acts)) acts = [acts];
		for(var a=0; a<acts.length; a++) {
			var cmd = '', vals = [];
			for(var sk in acts[a].vals) {
				cmd += sk+'=?, ';
				vals.push(acts[a].vals[sk]);
			}
			cmd = cmd.substring(0, cmd.length-2);
			var stmt = o.filter(acts[a].flt);
			stmt.cmd = 'UPDATE '+tab+' SET '+cmd+stmt.cmd;
			stmt.vals = z.apush(vals, stmt.vals);
			stmts.push(stmt);
		}
		o.batch(stmts, fn);
	};


	// ready
	console.log('db> ready!');
	return o;
};
