(function(window, document, undefined) {'use strict';



function minErr(module) {
  return function () {
    var code = arguments[0],
      prefix = '[' + (module ? module + ':' : '') + code + '] ',
      template = arguments[1],
      templateArgs = arguments,
      stringify = function (obj) {
        if (typeof obj === 'function') {
          return obj.toString().replace(/ \{[\s\S]*$/, '');
        } else if (typeof obj === 'undefined') {
          return 'undefined';
        } else if (typeof obj !== 'string') {
          return JSON.stringify(obj);
        }
        return obj;
      },
      message, i;

    message = prefix + template.replace(/\{\d+\}/g, function (match) {
      var index = +match.slice(1, -1), arg;

      if (index + 2 < templateArgs.length) {
        arg = templateArgs[index + 2];
        if (typeof arg === 'function') {
          return arg.toString().replace(/ ?\{[\s\S]*$/, '');
        } else if (typeof arg === 'undefined') {
          return 'undefined';
        } else if (typeof arg !== 'string') {
          return toJson(arg);
        }
        return arg;
      }
      return match;
    });

    message = message + '\nhttp://errors.angularjs.org/1.3.0-beta.15/' +
      (module ? module + '/' : '') + code;
    for (i = 2; i < arguments.length; i++) {
      message = message + (i == 2 ? '?' : '&') + 'p' + (i-2) + '=' +
        encodeURIComponent(stringify(arguments[i]));
    }

    return new Error(message);
  };
}



var REGEX_STRING_REGEXP = /^\/(.+)\/([a-z]*)$/;

var VALIDITY_STATE_PROPERTY = 'validity';


var lowercase = function(string){return isString(string) ? string.toLowerCase() : string;};
var hasOwnProperty = Object.prototype.hasOwnProperty;


var uppercase = function(string){return isString(string) ? string.toUpperCase() : string;};


var manualLowercase = function(s) {
  return isString(s)
      ? s.replace(/[A-Z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) | 32);})
      : s;
};
var manualUppercase = function(s) {
  return isString(s)
      ? s.replace(/[a-z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) & ~32);})
      : s;
};


if ('i' !== 'I'.toLowerCase()) {
  lowercase = manualLowercase;
  uppercase = manualUppercase;
}


var
    msie,
    jqLite,    jQuery,    slice             = [].slice,
    push              = [].push,
    toString          = Object.prototype.toString,
    ngMinErr          = minErr('ng'),

    angular           = window.angular || (window.angular = {}),
    angularModule,
    nodeName_,
    uid               = 0;


msie = int((/msie (\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]);
if (isNaN(msie)) {
  msie = int((/trident\/.*; rv:(\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]);
}



function isArrayLike(obj) {
  if (obj == null || isWindow(obj)) {
    return false;
  }

  var length = obj.length;

  if (obj.nodeType === 1 && length) {
    return true;
  }

  return isString(obj) || isArray(obj) || length === 0 ||
         typeof length === 'number' && length > 0 && (length - 1) in obj;
}



function forEach(obj, iterator, context) {
  var key, length;
  if (obj) {
    if (isFunction(obj)) {
      for (key in obj) {
        if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
          iterator.call(context, obj[key], key);
        }
      }
    } else if (isArray(obj) || isArrayLike(obj)) {
      for (key = 0, length = obj.length; key < length; key++) {
        iterator.call(context, obj[key], key);
      }
    } else if (obj.forEach && obj.forEach !== forEach) {
        obj.forEach(iterator, context);
    } else {
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          iterator.call(context, obj[key], key);
        }
      }
    }
  }
  return obj;
}

function sortedKeys(obj) {
  var keys = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      keys.push(key);
    }
  }
  return keys.sort();
}

function forEachSorted(obj, iterator, context) {
  var keys = sortedKeys(obj);
  for ( var i = 0; i < keys.length; i++) {
    iterator.call(context, obj[keys[i]], keys[i]);
  }
  return keys;
}



function reverseParams(iteratorFn) {
  return function(value, key) { iteratorFn(key, value); };
}


function nextUid() {
  return ++uid;
}



function setHashKey(obj, h) {
  if (h) {
    obj.$$hashKey = h;
  }
  else {
    delete obj.$$hashKey;
  }
}


function extend(dst) {
  var h = dst.$$hashKey;
  forEach(arguments, function(obj) {
    if (obj !== dst) {
      forEach(obj, function(value, key) {
        dst[key] = value;
      });
    }
  });

  setHashKey(dst,h);
  return dst;
}

function int(str) {
  return parseInt(str, 10);
}


function inherit(parent, extra) {
  return extend(new (extend(function() {}, {prototype:parent}))(), extra);
}


function noop() {}
noop.$inject = [];



function identity($) {return $;}
identity.$inject = [];


function valueFn(value) {return function() {return value;};}


function isUndefined(value){return typeof value === 'undefined';}



function isDefined(value){return typeof value !== 'undefined';}



function isObject(value){return value != null && typeof value === 'object';}



function isString(value){return typeof value === 'string';}



function isNumber(value){return typeof value === 'number';}



function isDate(value) {
  return toString.call(value) === '[object Date]';
}



var isArray = (function() {
  if (!isFunction(Array.isArray)) {
    return function(value) {
      return toString.call(value) === '[object Array]';
    };
  }
  return Array.isArray;
})();


function isFunction(value){return typeof value === 'function';}



function isRegExp(value) {
  return toString.call(value) === '[object RegExp]';
}



function isWindow(obj) {
  return obj && obj.window === obj;
}


function isScope(obj) {
  return obj && obj.$evalAsync && obj.$watch;
}


function isFile(obj) {
  return toString.call(obj) === '[object File]';
}


function isBlob(obj) {
  return toString.call(obj) === '[object Blob]';
}


function isBoolean(value) {
  return typeof value === 'boolean';
}


var trim = (function() {
  if (!String.prototype.trim) {
    return function(value) {
      return isString(value) ? value.replace(/^\s\s*/, '').replace(/\s\s*$/, '') : value;
    };
  }
  return function(value) {
    return isString(value) ? value.trim() : value;
  };
})();



function isElement(node) {
  return !!(node &&
    (node.nodeName    || (node.prop && node.attr && node.find)));}


function makeMap(str) {
  var obj = {}, items = str.split(","), i;
  for ( i = 0; i < items.length; i++ )
    obj[ items[i] ] = true;
  return obj;
}


if (msie < 9) {
  nodeName_ = function(element) {
    element = element.nodeName ? element : element[0];
    return lowercase(
      (element.scopeName && element.scopeName != 'HTML')
      ? element.scopeName + ':' + element.nodeName : element.nodeName
    );
  };
} else {
  nodeName_ = function(element) {
    return lowercase(element.nodeName ? element.nodeName : element[0].nodeName);
  };
}


function map(obj, iterator, context) {
  var results = [];
  forEach(obj, function(value, index, list) {
    results.push(iterator.call(context, value, index, list));
  });
  return results;
}



function size(obj, ownPropsOnly) {
  var count = 0, key;

  if (isArray(obj) || isString(obj)) {
    return obj.length;
  } else if (isObject(obj)) {
    for (key in obj)
      if (!ownPropsOnly || obj.hasOwnProperty(key))
        count++;
  }

  return count;
}


function includes(array, obj) {
  return indexOf(array, obj) != -1;
}

function indexOf(array, obj) {
  if (array.indexOf) return array.indexOf(obj);

  for (var i = 0; i < array.length; i++) {
    if (obj === array[i]) return i;
  }
  return -1;
}

function arrayRemove(array, value) {
  var index = indexOf(array, value);
  if (index >=0)
    array.splice(index, 1);
  return value;
}

function isLeafNode (node) {
  if (node) {
    switch (nodeName_(node)) {
    case "option":
    case "pre":
    case "title":
      return true;
    }
  }
  return false;
}


function copy(source, destination, stackSource, stackDest) {
  if (isWindow(source) || isScope(source)) {
    throw ngMinErr('cpws',
      "Can't copy! Making copies of Window or Scope instances is not supported.");
  }

  if (!destination) {
    destination = source;
    if (source) {
      if (isArray(source)) {
        destination = copy(source, [], stackSource, stackDest);
      } else if (isDate(source)) {
        destination = new Date(source.getTime());
      } else if (isRegExp(source)) {
        destination = new RegExp(source.source);
      } else if (isObject(source)) {
        var emptyObject = Object.create(Object.getPrototypeOf(source));
        destination = copy(source, emptyObject, stackSource, stackDest);
      }
    }
  } else {
    if (source === destination) throw ngMinErr('cpi',
      "Can't copy! Source and destination are identical.");

    stackSource = stackSource || [];
    stackDest = stackDest || [];

    if (isObject(source)) {
      var index = indexOf(stackSource, source);
      if (index !== -1) return stackDest[index];

      stackSource.push(source);
      stackDest.push(destination);
    }

    var result;
    if (isArray(source)) {
      destination.length = 0;
      for ( var i = 0; i < source.length; i++) {
        result = copy(source[i], null, stackSource, stackDest);
        if (isObject(source[i])) {
          stackSource.push(source[i]);
          stackDest.push(result);
        }
        destination.push(result);
      }
    } else {
      var h = destination.$$hashKey;
      forEach(destination, function(value, key) {
        delete destination[key];
      });
      for ( var key in source) {
        if(source.hasOwnProperty(key)) {
          result = copy(source[key], null, stackSource, stackDest);
          if (isObject(source[key])) {
            stackSource.push(source[key]);
            stackDest.push(result);
          }
          destination[key] = result;
        }
      }
      setHashKey(destination,h);
    }

  }
  return destination;
}


function shallowCopy(src, dst) {
  var i = 0;
  if (isArray(src)) {
    dst = dst || [];

    for (; i < src.length; i++) {
      dst[i] = src[i];
    }
  } else if (isObject(src)) {
    dst = dst || {};

    var keys = Object.keys(src);

    for (var l = keys.length; i < l; i++) {
      var key = keys[i];

      if (!(key.charAt(0) === '$' && key.charAt(1) === '$')) {
        dst[key] = src[key];
      }
    }
  }

  return dst || src;
}



function equals(o1, o2) {
  if (o1 === o2) return true;
  if (o1 === null || o2 === null) return false;
  if (o1 !== o1 && o2 !== o2) return true;  var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
  if (t1 == t2) {
    if (t1 == 'object') {
      if (isArray(o1)) {
        if (!isArray(o2)) return false;
        if ((length = o1.length) == o2.length) {
          for(key=0; key<length; key++) {
            if (!equals(o1[key], o2[key])) return false;
          }
          return true;
        }
      } else if (isDate(o1)) {
        return isDate(o2) && o1.getTime() == o2.getTime();
      } else if (isRegExp(o1) && isRegExp(o2)) {
        return o1.toString() == o2.toString();
      } else {
        if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) || isArray(o2)) return false;
        keySet = {};
        for(key in o1) {
          if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
          if (!equals(o1[key], o2[key])) return false;
          keySet[key] = true;
        }
        for(key in o2) {
          if (!keySet.hasOwnProperty(key) &&
              key.charAt(0) !== '$' &&
              o2[key] !== undefined &&
              !isFunction(o2[key])) return false;
        }
        return true;
      }
    }
  }
  return false;
}


function csp() {
  return (document.securityPolicy && document.securityPolicy.isActive) ||
      (document.querySelector &&
      !!(document.querySelector('[ng-csp]') || document.querySelector('[data-ng-csp]')));
}


function concat(array1, array2, index) {
  return array1.concat(slice.call(array2, index));
}

function sliceArgs(args, startIndex) {
  return slice.call(args, startIndex || 0);
}


function bind(self, fn) {
  var curryArgs = arguments.length > 2 ? sliceArgs(arguments, 2) : [];
  if (isFunction(fn) && !(fn instanceof RegExp)) {
    return curryArgs.length
      ? function() {
          return arguments.length
            ? fn.apply(self, curryArgs.concat(slice.call(arguments, 0)))
            : fn.apply(self, curryArgs);
        }
      : function() {
          return arguments.length
            ? fn.apply(self, arguments)
            : fn.call(self);
        };
  } else {
    return fn;
  }
}


function toJsonReplacer(key, value) {
  var val = value;

  if (typeof key === 'string' && key.charAt(0) === '$' && key.charAt(1) === '$') {
    val = undefined;
  } else if (isWindow(value)) {
    val = '$WINDOW';
  } else if (value &&  document === value) {
    val = '$DOCUMENT';
  } else if (isScope(value)) {
    val = '$SCOPE';
  }

  return val;
}



function toJson(obj, pretty) {
  if (typeof obj === 'undefined') return undefined;
  return JSON.stringify(obj, toJsonReplacer, pretty ? '  ' : null);
}



function fromJson(json) {
  return isString(json)
      ? JSON.parse(json)
      : json;
}



function startingTag(element) {
  element = jqLite(element).clone();
  try {
    element.empty();
  } catch(e) {}
  var TEXT_NODE = 3;
  var elemHtml = jqLite('<div>').append(element).html();
  try {
    return element[0].nodeType === TEXT_NODE ? lowercase(elemHtml) :
        elemHtml.
          match(/^(<[^>]+>)/)[1].
          replace(/^<([\w\-]+)/, function(match, nodeName) { return '<' + lowercase(nodeName); });
  } catch(e) {
    return lowercase(elemHtml);
  }

}


function tryDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch(e) {
  }
}



function parseKeyValue(/**string*/keyValue) {
  var obj = {}, key_value, key;
  forEach((keyValue || "").split('&'), function(keyValue) {
    if ( keyValue ) {
      key_value = keyValue.split('=');
      key = tryDecodeURIComponent(key_value[0]);
      if ( isDefined(key) ) {
        var val = isDefined(key_value[1]) ? tryDecodeURIComponent(key_value[1]) : true;
        if (!hasOwnProperty.call(obj, key)) {
          obj[key] = val;
        } else if(isArray(obj[key])) {
          obj[key].push(val);
        } else {
          obj[key] = [obj[key],val];
        }
      }
    }
  });
  return obj;
}

function toKeyValue(obj) {
  var parts = [];
  forEach(obj, function(value, key) {
    if (isArray(value)) {
      forEach(value, function(arrayValue) {
        parts.push(encodeUriQuery(key, true) +
                   (arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
      });
    } else {
    parts.push(encodeUriQuery(key, true) +
               (value === true ? '' : '=' + encodeUriQuery(value, true)));
    }
  });
  return parts.length ? parts.join('&') : '';
}



function encodeUriSegment(val) {
  return encodeUriQuery(val, true).
             replace(/%26/gi, '&').
             replace(/%3D/gi, '=').
             replace(/%2B/gi, '+');
}



function encodeUriQuery(val, pctEncodeSpaces) {
  return encodeURIComponent(val).
             replace(/%40/gi, '@').
             replace(/%3A/gi, ':').
             replace(/%24/g, '$').
             replace(/%2C/gi, ',').
             replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
}

var ngAttrPrefixes = ['ng-', 'data-ng-', 'ng:', 'x-ng-'];

function getNgAttribute(element, ngAttr) {
  var attr, i, ii = ngAttrPrefixes.length, j, jj;
  element = jqLite(element);
  for (i=0; i<ii; ++i) {
    attr = ngAttrPrefixes[i] + ngAttr;
    if (isString(attr = element.attr(attr))) {
      return attr;
    }
  }
  return null;
}


function angularInit(element, bootstrap) {
  var elements = [element],
      appElement,
      module,
      config = {},
      names = ['ng:app', 'ng-app', 'x-ng-app', 'data-ng-app'],
      options = {
        'boolean': ['strict-di']
      },
      NG_APP_CLASS_REGEXP = /\sng[:\-]app(:\s*([\w\d_]+);?)?\s/;

  function append(element) {
    element && elements.push(element);
  }

  forEach(names, function(name) {
    names[name] = true;
    append(document.getElementById(name));
    name = name.replace(':', '\\:');
    if (element.querySelectorAll) {
      forEach(element.querySelectorAll('.' + name), append);
      forEach(element.querySelectorAll('.' + name + '\\:'), append);
      forEach(element.querySelectorAll('[' + name + ']'), append);
    }
  });

  forEach(elements, function(element) {
    if (!appElement) {
      var className = ' ' + element.className + ' ';
      var match = NG_APP_CLASS_REGEXP.exec(className);
      if (match) {
        appElement = element;
        module = (match[2] || '').replace(/\s+/g, ',');
      } else {
        forEach(element.attributes, function(attr) {
          if (!appElement && names[attr.name]) {
            appElement = element;
            module = attr.value;
          }
        });
      }
    }
  });
  if (appElement) {
    config.strictDi = getNgAttribute(appElement, "strict-di") !== null;
    bootstrap(appElement, module ? [module] : [], config);
  }
}


function bootstrap(element, modules, config) {
  if (!isObject(config)) config = {};
  var defaultConfig = {
    strictDi: false
  };
  config = extend(defaultConfig, config);
  var doBootstrap = function() {
    element = jqLite(element);

    if (element.injector()) {
      var tag = (element[0] === document) ? 'document' : startingTag(element);
      throw ngMinErr('btstrpd', "App Already Bootstrapped with this Element '{0}'", tag);
    }

    modules = modules || [];
    modules.unshift(['$provide', function($provide) {
      $provide.value('$rootElement', element);
    }]);
    modules.unshift('ng');
    var injector = createInjector(modules, config.strictDi);
    injector.invoke(['$rootScope', '$rootElement', '$compile', '$injector',
       function(scope, element, compile, injector) {
        scope.$apply(function() {
          element.data('$injector', injector);
          compile(element)(scope);
        });
      }]
    );
    return injector;
  };

  var NG_DEFER_BOOTSTRAP = /^NG_DEFER_BOOTSTRAP!/;

  if (window && !NG_DEFER_BOOTSTRAP.test(window.name)) {
    return doBootstrap();
  }

  window.name = window.name.replace(NG_DEFER_BOOTSTRAP, '');
  angular.resumeBootstrap = function(extraModules) {
    forEach(extraModules, function(module) {
      modules.push(module);
    });
    doBootstrap();
  };
}

var SNAKE_CASE_REGEXP = /[A-Z]/g;
function snake_case(name, separator) {
  separator = separator || '_';
  return name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
    return (pos ? separator : '') + letter.toLowerCase();
  });
}

function bindJQuery() {
  var originalCleanData;
  jQuery = window.jQuery;
  if (jQuery && jQuery.fn.on) {
    jqLite = jQuery;
    extend(jQuery.fn, {
      scope: JQLitePrototype.scope,
      isolateScope: JQLitePrototype.isolateScope,
      controller: JQLitePrototype.controller,
      injector: JQLitePrototype.injector,
      inheritedData: JQLitePrototype.inheritedData
    });

    originalCleanData = jQuery.cleanData;
    originalCleanData = originalCleanData.$$original || originalCleanData;

    jQuery.cleanData = function(elems) {
      for (var i = 0, elem; (elem = elems[i]) != null; i++) {
        jQuery(elem).triggerHandler('$destroy');
      }
      originalCleanData(elems);
    };
    jQuery.cleanData.$$original = originalCleanData;
  } else {
    jqLite = JQLite;
  }

  angular.element = jqLite;
}


function assertArg(arg, name, reason) {
  if (!arg) {
    throw ngMinErr('areq', "Argument '{0}' is {1}", (name || '?'), (reason || "required"));
  }
  return arg;
}

function assertArgFn(arg, name, acceptArrayAnnotation) {
  if (acceptArrayAnnotation && isArray(arg)) {
      arg = arg[arg.length - 1];
  }

  assertArg(isFunction(arg), name, 'not a function, got ' +
      (arg && typeof arg === 'object' ? arg.constructor.name || 'Object' : typeof arg));
  return arg;
}


function assertNotHasOwnProperty(name, context) {
  if (name === 'hasOwnProperty') {
    throw ngMinErr('badname', "hasOwnProperty is not a valid {0} name", context);
  }
}


function getter(obj, path, bindFnToScope) {
  if (!path) return obj;
  var keys = path.split('.');
  var key;
  var lastInstance = obj;
  var len = keys.length;

  for (var i = 0; i < len; i++) {
    key = keys[i];
    if (obj) {
      obj = (lastInstance = obj)[key];
    }
  }
  if (!bindFnToScope && isFunction(obj)) {
    return bind(lastInstance, obj);
  }
  return obj;
}


function getBlockElements(nodes) {
  var startNode = nodes[0],
      endNode = nodes[nodes.length - 1];
  if (startNode === endNode) {
    return jqLite(startNode);
  }

  var element = startNode;
  var elements = [element];

  do {
    element = element.nextSibling;
    if (!element) break;
    elements.push(element);
  } while (element !== endNode);

  return jqLite(elements);
}



function setupModuleLoader(window) {

  var $injectorMinErr = minErr('$injector');
  var ngMinErr = minErr('ng');

  function ensure(obj, name, factory) {
    return obj[name] || (obj[name] = factory());
  }

  var angular = ensure(window, 'angular', Object);

  angular.$$minErr = angular.$$minErr || minErr;

  return ensure(angular, 'module', function() {
    var modules = {};


    return function module(name, requires, configFn) {
      var assertNotHasOwnProperty = function(name, context) {
        if (name === 'hasOwnProperty') {
          throw ngMinErr('badname', 'hasOwnProperty is not a valid {0} name', context);
        }
      };

      assertNotHasOwnProperty(name, 'module');
      if (requires && modules.hasOwnProperty(name)) {
        modules[name] = null;
      }
      return ensure(modules, name, function() {
        if (!requires) {
          throw $injectorMinErr('nomod', "Module '{0}' is not available! You either misspelled " +
             "the module name or forgot to load it. If registering a module ensure that you " +
             "specify the dependencies as the second argument.", name);
        }

        var invokeQueue = [];

        var configBlocks = [];

        var runBlocks = [];

        var config = invokeLater('$injector', 'invoke', 'push', configBlocks);

        var moduleInstance = {
          _invokeQueue: invokeQueue,
          _configBlocks: configBlocks,
          _runBlocks: runBlocks,


          requires: requires,


          name: name,



          provider: invokeLater('$provide', 'provider'),


          factory: invokeLater('$provide', 'factory'),


          service: invokeLater('$provide', 'service'),


          value: invokeLater('$provide', 'value'),


          constant: invokeLater('$provide', 'constant', 'unshift'),


          animation: invokeLater('$animateProvider', 'register'),


          filter: invokeLater('$filterProvider', 'register'),


          controller: invokeLater('$controllerProvider', 'register'),


          directive: invokeLater('$compileProvider', 'directive'),


          config: config,


          run: function(block) {
            runBlocks.push(block);
            return this;
          }
        };

        if (configFn) {
          config(configFn);
        }

        return  moduleInstance;


        function invokeLater(provider, method, insertMethod, queue) {
          if (!queue) queue = invokeQueue;
          return function() {
            queue[insertMethod || 'push']([provider, method, arguments]);
            return moduleInstance;
          };
        }
      });
    };
  });

}

var version = {
  full: '1.3.0-beta.15',  major: 1,  minor: 3,
  dot: 0,
  codeName: 'unbelievable-advancement'
};


function publishExternalAPI(angular){
  extend(angular, {
    'bootstrap': bootstrap,
    'copy': copy,
    'extend': extend,
    'equals': equals,
    'element': jqLite,
    'forEach': forEach,
    'injector': createInjector,
    'noop':noop,
    'bind':bind,
    'toJson': toJson,
    'fromJson': fromJson,
    'identity':identity,
    'isUndefined': isUndefined,
    'isDefined': isDefined,
    'isString': isString,
    'isFunction': isFunction,
    'isObject': isObject,
    'isNumber': isNumber,
    'isElement': isElement,
    'isArray': isArray,
    'version': version,
    'isDate': isDate,
    'lowercase': lowercase,
    'uppercase': uppercase,
    'callbacks': {counter: 0},
    '$$minErr': minErr,
    '$$csp': csp
  });

  angularModule = setupModuleLoader(window);
  try {
    angularModule('ngLocale');
  } catch (e) {
    angularModule('ngLocale', []).provider('$locale', $LocaleProvider);
  }

  angularModule('ng', ['ngLocale'], ['$provide',
    function ngModule($provide) {
      $provide.provider({
        $$sanitizeUri: $$SanitizeUriProvider
      });
      $provide.provider('$compile', $CompileProvider).
        directive({
            a: htmlAnchorDirective,
            input: inputDirective,
            textarea: inputDirective,
            form: formDirective,
            script: scriptDirective,
            select: selectDirective,
            style: styleDirective,
            option: optionDirective,
            ngBind: ngBindDirective,
            ngBindHtml: ngBindHtmlDirective,
            ngBindTemplate: ngBindTemplateDirective,
            ngClass: ngClassDirective,
            ngClassEven: ngClassEvenDirective,
            ngClassOdd: ngClassOddDirective,
            ngCloak: ngCloakDirective,
            ngController: ngControllerDirective,
            ngForm: ngFormDirective,
            ngHide: ngHideDirective,
            ngIf: ngIfDirective,
            ngInclude: ngIncludeDirective,
            ngInit: ngInitDirective,
            ngNonBindable: ngNonBindableDirective,
            ngPluralize: ngPluralizeDirective,
            ngRepeat: ngRepeatDirective,
            ngShow: ngShowDirective,
            ngStyle: ngStyleDirective,
            ngSwitch: ngSwitchDirective,
            ngSwitchWhen: ngSwitchWhenDirective,
            ngSwitchDefault: ngSwitchDefaultDirective,
            ngOptions: ngOptionsDirective,
            ngTransclude: ngTranscludeDirective,
            ngModel: ngModelDirective,
            ngList: ngListDirective,
            ngChange: ngChangeDirective,
            pattern: patternDirective,
            ngPattern: patternDirective,
            required: requiredDirective,
            ngRequired: requiredDirective,
            minlength: minlengthDirective,
            ngMinlength: minlengthDirective,
            maxlength: maxlengthDirective,
            ngMaxlength: maxlengthDirective,
            ngValue: ngValueDirective,
            ngModelOptions: ngModelOptionsDirective
        }).
        directive({
          ngInclude: ngIncludeFillContentDirective
        }).
        directive(ngAttributeAliasDirectives).
        directive(ngEventDirectives);
      $provide.provider({
        $anchorScroll: $AnchorScrollProvider,
        $animate: $AnimateProvider,
        $browser: $BrowserProvider,
        $cacheFactory: $CacheFactoryProvider,
        $controller: $ControllerProvider,
        $document: $DocumentProvider,
        $exceptionHandler: $ExceptionHandlerProvider,
        $filter: $FilterProvider,
        $interpolate: $InterpolateProvider,
        $interval: $IntervalProvider,
        $http: $HttpProvider,
        $httpBackend: $HttpBackendProvider,
        $location: $LocationProvider,
        $log: $LogProvider,
        $parse: $ParseProvider,
        $rootScope: $RootScopeProvider,
        $q: $QProvider,
        $$q: $$QProvider,
        $sce: $SceProvider,
        $sceDelegate: $SceDelegateProvider,
        $sniffer: $SnifferProvider,
        $templateCache: $TemplateCacheProvider,
        $timeout: $TimeoutProvider,
        $window: $WindowProvider,
        $$rAF: $$RAFProvider,
        $$asyncCallback : $$AsyncCallbackProvider
      });
    }
  ]);
}


JQLite.expando = 'ng339';

var jqCache = JQLite.cache = {},
    jqId = 1,
    addEventListenerFn = (window.document.addEventListener
      ? function(element, type, fn) {element.addEventListener(type, fn, false);}
      : function(element, type, fn) {element.attachEvent('on' + type, fn);}),
    removeEventListenerFn = (window.document.removeEventListener
      ? function(element, type, fn) {element.removeEventListener(type, fn, false); }
      : function(element, type, fn) {element.detachEvent('on' + type, fn); });


var jqData = JQLite._data = function(node) {
  return this.cache[node[this.expando]] || {};
};

function jqNextId() { return ++jqId; }


var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
var MOZ_HACK_REGEXP = /^moz([A-Z])/;
var jqLiteMinErr = minErr('jqLite');


function camelCase(name) {
  return name.
    replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    }).
    replace(MOZ_HACK_REGEXP, 'Moz$1');
}

var SINGLE_TAG_REGEXP = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
var HTML_REGEXP = /<|&#?\w+;/;
var TAG_NAME_REGEXP = /<([\w:]+)/;
var XHTML_TAG_REGEXP = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi;

var wrapMap = {
  'option': [1, '<select multiple="multiple">', '</select>'],

  'thead': [1, '<table>', '</table>'],
  'col': [2, '<table><colgroup>', '</colgroup></table>'],
  'tr': [2, '<table><tbody>', '</tbody></table>'],
  'td': [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  '_default': [0, "", ""]
};

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

function jqLiteIsTextNode(html) {
  return !HTML_REGEXP.test(html);
}

function jqLiteAcceptsData(node) {
  return !node.nodeType || node.nodeType === 1 || node.nodeType === 9;
}

function jqLiteBuildFragment(html, context) {
  var elem, tmp, tag, wrap,
      fragment = context.createDocumentFragment(),
      nodes = [], i;

  if (jqLiteIsTextNode(html)) {
    nodes.push(context.createTextNode(html));
  } else {
    tmp = tmp || fragment.appendChild(context.createElement("div"));
    tag = (TAG_NAME_REGEXP.exec(html) || ["", ""])[1].toLowerCase();
    wrap = wrapMap[tag] || wrapMap._default;
    tmp.innerHTML = wrap[1] + html.replace(XHTML_TAG_REGEXP, "<$1></$2>") + wrap[2];

    i = wrap[0];
    while (i--) {
      tmp = tmp.lastChild;
    }

    nodes = concat(nodes, tmp.childNodes);

    tmp = fragment.firstChild;
    tmp.textContent = "";
  }

  fragment.textContent = "";
  fragment.innerHTML = "";
  forEach(nodes, function(node) {
    fragment.appendChild(node);
  });

  return fragment;
}

function jqLiteParseHTML(html, context) {
  context = context || document;
  var parsed;

  if ((parsed = SINGLE_TAG_REGEXP.exec(html))) {
    return [context.createElement(parsed[1])];
  }

  if ((parsed = jqLiteBuildFragment(html, context))) {
    return parsed.childNodes;
  }

  return [];
}

function JQLite(element) {
  if (element instanceof JQLite) {
    return element;
  }
  if (isString(element)) {
    element = trim(element);
  }
  if (!(this instanceof JQLite)) {
    if (isString(element) && element.charAt(0) != '<') {
      throw jqLiteMinErr('nosel', 'Looking up elements via selectors is not supported by jqLite! See: http://docs.angularjs.org/api/angular.element');
    }
    return new JQLite(element);
  }

  if (isString(element)) {
    jqLiteAddNodes(this, jqLiteParseHTML(element));
  } else {
    jqLiteAddNodes(this, element);
  }
}

function jqLiteClone(element) {
  return element.cloneNode(true);
}

function jqLiteDealoc(element, onlyDescendants){
  if (!onlyDescendants) jqLiteRemoveData(element);

  if (element.childNodes && element.childNodes.length) {
    var descendants = element.getElementsByTagName ? element.getElementsByTagName('*') :
                    element.querySelectorAll ? element.querySelectorAll('*') : [];
    for (var i = 0, l = descendants.length; i < l; i++) {
      jqLiteRemoveData(descendants[i]);
    }
  }
}

function jqLiteOff(element, type, fn, unsupported) {
  if (isDefined(unsupported)) throw jqLiteMinErr('offargs', 'jqLite#off() does not support the `selector` argument');

  var events = jqLiteExpandoStore(element, 'events'),
      handle = jqLiteExpandoStore(element, 'handle');

  if (!handle) return;

  if (isUndefined(type)) {
    forEach(events, function(eventHandler, type) {
      removeEventListenerFn(element, type, eventHandler);
      delete events[type];
    });
  } else {
    forEach(type.split(' '), function(type) {
      if (isUndefined(fn)) {
        removeEventListenerFn(element, type, events[type]);
        delete events[type];
      } else {
        arrayRemove(events[type] || [], fn);
      }
    });
  }
}

function jqLiteRemoveData(element, name) {
  var expandoId = element.ng339,
      expandoStore = jqCache[expandoId];

  if (expandoStore) {
    if (name) {
      delete jqCache[expandoId].data[name];
      return;
    }

    if (expandoStore.handle) {
      expandoStore.events.$destroy && expandoStore.handle({}, '$destroy');
      jqLiteOff(element);
    }
    delete jqCache[expandoId];
    element.ng339 = undefined;
  }
}

function jqLiteExpandoStore(element, key, value) {
  var expandoId = element.ng339,
      expandoStore = jqCache[expandoId || -1];

  if (isDefined(value)) {
    if (!expandoStore) {
      element.ng339 = expandoId = jqNextId();
      expandoStore = jqCache[expandoId] = {};
    }
    expandoStore[key] = value;
  } else {
    return expandoStore && expandoStore[key];
  }
}

function jqLiteData(element, key, value) {
  if (jqLiteAcceptsData(element)) {
    var data = jqLiteExpandoStore(element, 'data'),
        isSetter = isDefined(value),
        keyDefined = !isSetter && isDefined(key),
        isSimpleGetter = keyDefined && !isObject(key);

    if (!data && !isSimpleGetter) {
      jqLiteExpandoStore(element, 'data', data = {});
    }

    if (isSetter) {
      data[key] = value;
    } else {
      if (keyDefined) {
        if (isSimpleGetter) {
          return data && data[key];
        } else {
          extend(data, key);
        }
      } else {
        return data;
      }
    }
  }
}

function jqLiteHasClass(element, selector) {
  if (!element.getAttribute) return false;
  return ((" " + (element.getAttribute('class') || '') + " ").replace(/[\n\t]/g, " ").
      indexOf( " " + selector + " " ) > -1);
}

function jqLiteRemoveClass(element, cssClasses) {
  if (cssClasses && element.setAttribute) {
    forEach(cssClasses.split(' '), function(cssClass) {
      element.setAttribute('class', trim(
          (" " + (element.getAttribute('class') || '') + " ")
          .replace(/[\n\t]/g, " ")
          .replace(" " + trim(cssClass) + " ", " "))
      );
    });
  }
}

function jqLiteAddClass(element, cssClasses) {
  if (cssClasses && element.setAttribute) {
    var existingClasses = (' ' + (element.getAttribute('class') || '') + ' ')
                            .replace(/[\n\t]/g, " ");

    forEach(cssClasses.split(' '), function(cssClass) {
      cssClass = trim(cssClass);
      if (existingClasses.indexOf(' ' + cssClass + ' ') === -1) {
        existingClasses += cssClass + ' ';
      }
    });

    element.setAttribute('class', trim(existingClasses));
  }
}


function jqLiteAddNodes(root, elements) {
  if (elements) {

    if (elements.nodeType) {
      root[root.length++] = elements;
    } else {
      var length = elements.length;

      if (typeof length === 'number' && elements.window !== elements) {
        if (length) {
          if (elements.item) {
            elements = slice.call(elements);
          }
          push.apply(root, elements);
        }
      } else {
        root[root.length++] = elements;
      }
    }
  }
}


function jqLiteController(element, name) {
  return jqLiteInheritedData(element, '$' + (name || 'ngController' ) + 'Controller');
}

function jqLiteInheritedData(element, name, value) {
  element = jqLite(element);

  if(element[0].nodeType == 9) {
    element = element.find('html');
  }
  var names = isArray(name) ? name : [name];

  while (element.length) {
    var node = element[0];
    for (var i = 0, ii = names.length; i < ii; i++) {
      if ((value = element.data(names[i])) !== undefined) return value;
    }

    element = jqLite(node.parentNode || (node.nodeType === 11 && node.host));
  }
}

function jqLiteEmpty(element) {
  jqLiteDealoc(element, true);
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

var JQLitePrototype = JQLite.prototype = {
  ready: function(fn) {
    var fired = false;

    function trigger() {
      if (fired) return;
      fired = true;
      fn();
    }

    if (document.readyState === 'complete'){
      setTimeout(trigger);
    } else {
      this.on('DOMContentLoaded', trigger);


      JQLite(window).on('load', trigger);

    }
  },
  toString: function() {
    var value = [];
    forEach(this, function(e){ value.push('' + e);});
    return '[' + value.join(', ') + ']';
  },

  eq: function(index) {
      return (index >= 0) ? jqLite(this[index]) : jqLite(this[this.length + index]);
  },

  length: 0,
  push: push,
  sort: [].sort,
  splice: [].splice
};

var BOOLEAN_ATTR = {};
forEach('multiple,selected,checked,disabled,readOnly,required,open'.split(','), function(value) {
  BOOLEAN_ATTR[lowercase(value)] = value;
});
var BOOLEAN_ELEMENTS = {};
forEach('input,select,option,textarea,button,form,details'.split(','), function(value) {
  BOOLEAN_ELEMENTS[value] = true;
});
var ALIASED_ATTR = {
  'ngMinlength' : 'minlength',
  'ngMaxlength' : 'maxlength',
  'ngPattern' : 'pattern'
};

function getBooleanAttrName(element, name) {
  var booleanAttr = BOOLEAN_ATTR[name.toLowerCase()];

  return booleanAttr && BOOLEAN_ELEMENTS[nodeName_(element)] && booleanAttr;
}

function getAliasedAttrName(element, name) {
  var nodeName = element.nodeName;
  return (nodeName === 'INPUT' || nodeName === 'TEXTAREA') && ALIASED_ATTR[name];
}

forEach({
  data: jqLiteData,
  inheritedData: jqLiteInheritedData,

  scope: function(element) {
    return jqLite(element).data('$scope') || jqLiteInheritedData(element.parentNode || element, ['$isolateScope', '$scope']);
  },

  isolateScope: function(element) {
    return jqLite(element).data('$isolateScope') || jqLite(element).data('$isolateScopeNoTemplate');
  },

  controller: jqLiteController,

  injector: function(element) {
    return jqLiteInheritedData(element, '$injector');
  },

  removeAttr: function(element,name) {
    element.removeAttribute(name);
  },

  hasClass: jqLiteHasClass,

  css: function(element, name, value) {
    name = camelCase(name);

    if (isDefined(value)) {
      element.style[name] = value;
    } else {
      var val;

      if (msie <= 8) {
        val = element.currentStyle && element.currentStyle[name];
        if (val === '') val = 'auto';
      }

      val = val || element.style[name];

      if (msie <= 8) {
        val = (val === '') ? undefined : val;
      }

      return  val;
    }
  },

  attr: function(element, name, value){
    var lowercasedName = lowercase(name);
    if (BOOLEAN_ATTR[lowercasedName]) {
      if (isDefined(value)) {
        if (!!value) {
          element[name] = true;
          element.setAttribute(name, lowercasedName);
        } else {
          element[name] = false;
          element.removeAttribute(lowercasedName);
        }
      } else {
        return (element[name] ||
                 (element.attributes.getNamedItem(name)|| noop).specified)
               ? lowercasedName
               : undefined;
      }
    } else if (isDefined(value)) {
      element.setAttribute(name, value);
    } else if (element.getAttribute) {
      var ret = element.getAttribute(name, 2);
      return ret === null ? undefined : ret;
    }
  },

  prop: function(element, name, value) {
    if (isDefined(value)) {
      element[name] = value;
    } else {
      return element[name];
    }
  },

  text: (function() {
    getText.$dv = '';
    return getText;

    function getText(element, value) {
      if (isUndefined(value)) {
        var nodeType = element.nodeType;
        return (nodeType === 1 || nodeType === 3) ? element.textContent : '';
      }
      element.textContent = value;
    }
  })(),

  val: function(element, value) {
    if (isUndefined(value)) {
      if (element.multiple && nodeName_(element) === 'select') {
        var result = [];
        forEach(element.options, function (option) {
          if (option.selected) {
            result.push(option.value || option.text);
          }
        });
        return result.length === 0 ? null : result;
      }
      return element.value;
    }
    element.value = value;
  },

  html: function(element, value) {
    if (isUndefined(value)) {
      return element.innerHTML;
    }
    jqLiteDealoc(element, true);
    element.innerHTML = value;
  },

  empty: jqLiteEmpty
}, function(fn, name){

  JQLite.prototype[name] = function(arg1, arg2) {
    var i, key;
    var nodeCount = this.length;

    if (fn !== jqLiteEmpty &&
        (((fn.length == 2 && (fn !== jqLiteHasClass && fn !== jqLiteController)) ? arg1 : arg2) === undefined)) {
      if (isObject(arg1)) {

        for (i = 0; i < nodeCount; i++) {
          if (fn === jqLiteData) {
            fn(this[i], arg1);
          } else {
            for (key in arg1) {
              fn(this[i], key, arg1[key]);
            }
          }
        }
        return this;
      } else {
        var value = fn.$dv;
        var jj = (value === undefined) ? Math.min(nodeCount, 1) : nodeCount;
        for (var j = 0; j < jj; j++) {
          var nodeValue = fn(this[j], arg1, arg2);
          value = value ? value + nodeValue : nodeValue;
        }
        return value;
      }
    } else {
      for (i = 0; i < nodeCount; i++) {
        fn(this[i], arg1, arg2);
      }
      return this;
    }
  };
});

function createEventHandler(element, events) {
  var eventHandler = function (event, type) {
    if (!event.preventDefault) {
      event.preventDefault = function() {
        event.returnValue = false;
      };
    }

    if (!event.stopPropagation) {
      event.stopPropagation = function() {
        event.cancelBubble = true;
      };
    }

    if (!event.target) {
      event.target = event.srcElement || document;
    }

    if (isUndefined(event.defaultPrevented)) {
      var prevent = event.preventDefault;
      event.preventDefault = function() {
        event.defaultPrevented = true;
        prevent.call(event);
      };
      event.defaultPrevented = false;
    }

    event.isDefaultPrevented = function() {
      return event.defaultPrevented || event.returnValue === false;
    };

    var eventHandlersCopy = shallowCopy(events[type || event.type] || []);

    forEach(eventHandlersCopy, function(fn) {
      fn.call(element, event);
    });

    if (msie <= 8) {
      event.preventDefault = null;
      event.stopPropagation = null;
      event.isDefaultPrevented = null;
    } else {
      delete event.preventDefault;
      delete event.stopPropagation;
      delete event.isDefaultPrevented;
    }
  };
  eventHandler.elem = element;
  return eventHandler;
}

forEach({
  removeData: jqLiteRemoveData,

  on: function onFn(element, type, fn, unsupported){
    if (isDefined(unsupported)) throw jqLiteMinErr('onargs', 'jqLite#on() does not support the `selector` or `eventData` parameters');

    if (!jqLiteAcceptsData(element)) {
      return;
    }

    var events = jqLiteExpandoStore(element, 'events'),
        handle = jqLiteExpandoStore(element, 'handle');

    if (!events) jqLiteExpandoStore(element, 'events', events = {});
    if (!handle) jqLiteExpandoStore(element, 'handle', handle = createEventHandler(element, events));

    forEach(type.split(' '), function(type){
      var eventFns = events[type];

      if (!eventFns) {
        if (type == 'mouseenter' || type == 'mouseleave') {
          var contains = document.body.contains || document.body.compareDocumentPosition ?
          function( a, b ) {
            var adown = a.nodeType === 9 ? a.documentElement : a,
            bup = b && b.parentNode;
            return a === bup || !!( bup && bup.nodeType === 1 && (
              adown.contains ?
              adown.contains( bup ) :
              a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
              ));
            } :
            function( a, b ) {
              if ( b ) {
                while ( (b = b.parentNode) ) {
                  if ( b === a ) {
                    return true;
                  }
                }
              }
              return false;
            };

          events[type] = [];

          var eventmap = { mouseleave : "mouseout", mouseenter : "mouseover"};

          onFn(element, eventmap[type], function(event) {
            var target = this, related = event.relatedTarget;
            if ( !related || (related !== target && !contains(target, related)) ){
              handle(event, type);
            }
          });

        } else {
          addEventListenerFn(element, type, handle);
          events[type] = [];
        }
        eventFns = events[type];
      }
      eventFns.push(fn);
    });
  },

  off: jqLiteOff,

  one: function(element, type, fn) {
    element = jqLite(element);

    element.on(type, function onFn() {
      element.off(type, fn);
      element.off(type, onFn);
    });
    element.on(type, fn);
  },

  replaceWith: function(element, replaceNode) {
    var index, parent = element.parentNode;
    jqLiteDealoc(element);
    forEach(new JQLite(replaceNode), function(node){
      if (index) {
        parent.insertBefore(node, index.nextSibling);
      } else {
        parent.replaceChild(node, element);
      }
      index = node;
    });
  },

  children: function(element) {
    var children = [];
    forEach(element.childNodes, function(element){
      if (element.nodeType === 1)
        children.push(element);
    });
    return children;
  },

  contents: function(element) {
    return element.contentDocument || element.childNodes || [];
  },

  append: function(element, node) {
    forEach(new JQLite(node), function(child){
      if (element.nodeType === 1 || element.nodeType === 11) {
        element.appendChild(child);
      }
    });
  },

  prepend: function(element, node) {
    if (element.nodeType === 1) {
      var index = element.firstChild;
      forEach(new JQLite(node), function(child){
        element.insertBefore(child, index);
      });
    }
  },

  wrap: function(element, wrapNode) {
    wrapNode = jqLite(wrapNode)[0];
    var parent = element.parentNode;
    if (parent) {
      parent.replaceChild(wrapNode, element);
    }
    wrapNode.appendChild(element);
  },

  remove: function(element) {
    jqLiteDealoc(element);
    var parent = element.parentNode;
    if (parent) parent.removeChild(element);
  },

  after: function(element, newElement) {
    var index = element, parent = element.parentNode;
    forEach(new JQLite(newElement), function(node){
      parent.insertBefore(node, index.nextSibling);
      index = node;
    });
  },

  addClass: jqLiteAddClass,
  removeClass: jqLiteRemoveClass,

  toggleClass: function(element, selector, condition) {
    if (selector) {
      forEach(selector.split(' '), function(className){
        var classCondition = condition;
        if (isUndefined(classCondition)) {
          classCondition = !jqLiteHasClass(element, className);
        }
        (classCondition ? jqLiteAddClass : jqLiteRemoveClass)(element, className);
      });
    }
  },

  parent: function(element) {
    var parent = element.parentNode;
    return parent && parent.nodeType !== 11 ? parent : null;
  },

  next: function(element) {
    if (element.nextElementSibling) {
      return element.nextElementSibling;
    }

    var elm = element.nextSibling;
    while (elm != null && elm.nodeType !== 1) {
      elm = elm.nextSibling;
    }
    return elm;
  },

  find: function(element, selector) {
    if (element.getElementsByTagName) {
      return element.getElementsByTagName(selector);
    } else {
      return [];
    }
  },

  clone: jqLiteClone,

  triggerHandler: function(element, eventName, eventData) {
    var eventFns = (jqLiteExpandoStore(element, 'events') || {})[eventName];

    eventData = eventData || [];

    var event = [{
      preventDefault: function() {
        this.defaultPrevented = true;
      },
      isDefaultPrevented: function() {
        return this.defaultPrevented === true;
      },
      stopPropagation: noop
    }];

    forEach(eventFns, function(fn) {
      fn.apply(element, event.concat(eventData));
    });
  }
}, function(fn, name){

  JQLite.prototype[name] = function(arg1, arg2, arg3) {
    var value;
    for(var i=0; i < this.length; i++) {
      if (isUndefined(value)) {
        value = fn(this[i], arg1, arg2, arg3);
        if (isDefined(value)) {
          value = jqLite(value);
        }
      } else {
        jqLiteAddNodes(value, fn(this[i], arg1, arg2, arg3));
      }
    }
    return isDefined(value) ? value : this;
  };

  JQLite.prototype.bind = JQLite.prototype.on;
  JQLite.prototype.unbind = JQLite.prototype.off;
});


function hashKey(obj, nextUidFn) {
  var objType = typeof obj,
      key;

  if (objType == 'function' || (objType == 'object' && obj !== null)) {
    if (typeof (key = obj.$$hashKey) == 'function') {
      key = obj.$$hashKey();
    } else if (key === undefined) {
      key = obj.$$hashKey = (nextUidFn || nextUid)();
    }
  } else {
    key = obj;
  }

  return objType + ':' + key;
}


function HashMap(array, isolatedUid) {
  if (isolatedUid) {
    var uid = 0;
    this.nextUid = function() {
      return ++uid;
    };
  }
  forEach(array, this.put, this);
}
HashMap.prototype = {

  put: function(key, value) {
    this[hashKey(key, this.nextUid)] = value;
  },


  get: function(key) {
    return this[hashKey(key, this.nextUid)];
  },


  remove: function(key) {
    var value = this[key = hashKey(key, this.nextUid)];
    delete this[key];
    return value;
  }
};




var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var $injectorMinErr = minErr('$injector');

function anonFn(fn) {
  var fnText = fn.toString().replace(STRIP_COMMENTS, ''),
      args = fnText.match(FN_ARGS);
  if (args) {
    return 'function(' + (args[1] || '').replace(/[\s\r\n]+/, ' ') + ')';
  }
  return 'fn';
}

function annotate(fn, strictDi, name) {
  var $inject,
      fnText,
      argDecl,
      last;

  if (typeof fn === 'function') {
    if (!($inject = fn.$inject)) {
      $inject = [];
      if (fn.length) {
        if (strictDi) {
          if (!isString(name) || !name) {
            name = fn.name || anonFn(fn);
          }
          throw $injectorMinErr('strictdi',
            '{0} is not using explicit annotation and cannot be invoked in strict mode', name);
        }
        fnText = fn.toString().replace(STRIP_COMMENTS, '');
        argDecl = fnText.match(FN_ARGS);
        forEach(argDecl[1].split(FN_ARG_SPLIT), function(arg){
          arg.replace(FN_ARG, function(all, underscore, name){
            $inject.push(name);
          });
        });
      }
      fn.$inject = $inject;
    }
  } else if (isArray(fn)) {
    last = fn.length - 1;
    assertArgFn(fn[last], 'fn');
    $inject = fn.slice(0, last);
  } else {
    assertArgFn(fn, 'fn', true);
  }
  return $inject;
}

function createInjector(modulesToLoad, strictDi) {
  strictDi = (strictDi === true);
  var INSTANTIATING = {},
      providerSuffix = 'Provider',
      path = [],
      loadedModules = new HashMap([], true),
      providerCache = {
        $provide: {
            provider: supportObject(provider),
            factory: supportObject(factory),
            service: supportObject(service),
            value: supportObject(value),
            constant: supportObject(constant),
            decorator: decorator
          }
      },
      providerInjector = (providerCache.$injector =
          createInternalInjector(providerCache, function() {
            throw $injectorMinErr('unpr', "Unknown provider: {0}", path.join(' <- '));
          }, strictDi)),
      instanceCache = {},
      instanceInjector = (instanceCache.$injector =
          createInternalInjector(instanceCache, function(servicename) {
            var provider = providerInjector.get(servicename + providerSuffix);
            return instanceInjector.invoke(provider.$get, provider, undefined, servicename);
          }, strictDi));


  forEach(loadModules(modulesToLoad), function(fn) { instanceInjector.invoke(fn || noop); });

  return instanceInjector;

  function supportObject(delegate) {
    return function(key, value) {
      if (isObject(key)) {
        forEach(key, reverseParams(delegate));
      } else {
        return delegate(key, value);
      }
    };
  }

  function provider(name, provider_) {
    assertNotHasOwnProperty(name, 'service');
    if (isFunction(provider_) || isArray(provider_)) {
      provider_ = providerInjector.instantiate(provider_);
    }
    if (!provider_.$get) {
      throw $injectorMinErr('pget', "Provider '{0}' must define $get factory method.", name);
    }
    return providerCache[name + providerSuffix] = provider_;
  }

  function factory(name, factoryFn) { return provider(name, { $get: factoryFn }); }

  function service(name, constructor) {
    return factory(name, ['$injector', function($injector) {
      return $injector.instantiate(constructor);
    }]);
  }

  function value(name, val) { return factory(name, valueFn(val)); }

  function constant(name, value) {
    assertNotHasOwnProperty(name, 'constant');
    providerCache[name] = value;
    instanceCache[name] = value;
  }

  function decorator(serviceName, decorFn) {
    var origProvider = providerInjector.get(serviceName + providerSuffix),
        orig$get = origProvider.$get;

    origProvider.$get = function() {
      var origInstance = instanceInjector.invoke(orig$get, origProvider);
      return instanceInjector.invoke(decorFn, null, {$delegate: origInstance});
    };
  }

  function loadModules(modulesToLoad){
    var runBlocks = [], moduleFn, invokeQueue;
    forEach(modulesToLoad, function(module) {
      if (loadedModules.get(module)) return;
      loadedModules.put(module, true);

      function runInvokeQueue(queue) {
        var i, ii;
        for(i = 0, ii = queue.length; i < ii; i++) {
          var invokeArgs = queue[i],
              provider = providerInjector.get(invokeArgs[0]);

          provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
        }
      }

      try {
        if (isString(module)) {
          moduleFn = angularModule(module);
          runBlocks = runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks);
          runInvokeQueue(moduleFn._invokeQueue);
          runInvokeQueue(moduleFn._configBlocks);
        } else if (isFunction(module)) {
            runBlocks.push(providerInjector.invoke(module));
        } else if (isArray(module)) {
            runBlocks.push(providerInjector.invoke(module));
        } else {
          assertArgFn(module, 'module');
        }
      } catch (e) {
        if (isArray(module)) {
          module = module[module.length - 1];
        }
        if (e.message && e.stack && e.stack.indexOf(e.message) == -1) {
          e = e.message + '\n' + e.stack;
        }
        throw $injectorMinErr('modulerr', "Failed to instantiate module {0} due to:\n{1}",
                  module, e.stack || e.message || e);
      }
    });
    return runBlocks;
  }

  function createInternalInjector(cache, factory) {

    function getService(serviceName) {
      if (cache.hasOwnProperty(serviceName)) {
        if (cache[serviceName] === INSTANTIATING) {
          throw $injectorMinErr('cdep', 'Circular dependency found: {0}',
                    serviceName + ' <- ' + path.join(' <- '));
        }
        return cache[serviceName];
      } else {
        try {
          path.unshift(serviceName);
          cache[serviceName] = INSTANTIATING;
          return cache[serviceName] = factory(serviceName);
        } catch (err) {
          if (cache[serviceName] === INSTANTIATING) {
            delete cache[serviceName];
          }
          throw err;
        } finally {
          path.shift();
        }
      }
    }

    function invoke(fn, self, locals, serviceName){
      if (typeof locals === 'string') {
        serviceName = locals;
        locals = null;
      }

      var args = [],
          $inject = annotate(fn, strictDi, serviceName),
          length, i,
          key;

      for(i = 0, length = $inject.length; i < length; i++) {
        key = $inject[i];
        if (typeof key !== 'string') {
          throw $injectorMinErr('itkn',
                  'Incorrect injection token! Expected service name as string, got {0}', key);
        }
        args.push(
          locals && locals.hasOwnProperty(key)
          ? locals[key]
          : getService(key)
        );
      }
      if (isArray(fn)) {
        fn = fn[length];
      }

      return fn.apply(self, args);
    }

    function instantiate(Type, locals, serviceName) {
      var Constructor = function() {},
          instance, returnedValue;

      Constructor.prototype = (isArray(Type) ? Type[Type.length - 1] : Type).prototype;
      instance = new Constructor();
      returnedValue = invoke(Type, instance, locals, serviceName);

      return isObject(returnedValue) || isFunction(returnedValue) ? returnedValue : instance;
    }

    return {
      invoke: invoke,
      instantiate: instantiate,
      get: getService,
      annotate: annotate,
      has: function(name) {
        return providerCache.hasOwnProperty(name + providerSuffix) || cache.hasOwnProperty(name);
      }
    };
  }
}

createInjector.$$annotate = annotate;


function $AnchorScrollProvider() {

  var autoScrollingEnabled = true;

  this.disableAutoScrolling = function() {
    autoScrollingEnabled = false;
  };

  this.$get = ['$window', '$location', '$rootScope', function($window, $location, $rootScope) {
    var document = $window.document;

    function getFirstAnchor(list) {
      var result = null;
      forEach(list, function(element) {
        if (!result && nodeName_(element) === 'a') result = element;
      });
      return result;
    }

    function scroll() {
      var hash = $location.hash(), elm;

      if (!hash) $window.scrollTo(0, 0);

      else if ((elm = document.getElementById(hash))) elm.scrollIntoView();

      else if ((elm = getFirstAnchor(document.getElementsByName(hash)))) elm.scrollIntoView();

      else if (hash === 'top') $window.scrollTo(0, 0);
    }

    if (autoScrollingEnabled) {
      $rootScope.$watch(function autoScrollWatch() {return $location.hash();},
        function autoScrollWatchAction() {
          $rootScope.$evalAsync(scroll);
        });
    }

    return scroll;
  }];
}

var $animateMinErr = minErr('$animate');


var $AnimateProvider = ['$provide', function($provide) {


  this.$$selectors = {};



  this.register = function(name, factory) {
    var key = name + '-animation';
    if (name && name.charAt(0) != '.') throw $animateMinErr('notcsel',
        "Expecting class selector starting with '.' got '{0}'.", name);
    this.$$selectors[name.substr(1)] = key;
    $provide.factory(key, factory);
  };


  this.classNameFilter = function(expression) {
    if(arguments.length === 1) {
      this.$$classNameFilter = (expression instanceof RegExp) ? expression : null;
    }
    return this.$$classNameFilter;
  };

  this.$get = ['$timeout', '$$asyncCallback', function($timeout, $$asyncCallback) {

    function async(fn) {
      fn && $$asyncCallback(fn);
    }


    return {


      enter : function(element, parent, after, done) {
        after
            ? after.after(element)
            : parent.prepend(element);
        async(done);
        return noop;
      },


      leave : function(element, done) {
        element.remove();
        async(done);
        return noop;
      },


      move : function(element, parent, after, done) {
        return this.enter(element, parent, after, done);
      },


      addClass : function(element, className, done) {
        className = !isString(className)
                        ? (isArray(className) ? className.join(' ') : '')
                        : className;
        forEach(element, function (element) {
          jqLiteAddClass(element, className);
        });
        async(done);
        return noop;
      },


      removeClass : function(element, className, done) {
        className = isString(className) ?
                      className :
                      isArray(className) ? className.join(' ') : '';
        forEach(element, function (element) {
          jqLiteRemoveClass(element, className);
        });
        async(done);
        return noop;
      },


      setClass : function(element, add, remove, done) {
        forEach(element, function (element) {
          jqLiteAddClass(element, add);
          jqLiteRemoveClass(element, remove);
        });
        async(done);
        return noop;
      },

      enabled : noop
    };
  }];
}];

function $$AsyncCallbackProvider(){
  this.$get = ['$$rAF', '$timeout', function($$rAF, $timeout) {
    return $$rAF.supported
      ? function(fn) { return $$rAF(fn); }
      : function(fn) {
        return $timeout(fn, 0, false);
      };
  }];
}



function Browser(window, document, $log, $sniffer) {
  var self = this,
      rawDocument = document[0],
      location = window.location,
      history = window.history,
      setTimeout = window.setTimeout,
      clearTimeout = window.clearTimeout,
      pendingDeferIds = {};

  self.isMock = false;

  var outstandingRequestCount = 0;
  var outstandingRequestCallbacks = [];

  self.$$completeOutstandingRequest = completeOutstandingRequest;
  self.$$incOutstandingRequestCount = function() { outstandingRequestCount++; };


  function completeOutstandingRequest(fn) {
    try {
      fn.apply(null, sliceArgs(arguments, 1));
    } finally {
      outstandingRequestCount--;
      if (outstandingRequestCount === 0) {
        while(outstandingRequestCallbacks.length) {
          try {
            outstandingRequestCallbacks.pop()();
          } catch (e) {
            $log.error(e);
          }
        }
      }
    }
  }


  self.notifyWhenNoOutstandingRequests = function(callback) {
    forEach(pollFns, function(pollFn){ pollFn(); });

    if (outstandingRequestCount === 0) {
      callback();
    } else {
      outstandingRequestCallbacks.push(callback);
    }
  };

  var pollFns = [],
      pollTimeout;


  self.addPollFn = function(fn) {
    if (isUndefined(pollTimeout)) startPoller(100, setTimeout);
    pollFns.push(fn);
    return fn;
  };


  function startPoller(interval, setTimeout) {
    (function check() {
      forEach(pollFns, function(pollFn){ pollFn(); });
      pollTimeout = setTimeout(check, interval);
    })();
  }

  var lastBrowserUrl = location.href,
      baseElement = document.find('base'),
      newLocation = null;


  self.url = function(url, replace) {
    if (location !== window.location) location = window.location;
    if (history !== window.history) history = window.history;

    if (url) {
      if (lastBrowserUrl == url) return;
      lastBrowserUrl = url;
      if ($sniffer.history) {
        if (replace) history.replaceState(null, '', url);
        else {
          history.pushState(null, '', url);
          baseElement.attr('href', baseElement.attr('href'));
        }
      } else {
        newLocation = url;
        if (replace) {
          location.replace(url);
        } else {
          location.href = url;
        }
      }
      return self;
    } else {
      return newLocation || location.href.replace(/%27/g,"'");
    }
  };

  var urlChangeListeners = [],
      urlChangeInit = false;

  function fireUrlChange() {
    newLocation = null;
    if (lastBrowserUrl == self.url()) return;

    lastBrowserUrl = self.url();
    forEach(urlChangeListeners, function(listener) {
      listener(self.url());
    });
  }


  self.onUrlChange = function(callback) {
    if (!urlChangeInit) {
      if ($sniffer.history) jqLite(window).on('popstate', fireUrlChange);
      if ($sniffer.hashchange) jqLite(window).on('hashchange', fireUrlChange);
      else self.addPollFn(fireUrlChange);

      urlChangeInit = true;
    }

    urlChangeListeners.push(callback);
    return callback;
  };


  self.baseHref = function() {
    var href = baseElement.attr('href');
    return href ? href.replace(/^(https?\:)?\/\/[^\/]*/, '') : '';
  };

  var lastCookies = {};
  var lastCookieString = '';
  var cookiePath = self.baseHref();


  self.cookies = function(name, value) {
    var cookieLength, cookieArray, cookie, i, index;

    if (name) {
      if (value === undefined) {
        rawDocument.cookie = escape(name) + "=;path=" + cookiePath +
                                ";expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } else {
        if (isString(value)) {
          cookieLength = (rawDocument.cookie = escape(name) + '=' + escape(value) +
                                ';path=' + cookiePath).length + 1;

          if (cookieLength > 4096) {
            $log.warn("Cookie '"+ name +
              "' possibly not set or overflowed because it was too large ("+
              cookieLength + " > 4096 bytes)!");
          }
        }
      }
    } else {
      if (rawDocument.cookie !== lastCookieString) {
        lastCookieString = rawDocument.cookie;
        cookieArray = lastCookieString.split("; ");
        lastCookies = {};

        for (i = 0; i < cookieArray.length; i++) {
          cookie = cookieArray[i];
          index = cookie.indexOf('=');
          if (index > 0) {
            name = unescape(cookie.substring(0, index));
            if (lastCookies[name] === undefined) {
              lastCookies[name] = unescape(cookie.substring(index + 1));
            }
          }
        }
      }
      return lastCookies;
    }
  };



  self.defer = function(fn, delay) {
    var timeoutId;
    outstandingRequestCount++;
    timeoutId = setTimeout(function() {
      delete pendingDeferIds[timeoutId];
      completeOutstandingRequest(fn);
    }, delay || 0);
    pendingDeferIds[timeoutId] = true;
    return timeoutId;
  };



  self.defer.cancel = function(deferId) {
    if (pendingDeferIds[deferId]) {
      delete pendingDeferIds[deferId];
      clearTimeout(deferId);
      completeOutstandingRequest(noop);
      return true;
    }
    return false;
  };

}

function $BrowserProvider(){
  this.$get = ['$window', '$log', '$sniffer', '$document',
      function( $window,   $log,   $sniffer,   $document){
        return new Browser($window, $document, $log, $sniffer);
      }];
}


function $CacheFactoryProvider() {

  this.$get = function() {
    var caches = {};

    function cacheFactory(cacheId, options) {
      if (cacheId in caches) {
        throw minErr('$cacheFactory')('iid', "CacheId '{0}' is already taken!", cacheId);
      }

      var size = 0,
          stats = extend({}, options, {id: cacheId}),
          data = {},
          capacity = (options && options.capacity) || Number.MAX_VALUE,
          lruHash = {},
          freshEnd = null,
          staleEnd = null;


      return caches[cacheId] = {


        put: function(key, value) {
          if (capacity < Number.MAX_VALUE) {
            var lruEntry = lruHash[key] || (lruHash[key] = {key: key});

            refresh(lruEntry);
          }

          if (isUndefined(value)) return;
          if (!(key in data)) size++;
          data[key] = value;

          if (size > capacity) {
            this.remove(staleEnd.key);
          }

          return value;
        },


        get: function(key) {
          if (capacity < Number.MAX_VALUE) {
            var lruEntry = lruHash[key];

            if (!lruEntry) return;

            refresh(lruEntry);
          }

          return data[key];
        },



        remove: function(key) {
          if (capacity < Number.MAX_VALUE) {
            var lruEntry = lruHash[key];

            if (!lruEntry) return;

            if (lruEntry == freshEnd) freshEnd = lruEntry.p;
            if (lruEntry == staleEnd) staleEnd = lruEntry.n;
            link(lruEntry.n,lruEntry.p);

            delete lruHash[key];
          }

          delete data[key];
          size--;
        },



        removeAll: function() {
          data = {};
          size = 0;
          lruHash = {};
          freshEnd = staleEnd = null;
        },



        destroy: function() {
          data = null;
          stats = null;
          lruHash = null;
          delete caches[cacheId];
        },



        info: function() {
          return extend({}, stats, {size: size});
        }
      };



      function refresh(entry) {
        if (entry != freshEnd) {
          if (!staleEnd) {
            staleEnd = entry;
          } else if (staleEnd == entry) {
            staleEnd = entry.n;
          }

          link(entry.n, entry.p);
          link(entry, freshEnd);
          freshEnd = entry;
          freshEnd.n = null;
        }
      }



      function link(nextEntry, prevEntry) {
        if (nextEntry != prevEntry) {
          if (nextEntry) nextEntry.p = prevEntry;
          if (prevEntry) prevEntry.n = nextEntry;
        }
      }
    }



    cacheFactory.info = function() {
      var info = {};
      forEach(caches, function(cache, cacheId) {
        info[cacheId] = cache.info();
      });
      return info;
    };



    cacheFactory.get = function(cacheId) {
      return caches[cacheId];
    };


    return cacheFactory;
  };
}


function $TemplateCacheProvider() {
  this.$get = ['$cacheFactory', function($cacheFactory) {
    return $cacheFactory('templates');
  }];
}


var $compileMinErr = minErr('$compile');

$CompileProvider.$inject = ['$provide', '$$sanitizeUriProvider'];
function $CompileProvider($provide, $$sanitizeUriProvider) {
  var hasDirectives = {},
      Suffix = 'Directive',
      COMMENT_DIRECTIVE_REGEXP = /^\s*directive\:\s*([\d\w_\-]+)\s+(.*)$/,
      CLASS_DIRECTIVE_REGEXP = /(([\d\w_\-]+)(?:\:([^;]+))?;?)/,
      ALL_OR_NOTHING_ATTRS = makeMap('ngSrc,ngSrcset,src,srcset');

  var EVENT_HANDLER_ATTR_REGEXP = /^(on[a-z]+|formaction)$/;


   this.directive = function registerDirective(name, directiveFactory) {
    assertNotHasOwnProperty(name, 'directive');
    if (isString(name)) {
      assertArg(directiveFactory, 'directiveFactory');
      if (!hasDirectives.hasOwnProperty(name)) {
        hasDirectives[name] = [];
        $provide.factory(name + Suffix, ['$injector', '$exceptionHandler',
          function($injector, $exceptionHandler) {
            var directives = [];
            forEach(hasDirectives[name], function(directiveFactory, index) {
              try {
                var directive = $injector.invoke(directiveFactory);
                if (isFunction(directive)) {
                  directive = { compile: valueFn(directive) };
                } else if (!directive.compile && directive.link) {
                  directive.compile = valueFn(directive.link);
                }
                directive.priority = directive.priority || 0;
                directive.index = index;
                directive.name = directive.name || name;
                directive.require = directive.require || (directive.controller && directive.name);
                directive.restrict = directive.restrict || 'A';
                directives.push(directive);
              } catch (e) {
                $exceptionHandler(e);
              }
            });
            return directives;
          }]);
      }
      hasDirectives[name].push(directiveFactory);
    } else {
      forEach(name, reverseParams(registerDirective));
    }
    return this;
  };



  this.aHrefSanitizationWhitelist = function(regexp) {
    if (isDefined(regexp)) {
      $$sanitizeUriProvider.aHrefSanitizationWhitelist(regexp);
      return this;
    } else {
      return $$sanitizeUriProvider.aHrefSanitizationWhitelist();
    }
  };



  this.imgSrcSanitizationWhitelist = function(regexp) {
    if (isDefined(regexp)) {
      $$sanitizeUriProvider.imgSrcSanitizationWhitelist(regexp);
      return this;
    } else {
      return $$sanitizeUriProvider.imgSrcSanitizationWhitelist();
    }
  };

  this.$get = [
            '$injector', '$interpolate', '$exceptionHandler', '$http', '$templateCache', '$parse',
            '$controller', '$rootScope', '$document', '$sce', '$animate', '$$sanitizeUri',
    function($injector,   $interpolate,   $exceptionHandler,   $http,   $templateCache,   $parse,
             $controller,   $rootScope,   $document,   $sce,   $animate,   $$sanitizeUri) {

    var Attributes = function(element, attr) {
      this.$$element = element;
      this.$attr = attr || {};
    };

    Attributes.prototype = {
      $normalize: directiveNormalize,



      $addClass : function(classVal) {
        if(classVal && classVal.length > 0) {
          $animate.addClass(this.$$element, classVal);
        }
      },


      $removeClass : function(classVal) {
        if(classVal && classVal.length > 0) {
          $animate.removeClass(this.$$element, classVal);
        }
      },


      $updateClass : function(newClasses, oldClasses) {
        var toAdd = tokenDifference(newClasses, oldClasses);
        var toRemove = tokenDifference(oldClasses, newClasses);

        if(toAdd.length === 0) {
          $animate.removeClass(this.$$element, toRemove);
        } else if(toRemove.length === 0) {
          $animate.addClass(this.$$element, toAdd);
        } else {
          $animate.setClass(this.$$element, toAdd, toRemove);
        }
      },


      $set: function(key, value, writeAttr, attrName) {

        var node = this.$$element[0],
            booleanKey = getBooleanAttrName(node, key),
            aliasedKey = getAliasedAttrName(node, key),
            observer = key,
            normalizedVal,
            nodeName;

        if (booleanKey) {
          this.$$element.prop(key, value);
          attrName = booleanKey;
        } else if(aliasedKey) {
          this[aliasedKey] = value;
          observer = aliasedKey;
        }

        this[key] = value;

        if (attrName) {
          this.$attr[key] = attrName;
        } else {
          attrName = this.$attr[key];
          if (!attrName) {
            this.$attr[key] = attrName = snake_case(key, '-');
          }
        }

        nodeName = nodeName_(this.$$element);

        if ((nodeName === 'a' && key === 'href') ||
            (nodeName === 'img' && key === 'src')) {
          this[key] = value = $$sanitizeUri(value, key === 'src');
        }

        if (writeAttr !== false) {
          if (value === null || value === undefined) {
            this.$$element.removeAttr(attrName);
          } else {
            this.$$element.attr(attrName, value);
          }
        }

        var $$observers = this.$$observers;
        $$observers && forEach($$observers[observer], function(fn) {
          try {
            fn(value);
          } catch (e) {
            $exceptionHandler(e);
          }
        });
      },



      $observe: function(key, fn) {
        var attrs = this,
            $$observers = (attrs.$$observers || (attrs.$$observers = {})),
            listeners = ($$observers[key] || ($$observers[key] = []));

        listeners.push(fn);
        $rootScope.$evalAsync(function() {
          if (!listeners.$$inter) {
            fn(attrs[key]);
          }
        });

        return function() {
          arrayRemove(listeners, fn);
        };
      }
    };

    var startSymbol = $interpolate.startSymbol(),
        endSymbol = $interpolate.endSymbol(),
        denormalizeTemplate = (startSymbol == '{{' || endSymbol  == '}}')
            ? identity
            : function denormalizeTemplate(template) {
              return template.replace(/\{\{/g, startSymbol).replace(/}}/g, endSymbol);
        },
        NG_ATTR_BINDING = /^ngAttr[A-Z]/;


    return compile;


    function compile($compileNodes, transcludeFn, maxPriority, ignoreDirective,
                        previousCompileContext) {
      if (!($compileNodes instanceof jqLite)) {
        $compileNodes = jqLite($compileNodes);
      }
      forEach($compileNodes, function(node, index){
        if (node.nodeType == 3 && node.nodeValue.match(/\S+/) ) {
          $compileNodes[index] = node = jqLite(node).wrap('<span></span>').parent()[0];
        }
      });
      var compositeLinkFn =
              compileNodes($compileNodes, transcludeFn, $compileNodes,
                           maxPriority, ignoreDirective, previousCompileContext);
      safeAddClass($compileNodes, 'ng-scope');
      return function publicLinkFn(scope, cloneConnectFn, transcludeControllers, parentBoundTranscludeFn){
        assertArg(scope, 'scope');
        var $linkNode = cloneConnectFn
          ? JQLitePrototype.clone.call($compileNodes)          : $compileNodes;

        forEach(transcludeControllers, function(instance, name) {
          $linkNode.data('$' + name + 'Controller', instance);
        });

        $linkNode.data('$scope', scope);

        if (cloneConnectFn) cloneConnectFn($linkNode, scope);
        if (compositeLinkFn) compositeLinkFn(scope, $linkNode, $linkNode, parentBoundTranscludeFn);
        return $linkNode;
      };
    }

    function safeAddClass($element, className) {
      try {
        $element.addClass(className);
      } catch(e) {
      }
    }


    function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective,
                            previousCompileContext) {
      var linkFns = [],
          attrs, directives, nodeLinkFn, childNodes, childLinkFn, linkFnFound;

      for (var i = 0; i < nodeList.length; i++) {
        attrs = new Attributes();

        directives = collectDirectives(nodeList[i], [], attrs, i === 0 ? maxPriority : undefined,
                                        ignoreDirective);

        nodeLinkFn = (directives.length)
            ? applyDirectivesToNode(directives, nodeList[i], attrs, transcludeFn, $rootElement,
                                      null, [], [], previousCompileContext)
            : null;

        if (nodeLinkFn && nodeLinkFn.scope) {
          safeAddClass(jqLite(nodeList[i]), 'ng-scope');
        }

        childLinkFn = (nodeLinkFn && nodeLinkFn.terminal ||
                      !(childNodes = nodeList[i].childNodes) ||
                      !childNodes.length)
            ? null
            : compileNodes(childNodes,
                 nodeLinkFn ? (
                  (nodeLinkFn.transcludeOnThisElement || !nodeLinkFn.templateOnThisElement)
                     && nodeLinkFn.transclude) : transcludeFn);

        linkFns.push(nodeLinkFn, childLinkFn);
        linkFnFound = linkFnFound || nodeLinkFn || childLinkFn;
        previousCompileContext = null;
      }

      return linkFnFound ? compositeLinkFn : null;

      function compositeLinkFn(scope, nodeList, $rootElement, parentBoundTranscludeFn) {
        var nodeLinkFn, childLinkFn, node, $node, childScope, i, ii, n, childBoundTranscludeFn;

        var nodeListLength = nodeList.length,
            stableNodeList = new Array(nodeListLength);
        for (i = 0; i < nodeListLength; i++) {
          stableNodeList[i] = nodeList[i];
        }

        for(i = 0, n = 0, ii = linkFns.length; i < ii; n++) {
          node = stableNodeList[n];
          nodeLinkFn = linkFns[i++];
          childLinkFn = linkFns[i++];
          $node = jqLite(node);

          if (nodeLinkFn) {
            if (nodeLinkFn.scope) {
              childScope = scope.$new();
              $node.data('$scope', childScope);
            } else {
              childScope = scope;
            }

            if ( nodeLinkFn.transcludeOnThisElement ) {
              childBoundTranscludeFn = createBoundTranscludeFn(scope, nodeLinkFn.transclude, parentBoundTranscludeFn);

            } else if (!nodeLinkFn.templateOnThisElement && parentBoundTranscludeFn) {
              childBoundTranscludeFn = parentBoundTranscludeFn;

            } else if (!parentBoundTranscludeFn && transcludeFn) {
              childBoundTranscludeFn = createBoundTranscludeFn(scope, transcludeFn);

            } else {
              childBoundTranscludeFn = null;
            }

            nodeLinkFn(childLinkFn, childScope, node, $rootElement, childBoundTranscludeFn);

          } else if (childLinkFn) {
            childLinkFn(scope, node.childNodes, undefined, parentBoundTranscludeFn);
          }
        }
      }
    }

    function createBoundTranscludeFn(scope, transcludeFn, previousBoundTranscludeFn) {

      var boundTranscludeFn = function(transcludedScope, cloneFn, controllers) {
        var scopeCreated = false;

        if (!transcludedScope) {
          transcludedScope = scope.$new();
          transcludedScope.$$transcluded = true;
          scopeCreated = true;
        }

        var clone = transcludeFn(transcludedScope, cloneFn, controllers, previousBoundTranscludeFn);
        if (scopeCreated) {
          clone.on('$destroy', function() { transcludedScope.$destroy(); });
        }
        return clone;
      };

      return boundTranscludeFn;
    }


    function collectDirectives(node, directives, attrs, maxPriority, ignoreDirective) {
      var nodeType = node.nodeType,
          attrsMap = attrs.$attr,
          match,
          className;

      switch(nodeType) {
        case 1:
          addDirective(directives,
              directiveNormalize(nodeName_(node)), 'E', maxPriority, ignoreDirective);

          for (var attr, name, nName, ngAttrName, value, isNgAttr, nAttrs = node.attributes,
                   j = 0, jj = nAttrs && nAttrs.length; j < jj; j++) {
            var attrStartName = false;
            var attrEndName = false;

            attr = nAttrs[j];
            if (!msie || msie >= 8 || attr.specified) {
              name = attr.name;
              value = trim(attr.value);

              ngAttrName = directiveNormalize(name);
              if (isNgAttr = NG_ATTR_BINDING.test(ngAttrName)) {
                name = snake_case(ngAttrName.substr(6), '-');
              }

              var directiveNName = ngAttrName.replace(/(Start|End)$/, '');
              if (ngAttrName === directiveNName + 'Start') {
                attrStartName = name;
                attrEndName = name.substr(0, name.length - 5) + 'end';
                name = name.substr(0, name.length - 6);
              }

              nName = directiveNormalize(name.toLowerCase());
              attrsMap[nName] = name;
              if (isNgAttr || !attrs.hasOwnProperty(nName)) {
                  attrs[nName] = value;
                  if (getBooleanAttrName(node, nName)) {
                    attrs[nName] = true;                  }
              }
              addAttrInterpolateDirective(node, directives, value, nName);
              addDirective(directives, nName, 'A', maxPriority, ignoreDirective, attrStartName,
                            attrEndName);
            }
          }

          className = node.className;
          if (isString(className) && className !== '') {
            while (match = CLASS_DIRECTIVE_REGEXP.exec(className)) {
              nName = directiveNormalize(match[2]);
              if (addDirective(directives, nName, 'C', maxPriority, ignoreDirective)) {
                attrs[nName] = trim(match[3]);
              }
              className = className.substr(match.index + match[0].length);
            }
          }
          break;
        case 3:
          addTextInterpolateDirective(directives, node.nodeValue);
          break;
        case 8:
          try {
            match = COMMENT_DIRECTIVE_REGEXP.exec(node.nodeValue);
            if (match) {
              nName = directiveNormalize(match[1]);
              if (addDirective(directives, nName, 'M', maxPriority, ignoreDirective)) {
                attrs[nName] = trim(match[2]);
              }
            }
          } catch (e) {
          }
          break;
      }

      directives.sort(byPriority);
      return directives;
    }


    function groupScan(node, attrStart, attrEnd) {
      var nodes = [];
      var depth = 0;
      if (attrStart && node.hasAttribute && node.hasAttribute(attrStart)) {
        var startNode = node;
        do {
          if (!node) {
            throw $compileMinErr('uterdir',
                      "Unterminated attribute, found '{0}' but no matching '{1}' found.",
                      attrStart, attrEnd);
          }
          if (node.nodeType == 1 ) {
            if (node.hasAttribute(attrStart)) depth++;
            if (node.hasAttribute(attrEnd)) depth--;
          }
          nodes.push(node);
          node = node.nextSibling;
        } while (depth > 0);
      } else {
        nodes.push(node);
      }

      return jqLite(nodes);
    }


    function groupElementsLinkFnWrapper(linkFn, attrStart, attrEnd) {
      return function(scope, element, attrs, controllers, transcludeFn) {
        element = groupScan(element[0], attrStart, attrEnd);
        return linkFn(scope, element, attrs, controllers, transcludeFn);
      };
    }


    function applyDirectivesToNode(directives, compileNode, templateAttrs, transcludeFn,
                                   jqCollection, originalReplaceDirective, preLinkFns, postLinkFns,
                                   previousCompileContext) {
      previousCompileContext = previousCompileContext || {};

      var terminalPriority = -Number.MAX_VALUE,
          newScopeDirective,
          controllerDirectives = previousCompileContext.controllerDirectives,
          newIsolateScopeDirective = previousCompileContext.newIsolateScopeDirective,
          templateDirective = previousCompileContext.templateDirective,
          nonTlbTranscludeDirective = previousCompileContext.nonTlbTranscludeDirective,
          hasTranscludeDirective = false,
          hasTemplate = false,
          hasElementTranscludeDirective = previousCompileContext.hasElementTranscludeDirective,
          $compileNode = templateAttrs.$$element = jqLite(compileNode),
          directive,
          directiveName,
          $template,
          replaceDirective = originalReplaceDirective,
          childTranscludeFn = transcludeFn,
          linkFn,
          directiveValue;

      for(var i = 0, ii = directives.length; i < ii; i++) {
        directive = directives[i];
        var attrStart = directive.$$start;
        var attrEnd = directive.$$end;

        if (attrStart) {
          $compileNode = groupScan(compileNode, attrStart, attrEnd);
        }
        $template = undefined;

        if (terminalPriority > directive.priority) {
          break;        }

        if (directiveValue = directive.scope) {

          if (!directive.templateUrl) {
            if (isObject(directiveValue)) {
              assertNoDuplicate('new/isolated scope', newIsolateScopeDirective || newScopeDirective,
                                directive, $compileNode);
              newIsolateScopeDirective = directive;
            } else {
              assertNoDuplicate('new/isolated scope', newIsolateScopeDirective, directive,
                                $compileNode);
            }
          }

          newScopeDirective = newScopeDirective || directive;
        }

        directiveName = directive.name;

        if (!directive.templateUrl && directive.controller) {
          directiveValue = directive.controller;
          controllerDirectives = controllerDirectives || {};
          assertNoDuplicate("'" + directiveName + "' controller",
              controllerDirectives[directiveName], directive, $compileNode);
          controllerDirectives[directiveName] = directive;
        }

        if (directiveValue = directive.transclude) {
          hasTranscludeDirective = true;

          if (!directive.$$tlb) {
            assertNoDuplicate('transclusion', nonTlbTranscludeDirective, directive, $compileNode);
            nonTlbTranscludeDirective = directive;
          }

          if (directiveValue == 'element') {
            hasElementTranscludeDirective = true;
            terminalPriority = directive.priority;
            $template = groupScan(compileNode, attrStart, attrEnd);
            $compileNode = templateAttrs.$$element =
                jqLite(document.createComment(' ' + directiveName + ': ' +
                                              templateAttrs[directiveName] + ' '));
            compileNode = $compileNode[0];
            replaceWith(jqCollection, jqLite(sliceArgs($template)), compileNode);

            childTranscludeFn = compile($template, transcludeFn, terminalPriority,
                                        replaceDirective && replaceDirective.name, {
                                          nonTlbTranscludeDirective: nonTlbTranscludeDirective
                                        });
          } else {
            $template = jqLite(jqLiteClone(compileNode)).contents();
            $compileNode.empty();            childTranscludeFn = compile($template, transcludeFn);
          }
        }

        if (directive.template) {
          hasTemplate = true;
          assertNoDuplicate('template', templateDirective, directive, $compileNode);
          templateDirective = directive;

          directiveValue = (isFunction(directive.template))
              ? directive.template($compileNode, templateAttrs)
              : directive.template;

          directiveValue = denormalizeTemplate(directiveValue);

          if (directive.replace) {
            replaceDirective = directive;
            if (jqLiteIsTextNode(directiveValue)) {
              $template = [];
            } else {
              $template = jqLite(wrapTemplate(directive.type, trim(directiveValue)));
            }
            compileNode = $template[0];

            if ($template.length != 1 || compileNode.nodeType !== 1) {
              throw $compileMinErr('tplrt',
                  "Template for directive '{0}' must have exactly one root element. {1}",
                  directiveName, '');
            }

            replaceWith(jqCollection, $compileNode, compileNode);

            var newTemplateAttrs = {$attr: {}};

            var templateDirectives = collectDirectives(compileNode, [], newTemplateAttrs);
            var unprocessedDirectives = directives.splice(i + 1, directives.length - (i + 1));

            if (newIsolateScopeDirective) {
              markDirectivesAsIsolate(templateDirectives);
            }
            directives = directives.concat(templateDirectives).concat(unprocessedDirectives);
            mergeTemplateAttributes(templateAttrs, newTemplateAttrs);

            ii = directives.length;
          } else {
            $compileNode.html(directiveValue);
          }
        }

        if (directive.templateUrl) {
          hasTemplate = true;
          assertNoDuplicate('template', templateDirective, directive, $compileNode);
          templateDirective = directive;

          if (directive.replace) {
            replaceDirective = directive;
          }

          nodeLinkFn = compileTemplateUrl(directives.splice(i, directives.length - i), $compileNode,
              templateAttrs, jqCollection, hasTranscludeDirective && childTranscludeFn, preLinkFns, postLinkFns, {
                controllerDirectives: controllerDirectives,
                newIsolateScopeDirective: newIsolateScopeDirective,
                templateDirective: templateDirective,
                nonTlbTranscludeDirective: nonTlbTranscludeDirective
              });
          ii = directives.length;
        } else if (directive.compile) {
          try {
            linkFn = directive.compile($compileNode, templateAttrs, childTranscludeFn);
            if (isFunction(linkFn)) {
              addLinkFns(null, linkFn, attrStart, attrEnd);
            } else if (linkFn) {
              addLinkFns(linkFn.pre, linkFn.post, attrStart, attrEnd);
            }
          } catch (e) {
            $exceptionHandler(e, startingTag($compileNode));
          }
        }

        if (directive.terminal) {
          nodeLinkFn.terminal = true;
          terminalPriority = Math.max(terminalPriority, directive.priority);
        }

      }

      nodeLinkFn.scope = newScopeDirective && newScopeDirective.scope === true;
      nodeLinkFn.transcludeOnThisElement = hasTranscludeDirective;
      nodeLinkFn.templateOnThisElement = hasTemplate;
      nodeLinkFn.transclude = childTranscludeFn;

      previousCompileContext.hasElementTranscludeDirective = hasElementTranscludeDirective;

      return nodeLinkFn;


      function addLinkFns(pre, post, attrStart, attrEnd) {
        if (pre) {
          if (attrStart) pre = groupElementsLinkFnWrapper(pre, attrStart, attrEnd);
          pre.require = directive.require;
          pre.directiveName = directiveName;
          if (newIsolateScopeDirective === directive || directive.$$isolateScope) {
            pre = cloneAndAnnotateFn(pre, {isolateScope: true});
          }
          preLinkFns.push(pre);
        }
        if (post) {
          if (attrStart) post = groupElementsLinkFnWrapper(post, attrStart, attrEnd);
          post.require = directive.require;
          post.directiveName = directiveName;
          if (newIsolateScopeDirective === directive || directive.$$isolateScope) {
            post = cloneAndAnnotateFn(post, {isolateScope: true});
          }
          postLinkFns.push(post);
        }
      }


      function getControllers(directiveName, require, $element, elementControllers) {
        var value, retrievalMethod = 'data', optional = false;
        if (isString(require)) {
          while((value = require.charAt(0)) == '^' || value == '?') {
            require = require.substr(1);
            if (value == '^') {
              retrievalMethod = 'inheritedData';
            }
            optional = optional || value == '?';
          }
          value = null;

          if (elementControllers && retrievalMethod === 'data') {
            value = elementControllers[require];
          }
          value = value || $element[retrievalMethod]('$' + require + 'Controller');

          if (!value && !optional) {
            throw $compileMinErr('ctreq',
                "Controller '{0}', required by directive '{1}', can't be found!",
                require, directiveName);
          }
          return value;
        } else if (isArray(require)) {
          value = [];
          forEach(require, function(require) {
            value.push(getControllers(directiveName, require, $element, elementControllers));
          });
        }
        return value;
      }


      function nodeLinkFn(childLinkFn, scope, linkNode, $rootElement, boundTranscludeFn) {
        var attrs, $element, i, ii, linkFn, controller, isolateScope, elementControllers = {}, transcludeFn;

        if (compileNode === linkNode) {
          attrs = templateAttrs;
        } else {
          attrs = shallowCopy(templateAttrs, new Attributes(jqLite(linkNode), templateAttrs.$attr));
        }
        $element = attrs.$$element;

        if (newIsolateScopeDirective) {
          var LOCAL_REGEXP = /^\s*([@=&])(\??)\s*(\w*)\s*$/;
          var $linkNode = jqLite(linkNode);

          isolateScope = scope.$new(true);

          if (templateDirective && (templateDirective === newIsolateScopeDirective ||
              templateDirective === newIsolateScopeDirective.$$originalDirective)) {
            $linkNode.data('$isolateScope', isolateScope) ;
          } else {
            $linkNode.data('$isolateScopeNoTemplate', isolateScope);
          }



          safeAddClass($linkNode, 'ng-isolate-scope');

          forEach(newIsolateScopeDirective.scope, function(definition, scopeName) {
            var match = definition.match(LOCAL_REGEXP) || [],
                attrName = match[3] || scopeName,
                optional = (match[2] == '?'),
                mode = match[1],                lastValue,
                parentGet, parentSet, compare;

            isolateScope.$$isolateBindings[scopeName] = mode + attrName;

            switch (mode) {

              case '@':
                attrs.$observe(attrName, function(value) {
                  isolateScope[scopeName] = value;
                });
                attrs.$$observers[attrName].$$scope = scope;
                if( attrs[attrName] ) {
                  isolateScope[scopeName] = $interpolate(attrs[attrName])(scope);
                }
                break;

              case '=':
                if (optional && !attrs[attrName]) {
                  return;
                }
                parentGet = $parse(attrs[attrName]);
                if (parentGet.literal) {
                  compare = equals;
                } else {
                  compare = function(a,b) { return a === b; };
                }
                parentSet = parentGet.assign || function() {
                  lastValue = isolateScope[scopeName] = parentGet(scope);
                  throw $compileMinErr('nonassign',
                      "Expression '{0}' used with directive '{1}' is non-assignable!",
                      attrs[attrName], newIsolateScopeDirective.name);
                };
                lastValue = isolateScope[scopeName] = parentGet(scope);
                isolateScope.$watch(function parentValueWatch() {
                  var parentValue = parentGet(scope);
                  if (!compare(parentValue, isolateScope[scopeName])) {
                    if (!compare(parentValue, lastValue)) {
                      isolateScope[scopeName] = parentValue;
                    } else {
                      parentSet(scope, parentValue = isolateScope[scopeName]);
                    }
                  }
                  parentValueWatch.$$unwatch = parentGet.$$unwatch;
                  return lastValue = parentValue;
                }, null, parentGet.literal);
                break;

              case '&':
                parentGet = $parse(attrs[attrName]);
                isolateScope[scopeName] = function(locals) {
                  return parentGet(scope, locals);
                };
                break;

              default:
                throw $compileMinErr('iscp',
                    "Invalid isolate scope definition for directive '{0}'." +
                    " Definition: {... {1}: '{2}' ...}",
                    newIsolateScopeDirective.name, scopeName, definition);
            }
          });
        }
        transcludeFn = boundTranscludeFn && controllersBoundTransclude;
        if (controllerDirectives) {
          forEach(controllerDirectives, function(directive) {
            var locals = {
              $scope: directive === newIsolateScopeDirective || directive.$$isolateScope ? isolateScope : scope,
              $element: $element,
              $attrs: attrs,
              $transclude: transcludeFn
            }, controllerInstance;

            controller = directive.controller;
            if (controller == '@') {
              controller = attrs[directive.name];
            }

            controllerInstance = $controller(controller, locals);
            elementControllers[directive.name] = controllerInstance;
            if (!hasElementTranscludeDirective) {
              $element.data('$' + directive.name + 'Controller', controllerInstance);
            }

            if (directive.controllerAs) {
              locals.$scope[directive.controllerAs] = controllerInstance;
            }
          });
        }

        for(i = 0, ii = preLinkFns.length; i < ii; i++) {
          try {
            linkFn = preLinkFns[i];
            linkFn(linkFn.isolateScope ? isolateScope : scope, $element, attrs,
                linkFn.require && getControllers(linkFn.directiveName, linkFn.require, $element, elementControllers), transcludeFn);
          } catch (e) {
            $exceptionHandler(e, startingTag($element));
          }
        }

        var scopeToChild = scope;
        if (newIsolateScopeDirective && (newIsolateScopeDirective.template || newIsolateScopeDirective.templateUrl === null)) {
          scopeToChild = isolateScope;
        }
        childLinkFn && childLinkFn(scopeToChild, linkNode.childNodes, undefined, boundTranscludeFn);

        for(i = postLinkFns.length - 1; i >= 0; i--) {
          try {
            linkFn = postLinkFns[i];
            linkFn(linkFn.isolateScope ? isolateScope : scope, $element, attrs,
                linkFn.require && getControllers(linkFn.directiveName, linkFn.require, $element, elementControllers), transcludeFn);
          } catch (e) {
            $exceptionHandler(e, startingTag($element));
          }
        }

        function controllersBoundTransclude(scope, cloneAttachFn) {
          var transcludeControllers;

          if (arguments.length < 2) {
            cloneAttachFn = scope;
            scope = undefined;
          }

          if (hasElementTranscludeDirective) {
            transcludeControllers = elementControllers;
          }

          return boundTranscludeFn(scope, cloneAttachFn, transcludeControllers);
        }
      }
    }

    function markDirectivesAsIsolate(directives) {
      for (var j = 0, jj = directives.length; j < jj; j++) {
        directives[j] = inherit(directives[j], {$$isolateScope: true});
      }
    }


    function addDirective(tDirectives, name, location, maxPriority, ignoreDirective, startAttrName,
                          endAttrName) {
      if (name === ignoreDirective) return null;
      var match = null;
      if (hasDirectives.hasOwnProperty(name)) {
        for(var directive, directives = $injector.get(name + Suffix),
            i = 0, ii = directives.length; i<ii; i++) {
          try {
            directive = directives[i];
            if ( (maxPriority === undefined || maxPriority > directive.priority) &&
                 directive.restrict.indexOf(location) != -1) {
              if (startAttrName) {
                directive = inherit(directive, {$$start: startAttrName, $$end: endAttrName});
              }
              tDirectives.push(directive);
              match = directive;
            }
          } catch(e) { $exceptionHandler(e); }
        }
      }
      return match;
    }



    function mergeTemplateAttributes(dst, src) {
      var srcAttr = src.$attr,
          dstAttr = dst.$attr,
          $element = dst.$$element;

      forEach(dst, function(value, key) {
        if (key.charAt(0) != '$') {
          if (src[key] && src[key] !== value) {
            value += (key === 'style' ? ';' : ' ') + src[key];
          }
          dst.$set(key, value, true, srcAttr[key]);
        }
      });

      forEach(src, function(value, key) {
        if (key == 'class') {
          safeAddClass($element, value);
          dst['class'] = (dst['class'] ? dst['class'] + ' ' : '') + value;
        } else if (key == 'style') {
          $element.attr('style', $element.attr('style') + ';' + value);
          dst['style'] = (dst['style'] ? dst['style'] + ';' : '') + value;
        } else if (key.charAt(0) != '$' && !dst.hasOwnProperty(key)) {
          dst[key] = value;
          dstAttr[key] = srcAttr[key];
        }
      });
    }


    function compileTemplateUrl(directives, $compileNode, tAttrs,
        $rootElement, childTranscludeFn, preLinkFns, postLinkFns, previousCompileContext) {
      var linkQueue = [],
          afterTemplateNodeLinkFn,
          afterTemplateChildLinkFn,
          beforeTemplateCompileNode = $compileNode[0],
          origAsyncDirective = directives.shift(),
          derivedSyncDirective = extend({}, origAsyncDirective, {
            templateUrl: null, transclude: null, replace: null, $$originalDirective: origAsyncDirective
          }),
          templateUrl = (isFunction(origAsyncDirective.templateUrl))
              ? origAsyncDirective.templateUrl($compileNode, tAttrs)
              : origAsyncDirective.templateUrl,
          type = origAsyncDirective.type;

      $compileNode.empty();

      $http.get($sce.getTrustedResourceUrl(templateUrl), {cache: $templateCache}).
        success(function(content) {
          var compileNode, tempTemplateAttrs, $template, childBoundTranscludeFn;

          content = denormalizeTemplate(content);

          if (origAsyncDirective.replace) {
            if (jqLiteIsTextNode(content)) {
              $template = [];
            } else {
              $template = jqLite(wrapTemplate(type, trim(content)));
            }
            compileNode = $template[0];

            if ($template.length != 1 || compileNode.nodeType !== 1) {
              throw $compileMinErr('tplrt',
                  "Template for directive '{0}' must have exactly one root element. {1}",
                  origAsyncDirective.name, templateUrl);
            }

            tempTemplateAttrs = {$attr: {}};
            replaceWith($rootElement, $compileNode, compileNode);
            var templateDirectives = collectDirectives(compileNode, [], tempTemplateAttrs);

            if (isObject(origAsyncDirective.scope)) {
              markDirectivesAsIsolate(templateDirectives);
            }
            directives = templateDirectives.concat(directives);
            mergeTemplateAttributes(tAttrs, tempTemplateAttrs);
          } else {
            compileNode = beforeTemplateCompileNode;
            $compileNode.html(content);
          }

          directives.unshift(derivedSyncDirective);

          afterTemplateNodeLinkFn = applyDirectivesToNode(directives, compileNode, tAttrs,
              childTranscludeFn, $compileNode, origAsyncDirective, preLinkFns, postLinkFns,
              previousCompileContext);
          forEach($rootElement, function(node, i) {
            if (node == compileNode) {
              $rootElement[i] = $compileNode[0];
            }
          });
          afterTemplateChildLinkFn = compileNodes($compileNode[0].childNodes, childTranscludeFn);

          while(linkQueue.length) {
            var scope = linkQueue.shift(),
                beforeTemplateLinkNode = linkQueue.shift(),
                linkRootElement = linkQueue.shift(),
                boundTranscludeFn = linkQueue.shift(),
                linkNode = $compileNode[0];

            if (beforeTemplateLinkNode !== beforeTemplateCompileNode) {
              var oldClasses = beforeTemplateLinkNode.className;

              if (!(previousCompileContext.hasElementTranscludeDirective &&
                  origAsyncDirective.replace)) {
                linkNode = jqLiteClone(compileNode);
              }

              replaceWith(linkRootElement, jqLite(beforeTemplateLinkNode), linkNode);

              safeAddClass(jqLite(linkNode), oldClasses);
            }
            if (afterTemplateNodeLinkFn.transcludeOnThisElement) {
              childBoundTranscludeFn = createBoundTranscludeFn(scope, afterTemplateNodeLinkFn.transclude, boundTranscludeFn);
            } else {
              childBoundTranscludeFn = boundTranscludeFn;
            }
            afterTemplateNodeLinkFn(afterTemplateChildLinkFn, scope, linkNode, $rootElement,
              childBoundTranscludeFn);
          }
          linkQueue = null;
        }).
        error(function(response, code, headers, config) {
          throw $compileMinErr('tpload', 'Failed to load template: {0}', config.url);
        });

      return function delayedNodeLinkFn(ignoreChildLinkFn, scope, node, rootElement, boundTranscludeFn) {
        var childBoundTranscludeFn = boundTranscludeFn;
        if (linkQueue) {
          linkQueue.push(scope);
          linkQueue.push(node);
          linkQueue.push(rootElement);
          linkQueue.push(childBoundTranscludeFn);
        } else {
          if (afterTemplateNodeLinkFn.transcludeOnThisElement) {
            childBoundTranscludeFn = createBoundTranscludeFn(scope, afterTemplateNodeLinkFn.transclude, boundTranscludeFn);
          }
          afterTemplateNodeLinkFn(afterTemplateChildLinkFn, scope, node, rootElement, childBoundTranscludeFn);
        }
      };
    }



    function byPriority(a, b) {
      var diff = b.priority - a.priority;
      if (diff !== 0) return diff;
      if (a.name !== b.name) return (a.name < b.name) ? -1 : 1;
      return a.index - b.index;
    }


    function assertNoDuplicate(what, previousDirective, directive, element) {
      if (previousDirective) {
        throw $compileMinErr('multidir', 'Multiple directives [{0}, {1}] asking for {2} on: {3}',
            previousDirective.name, directive.name, what, startingTag(element));
      }
    }


    function addTextInterpolateDirective(directives, text) {
      var interpolateFn = $interpolate(text, true);
      if (interpolateFn) {
        directives.push({
          priority: 0,
          compile: function textInterpolateCompileFn(templateNode) {
            var parent = templateNode.parent(), hasCompileParent = parent.length;
            if (hasCompileParent) safeAddClass(templateNode.parent(), 'ng-binding');

            return function textInterpolateLinkFn(scope, node) {
              var parent = node.parent(),
                  bindings = parent.data('$binding') || [];
              interpolateFn = $interpolate(text);
              bindings.push(interpolateFn);
              parent.data('$binding', bindings);
              if (!hasCompileParent) safeAddClass(parent, 'ng-binding');
              scope.$watch(interpolateFn, function interpolateFnWatchAction(value) {
                node[0].nodeValue = value;
              });
            };
          }
        });
      }
    }


    function wrapTemplate(type, template) {
      type = lowercase(type || 'html');
      switch(type) {
      case 'svg':
      case 'math':
        var wrapper = document.createElement('div');
        wrapper.innerHTML = '<'+type+'>'+template+'</'+type+'>';
        return wrapper.childNodes[0].childNodes;
      default:
        return template;
      }
    }


    function getTrustedContext(node, attrNormalizedName) {
      if (attrNormalizedName == "srcdoc") {
        return $sce.HTML;
      }
      var tag = nodeName_(node);
      if (attrNormalizedName == "xlinkHref" ||
          (tag == "form" && attrNormalizedName == "action") ||
          (tag != "img" && (attrNormalizedName == "src" ||
                            attrNormalizedName == "ngSrc"))) {
        return $sce.RESOURCE_URL;
      }
    }


    function addAttrInterpolateDirective(node, directives, value, name) {
      var interpolateFn = $interpolate(value, true);

      if (!interpolateFn) return;


      if (name === "multiple" && nodeName_(node) === "select") {
        throw $compileMinErr("selmulti",
            "Binding to the 'multiple' attribute is not supported. Element: {0}",
            startingTag(node));
      }

      directives.push({
        priority: 100,
        compile: function() {
            return {
              pre: function attrInterpolatePreLinkFn(scope, element, attr) {
                var $$observers = (attr.$$observers || (attr.$$observers = {}));

                if (EVENT_HANDLER_ATTR_REGEXP.test(name)) {
                  throw $compileMinErr('nodomevents',
                      "Interpolations for HTML DOM event attributes are disallowed.  Please use the " +
                          "ng- versions (such as ng-click instead of onclick) instead.");
                }

                interpolateFn = $interpolate(attr[name], true, getTrustedContext(node, name),
                    ALL_OR_NOTHING_ATTRS[name]);

                if (!interpolateFn) return;

                attr[name] = interpolateFn(scope);

                ($$observers[name] || ($$observers[name] = [])).$$inter = true;
                (attr.$$observers && attr.$$observers[name].$$scope || scope).
                  $watch(interpolateFn, function interpolateFnWatchAction(newValue, oldValue) {
                    if(name === 'class' && newValue != oldValue) {
                      attr.$updateClass(newValue, oldValue);
                    } else {
                      attr.$set(name, newValue);
                    }
                  });
              }
            };
          }
      });
    }



    function replaceWith($rootElement, elementsToRemove, newNode) {
      var firstElementToRemove = elementsToRemove[0],
          removeCount = elementsToRemove.length,
          parent = firstElementToRemove.parentNode,
          i, ii;

      if ($rootElement) {
        for(i = 0, ii = $rootElement.length; i < ii; i++) {
          if ($rootElement[i] == firstElementToRemove) {
            $rootElement[i++] = newNode;
            for (var j = i, j2 = j + removeCount - 1,
                     jj = $rootElement.length;
                 j < jj; j++, j2++) {
              if (j2 < jj) {
                $rootElement[j] = $rootElement[j2];
              } else {
                delete $rootElement[j];
              }
            }
            $rootElement.length -= removeCount - 1;
            break;
          }
        }
      }

      if (parent) {
        parent.replaceChild(newNode, firstElementToRemove);
      }
      var fragment = document.createDocumentFragment();
      fragment.appendChild(firstElementToRemove);
      newNode[jqLite.expando] = firstElementToRemove[jqLite.expando];
      for (var k = 1, kk = elementsToRemove.length; k < kk; k++) {
        var element = elementsToRemove[k];
        jqLite(element).remove();        fragment.appendChild(element);
        delete elementsToRemove[k];
      }

      elementsToRemove[0] = newNode;
      elementsToRemove.length = 1;
    }


    function cloneAndAnnotateFn(fn, annotation) {
      return extend(function() { return fn.apply(null, arguments); }, fn, annotation);
    }
  }];
}

var PREFIX_REGEXP = /^(x[\:\-_]|data[\:\-_])/i;

function directiveNormalize(name) {
  return camelCase(name.replace(PREFIX_REGEXP, ''));
}












function nodesetLinkingFn(
  scope,
  nodeList,
  rootElement,
  boundTranscludeFn
){}

function directiveLinkingFn(
  nodesetLinkingFn,
  scope,
  node,
  rootElement,
  boundTranscludeFn
){}

function tokenDifference(str1, str2) {
  var values = '',
      tokens1 = str1.split(/\s+/),
      tokens2 = str2.split(/\s+/);

  outer:
  for(var i = 0; i < tokens1.length; i++) {
    var token = tokens1[i];
    for(var j = 0; j < tokens2.length; j++) {
      if(token == tokens2[j]) continue outer;
    }
    values += (values.length > 0 ? ' ' : '') + token;
  }
  return values;
}


function $ControllerProvider() {
  var controllers = {},
      globals = false,
      CNTRL_REG = /^(\S+)(\s+as\s+(\w+))?$/;



  this.register = function(name, constructor) {
    assertNotHasOwnProperty(name, 'controller');
    if (isObject(name)) {
      extend(controllers, name);
    } else {
      controllers[name] = constructor;
    }
  };


  this.allowGlobals = function() {
    globals = true;
  };


  this.$get = ['$injector', '$window', function($injector, $window) {


    return function(expression, locals) {
      var instance, match, constructor, identifier;

      if(isString(expression)) {
        match = expression.match(CNTRL_REG),
        constructor = match[1],
        identifier = match[3];
        expression = controllers.hasOwnProperty(constructor)
            ? controllers[constructor]
            : getter(locals.$scope, constructor, true) ||
                (globals ? getter($window, constructor, true) : undefined);

        assertArgFn(expression, constructor, true);
      }

      instance = $injector.instantiate(expression, locals, constructor);

      if (identifier) {
        if (!(locals && typeof locals.$scope === 'object')) {
          throw minErr('$controller')('noscp',
              "Cannot export controller '{0}' as '{1}'! No $scope object provided via `locals`.",
              constructor || expression.name, identifier);
        }

        locals.$scope[identifier] = instance;
      }

      return instance;
    };
  }];
}


function $DocumentProvider(){
  this.$get = ['$window', function(window){
    return jqLite(window.document);
  }];
}


function $ExceptionHandlerProvider() {
  this.$get = ['$log', function($log) {
    return function(exception, cause) {
      $log.error.apply($log, arguments);
    };
  }];
}


function parseHeaders(headers) {
  var parsed = {}, key, val, i;

  if (!headers) return parsed;

  forEach(headers.split('\n'), function(line) {
    i = line.indexOf(':');
    key = lowercase(trim(line.substr(0, i)));
    val = trim(line.substr(i + 1));

    if (key) {
      if (parsed[key]) {
        parsed[key] += ', ' + val;
      } else {
        parsed[key] = val;
      }
    }
  });

  return parsed;
}



function headersGetter(headers) {
  var headersObj = isObject(headers) ? headers : undefined;

  return function(name) {
    if (!headersObj) headersObj =  parseHeaders(headers);

    if (name) {
      return headersObj[lowercase(name)] || null;
    }

    return headersObj;
  };
}



function transformData(data, headers, fns) {
  if (isFunction(fns))
    return fns(data, headers);

  forEach(fns, function(fn) {
    data = fn(data, headers);
  });

  return data;
}


function isSuccess(status) {
  return 200 <= status && status < 300;
}


function $HttpProvider() {
  var JSON_START = /^\s*(\[|\{[^\{])/,
      JSON_END = /[\}\]]\s*$/,
      PROTECTION_PREFIX = /^\)\]\}',?\n/,
      CONTENT_TYPE_APPLICATION_JSON = {'Content-Type': 'application/json;charset=utf-8'};


  var defaults = this.defaults = {
    transformResponse: [function(data) {
      if (isString(data)) {
        data = data.replace(PROTECTION_PREFIX, '');
        if (JSON_START.test(data) && JSON_END.test(data))
          data = fromJson(data);
      }
      return data;
    }],

    transformRequest: [function(d) {
      return isObject(d) && !isFile(d) && !isBlob(d) ? toJson(d) : d;
    }],

    headers: {
      common: {
        'Accept': 'application/json, text/plain, */*'
      },
      post:   shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
      put:    shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
      patch:  shallowCopy(CONTENT_TYPE_APPLICATION_JSON)
    },

    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN'
  };


  var interceptorFactories = this.interceptors = [];

  this.$get = ['$httpBackend', '$browser', '$cacheFactory', '$rootScope', '$q', '$injector',
      function($httpBackend, $browser, $cacheFactory, $rootScope, $q, $injector) {

    var defaultCache = $cacheFactory('$http');


    var reversedInterceptors = [];

    forEach(interceptorFactories, function(interceptorFactory) {
      reversedInterceptors.unshift(isString(interceptorFactory)
          ? $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory));
    });

    function $http(requestConfig) {
      var config = {
        method: 'get',
        transformRequest: defaults.transformRequest,
        transformResponse: defaults.transformResponse
      };
      var headers = mergeHeaders(requestConfig);

      extend(config, requestConfig);
      config.headers = headers;
      config.method = uppercase(config.method);

      var serverRequest = function(config) {
        headers = config.headers;
        var reqData = transformData(config.data, headersGetter(headers), config.transformRequest);

        if (isUndefined(reqData)) {
          forEach(headers, function(value, header) {
            if (lowercase(header) === 'content-type') {
                delete headers[header];
            }
          });
        }

        if (isUndefined(config.withCredentials) && !isUndefined(defaults.withCredentials)) {
          config.withCredentials = defaults.withCredentials;
        }

        return sendReq(config, reqData, headers).then(transformResponse, transformResponse);
      };

      var chain = [serverRequest, undefined];
      var promise = $q.when(config);

      forEach(reversedInterceptors, function(interceptor) {
        if (interceptor.request || interceptor.requestError) {
          chain.unshift(interceptor.request, interceptor.requestError);
        }
        if (interceptor.response || interceptor.responseError) {
          chain.push(interceptor.response, interceptor.responseError);
        }
      });

      while(chain.length) {
        var thenFn = chain.shift();
        var rejectFn = chain.shift();

        promise = promise.then(thenFn, rejectFn);
      }

      promise.success = function(fn) {
        promise.then(function(response) {
          fn(response.data, response.status, response.headers, config);
        });
        return promise;
      };

      promise.error = function(fn) {
        promise.then(null, function(response) {
          fn(response.data, response.status, response.headers, config);
        });
        return promise;
      };

      return promise;

      function transformResponse(response) {
        var resp = extend({}, response, {
          data: transformData(response.data, response.headers, config.transformResponse)
        });
        return (isSuccess(response.status))
          ? resp
          : $q.reject(resp);
      }

      function mergeHeaders(config) {
        var defHeaders = defaults.headers,
            reqHeaders = extend({}, config.headers),
            defHeaderName, lowercaseDefHeaderName, reqHeaderName;

        defHeaders = extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);

        defaultHeadersIteration:
        for (defHeaderName in defHeaders) {
          lowercaseDefHeaderName = lowercase(defHeaderName);

          for (reqHeaderName in reqHeaders) {
            if (lowercase(reqHeaderName) === lowercaseDefHeaderName) {
              continue defaultHeadersIteration;
            }
          }

          reqHeaders[defHeaderName] = defHeaders[defHeaderName];
        }

        execHeaders(reqHeaders);
        return reqHeaders;

        function execHeaders(headers) {
          var headerContent;

          forEach(headers, function(headerFn, header) {
            if (isFunction(headerFn)) {
              headerContent = headerFn();
              if (headerContent != null) {
                headers[header] = headerContent;
              } else {
                delete headers[header];
              }
            }
          });
        }
      }
    }

    $http.pendingRequests = [];








    createShortMethods('get', 'delete', 'head', 'jsonp');






    createShortMethodsWithData('post', 'put', 'patch');


    $http.defaults = defaults;


    return $http;


    function createShortMethods(names) {
      forEach(arguments, function(name) {
        $http[name] = function(url, config) {
          return $http(extend(config || {}, {
            method: name,
            url: url
          }));
        };
      });
    }


    function createShortMethodsWithData(name) {
      forEach(arguments, function(name) {
        $http[name] = function(url, data, config) {
          return $http(extend(config || {}, {
            method: name,
            url: url,
            data: data
          }));
        };
      });
    }



    function sendReq(config, reqData, reqHeaders) {
      var deferred = $q.defer(),
          promise = deferred.promise,
          cache,
          cachedResp,
          url = buildUrl(config.url, config.params);

      $http.pendingRequests.push(config);
      promise.then(removePendingReq, removePendingReq);


      if ((config.cache || defaults.cache) && config.cache !== false && config.method == 'GET') {
        cache = isObject(config.cache) ? config.cache
              : isObject(defaults.cache) ? defaults.cache
              : defaultCache;
      }

      if (cache) {
        cachedResp = cache.get(url);
        if (isDefined(cachedResp)) {
          if (cachedResp.then) {
            cachedResp.then(removePendingReq, removePendingReq);
            return cachedResp;
          } else {
            if (isArray(cachedResp)) {
              resolvePromise(cachedResp[1], cachedResp[0], shallowCopy(cachedResp[2]), cachedResp[3]);
            } else {
              resolvePromise(cachedResp, 200, {}, 'OK');
            }
          }
        } else {
          cache.put(url, promise);
        }
      }


      if (isUndefined(cachedResp)) {
        var xsrfValue = urlIsSameOrigin(config.url)
            ? $browser.cookies()[config.xsrfCookieName || defaults.xsrfCookieName]
            : undefined;
        if (xsrfValue) {
          reqHeaders[(config.xsrfHeaderName || defaults.xsrfHeaderName)] = xsrfValue;
        }

        $httpBackend(config.method, url, reqData, done, reqHeaders, config.timeout,
            config.withCredentials, config.responseType);
      }

      return promise;



      function done(status, response, headersString, statusText) {
        if (cache) {
          if (isSuccess(status)) {
            cache.put(url, [status, response, parseHeaders(headersString), statusText]);
          } else {
            cache.remove(url);
          }
        }

        resolvePromise(response, status, headersString, statusText);
        if (!$rootScope.$$phase) $rootScope.$apply();
      }



      function resolvePromise(response, status, headers, statusText) {
        status = Math.max(status, 0);

        (isSuccess(status) ? deferred.resolve : deferred.reject)({
          data: response,
          status: status,
          headers: headersGetter(headers),
          config: config,
          statusText : statusText
        });
      }


      function removePendingReq() {
        var idx = indexOf($http.pendingRequests, config);
        if (idx !== -1) $http.pendingRequests.splice(idx, 1);
      }
    }


    function buildUrl(url, params) {
          if (!params) return url;
          var parts = [];
          forEachSorted(params, function(value, key) {
            if (value === null || isUndefined(value)) return;
            if (!isArray(value)) value = [value];

            forEach(value, function(v) {
              if (isObject(v)) {
                v = toJson(v);
              }
              parts.push(encodeUriQuery(key) + '=' +
                         encodeUriQuery(v));
            });
          });
          if(parts.length > 0) {
            url += ((url.indexOf('?') == -1) ? '?' : '&') + parts.join('&');
          }
          return url;
        }


  }];
}

function createXhr(method) {
    if (msie <= 8 && (!method.match(/^(get|post|head|put|delete|options)$/i) ||
      !window.XMLHttpRequest)) {
      return new window.ActiveXObject("Microsoft.XMLHTTP");
    } else if (window.XMLHttpRequest) {
      return new window.XMLHttpRequest();
    }

    throw minErr('$httpBackend')('noxhr', "This browser does not support XMLHttpRequest.");
}


function $HttpBackendProvider() {
  this.$get = ['$browser', '$window', '$document', function($browser, $window, $document) {
    return createHttpBackend($browser, createXhr, $browser.defer, $window.angular.callbacks, $document[0]);
  }];
}

function createHttpBackend($browser, createXhr, $browserDefer, callbacks, rawDocument) {
  var ABORTED = -1;

  return function(method, url, post, callback, headers, timeout, withCredentials, responseType) {
    var status;
    $browser.$$incOutstandingRequestCount();
    url = url || $browser.url();

    if (lowercase(method) == 'jsonp') {
      var callbackId = '_' + (callbacks.counter++).toString(36);
      callbacks[callbackId] = function(data) {
        callbacks[callbackId].data = data;
        callbacks[callbackId].called = true;
      };

      var jsonpDone = jsonpReq(url.replace('JSON_CALLBACK', 'angular.callbacks.' + callbackId),
          callbackId, function(status, text) {
        completeRequest(callback, status, callbacks[callbackId].data, "", text);
        callbacks[callbackId] = noop;
      });
    } else {

      var xhr = createXhr(method);

      xhr.open(method, url, true);
      forEach(headers, function(value, key) {
        if (isDefined(value)) {
            xhr.setRequestHeader(key, value);
        }
      });

      xhr.onreadystatechange = function() {
        if (xhr && xhr.readyState == 4) {
          var responseHeaders = null,
              response = null,
              statusText = '';

          if(status !== ABORTED) {
            responseHeaders = xhr.getAllResponseHeaders();

            response = ('response' in xhr) ? xhr.response : xhr.responseText;
          }

          if (!(status === ABORTED && msie < 10)) {
            statusText = xhr.statusText;
          }

          completeRequest(callback,
              status || xhr.status,
              response,
              responseHeaders,
              statusText);
        }
      };

      if (withCredentials) {
        xhr.withCredentials = true;
      }

      if (responseType) {
        try {
          xhr.responseType = responseType;
        } catch (e) {
          if (responseType !== 'json') {
            throw e;
          }
        }
      }

      xhr.send(post || null);
    }

    if (timeout > 0) {
      var timeoutId = $browserDefer(timeoutRequest, timeout);
    } else if (timeout && timeout.then) {
      timeout.then(timeoutRequest);
    }


    function timeoutRequest() {
      status = ABORTED;
      jsonpDone && jsonpDone();
      xhr && xhr.abort();
    }

    function completeRequest(callback, status, response, headersString, statusText) {
      timeoutId && $browserDefer.cancel(timeoutId);
      jsonpDone = xhr = null;

      if (status === 0) {
        status = response ? 200 : urlResolve(url).protocol == 'file' ? 404 : 0;
      }

      status = status === 1223 ? 204 : status;
      statusText = statusText || '';

      callback(status, response, headersString, statusText);
      $browser.$$completeOutstandingRequest(noop);
    }
  };

  function jsonpReq(url, callbackId, done) {
    var script = rawDocument.createElement('script'), callback = null;
    script.type = "text/javascript";
    script.src = url;
    script.async = true;

    callback = function(event) {
      removeEventListenerFn(script, "load", callback);
      removeEventListenerFn(script, "error", callback);
      rawDocument.body.removeChild(script);
      script = null;
      var status = -1;
      var text = "unknown";

      if (event) {
        if (event.type === "load" && !callbacks[callbackId].called) {
          event = { type: "error" };
        }
        text = event.type;
        status = event.type === "error" ? 404 : 200;
      }

      if (done) {
        done(status, text);
      }
    };

    addEventListenerFn(script, "load", callback);
    addEventListenerFn(script, "error", callback);
    rawDocument.body.appendChild(script);
    return callback;
  }
}

var $interpolateMinErr = minErr('$interpolate');


function $InterpolateProvider() {
  var startSymbol = '{{';
  var endSymbol = '}}';


  this.startSymbol = function(value){
    if (value) {
      startSymbol = value;
      return this;
    } else {
      return startSymbol;
    }
  };


  this.endSymbol = function(value){
    if (value) {
      endSymbol = value;
      return this;
    } else {
      return endSymbol;
    }
  };


  this.$get = ['$parse', '$exceptionHandler', '$sce', function($parse, $exceptionHandler, $sce) {
    var startSymbolLength = startSymbol.length,
        endSymbolLength = endSymbol.length,
        escapedStartRegexp = new RegExp(startSymbol.replace(/./g, escape), 'g'),
        escapedEndRegexp = new RegExp(endSymbol.replace(/./g, escape), 'g');

    function escape(ch) {
      return '\\\\\\' + ch;
    }


    function $interpolate(text, mustHaveExpression, trustedContext, allOrNothing) {
      allOrNothing = !!allOrNothing;
      var startIndex,
          endIndex,
          index = 0,
          separators = [],
          expressions = [],
          parseFns = [],
          textLength = text.length,
          hasInterpolation = false,
          hasText = false,
          exp,
          concat = [],
          lastValuesCache = { values: {}, results: {}};

      while(index < textLength) {
        if ( ((startIndex = text.indexOf(startSymbol, index)) != -1) &&
             ((endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) != -1) ) {
          if (index !== startIndex) hasText = true;
          separators.push(text.substring(index, startIndex));
          exp = text.substring(startIndex + startSymbolLength, endIndex);
          expressions.push(exp);
          parseFns.push($parse(exp));
          index = endIndex + endSymbolLength;
          hasInterpolation = true;
        } else {
          if (index !== textLength) {
            hasText = true;
            separators.push(text.substring(index));
          }
          break;
        }
      }

      forEach(separators, function(key, i) {
        separators[i] = separators[i].
          replace(escapedStartRegexp, startSymbol).
          replace(escapedEndRegexp, endSymbol);
      });

      if (separators.length === expressions.length) {
        separators.push('');
      }

      if (trustedContext && hasInterpolation && (hasText || expressions.length > 1)) {
          throw $interpolateMinErr('noconcat',
              "Error while interpolating: {0}\nStrict Contextual Escaping disallows " +
              "interpolations that concatenate multiple expressions when a trusted value is " +
              "required.  See http://docs.angularjs.org/api/ng.$sce", text);
      }

      if (!mustHaveExpression || hasInterpolation) {
        concat.length = separators.length + expressions.length;

        var compute = function(values) {
          for(var i = 0, ii = expressions.length; i < ii; i++) {
            concat[2*i] = separators[i];
            concat[(2*i)+1] = values[i];
          }
          concat[2*ii] = separators[ii];
          return concat.join('');
        };

        var getValue = function (value) {
          if (trustedContext) {
            value = $sce.getTrusted(trustedContext, value);
          } else {
            value = $sce.valueOf(value);
          }

          return value;
        };

        var stringify = function (value) {
          if (value == null) {            return '';
          }
          switch (typeof value) {
            case 'string': {
              break;
            }
            case 'number': {
              value = '' + value;
              break;
            }
            default: {
              value = toJson(value);
            }
          }

          return value;
        };

        return extend(function interpolationFn(context) {
            var scopeId = (context && context.$id) || 'notAScope';
            var lastValues = lastValuesCache.values[scopeId];
            var lastResult = lastValuesCache.results[scopeId];
            var i = 0;
            var ii = expressions.length;
            var values = new Array(ii);
            var val;
            var inputsChanged = lastResult === undefined ? true: false;


            if (!lastValues) {
              lastValues = [];
              inputsChanged = true;
              if (context && context.$on) {
                context.$on('$destroy', function() {
                  lastValuesCache.values[scopeId] = null;
                  lastValuesCache.results[scopeId] = null;
                });
              }
            }


            try {
              interpolationFn.$$unwatch = true;
              for (; i < ii; i++) {
                val = getValue(parseFns[i](context));
                if (allOrNothing && isUndefined(val)) {
                  interpolationFn.$$unwatch = undefined;
                  return;
                }
                val = stringify(val);
                if (val !== lastValues[i]) {
                  inputsChanged = true;
                }
                values[i] = val;
                interpolationFn.$$unwatch = interpolationFn.$$unwatch && parseFns[i].$$unwatch;
              }

              if (inputsChanged) {
                lastValuesCache.values[scopeId] = values;
                lastValuesCache.results[scopeId] = lastResult = compute(values);
              }
            } catch(err) {
              var newErr = $interpolateMinErr('interr', "Can't interpolate: {0}\n{1}", text,
                  err.toString());
              $exceptionHandler(newErr);
            }

            return lastResult;
          }, {
          exp: text,          separators: separators,
          expressions: expressions
        });
      }
    }



    $interpolate.startSymbol = function() {
      return startSymbol;
    };



    $interpolate.endSymbol = function() {
      return endSymbol;
    };

    return $interpolate;
  }];
}

function $IntervalProvider() {
  this.$get = ['$rootScope', '$window', '$q', '$$q',
       function($rootScope,   $window,   $q,   $$q) {
    var intervals = {};



    function interval(fn, delay, count, invokeApply) {
      var setInterval = $window.setInterval,
          clearInterval = $window.clearInterval,
          iteration = 0,
          skipApply = (isDefined(invokeApply) && !invokeApply),
          deferred = (skipApply ? $$q : $q).defer(),
          promise = deferred.promise;

      count = isDefined(count) ? count : 0;

      promise.then(null, null, fn);

      promise.$$intervalId = setInterval(function tick() {
        deferred.notify(iteration++);

        if (count > 0 && iteration >= count) {
          deferred.resolve(iteration);
          clearInterval(promise.$$intervalId);
          delete intervals[promise.$$intervalId];
        }

        if (!skipApply) $rootScope.$apply();

      }, delay);

      intervals[promise.$$intervalId] = deferred;

      return promise;
    }



    interval.cancel = function(promise) {
      if (promise && promise.$$intervalId in intervals) {
        intervals[promise.$$intervalId].reject('canceled');
        $window.clearInterval(promise.$$intervalId);
        delete intervals[promise.$$intervalId];
        return true;
      }
      return false;
    };

    return interval;
  }];
}


function $LocaleProvider(){
  this.$get = function() {
    return {
      id: 'en-us',

      NUMBER_FORMATS: {
        DECIMAL_SEP: '.',
        GROUP_SEP: ',',
        PATTERNS: [
          {            minInt: 1,
            minFrac: 0,
            maxFrac: 3,
            posPre: '',
            posSuf: '',
            negPre: '-',
            negSuf: '',
            gSize: 3,
            lgSize: 3
          },{            minInt: 1,
            minFrac: 2,
            maxFrac: 2,
            posPre: '\u00A4',
            posSuf: '',
            negPre: '(\u00A4',
            negSuf: ')',
            gSize: 3,
            lgSize: 3
          }
        ],
        CURRENCY_SYM: '$'
      },

      DATETIME_FORMATS: {
        MONTH:
            'January,February,March,April,May,June,July,August,September,October,November,December'
            .split(','),
        SHORTMONTH:  'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(','),
        DAY: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(','),
        SHORTDAY: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(','),
        AMPMS: ['AM','PM'],
        medium: 'MMM d, y h:mm:ss a',
        short: 'M/d/yy h:mm a',
        fullDate: 'EEEE, MMMM d, y',
        longDate: 'MMMM d, y',
        mediumDate: 'MMM d, y',
        shortDate: 'M/d/yy',
        mediumTime: 'h:mm:ss a',
        shortTime: 'h:mm a'
      },

      pluralCat: function(num) {
        if (num === 1) {
          return 'one';
        }
        return 'other';
      }
    };
  };
}

var PATH_MATCH = /^([^\?#]*)(\?([^#]*))?(#(.*))?$/,
    DEFAULT_PORTS = {'http': 80, 'https': 443, 'ftp': 21};
var $locationMinErr = minErr('$location');



function encodePath(path) {
  var segments = path.split('/'),
      i = segments.length;

  while (i--) {
    segments[i] = encodeUriSegment(segments[i]);
  }

  return segments.join('/');
}

function parseAbsoluteUrl(absoluteUrl, locationObj, appBase) {
  var parsedUrl = urlResolve(absoluteUrl, appBase);

  locationObj.$$protocol = parsedUrl.protocol;
  locationObj.$$host = parsedUrl.hostname;
  locationObj.$$port = int(parsedUrl.port) || DEFAULT_PORTS[parsedUrl.protocol] || null;
}


function parseAppUrl(relativeUrl, locationObj, appBase) {
  var prefixed = (relativeUrl.charAt(0) !== '/');
  if (prefixed) {
    relativeUrl = '/' + relativeUrl;
  }
  var match = urlResolve(relativeUrl, appBase);
  locationObj.$$path = decodeURIComponent(prefixed && match.pathname.charAt(0) === '/' ?
      match.pathname.substring(1) : match.pathname);
  locationObj.$$search = parseKeyValue(match.search);
  locationObj.$$hash = decodeURIComponent(match.hash);

  if (locationObj.$$path && locationObj.$$path.charAt(0) != '/') {
    locationObj.$$path = '/' + locationObj.$$path;
  }
}



function beginsWith(begin, whole) {
  if (whole.indexOf(begin) === 0) {
    return whole.substr(begin.length);
  }
}


function stripHash(url) {
  var index = url.indexOf('#');
  return index == -1 ? url : url.substr(0, index);
}


function stripFile(url) {
  return url.substr(0, stripHash(url).lastIndexOf('/') + 1);
}

function serverBase(url) {
  return url.substring(0, url.indexOf('/', url.indexOf('//') + 2));
}



function LocationHtml5Url(appBase, basePrefix) {
  this.$$html5 = true;
  basePrefix = basePrefix || '';
  var appBaseNoFile = stripFile(appBase);
  parseAbsoluteUrl(appBase, this, appBase);



  this.$$parse = function(url) {
    var pathUrl = beginsWith(appBaseNoFile, url);
    if (!isString(pathUrl)) {
      throw $locationMinErr('ipthprfx', 'Invalid url "{0}", missing path prefix "{1}".', url,
          appBaseNoFile);
    }

    parseAppUrl(pathUrl, this, appBase);

    if (!this.$$path) {
      this.$$path = '/';
    }

    this.$$compose();
  };


  this.$$compose = function() {
    var search = toKeyValue(this.$$search),
        hash = this.$$hash ? '#' + encodeUriSegment(this.$$hash) : '';

    this.$$url = encodePath(this.$$path) + (search ? '?' + search : '') + hash;
    this.$$absUrl = appBaseNoFile + this.$$url.substr(1);  };

  this.$$rewrite = function(url) {
    var appUrl, prevAppUrl;

    if ( (appUrl = beginsWith(appBase, url)) !== undefined ) {
      prevAppUrl = appUrl;
      if ( (appUrl = beginsWith(basePrefix, appUrl)) !== undefined ) {
        return appBaseNoFile + (beginsWith('/', appUrl) || appUrl);
      } else {
        return appBase + prevAppUrl;
      }
    } else if ( (appUrl = beginsWith(appBaseNoFile, url)) !== undefined ) {
      return appBaseNoFile + appUrl;
    } else if (appBaseNoFile == url + '/') {
      return appBaseNoFile;
    }
  };
}



function LocationHashbangUrl(appBase, hashPrefix) {
  var appBaseNoFile = stripFile(appBase);

  parseAbsoluteUrl(appBase, this, appBase);



  this.$$parse = function(url) {
    var withoutBaseUrl = beginsWith(appBase, url) || beginsWith(appBaseNoFile, url);
    var withoutHashUrl = withoutBaseUrl.charAt(0) == '#'
        ? beginsWith(hashPrefix, withoutBaseUrl)
        : (this.$$html5)
          ? withoutBaseUrl
          : '';

    if (!isString(withoutHashUrl)) {
      throw $locationMinErr('ihshprfx', 'Invalid url "{0}", missing hash prefix "{1}".', url,
          hashPrefix);
    }
    parseAppUrl(withoutHashUrl, this, appBase);

    this.$$path = removeWindowsDriveName(this.$$path, withoutHashUrl, appBase);

    this.$$compose();

    function removeWindowsDriveName (path, url, base) {
      var windowsFilePathExp = /^\/[A-Z]:(\/.*)/;

      var firstPathSegmentMatch;

      if (url.indexOf(base) === 0) {
        url = url.replace(base, '');
      }

      if (windowsFilePathExp.exec(url)) {
        return path;
      }

      firstPathSegmentMatch = windowsFilePathExp.exec(path);
      return firstPathSegmentMatch ? firstPathSegmentMatch[1] : path;
    }
  };


  this.$$compose = function() {
    var search = toKeyValue(this.$$search),
        hash = this.$$hash ? '#' + encodeUriSegment(this.$$hash) : '';

    this.$$url = encodePath(this.$$path) + (search ? '?' + search : '') + hash;
    this.$$absUrl = appBase + (this.$$url ? hashPrefix + this.$$url : '');
  };

  this.$$rewrite = function(url) {
    if(stripHash(appBase) == stripHash(url)) {
      return url;
    }
  };
}



function LocationHashbangInHtml5Url(appBase, hashPrefix) {
  this.$$html5 = true;
  LocationHashbangUrl.apply(this, arguments);

  var appBaseNoFile = stripFile(appBase);

  this.$$rewrite = function(url) {
    var appUrl;

    if ( appBase == stripHash(url) ) {
      return url;
    } else if ( (appUrl = beginsWith(appBaseNoFile, url)) ) {
      return appBase + hashPrefix + appUrl;
    } else if ( appBaseNoFile === url + '/') {
      return appBaseNoFile;
    }
  };

  this.$$compose = function() {
    var search = toKeyValue(this.$$search),
        hash = this.$$hash ? '#' + encodeUriSegment(this.$$hash) : '';

    this.$$url = encodePath(this.$$path) + (search ? '?' + search : '') + hash;
    this.$$absUrl = appBase + hashPrefix + this.$$url;
  };

}


LocationHashbangInHtml5Url.prototype =
  LocationHashbangUrl.prototype =
  LocationHtml5Url.prototype = {


  $$html5: false,


  $$replace: false,


  absUrl: locationGetter('$$absUrl'),


  url: function(url, replace) {
    if (isUndefined(url))
      return this.$$url;

    var match = PATH_MATCH.exec(url);
    if (match[1]) this.path(decodeURIComponent(match[1]));
    if (match[2] || match[1]) this.search(match[3] || '');
    this.hash(match[5] || '', replace);

    return this;
  },


  protocol: locationGetter('$$protocol'),


  host: locationGetter('$$host'),


  port: locationGetter('$$port'),


  path: locationGetterSetter('$$path', function(path) {
    return path.charAt(0) == '/' ? path : '/' + path;
  }),


  search: function(search, paramValue) {
    switch (arguments.length) {
      case 0:
        return this.$$search;
      case 1:
        if (isString(search)) {
          this.$$search = parseKeyValue(search);
        } else if (isObject(search)) {
          forEach(search, function(value, key) {
            if (value == null) delete search[key];
          });

          this.$$search = search;
        } else {
          throw $locationMinErr('isrcharg',
              'The first argument of the `$location#search()` call must be a string or an object.');
        }
        break;
      default:
        if (isUndefined(paramValue) || paramValue === null) {
          delete this.$$search[search];
        } else {
          this.$$search[search] = paramValue;
        }
    }

    this.$$compose();
    return this;
  },


  hash: locationGetterSetter('$$hash', identity),


  replace: function() {
    this.$$replace = true;
    return this;
  }
};

function locationGetter(property) {
  return function() {
    return this[property];
  };
}


function locationGetterSetter(property, preprocess) {
  return function(value) {
    if (isUndefined(value))
      return this[property];

    this[property] = preprocess(value);
    this.$$compose();

    return this;
  };
}





function $LocationProvider(){
  var hashPrefix = '',
      html5Mode = false;


  this.hashPrefix = function(prefix) {
    if (isDefined(prefix)) {
      hashPrefix = prefix;
      return this;
    } else {
      return hashPrefix;
    }
  };


  this.html5Mode = function(mode) {
    if (isDefined(mode)) {
      html5Mode = mode;
      return this;
    } else {
      return html5Mode;
    }
  };





  this.$get = ['$rootScope', '$browser', '$sniffer', '$rootElement',
      function( $rootScope,   $browser,   $sniffer,   $rootElement) {
    var $location,
        LocationMode,
        baseHref = $browser.baseHref(),        initialUrl = $browser.url(),
        appBase;

    if (html5Mode) {
      appBase = serverBase(initialUrl) + (baseHref || '/');
      LocationMode = $sniffer.history ? LocationHtml5Url : LocationHashbangInHtml5Url;
    } else {
      appBase = stripHash(initialUrl);
      LocationMode = LocationHashbangUrl;
    }
    $location = new LocationMode(appBase, '#' + hashPrefix);
    $location.$$parse($location.$$rewrite(initialUrl));

    $rootElement.on('click', function(event) {

      if (event.ctrlKey || event.metaKey || event.which == 2) return;

      var elm = jqLite(event.target);

      while (nodeName_(elm[0]) !== 'a') {
        if (elm[0] === $rootElement[0] || !(elm = elm.parent())[0]) return;
      }

      var absHref = elm.prop('href');

      if (isObject(absHref) && absHref.toString() === '[object SVGAnimatedString]') {
        absHref = urlResolve(absHref.animVal).href;
      }

      if (LocationMode === LocationHashbangInHtml5Url) {
        var href = elm.attr('href') || elm.attr('xlink:href');

        if (href.indexOf('://') < 0) {          var prefix = '#' + hashPrefix;
          if (href[0] == '/') {
            absHref = appBase + prefix + href;
          } else if (href[0] == '#') {
            absHref = appBase + prefix + ($location.path() || '/') + href;
          } else {
            var stack = $location.path().split("/"),
              parts = href.split("/");
            for (var i=0; i<parts.length; i++) {
              if (parts[i] == ".")
                continue;
              else if (parts[i] == "..")
                stack.pop();
              else if (parts[i].length)
                stack.push(parts[i]);
            }
            absHref = appBase + prefix + stack.join('/');
          }
        }
      }

      var rewrittenUrl = $location.$$rewrite(absHref);

      if (absHref && !elm.attr('target') && rewrittenUrl && !event.isDefaultPrevented()) {
        event.preventDefault();
        if (rewrittenUrl != $browser.url()) {
          $location.$$parse(rewrittenUrl);
          $rootScope.$apply();
          window.angular['ff-684208-preventDefault'] = true;
        }
      }
    });


    if ($location.absUrl() != initialUrl) {
      $browser.url($location.absUrl(), true);
    }

    $browser.onUrlChange(function(newUrl) {
      if ($location.absUrl() != newUrl) {
        $rootScope.$evalAsync(function() {
          var oldUrl = $location.absUrl();

          $location.$$parse(newUrl);
          if ($rootScope.$broadcast('$locationChangeStart', newUrl,
                                    oldUrl).defaultPrevented) {
            $location.$$parse(oldUrl);
            $browser.url(oldUrl);
          } else {
            afterLocationChange(oldUrl);
          }
        });
        if (!$rootScope.$$phase) $rootScope.$digest();
      }
    });

    var changeCounter = 0;
    $rootScope.$watch(function $locationWatch() {
      var oldUrl = $browser.url();
      var currentReplace = $location.$$replace;

      if (!changeCounter || oldUrl != $location.absUrl()) {
        changeCounter++;
        $rootScope.$evalAsync(function() {
          if ($rootScope.$broadcast('$locationChangeStart', $location.absUrl(), oldUrl).
              defaultPrevented) {
            $location.$$parse(oldUrl);
          } else {
            $browser.url($location.absUrl(), currentReplace);
            afterLocationChange(oldUrl);
          }
        });
      }
      $location.$$replace = false;

      return changeCounter;
    });

    return $location;

    function afterLocationChange(oldUrl) {
      $rootScope.$broadcast('$locationChangeSuccess', $location.absUrl(), oldUrl);
    }
}];
}




function $LogProvider(){
  var debug = true,
      self = this;


  this.debugEnabled = function(flag) {
    if (isDefined(flag)) {
      debug = flag;
    return this;
    } else {
      return debug;
    }
  };

  this.$get = ['$window', function($window){
    return {

      log: consoleLog('log'),


      info: consoleLog('info'),


      warn: consoleLog('warn'),


      error: consoleLog('error'),


      debug: (function () {
        var fn = consoleLog('debug');

        return function() {
          if (debug) {
            fn.apply(self, arguments);
          }
        };
      }())
    };

    function formatError(arg) {
      if (arg instanceof Error) {
        if (arg.stack) {
          arg = (arg.message && arg.stack.indexOf(arg.message) === -1)
              ? 'Error: ' + arg.message + '\n' + arg.stack
              : arg.stack;
        } else if (arg.sourceURL) {
          arg = arg.message + '\n' + arg.sourceURL + ':' + arg.line;
        }
      }
      return arg;
    }

    function consoleLog(type) {
      var console = $window.console || {},
          logFn = console[type] || console.log || noop,
          hasApply = false;

      try {
        hasApply = !!logFn.apply;
      } catch (e) {}

      if (hasApply) {
        return function() {
          var args = [];
          forEach(arguments, function(arg) {
            args.push(formatError(arg));
          });
          return logFn.apply(console, args);
        };
      }

      return function(arg1, arg2) {
        logFn(arg1, arg2 == null ? '' : arg2);
      };
    }
  }];
}

var $parseMinErr = minErr('$parse');

function ensureSafeMemberName(name, fullExpression) {
  if (name === "__defineGetter__" || name === "__defineSetter__"
      || name === "__lookupGetter__" || name === "__lookupSetter__"
      || name === "__proto__") {
    throw $parseMinErr('isecfld',
        'Attempting to access a disallowed field in Angular expressions! '
        +'Expression: {0}', fullExpression);
  }
  return name;
}

function ensureSafeObject(obj, fullExpression) {
  if (obj) {
    if (obj.constructor === obj) {
      throw $parseMinErr('isecfn',
          'Referencing Function in Angular expressions is disallowed! Expression: {0}',
          fullExpression);
    } else if (
        obj.window === obj) {
      throw $parseMinErr('isecwindow',
          'Referencing the Window in Angular expressions is disallowed! Expression: {0}',
          fullExpression);
    } else if (
        obj.children && (obj.nodeName || (obj.prop && obj.attr && obj.find))) {
      throw $parseMinErr('isecdom',
          'Referencing DOM nodes in Angular expressions is disallowed! Expression: {0}',
          fullExpression);
    } else if (
        obj === Object) {
      throw $parseMinErr('isecobj',
          'Referencing Object in Angular expressions is disallowed! Expression: {0}',
          fullExpression);
    }
  }
  return obj;
}

var CALL = Function.prototype.call;
var APPLY = Function.prototype.apply;
var BIND = Function.prototype.bind;

function ensureSafeFunction(obj, fullExpression) {
  if (obj) {
    if (obj.constructor === obj) {
      throw $parseMinErr('isecfn',
        'Referencing Function in Angular expressions is disallowed! Expression: {0}',
        fullExpression);
    } else if (obj === CALL || obj === APPLY || obj === BIND) {
      throw $parseMinErr('isecff',
        'Referencing call, apply or bind in Angular expressions is disallowed! Expression: {0}',
        fullExpression);
    }
  }
}

var OPERATORS = {
    'null':function(){return null;},
    'true':function(){return true;},
    'false':function(){return false;},
    undefined:noop,
    '+':function(self, locals, a,b){
      a=a(self, locals); b=b(self, locals);
      if (isDefined(a)) {
        if (isDefined(b)) {
          return a + b;
        }
        return a;
      }
      return isDefined(b)?b:undefined;},
    '-':function(self, locals, a,b){
          a=a(self, locals); b=b(self, locals);
          return (isDefined(a)?a:0)-(isDefined(b)?b:0);
        },
    '*':function(self, locals, a,b){return a(self, locals)*b(self, locals);},
    '/':function(self, locals, a,b){return a(self, locals)/b(self, locals);},
    '%':function(self, locals, a,b){return a(self, locals)%b(self, locals);},
    '^':function(self, locals, a,b){return a(self, locals)^b(self, locals);},
    '=':noop,
    '===':function(self, locals, a, b){return a(self, locals)===b(self, locals);},
    '!==':function(self, locals, a, b){return a(self, locals)!==b(self, locals);},
    '==':function(self, locals, a,b){return a(self, locals)==b(self, locals);},
    '!=':function(self, locals, a,b){return a(self, locals)!=b(self, locals);},
    '<':function(self, locals, a,b){return a(self, locals)<b(self, locals);},
    '>':function(self, locals, a,b){return a(self, locals)>b(self, locals);},
    '<=':function(self, locals, a,b){return a(self, locals)<=b(self, locals);},
    '>=':function(self, locals, a,b){return a(self, locals)>=b(self, locals);},
    '&&':function(self, locals, a,b){return a(self, locals)&&b(self, locals);},
    '||':function(self, locals, a,b){return a(self, locals)||b(self, locals);},
    '&':function(self, locals, a,b){return a(self, locals)&b(self, locals);},
    '|':function(self, locals, a,b){return b(self, locals)(self, locals, a(self, locals));},
    '!':function(self, locals, a){return !a(self, locals);}
};
var ESCAPE = {"n":"\n", "f":"\f", "r":"\r", "t":"\t", "v":"\v", "'":"'", '"':'"'};

var Lexer = function (options) {
  this.options = options;
};

Lexer.prototype = {
  constructor: Lexer,

  lex: function (text) {
    this.text = text;
    this.index = 0;
    this.ch = undefined;
    this.tokens = [];

    while (this.index < this.text.length) {
      this.ch = this.text.charAt(this.index);
      if (this.is('"\'')) {
        this.readString(this.ch);
      } else if (this.isNumber(this.ch) || this.is('.') && this.isNumber(this.peek())) {
        this.readNumber();
      } else if (this.isIdent(this.ch)) {
        this.readIdent();
      } else if (this.is('(){}[].,;:?')) {
        this.tokens.push({
          index: this.index,
          text: this.ch
        });
        this.index++;
      } else if (this.isWhitespace(this.ch)) {
        this.index++;
      } else {
        var ch2 = this.ch + this.peek();
        var ch3 = ch2 + this.peek(2);
        var fn = OPERATORS[this.ch];
        var fn2 = OPERATORS[ch2];
        var fn3 = OPERATORS[ch3];
        if (fn3) {
          this.tokens.push({index: this.index, text: ch3, fn: fn3});
          this.index += 3;
        } else if (fn2) {
          this.tokens.push({index: this.index, text: ch2, fn: fn2});
          this.index += 2;
        } else if (fn) {
          this.tokens.push({
            index: this.index,
            text: this.ch,
            fn: fn
          });
          this.index += 1;
        } else {
          this.throwError('Unexpected next character ', this.index, this.index + 1);
        }
      }
    }
    return this.tokens;
  },

  is: function(chars) {
    return chars.indexOf(this.ch) !== -1;
  },

  peek: function(i) {
    var num = i || 1;
    return (this.index + num < this.text.length) ? this.text.charAt(this.index + num) : false;
  },

  isNumber: function(ch) {
    return ('0' <= ch && ch <= '9');
  },

  isWhitespace: function(ch) {
    return (ch === ' ' || ch === '\r' || ch === '\t' ||
            ch === '\n' || ch === '\v' || ch === '\u00A0');
  },

  isIdent: function(ch) {
    return ('a' <= ch && ch <= 'z' ||
            'A' <= ch && ch <= 'Z' ||
            '_' === ch || ch === '$');
  },

  isExpOperator: function(ch) {
    return (ch === '-' || ch === '+' || this.isNumber(ch));
  },

  throwError: function(error, start, end) {
    end = end || this.index;
    var colStr = (isDefined(start)
            ? 's ' + start +  '-' + this.index + ' [' + this.text.substring(start, end) + ']'
            : ' ' + end);
    throw $parseMinErr('lexerr', 'Lexer Error: {0} at column{1} in expression [{2}].',
        error, colStr, this.text);
  },

  readNumber: function() {
    var number = '';
    var start = this.index;
    while (this.index < this.text.length) {
      var ch = lowercase(this.text.charAt(this.index));
      if (ch == '.' || this.isNumber(ch)) {
        number += ch;
      } else {
        var peekCh = this.peek();
        if (ch == 'e' && this.isExpOperator(peekCh)) {
          number += ch;
        } else if (this.isExpOperator(ch) &&
            peekCh && this.isNumber(peekCh) &&
            number.charAt(number.length - 1) == 'e') {
          number += ch;
        } else if (this.isExpOperator(ch) &&
            (!peekCh || !this.isNumber(peekCh)) &&
            number.charAt(number.length - 1) == 'e') {
          this.throwError('Invalid exponent');
        } else {
          break;
        }
      }
      this.index++;
    }
    number = 1 * number;
    this.tokens.push({
      index: start,
      text: number,
      constant: true,
      fn: function() { return number; }
    });
  },

  readIdent: function() {
    var parser = this;

    var ident = '';
    var start = this.index;

    var lastDot, peekIndex, methodName, ch;

    while (this.index < this.text.length) {
      ch = this.text.charAt(this.index);
      if (ch === '.' || this.isIdent(ch) || this.isNumber(ch)) {
        if (ch === '.') lastDot = this.index;
        ident += ch;
      } else {
        break;
      }
      this.index++;
    }

    if (lastDot) {
      peekIndex = this.index;
      while (peekIndex < this.text.length) {
        ch = this.text.charAt(peekIndex);
        if (ch === '(') {
          methodName = ident.substr(lastDot - start + 1);
          ident = ident.substr(0, lastDot - start);
          this.index = peekIndex;
          break;
        }
        if (this.isWhitespace(ch)) {
          peekIndex++;
        } else {
          break;
        }
      }
    }


    var token = {
      index: start,
      text: ident
    };

    if (OPERATORS.hasOwnProperty(ident)) {
      token.fn = OPERATORS[ident];
      token.constant = true;
    } else {
      var getter = getterFn(ident, this.options, this.text);
      token.fn = extend(function(self, locals) {
        return (getter(self, locals));
      }, {
        assign: function(self, value) {
          return setter(self, ident, value, parser.text);
        }
      });
    }

    this.tokens.push(token);

    if (methodName) {
      this.tokens.push({
        index: lastDot,
        text: '.'
      });
      this.tokens.push({
        index: lastDot + 1,
        text: methodName
      });
    }
  },

  readString: function(quote) {
    var start = this.index;
    this.index++;
    var string = '';
    var rawString = quote;
    var escape = false;
    while (this.index < this.text.length) {
      var ch = this.text.charAt(this.index);
      rawString += ch;
      if (escape) {
        if (ch === 'u') {
          var hex = this.text.substring(this.index + 1, this.index + 5);
          if (!hex.match(/[\da-f]{4}/i))
            this.throwError('Invalid unicode escape [\\u' + hex + ']');
          this.index += 4;
          string += String.fromCharCode(parseInt(hex, 16));
        } else {
          var rep = ESCAPE[ch];
          if (rep) {
            string += rep;
          } else {
            string += ch;
          }
        }
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === quote) {
        this.index++;
        this.tokens.push({
          index: start,
          text: rawString,
          string: string,
          constant: true,
          fn: function() { return string; }
        });
        return;
      } else {
        string += ch;
      }
      this.index++;
    }
    this.throwError('Unterminated quote', start);
  }
};



var Parser = function (lexer, $filter, options) {
  this.lexer = lexer;
  this.$filter = $filter;
  this.options = options;
};

Parser.ZERO = extend(function () {
  return 0;
}, {
  constant: true
});

Parser.prototype = {
  constructor: Parser,

  parse: function (text) {
    this.text = text;
    this.tokens = this.lexer.lex(text);

    var value = this.statements();

    if (this.tokens.length !== 0) {
      this.throwError('is an unexpected token', this.tokens[0]);
    }

    value.literal = !!value.literal;
    value.constant = !!value.constant;

    return value;
  },

  primary: function () {
    var primary;
    if (this.expect('(')) {
      primary = this.filterChain();
      this.consume(')');
    } else if (this.expect('[')) {
      primary = this.arrayDeclaration();
    } else if (this.expect('{')) {
      primary = this.object();
    } else {
      var token = this.expect();
      primary = token.fn;
      if (!primary) {
        this.throwError('not a primary expression', token);
      }
      if (token.constant) {
        primary.constant = true;
        primary.literal = true;
      }
    }

    var next, context;
    while ((next = this.expect('(', '[', '.'))) {
      if (next.text === '(') {
        primary = this.functionCall(primary, context);
        context = null;
      } else if (next.text === '[') {
        context = primary;
        primary = this.objectIndex(primary);
      } else if (next.text === '.') {
        context = primary;
        primary = this.fieldAccess(primary);
      } else {
        this.throwError('IMPOSSIBLE');
      }
    }
    return primary;
  },

  throwError: function(msg, token) {
    throw $parseMinErr('syntax',
        'Syntax Error: Token \'{0}\' {1} at column {2} of the expression [{3}] starting at [{4}].',
          token.text, msg, (token.index + 1), this.text, this.text.substring(token.index));
  },

  peekToken: function() {
    if (this.tokens.length === 0)
      throw $parseMinErr('ueoe', 'Unexpected end of expression: {0}', this.text);
    return this.tokens[0];
  },

  peek: function(e1, e2, e3, e4) {
    if (this.tokens.length > 0) {
      var token = this.tokens[0];
      var t = token.text;
      if (t === e1 || t === e2 || t === e3 || t === e4 ||
          (!e1 && !e2 && !e3 && !e4)) {
        return token;
      }
    }
    return false;
  },

  expect: function(e1, e2, e3, e4){
    var token = this.peek(e1, e2, e3, e4);
    if (token) {
      this.tokens.shift();
      return token;
    }
    return false;
  },

  consume: function(e1){
    if (!this.expect(e1)) {
      this.throwError('is unexpected, expecting [' + e1 + ']', this.peek());
    }
  },

  unaryFn: function(fn, right) {
    return extend(function(self, locals) {
      return fn(self, locals, right);
    }, {
      constant:right.constant
    });
  },

  ternaryFn: function(left, middle, right){
    return extend(function(self, locals){
      return left(self, locals) ? middle(self, locals) : right(self, locals);
    }, {
      constant: left.constant && middle.constant && right.constant
    });
  },

  binaryFn: function(left, fn, right) {
    return extend(function(self, locals) {
      return fn(self, locals, left, right);
    }, {
      constant:left.constant && right.constant
    });
  },

  statements: function() {
    var statements = [];
    while (true) {
      if (this.tokens.length > 0 && !this.peek('}', ')', ';', ']'))
        statements.push(this.filterChain());
      if (!this.expect(';')) {
        return (statements.length === 1)
            ? statements[0]
            : function(self, locals) {
                var value;
                for (var i = 0; i < statements.length; i++) {
                  var statement = statements[i];
                  if (statement) {
                    value = statement(self, locals);
                  }
                }
                return value;
              };
      }
    }
  },

  filterChain: function() {
    var left = this.expression();
    var token;
    while (true) {
      if ((token = this.expect('|'))) {
        left = this.binaryFn(left, token.fn, this.filter());
      } else {
        return left;
      }
    }
  },

  filter: function() {
    var token = this.expect();
    var fn = this.$filter(token.text);
    var argsFn = [];
    while(this.expect(':')) {
      argsFn.push(this.expression());
    }
    return valueFn(fnInvoke);

    function fnInvoke(self, locals, input) {
      var args = [input];
      for (var i = 0; i < argsFn.length; i++) {
        args.push(argsFn[i](self, locals));
      }
      return fn.apply(self, args);
    }
  },

  expression: function() {
    return this.assignment();
  },

  assignment: function() {
    var left = this.ternary();
    var right;
    var token;
    if ((token = this.expect('='))) {
      if (!left.assign) {
        this.throwError('implies assignment but [' +
            this.text.substring(0, token.index) + '] can not be assigned to', token);
      }
      right = this.ternary();
      return function(scope, locals) {
        return left.assign(scope, right(scope, locals), locals);
      };
    }
    return left;
  },

  ternary: function() {
    var left = this.logicalOR();
    var middle;
    var token;
    if ((token = this.expect('?'))) {
      middle = this.ternary();
      if ((token = this.expect(':'))) {
        return this.ternaryFn(left, middle, this.ternary());
      } else {
        this.throwError('expected :', token);
      }
    } else {
      return left;
    }
  },

  logicalOR: function() {
    var left = this.logicalAND();
    var token;
    while (true) {
      if ((token = this.expect('||'))) {
        left = this.binaryFn(left, token.fn, this.logicalAND());
      } else {
        return left;
      }
    }
  },

  logicalAND: function() {
    var left = this.equality();
    var token;
    if ((token = this.expect('&&'))) {
      left = this.binaryFn(left, token.fn, this.logicalAND());
    }
    return left;
  },

  equality: function() {
    var left = this.relational();
    var token;
    if ((token = this.expect('==','!=','===','!=='))) {
      left = this.binaryFn(left, token.fn, this.equality());
    }
    return left;
  },

  relational: function() {
    var left = this.additive();
    var token;
    if ((token = this.expect('<', '>', '<=', '>='))) {
      left = this.binaryFn(left, token.fn, this.relational());
    }
    return left;
  },

  additive: function() {
    var left = this.multiplicative();
    var token;
    while ((token = this.expect('+','-'))) {
      left = this.binaryFn(left, token.fn, this.multiplicative());
    }
    return left;
  },

  multiplicative: function() {
    var left = this.unary();
    var token;
    while ((token = this.expect('*','/','%'))) {
      left = this.binaryFn(left, token.fn, this.unary());
    }
    return left;
  },

  unary: function() {
    var token;
    if (this.expect('+')) {
      return this.primary();
    } else if ((token = this.expect('-'))) {
      return this.binaryFn(Parser.ZERO, token.fn, this.unary());
    } else if ((token = this.expect('!'))) {
      return this.unaryFn(token.fn, this.unary());
    } else {
      return this.primary();
    }
  },

  fieldAccess: function(object) {
    var parser = this;
    var field = this.expect().text;
    var getter = getterFn(field, this.options, this.text);

    return extend(function(scope, locals, self) {
      return getter(self || object(scope, locals));
    }, {
      assign: function(scope, value, locals) {
        return setter(object(scope, locals), field, value, parser.text);
      }
    });
  },

  objectIndex: function(obj) {
    var parser = this;

    var indexFn = this.expression();
    this.consume(']');

    return extend(function(self, locals) {
      var o = obj(self, locals),
          i = indexFn(self, locals),
          v;

      ensureSafeMemberName(i, parser.text);
      if (!o) return undefined;
      v = ensureSafeObject(o[i], parser.text);
      return v;
    }, {
      assign: function(self, value, locals) {
        var key = indexFn(self, locals);
        var safe = ensureSafeObject(obj(self, locals), parser.text);
        return safe[key] = value;
      }
    });
  },

  functionCall: function(fn, contextGetter) {
    var argsFn = [];
    if (this.peekToken().text !== ')') {
      do {
        argsFn.push(this.expression());
      } while (this.expect(','));
    }
    this.consume(')');

    var parser = this;

    return function(scope, locals) {
      var args = [];
      var context = contextGetter ? contextGetter(scope, locals) : scope;

      for (var i = 0; i < argsFn.length; i++) {
        args.push(argsFn[i](scope, locals));
      }
      var fnPtr = fn(scope, locals, context) || noop;

      ensureSafeObject(context, parser.text);
      ensureSafeFunction(fnPtr, parser.text);

      var v = fnPtr.apply
            ? fnPtr.apply(context, args)
            : fnPtr(args[0], args[1], args[2], args[3], args[4]);

      return ensureSafeObject(v, parser.text);
    };
  },

  arrayDeclaration: function () {
    var elementFns = [];
    var allConstant = true;
    if (this.peekToken().text !== ']') {
      do {
        if (this.peek(']')) {
          break;
        }
        var elementFn = this.expression();
        elementFns.push(elementFn);
        if (!elementFn.constant) {
          allConstant = false;
        }
      } while (this.expect(','));
    }
    this.consume(']');

    return extend(function(self, locals) {
      var array = [];
      for (var i = 0; i < elementFns.length; i++) {
        array.push(elementFns[i](self, locals));
      }
      return array;
    }, {
      literal: true,
      constant: allConstant
    });
  },

  object: function () {
    var keyValues = [];
    var allConstant = true;
    if (this.peekToken().text !== '}') {
      do {
        if (this.peek('}')) {
          break;
        }
        var token = this.expect(),
        key = token.string || token.text;
        this.consume(':');
        var value = this.expression();
        keyValues.push({key: key, value: value});
        if (!value.constant) {
          allConstant = false;
        }
      } while (this.expect(','));
    }
    this.consume('}');

    return extend(function(self, locals) {
      var object = {};
      for (var i = 0; i < keyValues.length; i++) {
        var keyValue = keyValues[i];
        object[keyValue.key] = keyValue.value(self, locals);
      }
      return object;
    }, {
      literal: true,
      constant: allConstant
    });
  }
};

function setter(obj, path, setValue, fullExp) {

  var element = path.split('.'), key;
  for (var i = 0; element.length > 1; i++) {
    key = ensureSafeMemberName(element.shift(), fullExp);
    var propertyObj = obj[key];
    if (!propertyObj) {
      propertyObj = {};
      obj[key] = propertyObj;
    }
    obj = propertyObj;
  }
  key = ensureSafeMemberName(element.shift(), fullExp);
  ensureSafeObject(obj, fullExp);
  ensureSafeObject(obj[key], fullExp);
  obj[key] = setValue;
  return setValue;
}

var getterFnCache = {};


function cspSafeGetterFn(key0, key1, key2, key3, key4, fullExp) {
  ensureSafeMemberName(key0, fullExp);
  ensureSafeMemberName(key1, fullExp);
  ensureSafeMemberName(key2, fullExp);
  ensureSafeMemberName(key3, fullExp);
  ensureSafeMemberName(key4, fullExp);

  return function cspSafeGetter(scope, locals) {
    var pathVal = (locals && locals.hasOwnProperty(key0)) ? locals : scope;

    if (pathVal == null) return pathVal;
    pathVal = pathVal[key0];

    if (!key1) return pathVal;
    if (pathVal == null) return undefined;
    pathVal = pathVal[key1];

    if (!key2) return pathVal;
    if (pathVal == null) return undefined;
    pathVal = pathVal[key2];

    if (!key3) return pathVal;
    if (pathVal == null) return undefined;
    pathVal = pathVal[key3];

    if (!key4) return pathVal;
    if (pathVal == null) return undefined;
    pathVal = pathVal[key4];

    return pathVal;
  };
}

function getterFn(path, options, fullExp) {
  if (getterFnCache.hasOwnProperty(path)) {
    return getterFnCache[path];
  }

  var pathKeys = path.split('.'),
      pathKeysLength = pathKeys.length,
      fn;

  if (options.csp) {
    if (pathKeysLength < 6) {
      fn = cspSafeGetterFn(pathKeys[0], pathKeys[1], pathKeys[2], pathKeys[3], pathKeys[4], fullExp);
    } else {
      fn = function(scope, locals) {
        var i = 0, val;
        do {
          val = cspSafeGetterFn(pathKeys[i++], pathKeys[i++], pathKeys[i++], pathKeys[i++],
                                pathKeys[i++], fullExp)(scope, locals);

          locals = undefined;          scope = val;
        } while (i < pathKeysLength);
        return val;
      };
    }
  } else {
    var code = 'var p;\n';
    forEach(pathKeys, function(key, index) {
      ensureSafeMemberName(key, fullExp);
      code += 'if(s == null) return undefined;\n' +
              's='+ (index
                      ? 's'
                      : '((k&&k.hasOwnProperty("' + key + '"))?k:s)') + '["' + key + '"]' + ';\n';
    });
    code += 'return s;';

    var evaledFnGetter = new Function('s', 'k', code);    evaledFnGetter.toString = valueFn(code);
    fn = evaledFnGetter;
  }

  if (path !== 'hasOwnProperty') {
    getterFnCache[path] = fn;
  }
  return fn;
}


function $ParseProvider() {
  var cache = {};

  var $parseOptions = {
    csp: false
  };


  this.$get = ['$filter', '$sniffer', function($filter, $sniffer) {
    $parseOptions.csp = $sniffer.csp;

    return function(exp) {
      var parsedExpression,
          oneTime;

      switch (typeof exp) {
        case 'string':

          exp = trim(exp);

          if (exp.charAt(0) === ':' && exp.charAt(1) === ':') {
            oneTime = true;
            exp = exp.substring(2);
          }

          if (cache.hasOwnProperty(exp)) {
            return oneTime ? oneTimeWrapper(cache[exp]) : cache[exp];
          }

          var lexer = new Lexer($parseOptions);
          var parser = new Parser(lexer, $filter, $parseOptions);
          parsedExpression = parser.parse(exp);

          if (exp !== 'hasOwnProperty') {
            cache[exp] = parsedExpression;
          }

          return oneTime || parsedExpression.constant ? oneTimeWrapper(parsedExpression) : parsedExpression;

        case 'function':
          return exp;

        default:
          return noop;
      }

      function oneTimeWrapper(expression) {
        var stable = false,
            lastValue;
        oneTimeParseFn.literal = expression.literal;
        oneTimeParseFn.constant = expression.constant;
        oneTimeParseFn.assign = expression.assign;
        return oneTimeParseFn;

        function oneTimeParseFn(self, locals) {
          if (!stable) {
            lastValue = expression.constant && lastValue ? lastValue : expression(self, locals);
            oneTimeParseFn.$$unwatch = isDefined(lastValue);
            if (oneTimeParseFn.$$unwatch && self && self.$$postDigestQueue) {
              self.$$postDigestQueue.push(function () {
                if ((stable = isDefined(lastValue)) &&
                    (lastValue === null || !lastValue.$$unwrapTrustedValue)) {
                  lastValue = copy(lastValue, null);
                }
              });
            }
          }
          return lastValue;
        }
      }
    };
  }];
}


function $QProvider() {

  this.$get = ['$rootScope', '$exceptionHandler', function($rootScope, $exceptionHandler) {
    return qFactory(function(callback) {
      $rootScope.$evalAsync(callback);
    }, $exceptionHandler);
  }];
}

function $$QProvider() {
  this.$get = ['$browser', '$exceptionHandler', function($browser, $exceptionHandler) {
    return qFactory(function(callback) {
      $browser.defer(callback);
    }, $exceptionHandler);
  }];
}


function qFactory(nextTick, exceptionHandler) {


  var defer = function() {
    var pending = [],
        value, deferred;

    deferred = {

      resolve: function(val) {
        if (pending) {
          var callbacks = pending;
          pending = undefined;
          value = ref(val);

          if (callbacks.length) {
            nextTick(function() {
              var callback;
              for (var i = 0, ii = callbacks.length; i < ii; i++) {
                callback = callbacks[i];
                value.then(callback[0], callback[1], callback[2]);
              }
            });
          }
        }
      },


      reject: function(reason) {
        deferred.resolve(createInternalRejectedPromise(reason));
      },


      notify: function(progress) {
        if (pending) {
          var callbacks = pending;

          if (pending.length) {
            nextTick(function() {
              var callback;
              for (var i = 0, ii = callbacks.length; i < ii; i++) {
                callback = callbacks[i];
                callback[2](progress);
              }
            });
          }
        }
      },


      promise: {
        then: function(callback, errback, progressback) {
          var result = defer();

          var wrappedCallback = function(value) {
            try {
              result.resolve((isFunction(callback) ? callback : defaultCallback)(value));
            } catch(e) {
              result.reject(e);
              exceptionHandler(e);
            }
          };

          var wrappedErrback = function(reason) {
            try {
              result.resolve((isFunction(errback) ? errback : defaultErrback)(reason));
            } catch(e) {
              result.reject(e);
              exceptionHandler(e);
            }
          };

          var wrappedProgressback = function(progress) {
            try {
              result.notify((isFunction(progressback) ? progressback : defaultCallback)(progress));
            } catch(e) {
              exceptionHandler(e);
            }
          };

          if (pending) {
            pending.push([wrappedCallback, wrappedErrback, wrappedProgressback]);
          } else {
            value.then(wrappedCallback, wrappedErrback, wrappedProgressback);
          }

          return result.promise;
        },

        "catch": function(callback) {
          return this.then(null, callback);
        },

        "finally": function(callback) {

          function makePromise(value, resolved) {
            var result = defer();
            if (resolved) {
              result.resolve(value);
            } else {
              result.reject(value);
            }
            return result.promise;
          }

          function handleCallback(value, isResolved) {
            var callbackOutput = null;
            try {
              callbackOutput = (callback ||defaultCallback)();
            } catch(e) {
              return makePromise(e, false);
            }
            if (callbackOutput && isFunction(callbackOutput.then)) {
              return callbackOutput.then(function() {
                return makePromise(value, isResolved);
              }, function(error) {
                return makePromise(error, false);
              });
            } else {
              return makePromise(value, isResolved);
            }
          }

          return this.then(function(value) {
            return handleCallback(value, true);
          }, function(error) {
            return handleCallback(error, false);
          });
        }
      }
    };

    return deferred;
  };


  var ref = function(value) {
    if (value && isFunction(value.then)) return value;
    return {
      then: function(callback) {
        var result = defer();
        nextTick(function() {
          result.resolve(callback(value));
        });
        return result.promise;
      }
    };
  };



  var reject = function(reason) {
    var result = defer();
    result.reject(reason);
    return result.promise;
  };

  var createInternalRejectedPromise = function(reason) {
    return {
      then: function(callback, errback) {
        var result = defer();
        nextTick(function() {
          try {
            result.resolve((isFunction(errback) ? errback : defaultErrback)(reason));
          } catch(e) {
            result.reject(e);
            exceptionHandler(e);
          }
        });
        return result.promise;
      }
    };
  };



  var when = function(value, callback, errback, progressback) {
    var result = defer(),
        done;

    var wrappedCallback = function(value) {
      try {
        return (isFunction(callback) ? callback : defaultCallback)(value);
      } catch (e) {
        exceptionHandler(e);
        return reject(e);
      }
    };

    var wrappedErrback = function(reason) {
      try {
        return (isFunction(errback) ? errback : defaultErrback)(reason);
      } catch (e) {
        exceptionHandler(e);
        return reject(e);
      }
    };

    var wrappedProgressback = function(progress) {
      try {
        return (isFunction(progressback) ? progressback : defaultCallback)(progress);
      } catch (e) {
        exceptionHandler(e);
      }
    };

    nextTick(function() {
      ref(value).then(function(value) {
        if (done) return;
        done = true;
        result.resolve(ref(value).then(wrappedCallback, wrappedErrback, wrappedProgressback));
      }, function(reason) {
        if (done) return;
        done = true;
        result.resolve(wrappedErrback(reason));
      }, function(progress) {
        if (done) return;
        result.notify(wrappedProgressback(progress));
      });
    });

    return result.promise;
  };


  function defaultCallback(value) {
    return value;
  }


  function defaultErrback(reason) {
    return reject(reason);
  }



  function all(promises) {
    var deferred = defer(),
        counter = 0,
        results = isArray(promises) ? [] : {};

    forEach(promises, function(promise, key) {
      counter++;
      ref(promise).then(function(value) {
        if (results.hasOwnProperty(key)) return;
        results[key] = value;
        if (!(--counter)) deferred.resolve(results);
      }, function(reason) {
        if (results.hasOwnProperty(key)) return;
        deferred.reject(reason);
      });
    });

    if (counter === 0) {
      deferred.resolve(results);
    }

    return deferred.promise;
  }

  return {
    defer: defer,
    reject: reject,
    when: when,
    all: all
  };
}

function $$RAFProvider(){  this.$get = ['$window', '$timeout', function($window, $timeout) {
    var requestAnimationFrame = $window.requestAnimationFrame ||
                                $window.webkitRequestAnimationFrame ||
                                $window.mozRequestAnimationFrame;

    var cancelAnimationFrame = $window.cancelAnimationFrame ||
                               $window.webkitCancelAnimationFrame ||
                               $window.mozCancelAnimationFrame ||
                               $window.webkitCancelRequestAnimationFrame;

    var rafSupported = !!requestAnimationFrame;
    var raf = rafSupported
      ? function(fn) {
          var id = requestAnimationFrame(fn);
          return function() {
            cancelAnimationFrame(id);
          };
        }
      : function(fn) {
          var timer = $timeout(fn, 16.66, false);          return function() {
            $timeout.cancel(timer);
          };
        };

    raf.supported = rafSupported;

    return raf;
  }];
}










function $RootScopeProvider(){
  var TTL = 10;
  var $rootScopeMinErr = minErr('$rootScope');
  var lastDirtyWatch = null;

  this.digestTtl = function(value) {
    if (arguments.length) {
      TTL = value;
    }
    return TTL;
  };

  this.$get = ['$injector', '$exceptionHandler', '$parse', '$browser',
      function( $injector,   $exceptionHandler,   $parse,   $browser) {

    function Scope() {
      this.$id = nextUid();
      this.$$phase = this.$parent = this.$$watchers =
                     this.$$nextSibling = this.$$prevSibling =
                     this.$$childHead = this.$$childTail = null;
      this['this'] = this.$root =  this;
      this.$$destroyed = false;
      this.$$asyncQueue = [];
      this.$$postDigestQueue = [];
      this.$$listeners = {};
      this.$$listenerCount = {};
      this.$$isolateBindings = {};
    }




    Scope.prototype = {
      constructor: Scope,

      $new: function(isolate) {
        var ChildScope,
            child;

        if (isolate) {
          child = new Scope();
          child.$root = this.$root;
          child.$$asyncQueue = this.$$asyncQueue;
          child.$$postDigestQueue = this.$$postDigestQueue;
        } else {
          if (!this.$$childScopeClass) {
            this.$$childScopeClass = function() {
              this.$$watchers = this.$$nextSibling =
                  this.$$childHead = this.$$childTail = null;
              this.$$listeners = {};
              this.$$listenerCount = {};
              this.$id = nextUid();
              this.$$childScopeClass = null;
            };
            this.$$childScopeClass.prototype = this;
          }
          child = new this.$$childScopeClass();
        }
        child['this'] = child;
        child.$parent = this;
        child.$$prevSibling = this.$$childTail;
        if (this.$$childHead) {
          this.$$childTail.$$nextSibling = child;
          this.$$childTail = child;
        } else {
          this.$$childHead = this.$$childTail = child;
        }
        return child;
      },

      $watch: function(watchExp, listener, objectEquality) {
        var scope = this,
            get = compileToFn(watchExp, 'watch'),
            array = scope.$$watchers,
            watcher = {
              fn: listener,
              last: initWatchVal,
              get: get,
              exp: watchExp,
              eq: !!objectEquality
            };

        lastDirtyWatch = null;

        if (!isFunction(listener)) {
          var listenFn = compileToFn(listener || noop, 'listener');
          watcher.fn = function(newVal, oldVal, scope) {listenFn(scope);};
        }

        if (!array) {
          array = scope.$$watchers = [];
        }
        array.unshift(watcher);

        return function deregisterWatch() {
          arrayRemove(array, watcher);
          lastDirtyWatch = null;
        };
      },


      $watchGroup: function(watchExpressions, listener) {
        var oldValues = new Array(watchExpressions.length);
        var newValues = new Array(watchExpressions.length);
        var deregisterFns = [];
        var changeCount = 0;
        var self = this;
        var unwatchFlags = new Array(watchExpressions.length);
        var unwatchCount = watchExpressions.length;

        forEach(watchExpressions, function (expr, i) {
          var exprFn = $parse(expr);
          deregisterFns.push(self.$watch(exprFn, function (value, oldValue) {
            newValues[i] = value;
            oldValues[i] = oldValue;
            changeCount++;
            if (unwatchFlags[i] && !exprFn.$$unwatch) unwatchCount++;
            if (!unwatchFlags[i] && exprFn.$$unwatch) unwatchCount--;
            unwatchFlags[i] = exprFn.$$unwatch;
          }));
        }, this);

        deregisterFns.push(self.$watch(watchGroupFn, function () {
          listener(newValues, oldValues, self);
          if (unwatchCount === 0) {
            watchGroupFn.$$unwatch = true;
          } else {
            watchGroupFn.$$unwatch = false;
          }
        }));

        return function deregisterWatchGroup() {
          forEach(deregisterFns, function (fn) {
            fn();
          });
        };

        function watchGroupFn() {return changeCount;}
      },

      $watchCollection: function(obj, listener) {
        var self = this;
        var newValue;
        var oldValue;
        var veryOldValue;
        var trackVeryOldValue = (listener.length > 1);
        var changeDetected = 0;
        var objGetter = $parse(obj);
        var internalArray = [];
        var internalObject = {};
        var initRun = true;
        var oldLength = 0;

        function $watchCollectionWatch() {
          newValue = objGetter(self);
          var newLength, key;

          if (!isObject(newValue)) {            if (oldValue !== newValue) {
              oldValue = newValue;
              changeDetected++;
            }
          } else if (isArrayLike(newValue)) {
            if (oldValue !== internalArray) {
              oldValue = internalArray;
              oldLength = oldValue.length = 0;
              changeDetected++;
            }

            newLength = newValue.length;

            if (oldLength !== newLength) {
              changeDetected++;
              oldValue.length = oldLength = newLength;
            }
            for (var i = 0; i < newLength; i++) {
              var bothNaN = (oldValue[i] !== oldValue[i]) &&
                  (newValue[i] !== newValue[i]);
              if (!bothNaN && (oldValue[i] !== newValue[i])) {
                changeDetected++;
                oldValue[i] = newValue[i];
              }
            }
          } else {
            if (oldValue !== internalObject) {
              oldValue = internalObject = {};
              oldLength = 0;
              changeDetected++;
            }
            newLength = 0;
            for (key in newValue) {
              if (newValue.hasOwnProperty(key)) {
                newLength++;
                if (oldValue.hasOwnProperty(key)) {
                  if (oldValue[key] !== newValue[key]) {
                    changeDetected++;
                    oldValue[key] = newValue[key];
                  }
                } else {
                  oldLength++;
                  oldValue[key] = newValue[key];
                  changeDetected++;
                }
              }
            }
            if (oldLength > newLength) {
              changeDetected++;
              for(key in oldValue) {
                if (oldValue.hasOwnProperty(key) && !newValue.hasOwnProperty(key)) {
                  oldLength--;
                  delete oldValue[key];
                }
              }
            }
          }
          $watchCollectionWatch.$$unwatch = objGetter.$$unwatch;
          return changeDetected;
        }

        function $watchCollectionAction() {
          if (initRun) {
            initRun = false;
            listener(newValue, newValue, self);
          } else {
            listener(newValue, veryOldValue, self);
          }

          if (trackVeryOldValue) {
            if (!isObject(newValue)) {
              veryOldValue = newValue;
            } else if (isArrayLike(newValue)) {
              veryOldValue = new Array(newValue.length);
              for (var i = 0; i < newValue.length; i++) {
                veryOldValue[i] = newValue[i];
              }
            } else {              veryOldValue = {};
              for (var key in newValue) {
                if (hasOwnProperty.call(newValue, key)) {
                  veryOldValue[key] = newValue[key];
                }
              }
            }
          }
        }

        return this.$watch($watchCollectionWatch, $watchCollectionAction);
      },

      $digest: function() {
        var watch, value, last,
            watchers,
            asyncQueue = this.$$asyncQueue,
            postDigestQueue = this.$$postDigestQueue,
            length,
            dirty, ttl = TTL,
            next, current, target = this,
            watchLog = [],
            stableWatchesCandidates = [],
            logIdx, logMsg, asyncTask;

        beginPhase('$digest');

        lastDirtyWatch = null;

        do {          dirty = false;
          current = target;

          while(asyncQueue.length) {
            try {
              asyncTask = asyncQueue.shift();
              asyncTask.scope.$eval(asyncTask.expression);
            } catch (e) {
              clearPhase();
              $exceptionHandler(e);
            }
            lastDirtyWatch = null;
          }

          traverseScopesLoop:
          do {            if ((watchers = current.$$watchers)) {
              length = watchers.length;
              while (length--) {
                try {
                  watch = watchers[length];
                  if (watch) {
                    if ((value = watch.get(current)) !== (last = watch.last) &&
                        !(watch.eq
                            ? equals(value, last)
                            : (typeof value === 'number' && typeof last === 'number'
                               && isNaN(value) && isNaN(last)))) {
                      dirty = true;
                      lastDirtyWatch = watch;
                      watch.last = watch.eq ? copy(value, null) : value;
                      watch.fn(value, ((last === initWatchVal) ? value : last), current);
                      if (ttl < 5) {
                        logIdx = 4 - ttl;
                        if (!watchLog[logIdx]) watchLog[logIdx] = [];
                        logMsg = (isFunction(watch.exp))
                            ? 'fn: ' + (watch.exp.name || watch.exp.toString())
                            : watch.exp;
                        logMsg += '; newVal: ' + toJson(value) + '; oldVal: ' + toJson(last);
                        watchLog[logIdx].push(logMsg);
                      }
                      if (watch.get.$$unwatch) stableWatchesCandidates.push({watch: watch, array: watchers});
                    } else if (watch === lastDirtyWatch) {
                      dirty = false;
                      break traverseScopesLoop;
                    }
                  }
                } catch (e) {
                  clearPhase();
                  $exceptionHandler(e);
                }
              }
            }

            if (!(next = (current.$$childHead ||
                (current !== target && current.$$nextSibling)))) {
              while(current !== target && !(next = current.$$nextSibling)) {
                current = current.$parent;
              }
            }
          } while ((current = next));


          if((dirty || asyncQueue.length) && !(ttl--)) {
            clearPhase();
            throw $rootScopeMinErr('infdig',
                '{0} $digest() iterations reached. Aborting!\n' +
                'Watchers fired in the last 5 iterations: {1}',
                TTL, toJson(watchLog));
          }

        } while (dirty || asyncQueue.length);

        clearPhase();

        while(postDigestQueue.length) {
          try {
            postDigestQueue.shift()();
          } catch (e) {
            $exceptionHandler(e);
          }
        }

        for (length = stableWatchesCandidates.length - 1; length >= 0; --length) {
          var candidate = stableWatchesCandidates[length];
          if (candidate.watch.get.$$unwatch) {
            arrayRemove(candidate.array, candidate.watch);
          }
        }
      },





      $destroy: function() {
        if (this.$$destroyed) return;
        var parent = this.$parent;

        this.$broadcast('$destroy');
        this.$$destroyed = true;
        if (this === $rootScope) return;

        forEach(this.$$listenerCount, bind(null, decrementListenerCount, this));

        if (parent.$$childHead == this) parent.$$childHead = this.$$nextSibling;
        if (parent.$$childTail == this) parent.$$childTail = this.$$prevSibling;
        if (this.$$prevSibling) this.$$prevSibling.$$nextSibling = this.$$nextSibling;
        if (this.$$nextSibling) this.$$nextSibling.$$prevSibling = this.$$prevSibling;



        this.$parent = this.$$nextSibling = this.$$prevSibling = this.$$childHead =
            this.$$childTail = this.$root = null;

        this.$$listeners = {};
        this.$$watchers = this.$$asyncQueue = this.$$postDigestQueue = [];

        this.$destroy = this.$digest = this.$apply = noop;
        this.$on = this.$watch = this.$watchGroup = function() { return noop; };
      },

      $eval: function(expr, locals) {
        return $parse(expr)(this, locals);
      },


      $evalAsync: function(expr) {
        if (!$rootScope.$$phase && !$rootScope.$$asyncQueue.length) {
          $browser.defer(function() {
            if ($rootScope.$$asyncQueue.length) {
              $rootScope.$digest();
            }
          });
        }

        this.$$asyncQueue.push({scope: this, expression: expr});
      },

      $$postDigest : function(fn) {
        this.$$postDigestQueue.push(fn);
      },


      $apply: function(expr) {
        try {
          beginPhase('$apply');
          return this.$eval(expr);
        } catch (e) {
          $exceptionHandler(e);
        } finally {
          clearPhase();
          try {
            $rootScope.$digest();
          } catch (e) {
            $exceptionHandler(e);
            throw e;
          }
        }
      },


      $on: function(name, listener) {
        var namedListeners = this.$$listeners[name];
        if (!namedListeners) {
          this.$$listeners[name] = namedListeners = [];
        }
        namedListeners.push(listener);

        var current = this;
        do {
          if (!current.$$listenerCount[name]) {
            current.$$listenerCount[name] = 0;
          }
          current.$$listenerCount[name]++;
        } while ((current = current.$parent));

        var self = this;
        return function() {
          namedListeners[indexOf(namedListeners, listener)] = null;
          decrementListenerCount(self, 1, name);
        };
      },



      $emit: function(name, args) {
        var empty = [],
            namedListeners,
            scope = this,
            stopPropagation = false,
            event = {
              name: name,
              targetScope: scope,
              stopPropagation: function() {stopPropagation = true;},
              preventDefault: function() {
                event.defaultPrevented = true;
              },
              defaultPrevented: false
            },
            listenerArgs = concat([event], arguments, 1),
            i, length;

        do {
          namedListeners = scope.$$listeners[name] || empty;
          event.currentScope = scope;
          for (i=0, length=namedListeners.length; i<length; i++) {

            if (!namedListeners[i]) {
              namedListeners.splice(i, 1);
              i--;
              length--;
              continue;
            }
            try {
              namedListeners[i].apply(null, listenerArgs);
            } catch (e) {
              $exceptionHandler(e);
            }
          }
          if (stopPropagation) {
            event.currentScope = null;
            return event;
          }
          scope = scope.$parent;
        } while (scope);

        event.currentScope = null;

        return event;
      },



      $broadcast: function(name, args) {
        var target = this,
            current = target,
            next = target,
            event = {
              name: name,
              targetScope: target,
              preventDefault: function() {
                event.defaultPrevented = true;
              },
              defaultPrevented: false
            },
            listenerArgs = concat([event], arguments, 1),
            listeners, i, length;

        while ((current = next)) {
          event.currentScope = current;
          listeners = current.$$listeners[name] || [];
          for (i=0, length = listeners.length; i<length; i++) {
            if (!listeners[i]) {
              listeners.splice(i, 1);
              i--;
              length--;
              continue;
            }

            try {
              listeners[i].apply(null, listenerArgs);
            } catch(e) {
              $exceptionHandler(e);
            }
          }

          if (!(next = ((current.$$listenerCount[name] && current.$$childHead) ||
              (current !== target && current.$$nextSibling)))) {
            while(current !== target && !(next = current.$$nextSibling)) {
              current = current.$parent;
            }
          }
        }

        event.currentScope = null;
        return event;
      }
    };

    var $rootScope = new Scope();

    return $rootScope;


    function beginPhase(phase) {
      if ($rootScope.$$phase) {
        throw $rootScopeMinErr('inprog', '{0} already in progress', $rootScope.$$phase);
      }

      $rootScope.$$phase = phase;
    }

    function clearPhase() {
      $rootScope.$$phase = null;
    }

    function compileToFn(exp, name) {
      var fn = $parse(exp);
      assertArgFn(fn, name);
      return fn;
    }

    function decrementListenerCount(current, count, name) {
      do {
        current.$$listenerCount[name] -= count;

        if (current.$$listenerCount[name] === 0) {
          delete current.$$listenerCount[name];
        }
      } while ((current = current.$parent));
    }


    function initWatchVal() {}
  }];
}


function $$SanitizeUriProvider() {
  var aHrefSanitizationWhitelist = /^\s*(https?|ftp|mailto|tel|file):/,
    imgSrcSanitizationWhitelist = /^\s*(https?|ftp|file|blob):|data:image\//;


  this.aHrefSanitizationWhitelist = function(regexp) {
    if (isDefined(regexp)) {
      aHrefSanitizationWhitelist = regexp;
      return this;
    }
    return aHrefSanitizationWhitelist;
  };



  this.imgSrcSanitizationWhitelist = function(regexp) {
    if (isDefined(regexp)) {
      imgSrcSanitizationWhitelist = regexp;
      return this;
    }
    return imgSrcSanitizationWhitelist;
  };

  this.$get = function() {
    return function sanitizeUri(uri, isImage) {
      var regex = isImage ? imgSrcSanitizationWhitelist : aHrefSanitizationWhitelist;
      var normalizedVal;
      if (!msie || msie >= 8 ) {
        normalizedVal = urlResolve(uri).href;
        if (normalizedVal !== '' && !normalizedVal.match(regex)) {
          return 'unsafe:'+normalizedVal;
        }
      }
      return uri;
    };
  };
}

var $sceMinErr = minErr('$sce');

var SCE_CONTEXTS = {
  HTML: 'html',
  CSS: 'css',
  URL: 'url',
  RESOURCE_URL: 'resourceUrl',
  JS: 'js'
};

function escapeForRegexp(s) {
  return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
           replace(/\x08/g, '\\x08');
}


function adjustMatcher(matcher) {
  if (matcher === 'self') {
    return matcher;
  } else if (isString(matcher)) {
    if (matcher.indexOf('***') > -1) {
      throw $sceMinErr('iwcard',
          'Illegal sequence *** in string matcher.  String: {0}', matcher);
    }
    matcher = escapeForRegexp(matcher).
                  replace('\\*\\*', '.*').
                  replace('\\*', '[^:/.?&;]*');
    return new RegExp('^' + matcher + '$');
  } else if (isRegExp(matcher)) {
    return new RegExp('^' + matcher.source + '$');
  } else {
    throw $sceMinErr('imatcher',
        'Matchers may only be "self", string patterns or RegExp objects');
  }
}


function adjustMatchers(matchers) {
  var adjustedMatchers = [];
  if (isDefined(matchers)) {
    forEach(matchers, function(matcher) {
      adjustedMatchers.push(adjustMatcher(matcher));
    });
  }
  return adjustedMatchers;
}






function $SceDelegateProvider() {
  this.SCE_CONTEXTS = SCE_CONTEXTS;

  var resourceUrlWhitelist = ['self'],
      resourceUrlBlacklist = [];


  this.resourceUrlWhitelist = function (value) {
    if (arguments.length) {
      resourceUrlWhitelist = adjustMatchers(value);
    }
    return resourceUrlWhitelist;
  };



  this.resourceUrlBlacklist = function (value) {
    if (arguments.length) {
      resourceUrlBlacklist = adjustMatchers(value);
    }
    return resourceUrlBlacklist;
  };

  this.$get = ['$injector', function($injector) {

    var htmlSanitizer = function htmlSanitizer(html) {
      throw $sceMinErr('unsafe', 'Attempting to use an unsafe value in a safe context.');
    };

    if ($injector.has('$sanitize')) {
      htmlSanitizer = $injector.get('$sanitize');
    }


    function matchUrl(matcher, parsedUrl) {
      if (matcher === 'self') {
        return urlIsSameOrigin(parsedUrl);
      } else {
        return !!matcher.exec(parsedUrl.href);
      }
    }

    function isResourceUrlAllowedByPolicy(url) {
      var parsedUrl = urlResolve(url.toString());
      var i, n, allowed = false;
      for (i = 0, n = resourceUrlWhitelist.length; i < n; i++) {
        if (matchUrl(resourceUrlWhitelist[i], parsedUrl)) {
          allowed = true;
          break;
        }
      }
      if (allowed) {
        for (i = 0, n = resourceUrlBlacklist.length; i < n; i++) {
          if (matchUrl(resourceUrlBlacklist[i], parsedUrl)) {
            allowed = false;
            break;
          }
        }
      }
      return allowed;
    }

    function generateHolderType(Base) {
      var holderType = function TrustedValueHolderType(trustedValue) {
        this.$$unwrapTrustedValue = function() {
          return trustedValue;
        };
      };
      if (Base) {
        holderType.prototype = new Base();
      }
      holderType.prototype.valueOf = function sceValueOf() {
        return this.$$unwrapTrustedValue();
      };
      holderType.prototype.toString = function sceToString() {
        return this.$$unwrapTrustedValue().toString();
      };
      return holderType;
    }

    var trustedValueHolderBase = generateHolderType(),
        byType = {};

    byType[SCE_CONTEXTS.HTML] = generateHolderType(trustedValueHolderBase);
    byType[SCE_CONTEXTS.CSS] = generateHolderType(trustedValueHolderBase);
    byType[SCE_CONTEXTS.URL] = generateHolderType(trustedValueHolderBase);
    byType[SCE_CONTEXTS.JS] = generateHolderType(trustedValueHolderBase);
    byType[SCE_CONTEXTS.RESOURCE_URL] = generateHolderType(byType[SCE_CONTEXTS.URL]);


    function trustAs(type, trustedValue) {
      var Constructor = (byType.hasOwnProperty(type) ? byType[type] : null);
      if (!Constructor) {
        throw $sceMinErr('icontext',
            'Attempted to trust a value in invalid context. Context: {0}; Value: {1}',
            type, trustedValue);
      }
      if (trustedValue === null || trustedValue === undefined || trustedValue === '') {
        return trustedValue;
      }
      if (typeof trustedValue !== 'string') {
        throw $sceMinErr('itype',
            'Attempted to trust a non-string value in a content requiring a string: Context: {0}',
            type);
      }
      return new Constructor(trustedValue);
    }


    function valueOf(maybeTrusted) {
      if (maybeTrusted instanceof trustedValueHolderBase) {
        return maybeTrusted.$$unwrapTrustedValue();
      } else {
        return maybeTrusted;
      }
    }


    function getTrusted(type, maybeTrusted) {
      if (maybeTrusted === null || maybeTrusted === undefined || maybeTrusted === '') {
        return maybeTrusted;
      }
      var constructor = (byType.hasOwnProperty(type) ? byType[type] : null);
      if (constructor && maybeTrusted instanceof constructor) {
        return maybeTrusted.$$unwrapTrustedValue();
      }
      if (type === SCE_CONTEXTS.RESOURCE_URL) {
        if (isResourceUrlAllowedByPolicy(maybeTrusted)) {
          return maybeTrusted;
        } else {
          throw $sceMinErr('insecurl',
              'Blocked loading resource from url not allowed by $sceDelegate policy.  URL: {0}',
              maybeTrusted.toString());
        }
      } else if (type === SCE_CONTEXTS.HTML) {
        return htmlSanitizer(maybeTrusted);
      }
      throw $sceMinErr('unsafe', 'Attempting to use an unsafe value in a safe context.');
    }

    return { trustAs: trustAs,
             getTrusted: getTrusted,
             valueOf: valueOf };
  }];
}


function $SceProvider() {
  var enabled = true;


  this.enabled = function (value) {
    if (arguments.length) {
      enabled = !!value;
    }
    return enabled;
  };


  this.$get = ['$parse', '$sniffer', '$sceDelegate', function(
                $parse,   $sniffer,   $sceDelegate) {
    if (enabled && $sniffer.msie && $sniffer.msieDocumentMode < 8) {
      throw $sceMinErr('iequirks',
        'Strict Contextual Escaping does not support Internet Explorer version < 9 in quirks ' +
        'mode.  You can fix this by adding the text <!doctype html> to the top of your HTML ' +
        'document.  See http://docs.angularjs.org/api/ng.$sce for more information.');
    }

    var sce = shallowCopy(SCE_CONTEXTS);


    sce.isEnabled = function () {
      return enabled;
    };
    sce.trustAs = $sceDelegate.trustAs;
    sce.getTrusted = $sceDelegate.getTrusted;
    sce.valueOf = $sceDelegate.valueOf;

    if (!enabled) {
      sce.trustAs = sce.getTrusted = function(type, value) { return value; };
      sce.valueOf = identity;
    }


    sce.parseAs = function sceParseAs(type, expr) {
      var parsed = $parse(expr);
      if (parsed.literal && parsed.constant) {
        return parsed;
      } else {
        return function sceParseAsTrusted(self, locals) {
          var result = sce.getTrusted(type, parsed(self, locals));
          sceParseAsTrusted.$$unwatch = parsed.$$unwatch;
          return result;
        };
      }
    };

































    var parse = sce.parseAs,
        getTrusted = sce.getTrusted,
        trustAs = sce.trustAs;

    forEach(SCE_CONTEXTS, function (enumValue, name) {
      var lName = lowercase(name);
      sce[camelCase("parse_as_" + lName)] = function (expr) {
        return parse(enumValue, expr);
      };
      sce[camelCase("get_trusted_" + lName)] = function (value) {
        return getTrusted(enumValue, value);
      };
      sce[camelCase("trust_as_" + lName)] = function (value) {
        return trustAs(enumValue, value);
      };
    });

    return sce;
  }];
}


function $SnifferProvider() {
  this.$get = ['$window', '$document', function($window, $document) {
    var eventSupport = {},
        android =
          int((/android (\d+)/.exec(lowercase(($window.navigator || {}).userAgent)) || [])[1]),
        boxee = /Boxee/i.test(($window.navigator || {}).userAgent),
        document = $document[0] || {},
        documentMode = document.documentMode,
        vendorPrefix,
        vendorRegex = /^(Moz|webkit|O|ms)(?=[A-Z])/,
        bodyStyle = document.body && document.body.style,
        transitions = false,
        animations = false,
        match;

    if (bodyStyle) {
      for(var prop in bodyStyle) {
        if(match = vendorRegex.exec(prop)) {
          vendorPrefix = match[0];
          vendorPrefix = vendorPrefix.substr(0, 1).toUpperCase() + vendorPrefix.substr(1);
          break;
        }
      }

      if(!vendorPrefix) {
        vendorPrefix = ('WebkitOpacity' in bodyStyle) && 'webkit';
      }

      transitions = !!(('transition' in bodyStyle) || (vendorPrefix + 'Transition' in bodyStyle));
      animations  = !!(('animation' in bodyStyle) || (vendorPrefix + 'Animation' in bodyStyle));

      if (android && (!transitions||!animations)) {
        transitions = isString(document.body.style.webkitTransition);
        animations = isString(document.body.style.webkitAnimation);
      }
    }


    return {

      history: !!($window.history && $window.history.pushState && !(android < 4) && !boxee),
      hashchange: 'onhashchange' in $window &&
                  (!documentMode || documentMode > 7),
      hasEvent: function(event) {
        if (event == 'input' && msie == 9) return false;

        if (isUndefined(eventSupport[event])) {
          var divElm = document.createElement('div');
          eventSupport[event] = 'on' + event in divElm;
        }

        return eventSupport[event];
      },
      csp: csp(),
      vendorPrefix: vendorPrefix,
      transitions : transitions,
      animations : animations,
      android: android,
      msie : msie,
      msieDocumentMode: documentMode
    };
  }];
}

function $TimeoutProvider() {
  this.$get = ['$rootScope', '$browser', '$q', '$$q', '$exceptionHandler',
       function($rootScope,   $browser,   $q,   $$q,   $exceptionHandler) {
    var deferreds = {};



    function timeout(fn, delay, invokeApply) {
      var skipApply = (isDefined(invokeApply) && !invokeApply),
          deferred = (skipApply ? $$q : $q).defer(),
          promise = deferred.promise,
          timeoutId;

      timeoutId = $browser.defer(function() {
        try {
          deferred.resolve(fn());
        } catch(e) {
          deferred.reject(e);
          $exceptionHandler(e);
        }
        finally {
          delete deferreds[promise.$$timeoutId];
        }

        if (!skipApply) $rootScope.$apply();
      }, delay);

      promise.$$timeoutId = timeoutId;
      deferreds[timeoutId] = deferred;

      return promise;
    }



    timeout.cancel = function(promise) {
      if (promise && promise.$$timeoutId in deferreds) {
        deferreds[promise.$$timeoutId].reject('canceled');
        delete deferreds[promise.$$timeoutId];
        return $browser.defer.cancel(promise.$$timeoutId);
      }
      return false;
    };

    return timeout;
  }];
}

var urlParsingNode = document.createElement("a");
var originUrl = urlResolve(window.location.href, true);

function urlResolve(url, base) {
  var href = url;

  if (msie) {
    urlParsingNode.setAttribute("href", href);
    href = urlParsingNode.href;
  }

  urlParsingNode.setAttribute('href', href);

  return {
    href: urlParsingNode.href,
    protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
    host: urlParsingNode.host,
    search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
    hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
    hostname: urlParsingNode.hostname,
    port: urlParsingNode.port,
    pathname: (urlParsingNode.pathname.charAt(0) === '/')
      ? urlParsingNode.pathname
      : '/' + urlParsingNode.pathname
  };
}


function urlIsSameOrigin(requestUrl) {
  var parsed = (isString(requestUrl)) ? urlResolve(requestUrl) : requestUrl;
  return (parsed.protocol === originUrl.protocol &&
          parsed.host === originUrl.host);
}


function $WindowProvider(){
  this.$get = valueFn(window);
}


$FilterProvider.$inject = ['$provide'];
function $FilterProvider($provide) {
  var suffix = 'Filter';


  function register(name, factory) {
    if(isObject(name)) {
      var filters = {};
      forEach(name, function(filter, key) {
        filters[key] = register(key, filter);
      });
      return filters;
    } else {
      return $provide.factory(name + suffix, factory);
    }
  }
  this.register = register;

  this.$get = ['$injector', function($injector) {
    return function(name) {
      return $injector.get(name + suffix);
    };
  }];

  register('currency', currencyFilter);
  register('date', dateFilter);
  register('filter', filterFilter);
  register('json', jsonFilter);
  register('limitTo', limitToFilter);
  register('lowercase', lowercaseFilter);
  register('number', numberFilter);
  register('orderBy', orderByFilter);
  register('uppercase', uppercaseFilter);
}

function filterFilter() {
  return function(array, expression, comparator) {
    if (!isArray(array)) return array;

    var comparatorType = typeof(comparator),
        predicates = [];

    predicates.check = function(value) {
      for (var j = 0; j < predicates.length; j++) {
        if(!predicates[j](value)) {
          return false;
        }
      }
      return true;
    };

    if (comparatorType !== 'function') {
      if (comparatorType === 'boolean' && comparator) {
        comparator = function(obj, text) {
          return angular.equals(obj, text);
        };
      } else {
        comparator = function(obj, text) {
          if (obj && text && typeof obj === 'object' && typeof text === 'object') {
            for (var objKey in obj) {
              if (objKey.charAt(0) !== '$' && hasOwnProperty.call(obj, objKey) &&
                  comparator(obj[objKey], text[objKey])) {
                return true;
              }
            }
            return false;
          }
          text = (''+text).toLowerCase();
          return (''+obj).toLowerCase().indexOf(text) > -1;
        };
      }
    }

    var search = function(obj, text){
      if (typeof text == 'string' && text.charAt(0) === '!') {
        return !search(obj, text.substr(1));
      }
      switch (typeof obj) {
        case "boolean":
        case "number":
        case "string":
          return comparator(obj, text);
        case "object":
          switch (typeof text) {
            case "object":
              return comparator(obj, text);
            default:
              for ( var objKey in obj) {
                if (objKey.charAt(0) !== '$' && search(obj[objKey], text)) {
                  return true;
                }
              }
              break;
          }
          return false;
        case "array":
          for ( var i = 0; i < obj.length; i++) {
            if (search(obj[i], text)) {
              return true;
            }
          }
          return false;
        default:
          return false;
      }
    };
    switch (typeof expression) {
      case "boolean":
      case "number":
      case "string":
        expression = {$:expression};
      case "object":
        for (var key in expression) {
          (function(path) {
            if (typeof expression[path] === 'undefined') return;
            predicates.push(function(value) {
              return search(path == '$' ? value : (value && value[path]), expression[path]);
            });
          })(key);
        }
        break;
      case 'function':
        predicates.push(expression);
        break;
      default:
        return array;
    }
    var filtered = [];
    for ( var j = 0; j < array.length; j++) {
      var value = array[j];
      if (predicates.check(value)) {
        filtered.push(value);
      }
    }
    return filtered;
  };
}


currencyFilter.$inject = ['$locale'];
function currencyFilter($locale) {
  var formats = $locale.NUMBER_FORMATS;
  return function(amount, currencySymbol){
    if (isUndefined(currencySymbol)) currencySymbol = formats.CURRENCY_SYM;
    return formatNumber(amount, formats.PATTERNS[1], formats.GROUP_SEP, formats.DECIMAL_SEP, 2).
                replace(/\u00A4/g, currencySymbol);
  };
}


numberFilter.$inject = ['$locale'];
function numberFilter($locale) {
  var formats = $locale.NUMBER_FORMATS;
  return function(number, fractionSize) {
    return formatNumber(number, formats.PATTERNS[0], formats.GROUP_SEP, formats.DECIMAL_SEP,
      fractionSize);
  };
}

var DECIMAL_SEP = '.';
function formatNumber(number, pattern, groupSep, decimalSep, fractionSize) {
  if (number == null || !isFinite(number) || isObject(number)) return '';

  var isNegative = number < 0;
  number = Math.abs(number);
  var numStr = number + '',
      formatedText = '',
      parts = [];

  var hasExponent = false;
  if (numStr.indexOf('e') !== -1) {
    var match = numStr.match(/([\d\.]+)e(-?)(\d+)/);
    if (match && match[2] == '-' && match[3] > fractionSize + 1) {
      numStr = '0';
      number = 0;
    } else {
      formatedText = numStr;
      hasExponent = true;
    }
  }

  if (!hasExponent) {
    var fractionLen = (numStr.split(DECIMAL_SEP)[1] || '').length;

    if (isUndefined(fractionSize)) {
      fractionSize = Math.min(Math.max(pattern.minFrac, fractionLen), pattern.maxFrac);
    }

    number = +(Math.round(+(number.toString() + 'e' + fractionSize)).toString() + 'e' + -fractionSize);

    var fraction = ('' + number).split(DECIMAL_SEP);
    var whole = fraction[0];
    fraction = fraction[1] || '';

    var i, pos = 0,
        lgroup = pattern.lgSize,
        group = pattern.gSize;

    if (whole.length >= (lgroup + group)) {
      pos = whole.length - lgroup;
      for (i = 0; i < pos; i++) {
        if ((pos - i)%group === 0 && i !== 0) {
          formatedText += groupSep;
        }
        formatedText += whole.charAt(i);
      }
    }

    for (i = pos; i < whole.length; i++) {
      if ((whole.length - i)%lgroup === 0 && i !== 0) {
        formatedText += groupSep;
      }
      formatedText += whole.charAt(i);
    }

    while(fraction.length < fractionSize) {
      fraction += '0';
    }

    if (fractionSize && fractionSize !== "0") formatedText += decimalSep + fraction.substr(0, fractionSize);
  } else {

    if (fractionSize > 0 && number > -1 && number < 1) {
      formatedText = number.toFixed(fractionSize);
    }
  }

  parts.push(isNegative ? pattern.negPre : pattern.posPre);
  parts.push(formatedText);
  parts.push(isNegative ? pattern.negSuf : pattern.posSuf);
  return parts.join('');
}

function padNumber(num, digits, trim) {
  var neg = '';
  if (num < 0) {
    neg =  '-';
    num = -num;
  }
  num = '' + num;
  while(num.length < digits) num = '0' + num;
  if (trim)
    num = num.substr(num.length - digits);
  return neg + num;
}


function dateGetter(name, size, offset, trim) {
  offset = offset || 0;
  return function(date) {
    var value = date['get' + name]();
    if (offset > 0 || value > -offset)
      value += offset;
    if (value === 0 && offset == -12 ) value = 12;
    return padNumber(value, size, trim);
  };
}

function dateStrGetter(name, shortForm) {
  return function(date, formats) {
    var value = date['get' + name]();
    var get = uppercase(shortForm ? ('SHORT' + name) : name);

    return formats[get][value];
  };
}

function timeZoneGetter(date) {
  var zone = -1 * date.getTimezoneOffset();
  var paddedZone = (zone >= 0) ? "+" : "";

  paddedZone += padNumber(Math[zone > 0 ? 'floor' : 'ceil'](zone / 60), 2) +
                padNumber(Math.abs(zone % 60), 2);

  return paddedZone;
}

function getFirstThursdayOfYear(year) {
    var dayOfWeekOnFirst = (new Date(year, 0, 1)).getDay();
    return new Date(year, 0, ((dayOfWeekOnFirst <= 4) ? 5 : 12) - dayOfWeekOnFirst);
}

function getThursdayThisWeek(datetime) {
    return new Date(datetime.getFullYear(), datetime.getMonth(),
      datetime.getDate() + (4 - datetime.getDay()));
}

function weekGetter(size) {
   return function(date) {
      var firstThurs = getFirstThursdayOfYear(date.getFullYear()),
         thisThurs = getThursdayThisWeek(date);

      var diff = +thisThurs - +firstThurs,
         result = 1 + Math.round(diff / 6.048e8);
      return padNumber(result, size);
   };
}

function ampmGetter(date, formats) {
  return date.getHours() < 12 ? formats.AMPMS[0] : formats.AMPMS[1];
}

var DATE_FORMATS = {
  yyyy: dateGetter('FullYear', 4),
    yy: dateGetter('FullYear', 2, 0, true),
     y: dateGetter('FullYear', 1),
  MMMM: dateStrGetter('Month'),
   MMM: dateStrGetter('Month', true),
    MM: dateGetter('Month', 2, 1),
     M: dateGetter('Month', 1, 1),
    dd: dateGetter('Date', 2),
     d: dateGetter('Date', 1),
    HH: dateGetter('Hours', 2),
     H: dateGetter('Hours', 1),
    hh: dateGetter('Hours', 2, -12),
     h: dateGetter('Hours', 1, -12),
    mm: dateGetter('Minutes', 2),
     m: dateGetter('Minutes', 1),
    ss: dateGetter('Seconds', 2),
     s: dateGetter('Seconds', 1),
   sss: dateGetter('Milliseconds', 3),
  EEEE: dateStrGetter('Day'),
   EEE: dateStrGetter('Day', true),
     a: ampmGetter,
     Z: timeZoneGetter,
    ww: weekGetter(2),
     w: weekGetter(1)
};

var DATE_FORMATS_SPLIT = /((?:[^yMdHhmsaZEw']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z|w+))(.*)/,
    NUMBER_STRING = /^\-?\d+$/;


dateFilter.$inject = ['$locale'];
function dateFilter($locale) {


  var R_ISO8601_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
  function jsonStringToDate(string) {
    var match;
    if (match = string.match(R_ISO8601_STR)) {
      var date = new Date(0),
          tzHour = 0,
          tzMin  = 0,
          dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear,
          timeSetter = match[8] ? date.setUTCHours : date.setHours;

      if (match[9]) {
        tzHour = int(match[9] + match[10]);
        tzMin = int(match[9] + match[11]);
      }
      dateSetter.call(date, int(match[1]), int(match[2]) - 1, int(match[3]));
      var h = int(match[4]||0) - tzHour;
      var m = int(match[5]||0) - tzMin;
      var s = int(match[6]||0);
      var ms = Math.round(parseFloat('0.' + (match[7]||0)) * 1000);
      timeSetter.call(date, h, m, s, ms);
      return date;
    }
    return string;
  }


  return function(date, format) {
    var text = '',
        parts = [],
        fn, match;

    format = format || 'mediumDate';
    format = $locale.DATETIME_FORMATS[format] || format;
    if (isString(date)) {
      if (NUMBER_STRING.test(date)) {
        date = int(date);
      } else {
        date = jsonStringToDate(date);
      }
    }

    if (isNumber(date)) {
      date = new Date(date);
    }

    if (!isDate(date)) {
      return date;
    }

    while(format) {
      match = DATE_FORMATS_SPLIT.exec(format);
      if (match) {
        parts = concat(parts, match, 1);
        format = parts.pop();
      } else {
        parts.push(format);
        format = null;
      }
    }

    forEach(parts, function(value){
      fn = DATE_FORMATS[value];
      text += fn ? fn(date, $locale.DATETIME_FORMATS)
                 : value.replace(/(^'|'$)/g, '').replace(/''/g, "'");
    });

    return text;
  };
}



function jsonFilter() {
  return function(object) {
    return toJson(object, true);
  };
}



var lowercaseFilter = valueFn(lowercase);



var uppercaseFilter = valueFn(uppercase);

function limitToFilter(){
  return function(input, limit) {
    if (!isArray(input) && !isString(input)) return input;

    if (Math.abs(Number(limit)) === Infinity) {
      limit = Number(limit);
    } else {
      limit = int(limit);
    }

    if (isString(input)) {
      if (limit) {
        return limit >= 0 ? input.slice(0, limit) : input.slice(limit, input.length);
      } else {
        return "";
      }
    }

    var out = [],
      i, n;

    if (limit > input.length)
      limit = input.length;
    else if (limit < -input.length)
      limit = -input.length;

    if (limit > 0) {
      i = 0;
      n = limit;
    } else {
      i = input.length + limit;
      n = input.length;
    }

    for (; i<n; i++) {
      out.push(input[i]);
    }

    return out;
  };
}

orderByFilter.$inject = ['$parse'];
function orderByFilter($parse){
  return function(array, sortPredicate, reverseOrder) {
    if (!isArray(array)) return array;
    if (!sortPredicate) return array;
    sortPredicate = isArray(sortPredicate) ? sortPredicate: [sortPredicate];
    sortPredicate = map(sortPredicate, function(predicate){
      var descending = false, get = predicate || identity;
      if (isString(predicate)) {
        if ((predicate.charAt(0) == '+' || predicate.charAt(0) == '-')) {
          descending = predicate.charAt(0) == '-';
          predicate = predicate.substring(1);
        }
        get = $parse(predicate);
        if (get.constant) {
          var key = get();
          return reverseComparator(function(a,b) {
            return compare(a[key], b[key]);
          }, descending);
        }
      }
      return reverseComparator(function(a,b){
        return compare(get(a),get(b));
      }, descending);
    });
    var arrayCopy = [];
    for ( var i = 0; i < array.length; i++) { arrayCopy.push(array[i]); }
    return arrayCopy.sort(reverseComparator(comparator, reverseOrder));

    function comparator(o1, o2){
      for ( var i = 0; i < sortPredicate.length; i++) {
        var comp = sortPredicate[i](o1, o2);
        if (comp !== 0) return comp;
      }
      return 0;
    }
    function reverseComparator(comp, descending) {
      return descending
          ? function(a,b){return comp(b,a);}
          : comp;
    }
    function compare(v1, v2){
      var t1 = typeof v1;
      var t2 = typeof v2;
      if (t1 == t2) {
        if (t1 == "string") {
           v1 = v1.toLowerCase();
           v2 = v2.toLowerCase();
        }
        if (v1 === v2) return 0;
        return v1 < v2 ? -1 : 1;
      } else {
        return t1 < t2 ? -1 : 1;
      }
    }
  };
}

function ngDirective(directive) {
  if (isFunction(directive)) {
    directive = {
      link: directive
    };
  }
  directive.restrict = directive.restrict || 'AC';
  return valueFn(directive);
}


var htmlAnchorDirective = valueFn({
  restrict: 'E',
  compile: function(element, attr) {

    if (msie <= 8) {

      if (!attr.href && !attr.name) {
        attr.$set('href', '');
      }

      element.append(document.createComment('IE fix'));
    }

    if (!attr.href && !attr.xlinkHref && !attr.name) {
      return function(scope, element) {
        var href = toString.call(element.prop('href')) === '[object SVGAnimatedString]' ?
                   'xlink:href' : 'href';
        element.on('click', function(event){
          if (!element.attr(href)) {
            event.preventDefault();
          }
        });
      };
    }
  }
});


var ngAttributeAliasDirectives = {};


forEach(BOOLEAN_ATTR, function(propName, attrName) {
  if (propName == "multiple") return;

  var normalized = directiveNormalize('ng-' + attrName);
  ngAttributeAliasDirectives[normalized] = function() {
    return {
      priority: 100,
      link: function(scope, element, attr) {
        scope.$watch(attr[normalized], function ngBooleanAttrWatchAction(value) {
          attr.$set(attrName, !!value);
        });
      }
    };
  };
});

forEach(ALIASED_ATTR, function(htmlAttr, ngAttr) {
  ngAttributeAliasDirectives[ngAttr] = function() {
    return {
      priority: 100,
      link: function(scope, element, attr) {
        if (ngAttr === "ngPattern" && attr.ngPattern.charAt(0) == "/") {
          var match = attr.ngPattern.match(REGEX_STRING_REGEXP);
          if (match) {
            attr.$set("ngPattern", new RegExp(match[1], match[2]));
            return;
          }
        }

        scope.$watch(attr[ngAttr], function ngAttrAliasWatchAction(value) {
          attr.$set(ngAttr, value);
        });
      }
    };
  };
});

forEach(['src', 'srcset', 'href'], function(attrName) {
  var normalized = directiveNormalize('ng-' + attrName);
  ngAttributeAliasDirectives[normalized] = function() {
    return {
      priority: 99,      link: function(scope, element, attr) {
        var propName = attrName,
            name = attrName;

        if (attrName === 'href' &&
            toString.call(element.prop('href')) === '[object SVGAnimatedString]') {
          name = 'xlinkHref';
          attr.$attr[name] = 'xlink:href';
          propName = null;
        }

        attr.$observe(normalized, function(value) {
          if (!value)
             return;

          attr.$set(name, value);

          if (msie && propName) element.prop(propName, attr[name]);
        });
      }
    };
  };
});

var nullFormCtrl = {
  $addControl: noop,
  $removeControl: noop,
  $setValidity: noop,
  $setDirty: noop,
  $setPristine: noop
};


FormController.$inject = ['$element', '$attrs', '$scope', '$animate'];
function FormController(element, attrs, $scope, $animate) {
  var form = this,
      parentForm = element.parent().controller('form') || nullFormCtrl,
      invalidCount = 0,      errors = form.$error = {},
      controls = [];

  form.$name = attrs.name || attrs.ngForm;
  form.$dirty = false;
  form.$pristine = true;
  form.$valid = true;
  form.$invalid = false;

  parentForm.$addControl(form);

  element.addClass(PRISTINE_CLASS);
  toggleValidCss(true);

  function toggleValidCss(isValid, validationErrorKey) {
    validationErrorKey = validationErrorKey ? '-' + snake_case(validationErrorKey, '-') : '';
    $animate.removeClass(element, (isValid ? INVALID_CLASS : VALID_CLASS) + validationErrorKey);
    $animate.addClass(element, (isValid ? VALID_CLASS : INVALID_CLASS) + validationErrorKey);
  }


  form.$rollbackViewValue = function() {
    forEach(controls, function(control) {
      control.$rollbackViewValue();
    });
  };


  form.$commitViewValue = function() {
    forEach(controls, function(control) {
      control.$commitViewValue();
    });
  };


  form.$addControl = function(control) {
    assertNotHasOwnProperty(control.$name, 'input');
    controls.push(control);

    if (control.$name) {
      form[control.$name] = control;
    }
  };


  form.$removeControl = function(control) {
    if (control.$name && form[control.$name] === control) {
      delete form[control.$name];
    }
    forEach(errors, function(queue, validationToken) {
      form.$setValidity(validationToken, true, control);
    });

    arrayRemove(controls, control);
  };


  form.$setValidity = function(validationToken, isValid, control) {
    var queue = errors[validationToken];

    if (isValid) {
      if (queue) {
        arrayRemove(queue, control);
        if (!queue.length) {
          invalidCount--;
          if (!invalidCount) {
            toggleValidCss(isValid);
            form.$valid = true;
            form.$invalid = false;
          }
          errors[validationToken] = false;
          toggleValidCss(true, validationToken);
          parentForm.$setValidity(validationToken, true, form);
        }
      }

    } else {
      if (!invalidCount) {
        toggleValidCss(isValid);
      }
      if (queue) {
        if (includes(queue, control)) return;
      } else {
        errors[validationToken] = queue = [];
        invalidCount++;
        toggleValidCss(false, validationToken);
        parentForm.$setValidity(validationToken, false, form);
      }
      queue.push(control);

      form.$valid = false;
      form.$invalid = true;
    }
  };


  form.$setDirty = function() {
    $animate.removeClass(element, PRISTINE_CLASS);
    $animate.addClass(element, DIRTY_CLASS);
    form.$dirty = true;
    form.$pristine = false;
    parentForm.$setDirty();
  };


  form.$setPristine = function () {
    $animate.removeClass(element, DIRTY_CLASS);
    $animate.addClass(element, PRISTINE_CLASS);
    form.$dirty = false;
    form.$pristine = true;
    forEach(controls, function(control) {
      control.$setPristine();
    });
  };
}


var formDirectiveFactory = function(isNgForm) {
  return ['$timeout', function($timeout) {
    var formDirective = {
      name: 'form',
      restrict: isNgForm ? 'EAC' : 'E',
      controller: FormController,
      compile: function() {
        return {
          pre: function(scope, formElement, attr, controller) {
            if (!attr.action) {
              var handleFormSubmission = function(event) {
                scope.$apply(function() {
                  controller.$commitViewValue();
                });

                event.preventDefault
                  ? event.preventDefault()
                  : event.returnValue = false;              };

              addEventListenerFn(formElement[0], 'submit', handleFormSubmission);

              formElement.on('$destroy', function() {
                $timeout(function() {
                  removeEventListenerFn(formElement[0], 'submit', handleFormSubmission);
                }, 0, false);
              });
            }

            var parentFormCtrl = formElement.parent().controller('form'),
                alias = attr.name || attr.ngForm;

            if (alias) {
              setter(scope, alias, controller, alias);
            }
            if (parentFormCtrl) {
              formElement.on('$destroy', function() {
                parentFormCtrl.$removeControl(controller);
                if (alias) {
                  setter(scope, alias, undefined, alias);
                }
                extend(controller, nullFormCtrl);              });
            }
          }
        };
      }
    };

    return formDirective;
  }];
};

var formDirective = formDirectiveFactory();
var ngFormDirective = formDirectiveFactory(true);

var URL_REGEXP = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
var EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
var NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/;
var DATE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})$/;
var DATETIMELOCAL_REGEXP = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)$/;
var WEEK_REGEXP = /^(\d{4})-W(\d\d)$/;
var MONTH_REGEXP = /^(\d{4})-(\d\d)$/;
var TIME_REGEXP = /^(\d\d):(\d\d)$/;
var DEFAULT_REGEXP = /(\s+|^)default(\s+|$)/;

var inputType = {
  'text': textInputType,
  'date': createDateInputType('date', DATE_REGEXP,
         createDateParser(DATE_REGEXP, ['yyyy', 'MM', 'dd']),
         'yyyy-MM-dd'),
  'datetime-local': createDateInputType('datetimelocal', DATETIMELOCAL_REGEXP,
      createDateParser(DATETIMELOCAL_REGEXP, ['yyyy', 'MM', 'dd', 'HH', 'mm']),
      'yyyy-MM-ddTHH:mm'),

  'time': createDateInputType('time', TIME_REGEXP,
      createDateParser(TIME_REGEXP, ['HH', 'mm']),
     'HH:mm'),
  'week': createDateInputType('week', WEEK_REGEXP, weekParser, 'yyyy-Www'),
  'month': createDateInputType('month', MONTH_REGEXP,
     createDateParser(MONTH_REGEXP, ['yyyy', 'MM']),
     'yyyy-MM'),

  'number': numberInputType,
  'url': urlInputType,
  'email': emailInputType,
  'radio': radioInputType,

  'checkbox': checkboxInputType,

  'hidden': noop,
  'button': noop,
  'submit': noop,
  'reset': noop,
  'file': noop
};

function validate(ctrl, validatorName, validity, value){
  ctrl.$setValidity(validatorName, validity);
  return validity ? value : undefined;
}

function testFlags(validity, flags) {
  var i, flag;
  if (flags) {
    for (i=0; i<flags.length; ++i) {
      flag = flags[i];
      if (validity[flag]) {
        return true;
      }
    }
  }
  return false;
}

function addNativeHtml5Validators(ctrl, validatorName, badFlags, ignoreFlags, validity) {
  if (isObject(validity)) {
    ctrl.$$hasNativeValidators = true;
    var validator = function(value) {
      if (!ctrl.$error[validatorName] &&
          !testFlags(validity, ignoreFlags) &&
          testFlags(validity, badFlags)) {
        ctrl.$setValidity(validatorName, false);
        return;
      }
      return value;
    };
    ctrl.$parsers.push(validator);
  }
}

function textInputType(scope, element, attr, ctrl, $sniffer, $browser) {
  var validity = element.prop(VALIDITY_STATE_PROPERTY);
  var placeholder = element[0].placeholder, noevent = {};
  ctrl.$$validityState = validity;

  if (!$sniffer.android) {
    var composing = false;

    element.on('compositionstart', function(data) {
      composing = true;
    });

    element.on('compositionend', function() {
      composing = false;
      listener();
    });
  }

  var listener = function(ev) {
    if (composing) return;
    var value = element.val(),
        event = ev && ev.type;

    if (msie && (ev || noevent).type === 'input' && element[0].placeholder !== placeholder) {
      placeholder = element[0].placeholder;
      return;
    }

    if (!attr.ngTrim || attr.ngTrim !== 'false') {
      value = trim(value);
    }

    var revalidate = validity && ctrl.$$hasNativeValidators;
    if (ctrl.$viewValue !== value || (value === '' && revalidate)) {
      if (scope.$$phase) {
        ctrl.$setViewValue(value, event, revalidate);
      } else {
        scope.$apply(function() {
          ctrl.$setViewValue(value, event, revalidate);
        });
      }
    }
  };

  if ($sniffer.hasEvent('input')) {
    element.on('input', listener);
  } else {
    var timeout;

    var deferListener = function(ev) {
      if (!timeout) {
        timeout = $browser.defer(function() {
          listener(ev);
          timeout = null;
        });
      }
    };

    element.on('keydown', function(event) {
      var key = event.keyCode;

      if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) return;

      deferListener(event);
    });

    if ($sniffer.hasEvent('paste')) {
      element.on('paste cut', deferListener);
    }
  }

  element.on('change', listener);

  ctrl.$render = function() {
    element.val(ctrl.$isEmpty(ctrl.$viewValue) ? '' : ctrl.$viewValue);
  };
}

function weekParser(isoWeek) {
   if(isDate(isoWeek)) {
      return isoWeek;
   }

   if(isString(isoWeek)) {
      WEEK_REGEXP.lastIndex = 0;
      var parts = WEEK_REGEXP.exec(isoWeek);
      if(parts) {
         var year = +parts[1],
            week = +parts[2],
            firstThurs = getFirstThursdayOfYear(year),
            addDays = (week - 1) * 7;
         return new Date(year, 0, firstThurs.getDate() + addDays);
      }
   }

   return NaN;
}

function createDateParser(regexp, mapping) {
   return function(iso) {
      var parts, map;

      if(isDate(iso)) {
         return iso;
      }

      if(isString(iso)) {
         regexp.lastIndex = 0;
         parts = regexp.exec(iso);

         if(parts) {
            parts.shift();
            map = { yyyy: 0, MM: 1, dd: 1, HH: 0, mm: 0 };

            forEach(parts, function(part, index) {
               if(index < mapping.length) {
                  map[mapping[index]] = +part;
               }
            });

            return new Date(map.yyyy, map.MM - 1, map.dd, map.HH, map.mm);
         }
      }

      return NaN;
   };
}

function createDateInputType(type, regexp, parseDate, format) {
   return function dynamicDateInputType(scope, element, attr, ctrl, $sniffer, $browser, $filter) {
      textInputType(scope, element, attr, ctrl, $sniffer, $browser);

      ctrl.$parsers.push(function(value) {
         if(ctrl.$isEmpty(value)) {
            ctrl.$setValidity(type, true);
            return null;
         }

         if(regexp.test(value)) {
            ctrl.$setValidity(type, true);
            return parseDate(value);
         }

         ctrl.$setValidity(type, false);
         return undefined;
      });

      ctrl.$formatters.push(function(value) {
         if(isDate(value)) {
            return $filter('date')(value, format);
         }
         return '';
      });

      if(attr.min) {
         var minValidator = function(value) {
            var valid = ctrl.$isEmpty(value) ||
               (parseDate(value) >= parseDate(attr.min));
            ctrl.$setValidity('min', valid);
            return valid ? value : undefined;
         };

         ctrl.$parsers.push(minValidator);
         ctrl.$formatters.push(minValidator);
      }

      if(attr.max) {
         var maxValidator = function(value) {
            var valid = ctrl.$isEmpty(value) ||
               (parseDate(value) <= parseDate(attr.max));
            ctrl.$setValidity('max', valid);
            return valid ? value : undefined;
         };

         ctrl.$parsers.push(maxValidator);
         ctrl.$formatters.push(maxValidator);
      }
   };
}

var numberBadFlags = ['badInput'];

function numberInputType(scope, element, attr, ctrl, $sniffer, $browser) {
  textInputType(scope, element, attr, ctrl, $sniffer, $browser);

  ctrl.$parsers.push(function(value) {
    var empty = ctrl.$isEmpty(value);
    if (empty || NUMBER_REGEXP.test(value)) {
      ctrl.$setValidity('number', true);
      return value === '' ? null : (empty ? value : parseFloat(value));
    } else {
      ctrl.$setValidity('number', false);
      return undefined;
    }
  });

  addNativeHtml5Validators(ctrl, 'number', numberBadFlags, null, ctrl.$$validityState);

  ctrl.$formatters.push(function(value) {
    return ctrl.$isEmpty(value) ? '' : '' + value;
  });

  if (attr.min) {
    var minValidator = function(value) {
      var min = parseFloat(attr.min);
      return validate(ctrl, 'min', ctrl.$isEmpty(value) || value >= min, value);
    };

    ctrl.$parsers.push(minValidator);
    ctrl.$formatters.push(minValidator);
  }

  if (attr.max) {
    var maxValidator = function(value) {
      var max = parseFloat(attr.max);
      return validate(ctrl, 'max', ctrl.$isEmpty(value) || value <= max, value);
    };

    ctrl.$parsers.push(maxValidator);
    ctrl.$formatters.push(maxValidator);
  }

  ctrl.$formatters.push(function(value) {
    return validate(ctrl, 'number', ctrl.$isEmpty(value) || isNumber(value), value);
  });
}

function urlInputType(scope, element, attr, ctrl, $sniffer, $browser) {
  textInputType(scope, element, attr, ctrl, $sniffer, $browser);

  ctrl.$validators.url = function(modelValue, viewValue) {
    var value = modelValue || viewValue;
    return ctrl.$isEmpty(value) || URL_REGEXP.test(value);
  };
}

function emailInputType(scope, element, attr, ctrl, $sniffer, $browser) {
  textInputType(scope, element, attr, ctrl, $sniffer, $browser);

  ctrl.$validators.email = function(modelValue, viewValue) {
    var value = modelValue || viewValue;
    return ctrl.$isEmpty(value) || EMAIL_REGEXP.test(value);
  };
}

function radioInputType(scope, element, attr, ctrl) {
  if (isUndefined(attr.name)) {
    element.attr('name', nextUid());
  }

  var listener = function(ev) {
    if (element[0].checked) {
      scope.$apply(function() {
        ctrl.$setViewValue(attr.value, ev && ev.type);
      });
    }
  };

  element.on('click', listener);

  ctrl.$render = function() {
    var value = attr.value;
    element[0].checked = (value == ctrl.$viewValue);
  };

  attr.$observe('value', ctrl.$render);
}

function parseConstantExpr($parse, context, name, expression, fallback) {
  var parseFn;
  if (isDefined(expression)) {
    parseFn = $parse(expression);
    if (!parseFn.constant) {
      throw new minErr('ngModel')('constexpr', 'Expected constant expression for `{0}`, but saw ' +
                                   '`{1}`.', name, expression);
    }
    return parseFn(context);
  }
  return fallback;
}

function checkboxInputType(scope, element, attr, ctrl, $sniffer, $browser, $filter, $parse) {
  var trueValue = parseConstantExpr($parse, scope, 'ngTrueValue', attr.ngTrueValue, true);
  var falseValue = parseConstantExpr($parse, scope, 'ngFalseValue', attr.ngFalseValue, false);

  var listener = function(ev) {
    scope.$apply(function() {
      ctrl.$setViewValue(element[0].checked, ev && ev.type);
    });
  };

  element.on('click', listener);

  ctrl.$render = function() {
    element[0].checked = ctrl.$viewValue;
  };

  ctrl.$isEmpty = function(value) {
    return value !== trueValue;
  };

  ctrl.$formatters.push(function(value) {
    return equals(value, trueValue);
  });

  ctrl.$parsers.push(function(value) {
    return value ? trueValue : falseValue;
  });
}





var inputDirective = ['$browser', '$sniffer', '$filter', '$parse',
    function($browser, $sniffer, $filter, $parse) {
  return {
    restrict: 'E',
    require: ['?ngModel'],
    link: function(scope, element, attr, ctrls) {
      if (ctrls[0]) {
        (inputType[lowercase(attr.type)] || inputType.text)(scope, element, attr, ctrls[0], $sniffer,
                                                            $browser, $filter, $parse);
      }
    }
  };
}];

var VALID_CLASS = 'ng-valid',
    INVALID_CLASS = 'ng-invalid',
    PRISTINE_CLASS = 'ng-pristine',
    DIRTY_CLASS = 'ng-dirty',
    UNTOUCHED_CLASS = 'ng-untouched',
    TOUCHED_CLASS = 'ng-touched';

var NgModelController = ['$scope', '$exceptionHandler', '$attrs', '$element', '$parse', '$animate', '$timeout',
    function($scope, $exceptionHandler, $attr, $element, $parse, $animate, $timeout) {
  this.$viewValue = Number.NaN;
  this.$modelValue = Number.NaN;
  this.$validators = {};
  this.$parsers = [];
  this.$formatters = [];
  this.$viewChangeListeners = [];
  this.$untouched = true;
  this.$touched = false;
  this.$pristine = true;
  this.$dirty = false;
  this.$valid = true;
  this.$invalid = false;
  this.$name = $attr.name;


  var ngModelGet = $parse($attr.ngModel),
      ngModelSet = ngModelGet.assign,
      pendingDebounce = null,
      ctrl = this;

  if (!ngModelSet) {
    throw minErr('ngModel')('nonassign', "Expression '{0}' is non-assignable. Element: {1}",
        $attr.ngModel, startingTag($element));
  }


  this.$render = noop;


  this.$isEmpty = function(value) {
    return isUndefined(value) || value === '' || value === null || value !== value;
  };

  var parentForm = $element.inheritedData('$formController') || nullFormCtrl,
      invalidCount = 0,      $error = this.$error = {};

  $element
    .addClass(PRISTINE_CLASS)
    .addClass(UNTOUCHED_CLASS);
  toggleValidCss(true);

  function toggleValidCss(isValid, validationErrorKey) {
    validationErrorKey = validationErrorKey ? '-' + snake_case(validationErrorKey, '-') : '';
    $animate.removeClass($element, (isValid ? INVALID_CLASS : VALID_CLASS) + validationErrorKey);
    $animate.addClass($element, (isValid ? VALID_CLASS : INVALID_CLASS) + validationErrorKey);
  }


  this.$setValidity = function(validationErrorKey, isValid) {
    if ($error[validationErrorKey] === !isValid) return;

    if (isValid) {
      if ($error[validationErrorKey]) invalidCount--;
      if (!invalidCount) {
        toggleValidCss(true);
        ctrl.$valid = true;
        ctrl.$invalid = false;
      }
    } else {
      toggleValidCss(false);
      ctrl.$invalid = true;
      ctrl.$valid = false;
      invalidCount++;
    }

    $error[validationErrorKey] = !isValid;
    toggleValidCss(isValid, validationErrorKey);

    parentForm.$setValidity(validationErrorKey, isValid, ctrl);
  };


  this.$setPristine = function () {
    ctrl.$dirty = false;
    ctrl.$pristine = true;
    $animate.removeClass($element, DIRTY_CLASS);
    $animate.addClass($element, PRISTINE_CLASS);
  };


  this.$setUntouched = function() {
    ctrl.$touched = false;
    ctrl.$untouched = true;
    $animate.setClass($element, UNTOUCHED_CLASS, TOUCHED_CLASS);
  };


  this.$setTouched = function() {
    ctrl.$touched = true;
    ctrl.$untouched = false;
    $animate.setClass($element, TOUCHED_CLASS, UNTOUCHED_CLASS);
  };


  this.$rollbackViewValue = function() {
    $timeout.cancel(pendingDebounce);
    ctrl.$viewValue = ctrl.$$lastCommittedViewValue;
    ctrl.$render();
  };


  this.$validate = function() {
    if (ctrl.$modelValue !== ctrl.$modelValue) {
      return;
    }

    var prev = ctrl.$modelValue;
    ctrl.$$runValidators(ctrl.$$invalidModelValue || ctrl.$modelValue, ctrl.$viewValue);
    if (prev !== ctrl.$modelValue) {
      ctrl.$$writeModelToScope();
    }
  };

  this.$$runValidators = function(modelValue, viewValue) {
    forEach(ctrl.$validators, function(fn, name) {
      ctrl.$setValidity(name, fn(modelValue, viewValue));
    });
    ctrl.$modelValue         = ctrl.$valid ? modelValue : undefined;
    ctrl.$$invalidModelValue = ctrl.$valid ? undefined : modelValue;
  };


  this.$commitViewValue = function(revalidate) {
    var viewValue = ctrl.$viewValue;

    $timeout.cancel(pendingDebounce);
    if (!revalidate && ctrl.$$lastCommittedViewValue === viewValue) {
      return;
    }
    ctrl.$$lastCommittedViewValue = viewValue;

    if (ctrl.$pristine) {
      ctrl.$dirty = true;
      ctrl.$pristine = false;
      $animate.removeClass($element, PRISTINE_CLASS);
      $animate.addClass($element, DIRTY_CLASS);
      parentForm.$setDirty();
    }

    var modelValue = viewValue;
    forEach(ctrl.$parsers, function(fn) {
      modelValue = fn(modelValue);
    });

    if (ctrl.$modelValue !== modelValue &&
        (isUndefined(ctrl.$$invalidModelValue) || ctrl.$$invalidModelValue != modelValue)) {
      ctrl.$$runValidators(modelValue, viewValue);
      ctrl.$$writeModelToScope();
    }
  };

  this.$$writeModelToScope = function() {
    var getterSetter;

    if (ctrl.$options && ctrl.$options.getterSetter &&
        isFunction(getterSetter = ngModelGet($scope))) {

      getterSetter(ctrl.$modelValue);
    } else {
      ngModelSet($scope, ctrl.$modelValue);
    }
    forEach(ctrl.$viewChangeListeners, function(listener) {
      try {
        listener();
      } catch(e) {
        $exceptionHandler(e);
      }
    });
  };


  this.$setViewValue = function(value, trigger, revalidate) {
    ctrl.$viewValue = value;
    if (!ctrl.$options || ctrl.$options.updateOnDefault) {
      ctrl.$$debounceViewValueCommit(trigger, revalidate);
    }
  };

  this.$$debounceViewValueCommit = function(trigger, revalidate) {
    var debounceDelay = 0,
        options = ctrl.$options,
        debounce;

    if(options && isDefined(options.debounce)) {
      debounce = options.debounce;
      if(isNumber(debounce)) {
        debounceDelay = debounce;
      } else if(isNumber(debounce[trigger])) {
        debounceDelay = debounce[trigger];
      } else if (isNumber(debounce['default'])) {
        debounceDelay = debounce['default'];
      }
    }

    $timeout.cancel(pendingDebounce);
    if (debounceDelay) {
      pendingDebounce = $timeout(function() {
        ctrl.$commitViewValue(revalidate);
      }, debounceDelay);
    } else {
      ctrl.$commitViewValue(revalidate);
    }
  };

  $scope.$watch(function ngModelWatch() {
    var modelValue = ngModelGet($scope);

    if (ctrl.$options && ctrl.$options.getterSetter && isFunction(modelValue)) {
      modelValue = modelValue();
    }

    if (ctrl.$modelValue !== modelValue &&
        (isUndefined(ctrl.$$invalidModelValue) || ctrl.$$invalidModelValue != modelValue)) {

      var formatters = ctrl.$formatters,
          idx = formatters.length;

      var viewValue = modelValue;
      while(idx--) {
        viewValue = formatters[idx](viewValue);
      }

      ctrl.$$runValidators(modelValue, viewValue);

      if (ctrl.$viewValue !== viewValue) {
        ctrl.$viewValue = ctrl.$$lastCommittedViewValue = viewValue;
        ctrl.$render();
      }
    }

    return modelValue;
  });
}];



var ngModelDirective = function() {
  return {
    require: ['ngModel', '^?form', '^?ngModelOptions'],
    controller: NgModelController,
    link: {
      pre: function(scope, element, attr, ctrls) {
        if (ctrls[2]) {
          ctrls[0].$options = ctrls[2].$options;
        }


        var modelCtrl = ctrls[0],
            formCtrl = ctrls[1] || nullFormCtrl;

        formCtrl.$addControl(modelCtrl);

        scope.$on('$destroy', function() {
          formCtrl.$removeControl(modelCtrl);
        });
      },
      post: function(scope, element, attr, ctrls) {
        var modelCtrl = ctrls[0];
        if (modelCtrl.$options && modelCtrl.$options.updateOn) {
          element.on(modelCtrl.$options.updateOn, function(ev) {
            scope.$apply(function() {
              modelCtrl.$$debounceViewValueCommit(ev && ev.type);
            });
          });
        }

        element.on('blur', function(ev) {
          scope.$apply(function() {
            modelCtrl.$setTouched();
          });
        });
      }
    }
  };
};


var ngChangeDirective = valueFn({
  require: 'ngModel',
  link: function(scope, element, attr, ctrl) {
    ctrl.$viewChangeListeners.push(function() {
      scope.$eval(attr.ngChange);
    });
  }
});


var requiredDirective = function() {
  return {
    require: '?ngModel',
    link: function(scope, elm, attr, ctrl) {
      if (!ctrl) return;
      attr.required = true;
      ctrl.$validators.required = function(modelValue, viewValue) {
        return !attr.required || !ctrl.$isEmpty(viewValue);
      };

      attr.$observe('required', function() {
        ctrl.$validate();
      });
    }
  };
};


var patternDirective = function() {
  return {
    require: '?ngModel',
    link: function(scope, elm, attr, ctrl) {
      if (!ctrl) return;

      var regexp, patternExp = attr.ngPattern || attr.pattern;
      attr.$observe('pattern', function(regex) {
        if(isString(regex) && regex.length > 0) {
          regex = new RegExp(regex);
        }

        if (regex && !regex.test) {
          throw minErr('ngPattern')('noregexp',
            'Expected {0} to be a RegExp but was {1}. Element: {2}', patternExp,
            regex, startingTag(elm));
        }

        regexp = regex || undefined;
        ctrl.$validate();
      });

      ctrl.$validators.pattern = function(value) {
        return ctrl.$isEmpty(value) || isUndefined(regexp) || regexp.test(value);
      };
    }
  };
};


var maxlengthDirective = function() {
  return {
    require: '?ngModel',
    link: function(scope, elm, attr, ctrl) {
      if (!ctrl) return;

      var maxlength = 0;
      attr.$observe('maxlength', function(value) {
        maxlength = int(value) || 0;
        ctrl.$validate();
      });
      ctrl.$validators.maxlength = function(value) {
        return ctrl.$isEmpty(value) || value.length <= maxlength;
      };
    }
  };
};

var minlengthDirective = function() {
  return {
    require: '?ngModel',
    link: function(scope, elm, attr, ctrl) {
      if (!ctrl) return;

      var minlength = 0;
      attr.$observe('minlength', function(value) {
        minlength = int(value) || 0;
        ctrl.$validate();
      });
      ctrl.$validators.minlength = function(value) {
        return ctrl.$isEmpty(value) || value.length >= minlength;
      };
    }
  };
};

var ngListDirective = function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attr, ctrl) {
      var match = /\/(.*)\//.exec(attr.ngList),
          separator = match && new RegExp(match[1]) || attr.ngList || ',';

      var parse = function(viewValue) {
        if (isUndefined(viewValue)) return;

        var list = [];

        if (viewValue) {
          forEach(viewValue.split(separator), function(value) {
            if (value) list.push(trim(value));
          });
        }

        return list;
      };

      ctrl.$parsers.push(parse);
      ctrl.$formatters.push(function(value) {
        if (isArray(value)) {
          return value.join(', ');
        }

        return undefined;
      });

      ctrl.$isEmpty = function(value) {
        return !value || !value.length;
      };
    }
  };
};


var CONSTANT_VALUE_REGEXP = /^(true|false|\d+)$/;

var ngValueDirective = function() {
  return {
    priority: 100,
    compile: function(tpl, tplAttr) {
      if (CONSTANT_VALUE_REGEXP.test(tplAttr.ngValue)) {
        return function ngValueConstantLink(scope, elm, attr) {
          attr.$set('value', scope.$eval(attr.ngValue));
        };
      } else {
        return function ngValueLink(scope, elm, attr) {
          scope.$watch(attr.ngValue, function valueWatchAction(value) {
            attr.$set('value', value);
          });
        };
      }
    }
  };
};

var ngModelOptionsDirective = function() {
  return {
    controller: ['$scope', '$attrs', function($scope, $attrs) {
      var that = this;
      this.$options = $scope.$eval($attrs.ngModelOptions);
      if (this.$options.updateOn !== undefined) {
        this.$options.updateOnDefault = false;
        this.$options.updateOn = trim(this.$options.updateOn.replace(DEFAULT_REGEXP, function() {
          that.$options.updateOnDefault = true;
          return ' ';
        }));
      } else {
        this.$options.updateOnDefault = true;
      }
    }]
  };
};

var ngBindDirective = ngDirective({
  compile: function(templateElement) {
    templateElement.addClass('ng-binding');
    return function (scope, element, attr) {
      element.data('$binding', attr.ngBind);
      scope.$watch(attr.ngBind, function ngBindWatchAction(value) {
        element.text(value == undefined ? '' : value);
      });
    };
  }
});


var ngBindTemplateDirective = ['$interpolate', function($interpolate) {
  return function(scope, element, attr) {
    var interpolateFn = $interpolate(element.attr(attr.$attr.ngBindTemplate));
    element.addClass('ng-binding').data('$binding', interpolateFn);
    attr.$observe('ngBindTemplate', function(value) {
      element.text(value);
    });
  };
}];

var ngBindHtmlDirective = ['$sce', '$parse', function($sce, $parse) {
  return function(scope, element, attr) {
    element.addClass('ng-binding').data('$binding', attr.ngBindHtml);

    var parsed = $parse(attr.ngBindHtml);
    function getStringValue() {
      var value = parsed(scope);
      getStringValue.$$unwatch = parsed.$$unwatch;
      return (value || '').toString();
    }

    scope.$watch(getStringValue, function ngBindHtmlWatchAction(value) {
      element.html($sce.getTrustedHtml(parsed(scope)) || '');
    });
  };
}];

function classDirective(name, selector) {
  name = 'ngClass' + name;
  return ['$animate', function($animate) {
    return {
      restrict: 'AC',
      link: function(scope, element, attr) {
        var oldVal;

        scope.$watch(attr[name], ngClassWatchAction, true);

        attr.$observe('class', function(value) {
          ngClassWatchAction(scope.$eval(attr[name]));
        });


        if (name !== 'ngClass') {
          scope.$watch('$index', function($index, old$index) {
            var mod = $index & 1;
            if (mod !== (old$index & 1)) {
              var classes = arrayClasses(scope.$eval(attr[name]));
              mod === selector ?
                addClasses(classes) :
                removeClasses(classes);
            }
          });
        }

        function addClasses(classes) {
          var newClasses = digestClassCounts(classes, 1);
          attr.$addClass(newClasses);
        }

        function removeClasses(classes) {
          var newClasses = digestClassCounts(classes, -1);
          attr.$removeClass(newClasses);
        }

        function digestClassCounts (classes, count) {
          var classCounts = element.data('$classCounts') || {};
          var classesToUpdate = [];
          forEach(classes, function (className) {
            if (count > 0 || classCounts[className]) {
              classCounts[className] = (classCounts[className] || 0) + count;
              if (classCounts[className] === +(count > 0)) {
                classesToUpdate.push(className);
              }
            }
          });
          element.data('$classCounts', classCounts);
          return classesToUpdate.join(' ');
        }

        function updateClasses (oldClasses, newClasses) {
          var toAdd = arrayDifference(newClasses, oldClasses);
          var toRemove = arrayDifference(oldClasses, newClasses);
          toRemove = digestClassCounts(toRemove, -1);
          toAdd = digestClassCounts(toAdd, 1);

          if (toAdd.length === 0) {
            $animate.removeClass(element, toRemove);
          } else if (toRemove.length === 0) {
            $animate.addClass(element, toAdd);
          } else {
            $animate.setClass(element, toAdd, toRemove);
          }
        }

        function ngClassWatchAction(newVal) {
          if (selector === true || scope.$index % 2 === selector) {
            var newClasses = arrayClasses(newVal || []);
            if (!oldVal) {
              addClasses(newClasses);
            } else if (!equals(newVal,oldVal)) {
              var oldClasses = arrayClasses(oldVal);
              updateClasses(oldClasses, newClasses);
            }
          }
          oldVal = shallowCopy(newVal);
        }
      }
    };

    function arrayDifference(tokens1, tokens2) {
      var values = [];

      outer:
      for(var i = 0; i < tokens1.length; i++) {
        var token = tokens1[i];
        for(var j = 0; j < tokens2.length; j++) {
          if(token == tokens2[j]) continue outer;
        }
        values.push(token);
      }
      return values;
    }

    function arrayClasses (classVal) {
      if (isArray(classVal)) {
        return classVal;
      } else if (isString(classVal)) {
        return classVal.split(' ');
      } else if (isObject(classVal)) {
        var classes = [], i = 0;
        forEach(classVal, function(v, k) {
          if (v) {
            classes = classes.concat(k.split(' '));
          }
        });
        return classes;
      }
      return classVal;
    }
  }];
}

var ngClassDirective = classDirective('', true);


var ngClassOddDirective = classDirective('Odd', 0);


var ngClassEvenDirective = classDirective('Even', 1);


var ngCloakDirective = ngDirective({
  compile: function(element, attr) {
    attr.$set('ngCloak', undefined);
    element.removeClass('ng-cloak');
  }
});

var ngControllerDirective = [function() {
  return {
    scope: true,
    controller: '@',
    priority: 500
  };
}];


var ngEventDirectives = {};
forEach(
  'click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste'.split(' '),
  function(name) {
    var directiveName = directiveNormalize('ng-' + name);
    ngEventDirectives[directiveName] = ['$parse', function($parse) {
      return {
        compile: function($element, attr) {
          var fn = $parse(attr[directiveName]);
          return function ngEventHandler(scope, element) {
            element.on(lowercase(name), function(event) {
              scope.$apply(function() {
                fn(scope, {$event:event});
              });
            });
          };
        }
      };
    }];
  }
);


var ngIfDirective = ['$animate', function($animate) {
  return {
    transclude: 'element',
    priority: 600,
    terminal: true,
    restrict: 'A',
    $$tlb: true,
    link: function ($scope, $element, $attr, ctrl, $transclude) {
        var block, childScope, previousElements;
        $scope.$watch($attr.ngIf, function ngIfWatchAction(value) {

          if (value) {
            if (!childScope) {
              $transclude(function (clone, newScope) {
                childScope = newScope;
                clone[clone.length++] = document.createComment(' end ngIf: ' + $attr.ngIf + ' ');
                block = {
                  clone: clone
                };
                $animate.enter(clone, $element.parent(), $element);
              });
            }
          } else {
            if(previousElements) {
              previousElements.remove();
              previousElements = null;
            }
            if(childScope) {
              childScope.$destroy();
              childScope = null;
            }
            if(block) {
              previousElements = getBlockElements(block.clone);
              $animate.leave(previousElements, function() {
                previousElements = null;
              });
              block = null;
            }
          }
        });
    }
  };
}];


var ngIncludeDirective = ['$http', '$templateCache', '$anchorScroll', '$animate', '$sce',
                  function($http,   $templateCache,   $anchorScroll,   $animate,   $sce) {
  return {
    restrict: 'ECA',
    priority: 400,
    terminal: true,
    transclude: 'element',
    controller: angular.noop,
    compile: function(element, attr) {
      var srcExp = attr.ngInclude || attr.src,
          onloadExp = attr.onload || '',
          autoScrollExp = attr.autoscroll;

      return function(scope, $element, $attr, ctrl, $transclude) {
        var changeCounter = 0,
            currentScope,
            previousElement,
            currentElement;

        var cleanupLastIncludeContent = function() {
          if(previousElement) {
            previousElement.remove();
            previousElement = null;
          }
          if(currentScope) {
            currentScope.$destroy();
            currentScope = null;
          }
          if(currentElement) {
            $animate.leave(currentElement, function() {
              previousElement = null;
            });
            previousElement = currentElement;
            currentElement = null;
          }
        };

        scope.$watch($sce.parseAsResourceUrl(srcExp), function ngIncludeWatchAction(src) {
          var afterAnimation = function() {
            if (isDefined(autoScrollExp) && (!autoScrollExp || scope.$eval(autoScrollExp))) {
              $anchorScroll();
            }
          };
          var thisChangeId = ++changeCounter;

          if (src) {
            $http.get(src, {cache: $templateCache}).success(function(response) {
              if (thisChangeId !== changeCounter) return;
              var newScope = scope.$new();
              ctrl.template = response;

              var clone = $transclude(newScope, function(clone) {
                cleanupLastIncludeContent();
                $animate.enter(clone, null, $element, afterAnimation);
              });

              currentScope = newScope;
              currentElement = clone;

              currentScope.$emit('$includeContentLoaded');
              scope.$eval(onloadExp);
            }).error(function() {
              if (thisChangeId === changeCounter) {
                cleanupLastIncludeContent();
                scope.$emit('$includeContentError');
              }
            });
            scope.$emit('$includeContentRequested');
          } else {
            cleanupLastIncludeContent();
            ctrl.template = null;
          }
        });
      };
    }
  };
}];

var ngIncludeFillContentDirective = ['$compile',
  function($compile) {
    return {
      restrict: 'ECA',
      priority: -400,
      require: 'ngInclude',
      link: function(scope, $element, $attr, ctrl) {
        $element.html(ctrl.template);
        $compile($element.contents())(scope);
      }
    };
  }];


var ngInitDirective = ngDirective({
  priority: 450,
  compile: function() {
    return {
      pre: function(scope, element, attrs) {
        scope.$eval(attrs.ngInit);
      }
    };
  }
});


var ngNonBindableDirective = ngDirective({ terminal: true, priority: 1000 });

var ngPluralizeDirective = ['$locale', '$interpolate', function($locale, $interpolate) {
  var BRACE = /{}/g;
  return {
    restrict: 'EA',
    link: function(scope, element, attr) {
      var numberExp = attr.count,
          whenExp = attr.$attr.when && element.attr(attr.$attr.when),          offset = attr.offset || 0,
          whens = scope.$eval(whenExp) || {},
          whensExpFns = {},
          startSymbol = $interpolate.startSymbol(),
          endSymbol = $interpolate.endSymbol(),
          isWhen = /^when(Minus)?(.+)$/;

      forEach(attr, function(expression, attributeName) {
        if (isWhen.test(attributeName)) {
          whens[lowercase(attributeName.replace('when', '').replace('Minus', '-'))] =
            element.attr(attr.$attr[attributeName]);
        }
      });
      forEach(whens, function(expression, key) {
        whensExpFns[key] =
          $interpolate(expression.replace(BRACE, startSymbol + numberExp + '-' +
            offset + endSymbol));
      });

      scope.$watch(function ngPluralizeWatch() {
        var value = parseFloat(scope.$eval(numberExp));

        if (!isNaN(value)) {
          if (!(value in whens)) value = $locale.pluralCat(value - offset);
           return whensExpFns[value](scope);
        } else {
          return '';
        }
      }, function ngPluralizeWatchAction(newVal) {
        element.text(newVal);
      });
    }
  };
}];


var ngRepeatDirective = ['$parse', '$animate', function($parse, $animate) {
  var NG_REMOVED = '$$NG_REMOVED';
  var ngRepeatMinErr = minErr('ngRepeat');
  return {
    transclude: 'element',
    priority: 1000,
    terminal: true,
    $$tlb: true,
    link: function($scope, $element, $attr, ctrl, $transclude){
        var expression = $attr.ngRepeat;
        var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/),
          trackByExp, trackByExpGetter, trackByIdExpFn, trackByIdArrayFn, trackByIdObjFn,
          lhs, rhs, valueIdentifier, keyIdentifier,
          hashFnLocals = {$id: hashKey};

        if (!match) {
          throw ngRepeatMinErr('iexp', "Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '{0}'.",
            expression);
        }

        lhs = match[1];
        rhs = match[2];
        trackByExp = match[3];

        if (trackByExp) {
          trackByExpGetter = $parse(trackByExp);
          trackByIdExpFn = function(key, value, index) {
            if (keyIdentifier) hashFnLocals[keyIdentifier] = key;
            hashFnLocals[valueIdentifier] = value;
            hashFnLocals.$index = index;
            return trackByExpGetter($scope, hashFnLocals);
          };
        } else {
          trackByIdArrayFn = function(key, value) {
            return hashKey(value);
          };
          trackByIdObjFn = function(key) {
            return key;
          };
        }

        match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);
        if (!match) {
          throw ngRepeatMinErr('iidexp', "'_item_' in '_item_ in _collection_' should be an identifier or '(_key_, _value_)' expression, but got '{0}'.",
                                                                    lhs);
        }
        valueIdentifier = match[3] || match[1];
        keyIdentifier = match[2];

        var lastBlockMap = {};

        $scope.$watchCollection(rhs, function ngRepeatAction(collection){
          var index, length,
              previousNode = $element[0],              nextNode,
              nextBlockMap = {},
              arrayLength,
              key, value,              trackById,
              trackByIdFn,
              collectionKeys,
              block,              nextBlockOrder = [],
              elementsToRemove;

          var updateScope = function(scope, index) {
            scope[valueIdentifier] = value;
            if (keyIdentifier) scope[keyIdentifier] = key;
            scope.$index = index;
            scope.$first = (index === 0);
            scope.$last = (index === (arrayLength - 1));
            scope.$middle = !(scope.$first || scope.$last);
            scope.$odd = !(scope.$even = (index&1) === 0);
          };

          if (isArrayLike(collection)) {
            collectionKeys = collection;
            trackByIdFn = trackByIdExpFn || trackByIdArrayFn;
          } else {
            trackByIdFn = trackByIdExpFn || trackByIdObjFn;
            collectionKeys = [];
            for (var itemKey in collection) {
              if (collection.hasOwnProperty(itemKey) && itemKey.charAt(0) != '$') {
                collectionKeys.push(itemKey);
              }
            }
            collectionKeys.sort();
          }

          arrayLength = collectionKeys.length;

          length = nextBlockOrder.length = collectionKeys.length;
          for(index = 0; index < length; index++) {
           key = (collection === collectionKeys) ? index : collectionKeys[index];
           value = collection[key];
           trackById = trackByIdFn(key, value, index);
           assertNotHasOwnProperty(trackById, '`track by` id');
           if(lastBlockMap.hasOwnProperty(trackById)) {
             block = lastBlockMap[trackById];
             delete lastBlockMap[trackById];
             nextBlockMap[trackById] = block;
             nextBlockOrder[index] = block;
           } else if (nextBlockMap.hasOwnProperty(trackById)) {
             forEach(nextBlockOrder, function(block) {
               if (block && block.scope) lastBlockMap[block.id] = block;
             });
             throw ngRepeatMinErr('dupes', "Duplicates in a repeater are not allowed. Use 'track by' expression to specify unique keys. Repeater: {0}, Duplicate key: {1}",
                                                                                                                                                    expression,       trackById);
           } else {
             nextBlockOrder[index] = { id: trackById };
             nextBlockMap[trackById] = false;
           }
         }

          for (var blockKey in lastBlockMap) {
            if (lastBlockMap.hasOwnProperty(blockKey)) {
              block = lastBlockMap[blockKey];
              elementsToRemove = getBlockElements(block.clone);
              $animate.leave(elementsToRemove);
              forEach(elementsToRemove, function(element) { element[NG_REMOVED] = true; });
              block.scope.$destroy();
            }
          }

          for (index = 0, length = collectionKeys.length; index < length; index++) {
            key = (collection === collectionKeys) ? index : collectionKeys[index];
            value = collection[key];
            block = nextBlockOrder[index];
            if (nextBlockOrder[index - 1]) previousNode = getBlockEnd(nextBlockOrder[index - 1]);

            if (block.scope) {
              nextNode = previousNode;
              do {
                nextNode = nextNode.nextSibling;
              } while(nextNode && nextNode[NG_REMOVED]);

              if (getBlockStart(block) != nextNode) {
                $animate.move(getBlockElements(block.clone), null, jqLite(previousNode));
              }
              previousNode = getBlockEnd(block);
              updateScope(block.scope, index);
            } else {
              $transclude(function(clone, scope) {
                block.scope = scope;
                clone[clone.length++] = document.createComment(' end ngRepeat: ' + expression + ' ');
                $animate.enter(clone, null, jqLite(previousNode));
                previousNode = clone;
                block.clone = clone;
                nextBlockMap[block.id] = block;
                updateScope(block.scope, index);
              });
            }
          }
          lastBlockMap = nextBlockMap;
        });
    }
  };

  function getBlockStart(block) {
    return block.clone[0];
  }

  function getBlockEnd(block) {
    return block.clone[block.clone.length - 1];
  }
}];

var ngShowDirective = ['$animate', function($animate) {
  return function(scope, element, attr) {
    scope.$watch(attr.ngShow, function ngShowWatchAction(value){
      $animate[value ? 'removeClass' : 'addClass'](element, 'ng-hide');
    });
  };
}];


var ngHideDirective = ['$animate', function($animate) {
  return function(scope, element, attr) {
    scope.$watch(attr.ngHide, function ngHideWatchAction(value){
      $animate[value ? 'addClass' : 'removeClass'](element, 'ng-hide');
    });
  };
}];

var ngStyleDirective = ngDirective(function(scope, element, attr) {
  scope.$watch(attr.ngStyle, function ngStyleWatchAction(newStyles, oldStyles) {
    if (oldStyles && (newStyles !== oldStyles)) {
      forEach(oldStyles, function(val, style) { element.css(style, '');});
    }
    if (newStyles) element.css(newStyles);
  }, true);
});

var ngSwitchDirective = ['$animate', function($animate) {
  return {
    restrict: 'EA',
    require: 'ngSwitch',

    controller: ['$scope', function ngSwitchController() {
     this.cases = {};
    }],
    link: function(scope, element, attr, ngSwitchController) {
      var watchExpr = attr.ngSwitch || attr.on,
          selectedTranscludes = [],
          selectedElements = [],
          previousElements = [],
          selectedScopes = [];

      scope.$watch(watchExpr, function ngSwitchWatchAction(value) {
        var i, ii;
        for (i = 0, ii = previousElements.length; i < ii; ++i) {
          previousElements[i].remove();
        }
        previousElements.length = 0;

        for (i = 0, ii = selectedScopes.length; i < ii; ++i) {
          var selected = selectedElements[i];
          selectedScopes[i].$destroy();
          previousElements[i] = selected;
          $animate.leave(selected, function() {
            previousElements.splice(i, 1);
          });
        }

        selectedElements.length = 0;
        selectedScopes.length = 0;

        if ((selectedTranscludes = ngSwitchController.cases['!' + value] || ngSwitchController.cases['?'])) {
          scope.$eval(attr.change);
          forEach(selectedTranscludes, function(selectedTransclude) {
            var selectedScope = scope.$new();
            selectedScopes.push(selectedScope);
            selectedTransclude.transclude(selectedScope, function(caseElement) {
              var anchor = selectedTransclude.element;

              selectedElements.push(caseElement);
              $animate.enter(caseElement, anchor.parent(), anchor);
            });
          });
        }
      });
    }
  };
}];

var ngSwitchWhenDirective = ngDirective({
  transclude: 'element',
  priority: 800,
  require: '^ngSwitch',
  link: function(scope, element, attrs, ctrl, $transclude) {
    ctrl.cases['!' + attrs.ngSwitchWhen] = (ctrl.cases['!' + attrs.ngSwitchWhen] || []);
    ctrl.cases['!' + attrs.ngSwitchWhen].push({ transclude: $transclude, element: element });
  }
});

var ngSwitchDefaultDirective = ngDirective({
  transclude: 'element',
  priority: 800,
  require: '^ngSwitch',
  link: function(scope, element, attr, ctrl, $transclude) {
    ctrl.cases['?'] = (ctrl.cases['?'] || []);
    ctrl.cases['?'].push({ transclude: $transclude, element: element });
   }
});


var ngTranscludeDirective = ngDirective({
  link: function($scope, $element, $attrs, controller, $transclude) {
    if (!$transclude) {
      throw minErr('ngTransclude')('orphan',
       'Illegal use of ngTransclude directive in the template! ' +
       'No parent directive that requires a transclusion found. ' +
       'Element: {0}',
       startingTag($element));
    }

    $transclude(function(clone) {
      $element.empty();
      $element.append(clone);
    });
  }
});

var scriptDirective = ['$templateCache', function($templateCache) {
  return {
    restrict: 'E',
    terminal: true,
    compile: function(element, attr) {
      if (attr.type == 'text/ng-template') {
        var templateUrl = attr.id,
            text = element[0].text;

        $templateCache.put(templateUrl, text);
      }
    }
  };
}];

var ngOptionsMinErr = minErr('ngOptions');

var ngOptionsDirective = valueFn({ terminal: true });
var selectDirective = ['$compile', '$parse', function($compile,   $parse) {
  var NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/,
      nullModelCtrl = {$setViewValue: noop};

  return {
    restrict: 'E',
    require: ['select', '?ngModel'],
    controller: ['$element', '$scope', '$attrs', function($element, $scope, $attrs) {
      var self = this,
          optionsMap = {},
          ngModelCtrl = nullModelCtrl,
          nullOption,
          unknownOption;


      self.databound = $attrs.ngModel;


      self.init = function(ngModelCtrl_, nullOption_, unknownOption_) {
        ngModelCtrl = ngModelCtrl_;
        nullOption = nullOption_;
        unknownOption = unknownOption_;
      };


      self.addOption = function(value, element) {
        assertNotHasOwnProperty(value, '"option value"');
        optionsMap[value] = true;

        if (ngModelCtrl.$viewValue == value) {
          $element.val(value);
          if (unknownOption.parent()) unknownOption.remove();
        }
        if (element[0].hasAttribute('selected')) {
          element[0].selected = true;
        }
      };


      self.removeOption = function(value) {
        if (this.hasOption(value)) {
          delete optionsMap[value];
          if (ngModelCtrl.$viewValue == value) {
            this.renderUnknownOption(value);
          }
        }
      };


      self.renderUnknownOption = function(val) {
        var unknownVal = '? ' + hashKey(val) + ' ?';
        unknownOption.val(unknownVal);
        $element.prepend(unknownOption);
        $element.val(unknownVal);
        unknownOption.prop('selected', true);      };


      self.hasOption = function(value) {
        return optionsMap.hasOwnProperty(value);
      };

      $scope.$on('$destroy', function() {
        self.renderUnknownOption = noop;
      });
    }],

    link: function(scope, element, attr, ctrls) {
      if (!ctrls[1]) return;

      var selectCtrl = ctrls[0],
          ngModelCtrl = ctrls[1],
          multiple = attr.multiple,
          optionsExp = attr.ngOptions,
          nullOption = false,          emptyOption,
          optionTemplate = jqLite(document.createElement('option')),
          optGroupTemplate =jqLite(document.createElement('optgroup')),
          unknownOption = optionTemplate.clone();

      for(var i = 0, children = element.children(), ii = children.length; i < ii; i++) {
        if (children[i].value === '') {
          emptyOption = nullOption = children.eq(i);
          break;
        }
      }

      selectCtrl.init(ngModelCtrl, nullOption, unknownOption);

      if (multiple) {
        ngModelCtrl.$isEmpty = function(value) {
          return !value || value.length === 0;
        };
      }

      if (optionsExp) setupAsOptions(scope, element, ngModelCtrl);
      else if (multiple) setupAsMultiple(scope, element, ngModelCtrl);
      else setupAsSingle(scope, element, ngModelCtrl, selectCtrl);





      function setupAsSingle(scope, selectElement, ngModelCtrl, selectCtrl) {
        ngModelCtrl.$render = function() {
          var viewValue = ngModelCtrl.$viewValue;

          if (selectCtrl.hasOption(viewValue)) {
            if (unknownOption.parent()) unknownOption.remove();
            selectElement.val(viewValue);
            if (viewValue === '') emptyOption.prop('selected', true);          } else {
            if (isUndefined(viewValue) && emptyOption) {
              selectElement.val('');
            } else {
              selectCtrl.renderUnknownOption(viewValue);
            }
          }
        };

        selectElement.on('change', function() {
          scope.$apply(function() {
            if (unknownOption.parent()) unknownOption.remove();
            ngModelCtrl.$setViewValue(selectElement.val());
          });
        });
      }

      function setupAsMultiple(scope, selectElement, ctrl) {
        var lastView;
        ctrl.$render = function() {
          var items = new HashMap(ctrl.$viewValue);
          forEach(selectElement.find('option'), function(option) {
            option.selected = isDefined(items.get(option.value));
          });
        };

        scope.$watch(function selectMultipleWatch() {
          if (!equals(lastView, ctrl.$viewValue)) {
            lastView = shallowCopy(ctrl.$viewValue);
            ctrl.$render();
          }
        });

        selectElement.on('change', function() {
          scope.$apply(function() {
            var array = [];
            forEach(selectElement.find('option'), function(option) {
              if (option.selected) {
                array.push(option.value);
              }
            });
            ctrl.$setViewValue(array);
          });
        });
      }

      function setupAsOptions(scope, selectElement, ctrl) {
        var match;

        if (!(match = optionsExp.match(NG_OPTIONS_REGEXP))) {
          throw ngOptionsMinErr('iexp',
            "Expected expression in form of " +
            "'_select_ (as _label_)? for (_key_,)?_value_ in _collection_'" +
            " but got '{0}'. Element: {1}",
            optionsExp, startingTag(selectElement));
        }

        var displayFn = $parse(match[2] || match[1]),
            valueName = match[4] || match[6],
            keyName = match[5],
            groupByFn = $parse(match[3] || ''),
            valueFn = $parse(match[2] ? match[1] : valueName),
            valuesFn = $parse(match[7]),
            track = match[8],
            trackFn = track ? $parse(match[8]) : null,
            optionGroupsCache = [[{element: selectElement, label:''}]];

        if (nullOption) {
          $compile(nullOption)(scope);

          nullOption.removeClass('ng-scope');

          nullOption.remove();
        }

        selectElement.empty();

        selectElement.on('change', function() {
          scope.$apply(function() {
            var optionGroup,
                collection = valuesFn(scope) || [],
                locals = {},
                key, value, optionElement, index, groupIndex, length, groupLength, trackIndex;

            if (multiple) {
              value = [];
              for (groupIndex = 0, groupLength = optionGroupsCache.length;
                   groupIndex < groupLength;
                   groupIndex++) {
                optionGroup = optionGroupsCache[groupIndex];

                for(index = 1, length = optionGroup.length; index < length; index++) {
                  if ((optionElement = optionGroup[index].element)[0].selected) {
                    key = optionElement.val();
                    if (keyName) locals[keyName] = key;
                    if (trackFn) {
                      for (trackIndex = 0; trackIndex < collection.length; trackIndex++) {
                        locals[valueName] = collection[trackIndex];
                        if (trackFn(scope, locals) == key) break;
                      }
                    } else {
                      locals[valueName] = collection[key];
                    }
                    value.push(valueFn(scope, locals));
                  }
                }
              }
            } else {
              key = selectElement.val();
              if (key == '?') {
                value = undefined;
              } else if (key === ''){
                value = null;
              } else {
                if (trackFn) {
                  for (trackIndex = 0; trackIndex < collection.length; trackIndex++) {
                    locals[valueName] = collection[trackIndex];
                    if (trackFn(scope, locals) == key) {
                      value = valueFn(scope, locals);
                      break;
                    }
                  }
                } else {
                  locals[valueName] = collection[key];
                  if (keyName) locals[keyName] = key;
                  value = valueFn(scope, locals);
                }
              }
              if (optionGroupsCache[0].length > 1) {
                if (optionGroupsCache[0][1].id !== key) {
                  optionGroupsCache[0][1].selected = false;
                }
              }
            }
            ctrl.$setViewValue(value);
          });
        });

        ctrl.$render = render;

        scope.$watch(render);

        function render() {
          var optionGroups = {'':[]},
              optionGroupNames = [''],
              optionGroupName,
              optionGroup,
              option,
              existingParent, existingOptions, existingOption,
              modelValue = ctrl.$modelValue,
              values = valuesFn(scope) || [],
              keys = keyName ? sortedKeys(values) : values,
              key,
              groupLength, length,
              groupIndex, index,
              locals = {},
              selected,
              selectedSet = false,              lastElement,
              element,
              label;

          if (multiple) {
            if (trackFn && isArray(modelValue)) {
              selectedSet = new HashMap([]);
              for (var trackIndex = 0; trackIndex < modelValue.length; trackIndex++) {
                locals[valueName] = modelValue[trackIndex];
                selectedSet.put(trackFn(scope, locals), modelValue[trackIndex]);
              }
            } else {
              selectedSet = new HashMap(modelValue);
            }
          }

          for (index = 0; length = keys.length, index < length; index++) {

            key = index;
            if (keyName) {
              key = keys[index];
              if ( key.charAt(0) === '$' ) continue;
              locals[keyName] = key;
            }

            locals[valueName] = values[key];

            optionGroupName = groupByFn(scope, locals) || '';
            if (!(optionGroup = optionGroups[optionGroupName])) {
              optionGroup = optionGroups[optionGroupName] = [];
              optionGroupNames.push(optionGroupName);
            }
            if (multiple) {
              selected = isDefined(
                selectedSet.remove(trackFn ? trackFn(scope, locals) : valueFn(scope, locals))
              );
            } else {
              if (trackFn) {
                var modelCast = {};
                modelCast[valueName] = modelValue;
                selected = trackFn(scope, modelCast) === trackFn(scope, locals);
              } else {
                selected = modelValue === valueFn(scope, locals);
              }
              selectedSet = selectedSet || selected;            }
            label = displayFn(scope, locals);
            label = isDefined(label) ? label : '';
            optionGroup.push({
              id: trackFn ? trackFn(scope, locals) : (keyName ? keys[index] : index),
              label: label,
              selected: selected            });
          }
          if (!multiple) {
            if (nullOption || modelValue === null) {
              optionGroups[''].unshift({id:'', label:'', selected:!selectedSet});
            } else if (!selectedSet) {
              optionGroups[''].unshift({id:'?', label:'', selected:true});
            }
          }

          for (groupIndex = 0, groupLength = optionGroupNames.length;
               groupIndex < groupLength;
               groupIndex++) {
            optionGroupName = optionGroupNames[groupIndex];

            optionGroup = optionGroups[optionGroupName];

            if (optionGroupsCache.length <= groupIndex) {
              existingParent = {
                element: optGroupTemplate.clone().attr('label', optionGroupName),
                label: optionGroup.label
              };
              existingOptions = [existingParent];
              optionGroupsCache.push(existingOptions);
              selectElement.append(existingParent.element);
            } else {
              existingOptions = optionGroupsCache[groupIndex];
              existingParent = existingOptions[0];
              if (existingParent.label != optionGroupName) {
                existingParent.element.attr('label', existingParent.label = optionGroupName);
              }
            }

            lastElement = null;            for(index = 0, length = optionGroup.length; index < length; index++) {
              option = optionGroup[index];
              if ((existingOption = existingOptions[index+1])) {
                lastElement = existingOption.element;
                if (existingOption.label !== option.label) {
                  lastElement.text(existingOption.label = option.label);
                }
                if (existingOption.id !== option.id) {
                  lastElement.val(existingOption.id = option.id);
                }
                if (existingOption.selected !== option.selected) {
                  lastElement.prop('selected', (existingOption.selected = option.selected));
                }
              } else {

                if (option.id === '' && nullOption) {
                  element = nullOption;
                } else {
                  (element = optionTemplate.clone())
                      .val(option.id)
                      .prop('selected', option.selected)
                      .text(option.label);
                }

                existingOptions.push(existingOption = {
                    element: element,
                    label: option.label,
                    id: option.id,
                    selected: option.selected
                });
                if (lastElement) {
                  lastElement.after(element);
                } else {
                  existingParent.element.append(element);
                }
                lastElement = element;
              }
            }
            index++;            while(existingOptions.length > index) {
              existingOptions.pop().element.remove();
            }
          }
          while(optionGroupsCache.length > groupIndex) {
            optionGroupsCache.pop()[0].element.remove();
          }
        }
      }
    }
  };
}];

var optionDirective = ['$interpolate', function($interpolate) {
  var nullSelectCtrl = {
    addOption: noop,
    removeOption: noop
  };

  return {
    restrict: 'E',
    priority: 100,
    compile: function(element, attr) {
      if (isUndefined(attr.value)) {
        var interpolateFn = $interpolate(element.text(), true);
        if (!interpolateFn) {
          attr.$set('value', element.text());
        }
      }

      return function (scope, element, attr) {
        var selectCtrlName = '$selectController',
            parent = element.parent(),
            selectCtrl = parent.data(selectCtrlName) ||
              parent.parent().data(selectCtrlName);
        if (selectCtrl && selectCtrl.databound) {
          element.prop('selected', false);
        } else {
          selectCtrl = nullSelectCtrl;
        }

        if (interpolateFn) {
          scope.$watch(interpolateFn, function interpolateWatchAction(newVal, oldVal) {
            attr.$set('value', newVal);
            if (oldVal !== newVal) {
              selectCtrl.removeOption(oldVal);
            }
            selectCtrl.addOption(newVal, element);
          });
        } else {
          selectCtrl.addOption(attr.value, element);
        }

        element.on('$destroy', function() {
          selectCtrl.removeOption(attr.value);
        });
      };
    }
  };
}];

var styleDirective = valueFn({
  restrict: 'E',
  terminal: false
});

  if (window.angular.bootstrap) {
    console.log('WARNING: Tried to load angular more than once.');
    return;
  }

  bindJQuery();

  publishExternalAPI(angular);

  jqLite(document).ready(function() {
    angularInit(document, bootstrap);
  });

})(window, document);

!window.angular.$$csp() && window.angular.element(document).find('head').prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide:not(.ng-animate){display:none !important;}ng\\:form{display:block;}</style>');