/* ZED - general purpose module */
/* fn: apush, fjoin, mreplace, krename, gskeys, gslen, gather, scatter */

// required modules
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');


// define
module.exports = function() {
	var o = new EventEmitter();

	// create initialized array
	o.array = function(dst, sz, val) {
		val = val || null;
		for(var i=0; i<sz; i++)
			dst.push(val);
		return dst;
	};


	// push items from source array
	o.apush = function(dst, src) {
		Array.prototype.push.apply(dst, src);
		return dst;
	};


	// formatted join
	o.fjoin = function(src, fmt, sep) {
		for(var i=0,I=src.length,dst=''; i<I; i++)
			dst += fmt.replace(/%i/g, src[i]) + (i===I-1? '' : sep||',');
		return dst;
	};


	// multiple replace
	o.mreplace = function(src, map) {
		var re = new RegExp(_.keys(map).join("|"), "g");
		return src.replace(re, function(m) { return map[m]; });
	};


	// rename keys of object
	o.krename = function(dst, src, fmt) {
		if(typeof fmt === 'string') for(var k in src)
			dst[fmt.replace(/%i/g, k)] = src[k];
		else for(var k in src)
			dst[fmt[k]] = src[k];
		return dst;
	};


	// get keys in gathered/scattered data
	o.gskeys = function(src) {
		return _.isArray(src)? _.keys(src[0]) : _.keys(src);
	};


	// get length in gathered/scattered data
	o.gslen = function(src) {
		return _.isArray(src)? src.length : src[_.keys(src)[0]].length;
	};


	// gather objects of same kind into arrays
	o.gather = function(dst, src, ps) {
		if(src.length===0) return {};
		ps = ps? ps : _.keys(src[0]);
		_.forEach(ps, function(p) {
			o.apush(dst[p] = dst[p]||[], _.pluck(src, p));
		});
		return dst;
	};


	// scatter arrays into objects of same kind
	o.scatter = function(dst, src, ps) {
		ps = ps? ps : _.keys(src);
		if(ps.length===0) return [];
		for(var i=0,I=src[ps[0]].length; i<I; i++) {
			for(var p=0,P=ps.length,v={}; p<P; p++)
				v[ps[p]] = src[ps[p]][i];
			dst.push(v);
		}
		return dst;
	};


	// ready
	console.log('zed> ready!');
	return o;
};
