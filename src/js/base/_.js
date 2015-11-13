'use strict';

var Regular = require('regularjs');

var _ = {};

_.noop = Regular.util.noop;
_.extend = Regular.util.extend;
_.dom = Regular.dom;

module.exports = _;