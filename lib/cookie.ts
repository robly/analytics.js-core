'use strict';

/**
 * Module dependencies.
 */

import bindAll from 'bind-all';
import clone from './utils/clone';
import cookie from '@segment/cookie';
import Debug from 'debug';
import defaults from '@ndhoule/defaults';
import topDomain from '@segment/top-domain';

// eslint-disable-next-line new-cap
const debug = Debug('analytics.js:cookie');

/**
 * Initialize a new `Cookie` with `options`.
 *
 * @param {Object} options
 */

function Cookie(options?: Object) {
  this.options(options);
}

/**
 * Get or set the cookie options.
 *
 * @param {Object} options
 *   @field {Number} maxage (1 year)
 *   @field {String} domain
 *   @field {String} path
 *   @field {Boolean} secure
 */

interface CookieOptions {
  maxage: number;
  domain: string;
  path: string;
  secure: boolean;
}

Cookie.prototype.options = function(options?: CookieOptions) {
  if (arguments.length === 0) return this._options;

  options = options || ({} as CookieOptions);

  let domain = '.' + topDomain(window.location.href);
  if (domain === '.') domain = null;

  this._options = defaults(options, {
    // default to a year
    maxage: 31536000000,
    path: '/',
    domain: domain,
    sameSite: 'Lax'
  });

  // http://curl.haxx.se/rfc/cookie_spec.html
  // https://publicsuffix.org/list/effective_tld_names.dat
  //
  // try setting a dummy cookie with the options
  // if the cookie isn't set, it probably means
  // that the domain is on the public suffix list
  // like myapp.herokuapp.com or localhost / ip.
  this.set('ajs:test', true);
  if (!this.get('ajs:test')) {
    debug('fallback to domain=null');
    this._options.domain = null;
  }
  this.remove('ajs:test');
};

/**
 * Set a `key` and `value` in our cookie.
 *
 * @param {String} key
 * @param {Object} value
 * @return {Boolean} saved
 */

Cookie.prototype.set = function(key: string, value: Object): boolean {
  try {
    value = window.JSON.stringify(value);
    cookie(key, value === 'null' ? null : value, clone(this._options));
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Get a value from our cookie by `key`.
 *
 * @param {String} key
 * @return {Object} value
 */

Cookie.prototype.get = function(key: string): Object {
  try {
    var value = cookie(key);
    value = value ? window.JSON.parse(value) : null;
    return value;
  } catch (e) {
    return null;
  }
};

/**
 * Remove a value from our cookie by `key`.
 *
 * @param {String} key
 * @return {Boolean} removed
 */

Cookie.prototype.remove = function(key: string): boolean {
  try {
    cookie(key, null, clone(this._options));
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Expose the cookie singleton.
 */

module.exports = bindAll(new Cookie());

/**
 * Expose the `Cookie` constructor.
 */

module.exports.Cookie = Cookie;
