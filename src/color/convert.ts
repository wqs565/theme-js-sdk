
var balanced = require('balanced-match');
var Color = require('color');
var balanced = require('balanced-match');
var debug = require('debug')('css-color-function:parse');

/**
 * Basic RGBA adjusters.
 */
const adjusters:any = {}
adjusters.red = rgbaAdjuster('red');
adjusters.blue = rgbaAdjuster('blue');
adjusters.green = rgbaAdjuster('green');
adjusters.alpha = adjusters.a = rgbaAdjuster('alpha');

/**
 * RGB adjuster.
 */

adjusters.rgb = function () {
  // TODO
};

/**
 * Basic HSLWB adjusters.
 */

adjusters.hue = adjusters.h = hslwbAdjuster('hue');
adjusters.saturation = adjusters.s = hslwbAdjuster('saturation');
adjusters.lightness = adjusters.l = hslwbAdjuster('lightness');
adjusters.whiteness = adjusters.w = hslwbAdjuster('whiteness');
adjusters.blackness = adjusters.b = hslwbAdjuster('blackness');

/**
 * Blend adjuster.
 *
 * @param {Color} color
 * @param {Object} args
 */

adjusters.blend = function (color: any, args: any) {
  var targetAlpha = color.alpha();

  // Reset the alpha value to one. This is required because color.mix mixes
  // the alpha value as well as rgb values. For blend() purposes, that's not
  // what we want.
  color.alpha(1);

  var other = new Color(args[0].value);
  var percentage = 1 - parseInt(args[1].value, 10) / 100;

  // Finally set the alpha value of the mixed color to the target value.
  color.mix(other, percentage).alpha(targetAlpha);
};

/**
 * Tint adjuster.
 *
 * @param {Color} color
 * @param {Object} args
 */

adjusters.tint = function (color: any, args: any) {
  args.unshift({ type: 'argument', value: 'white' });
  adjusters.blend(color, args);
};

/**
 * Share adjuster.
 *
 * @param {Color} color
 * @param {Object} args
 */

adjusters.shade = function (color: any, args: any) {
  args.unshift({ type: 'argument', value: 'black' });
  adjusters.blend(color, args);
};

/**
 * Contrast adjuster.
 *
 * @param {Color} color
 * @param {Object} args
 */
adjusters.contrast = function (color: any, args: any) {
  if (args.length == 0) args.push({ type: 'argument', value: '100%' });
  var percentage = 1 - parseInt(args[0].value, 10) / 100;
  var max = color.luminosity() < .5 ? new Color({ h:color.hue(), w:100, b:0 }) : new Color({ h:color.hue(), w:0, b:100 });
  var min = max;
  var minRatio = 4.5;
  if (color.contrast(max) > minRatio) {
    var min = binarySearchBWContrast(minRatio, color, max);
    var targetMinAlpha = min.alpha();
    // Set the alpha to 1 to avoid mix()-ing the alpha value.
    min.alpha(1);
    // mixes the colors then sets the alpha back to the target alpha.
    min.mix(max, percentage).alpha(targetMinAlpha);
  }
  color.hwb(min.hwb());
};

/**
 * Generate a value or percentage of modifier.
 *
 * @param {String} prop
 * @return {Function}
 */

function rgbaAdjuster (prop: any) {
  return function (color: any, args: any) {
    var mod;
    if (args[0].type == 'modifier') mod = args.shift().value;

    var val = args[0].value;
    if (val.indexOf('%') != -1) {
      val = parseInt(val, 10) / 100;
      if (!mod) {
        val = val * (prop == 'alpha' ? 1 : 255);
      } else if (mod != '*') {
        val = color[prop]() * val;
      }
    } else {
      val = Number(val);
    }

    color[prop](modify(color[prop](), val, mod));
  };
}

/**
 * Generate a basic HSLWB adjuster.
 *
 * @param {String} prop
 * @return {Function}
 */

function hslwbAdjuster (prop: any) {
  return function (color: any, args: any) {
    var mod;
    if (args[0].type == 'modifier') mod = args.shift().value;
    // var val = parseFloat(args[0].value, 10);
    var val = parseFloat(args[0].value);
    color[prop](modify(color[prop](), val, mod));
  };
}

/**
 * Modify a `val` by an `amount` with an optional `modifier`.
 *
 * @param {Number} val
 * @param {Number} amount
 * @param {String} modifier (optional)
 */

function modify (val: number, amount: number, modifier: any) {
  switch (modifier) {
    case '+': return val + amount;
    case '-': return val - amount;
    case '*': return val * amount;
    default: return amount;
  }
}

/**
 * Return the color closest to `color` between `color` and `max` that has a contrast ratio higher than `minRatio`
 *  assumes `color` and `max` have identical hue
 *
 * @param {Number} minRatio
 * @param {Color} color
 * @param {Color} max
 **/

function binarySearchBWContrast (minRatio: any, color: any, max: any) {
  var min = color.clone();
  var minW = color.whiteness();
  var minB = color.blackness();
  var maxW = max.whiteness();
  var maxB = max.blackness();
  while (Math.abs(minW - maxW) > 1 || Math.abs(minB - maxB) > 1) {
    var midW = Math.round((maxW + minW) / 2);
    var midB = Math.round((maxB + minB) / 2);
    min.whiteness(midW);
    min.blackness(midB);
    if (min.contrast(color) > minRatio) {
      maxW = midW;
      maxB = midB;
    } else {
      minW = midW;
      minB = midB;
    }
  }
  return min
}


// parse
function parse (string: any): any {
if ('string' != typeof string) string = string.toString();
debug('string %s', string);

/**
 * Match the current position in the string against a `regexp`, returning the
 * match if one exists.
 *
 * @param {RegExp} regexp
 * @return {Undefined or Array}
 */

function match (regexp: any) {
  var m = regexp.exec(string);
  if (!m) return;
  string = string.slice(m[0].length);
  return m.slice(1);
}

/**
 * Match whitespace.
 */

function whitespace () {
  match(/^\s+/);
}

/**
 * Match a right parentheses.
 *
 * @return {Array or Undefined}
 */

function rparen () {
  var m = match(/^\)/);
  if (!m) return;
  debug('rparen');
  return m;
}

/**
 * Match a modifier: '+' '-' '*'.
 *
 * @return {Object or Undefined}
 */

function modifier () {
  var m = match(/^([\+\-\*])/);
  if (!m) return;
  var ret: any = {};
  ret.type = 'modifier';
  ret.value = m[0];
  debug('modifier %o', ret);
  return ret;
}

/**
 * Match a generic number function argument.
 *
 * @return {Object or Undefined}
 */

function number () {
  var m = match(/^([^\)\s]+)/);
  if (!m) return;
  var ret:any = {};
  ret.type = 'number';
  ret.value = m[0];
  debug('number %o', ret);
  return ret;
}

/**
 * Match a function's arguments.
 *
 * @return {Array}
 */

function args () {
  var ret = [];
  var el;
  while (el = modifier() || fn() || number()) {
    ret.push(el);
    whitespace();
  }
  debug('args %o', ret);
  return ret;
}

/**
 * Match an adjuster function.
 *
 * @return {Object or Undefined}
 */

function adjuster () {
  var m = match(/^(\w+)\(/);
  if (!m) return;
  whitespace();
  var ret: any= {};
  ret.type = 'function';
  ret.name = m[0];
  ret.arguments = args();
  rparen()
  debug('adjuster %o', ret);
  return ret;
}

/**
 * Match a color.
 *
 * @return {Object}
 */

function color () {
  var ret:any = {};
  ret.type = 'color';

  var col = match(/([^\)\s]+)/)[0];
  if (col.indexOf('(') != -1) {
    var piece = match(/([^\)]*?\))/)[0];
    col = col + piece;
  }

  ret.value = col;
  whitespace();
  return ret;
}

/**
 * Match a color function, capturing the first color argument and any adjuster
 * functions after it.
 *
 * @return {Object or Undefined}
 */

function fn () {
  if (!string.match(/^color\(/)) return;

  var colorRef = balanced('(', ')', string)
  if (!colorRef) throw new SyntaxError('Missing closing parenthese for \'' + string + '\'');
  if (colorRef.body === '') throw new SyntaxError('color() function cannot be empty');
  string = colorRef.body
  whitespace();

  var ret: any= {};
  ret.type = 'function';
  ret.name = 'color';
  ret.arguments = [fn() || color()];
  debug('function arguments %o', ret.arguments);

  var el;
  while (el = adjuster()) {
    ret.arguments.push(el);
    whitespace();
  }

  // pass the rest of the string in case of recursive color()
  string = colorRef.post
  whitespace();
  debug('function %o', ret);

  return ret;
}

/**
 * Return the parsed color function.
 */

return fn();
}

/**
 * Convert a color function CSS `string` into an RGB color string.
 *
 * @param {String} string
 * @return {String}
 */

export function convert (string: any):any {
  var index = string.indexOf('color(');
  if (index == -1) return string;

  string = string.slice(index);
  string = balanced('(', ')', string);
  if (!string) throw new SyntaxError('Missing closing parenthese for \'' + string + '\'');
  var ast = parse('color(' + string.body + ')');
  return toRGB(ast) + convert(string.post);
}

/**
 * Given a color `ast` return an RGB color string.
 *
 * @param {Object} ast
 * @return {String}
 */

function toRGB (ast: any): any {
  var color = new Color(ast.arguments[0].type == "function" ? toRGB(ast.arguments[0]) : ast.arguments[0].value)
  var fns = ast.arguments.slice(1);

  fns.forEach(function (adjuster: { name: any; arguments: any[]; }) {
    var name = adjuster.name;
    if (!adjusters[name]) throw new Error('Unknown <color-adjuster> \'' + name + '\'');

    // convert nested color functions
    adjuster.arguments.forEach(function (arg) {
      if (arg.type == 'function' && arg.name == 'color') {
        arg.value = toRGB(arg);
        arg.type = 'color';
        delete arg.name;
      }
    });

    // apply adjuster transformations
    adjusters[name](color, adjuster.arguments);
  });

  return color.rgbString();
}
