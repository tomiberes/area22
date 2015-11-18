(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Area22 = factory();
  }
}(this, function() {
  'use strict';

  // Codename
  var Area22 = {};

  Area22.VERSION = '0.0.1';

  Area22.area = function(el, opts) {
    return new Area(el, opts);
  };

  // Expose internal helpers on demand,
  // accepts string with space separated list of object names to expose
  Area22.expose = function(opts) {
    if (!opts) return;
    opts = opts.toLowerCase();
    if (/coords/.test(opts)) Area22.Coords = Coords;
    if (/util/.test(opts)) Area22.Util = Util;
    if (/browser/.test(opts)) Area22.Browser = Browser;
    if (/events/.test(opts)) Area22.Events = Events;
    if (/area/.test(opts)) Area22.Area = Area;
    if (/draggable/.test(opts)) Area22.Draggable = Draggable;
    if (/dropzone/.test(opts)) Area22.Dropzone = Dropzone;
  };

  // Build a debug element
  Area22.debug = function(area) {
    var id = '22-debug';
    if (!(area instanceof Area)) {
      document.body.removeChild(document.querySelectorAll(id)[0]);
      return;
    }
    Area22.debugFrame = {};
    var frame = document.createElement('div');
    frame.setAttribute('id', id);
    var elements = {
      area: document.createElement('div'),
      event: document.createElement('div'),
      coords: document.createElement('div'),
      position: document.createElement('div'),
      delta: document.createElement('div'),
    };
    var css = {
      width: '140px',
      position: 'fixed',
      bottom: '5px',
      right: '5px',
      zIndex: 9999,
      textAlign: 'right',
      fontFamily: 'Arial, sans',
      fontSize: '14px',
      border: '2px solid #DDD',
      padding: '3px',
      background: 'white',
      color: '#333'
    };
    for (var name in elements) {
      var el = elements[name],
          pName = document.createElement('p'),
          pContent = document.createElement('p');
      pName.style.display = 'inline-block';
      pName.style.margin = '0';
      pName.textContent = name + ': ';
      pContent.style.display = 'inline-block';
      pContent.style.margin = '0';
      Area22.debugFrame[name] = pContent;
      el.setAttribute('id', id + '-' + name);
      el.appendChild(pName);
      el.appendChild(pContent);
      frame.appendChild(el);
    }
    for (var prop in css) {
      frame.style[prop] = css[prop];
    }
    document.body.appendChild(frame);
    return;
  };

  Area22.log = function(data) {
    switch (data.type) {
      case 'event': {
        this.debugFrame.event.textContent = ' ' + data.event;
        break;
      }
      case 'coords': {
        this.debugFrame.coords.textContent = ' x: ' + data.coords.x +
          ', y: ' + data.coords.y;
        break;
      }
      case 'position': {
        this.debugFrame.position.textContent = ' x: ' + data.position.x +
          ', y: ' + data.position.y;
        break;
      }
      case 'delta': {
        this.debugFrame.delta.textContent = ' x: ' + data.delta.x +
          ', y: ' + data.delta.y;
        break;
      }
    }
  };

  // Coordinates helpers
  var Coords = {};

  // Get x/y coordinates generic
  Coords.getXY = function(type, ev, xy) {
    var touch, x, y;
    xy = xy || {};
    type = type || 'page';
    if (/touch/.test(ev.type) && ev.touches) {
      touch = (ev.touches.length) ? ev.touches[0] : ev.changedTouches[0];
      x = touch[type + 'X'];
      y = touch[type + 'Y'];
    } else {
      x = ev[type + 'X'];
      y = ev[type + 'Y'];
    }
    xy.x = x;
    xy.y = y;
    return xy;
  };

  Coords.getPageXY = function(ev, page) {
    page = page || {};
    Coords.getXY('page', ev, page);
    return {
      x: page.x,
      y: page.y
    };
  };

  Coords.getClientXY = function(ev, client) {
    client = client || {};
    Coords.getXY('client', ev, client);
    return {
      x: client.x,
      y: client.y
    };
  };

  Coords.getScroll = function() {
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft,
      y: window.pageYOffset || document.documentElement.scrollTop
    };
  };

  // Offsets for all parents
  Coords.getOffset = function(el) {
    var currLeft = 0;
    var currTop = 0;
    while (el.offsetParent) {
      currLeft += el.offsetLeft;
      currTop += el.offsetTop;
      el = el.offsetParent;
    }
    return {
      x: currLeft,
      y: currTop
    };
  };

  // Client rect + scroll
  Coords.getPosition = function(el) {
    var rect = el.getBoundingClientRect();
    var scroll = Coords.getScroll();
    return {
      x: rect.left + scroll.x,
      y: rect.top + scroll.y
    };
  };

  // Check whether coordinates are within element
  Coords.checkPosition = function(el, coords) {
    var horizontal, vertical;
    // Guard for elements which are not in the DOM
    try {
      var rect = el.getBoundingClientRect();
      horizontal = (coords.x > rect.left) && (coords.x < rect.right);
      vertical = (coords.y > rect.top) && (coords.y < rect.bottom);
    } catch (err) {
      return false;
    }
    return horizontal && vertical;
  };

  Coords.getCenter = function(el) {
    var rect = el.getBoundingClientRect();
    return {
      x: rect.left + Math.round(rect.width / 2),
      y: rect.top + Math.round(rect.height / 2)
    };
  };

  // Utility functions
  var Util = {};

  Util.extend = function(obj) {
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
        }
      }
    }
    return obj;
  };

  Util.isFunction = function(obj) {
    return typeof obj === 'function' || false;
  };

  // Browser helpers
  var Browser = {};

  Browser.prefixCSS = function (cssProp, webkit, moz, ms) {
    function capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    if (moz) return Browser.geckoPrefix.concat(capitalize(cssProp));
    if (ms) return Browser.msiePrefix.concat(capitalize(cssProp));
    if (webkit) return Browser.webkitPrefix.concat(capitalize(cssProp));
    return cssProp;
  };

  Browser.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame;
  })();

  Browser.cancelAnimFrame = (function() {
    return window.cancelAnimationFrame ||
      window.webkitCancelAnimationFrame ||
      window.mozCancelAnimationFrame;
  })();

  Browser.isMac = /Mac OS X/.test(navigator.userAgent);
  Browser.isIOS = /iP(?:ad|hone|od)/.test(navigator.userAgent);

  Browser.isWebKit = /WebKit\//.test(navigator.userAgent);
  Browser.isGecko = /Gecko\//.test(navigator.userAgent);
  Browser.isMSIE = /Trident\//.test(navigator.userAgent);

  Browser.geckoPrefix = 'Moz';
  Browser.msiePrefix = 'ms';
  Browser.webkitPrefix = 'webkit';

  Browser.userSelect = Browser.prefixCSS('userSelect', Browser.isWebKit,
    Browser.isGecko, Browser.isMSIE);
  Browser.backfaceVisibility = Browser.prefixCSS('backfaceVisibility',
    Browser.isWebKit, Browser.isGecko, Browser.isMSIE);
  Browser.perspective = Browser.prefixCSS('perspective', Browser.isWebKit,
    false, Browser.isMSIE);
  Browser.transform = Browser.prefixCSS('transform', Browser.isWebKit,
    false, Browser.isMSIE);

  // TODO: input type detection
  Browser.supportMouse = null;
  Browser.supportTouch = null;
  Browser.supportPointer = null;

  // Events mapping
  var EVENTS = {
    pointerDown: 'mousedown touchstart MSPointerDown',
    pointerMove: 'mousemove touchmove MSPointerMove',
    pointerUp: 'mouseup touchend touchcancel MSPointerUp' // TODO: mouseout
  };

  // Events mixin
  var Events = {};

  Events.on = function(events, handler) {
    events = events.split(' ');
    for (var i = 0; i < events.length; i++) {
      this.el.addEventListener(events[i], handler.bind(this), false);
    }
  };

  Events.off = function(events, handler) {
    events = events.split(' ');
    for (var i = 0; i < events.length; i++) {
      this.el.removeEventListener(events[i], handler, false);
    }
  };

  // Constructors

  // Mixed in other constructors
  var Data = function() {
    this._data = {};
  };

  Util.extend(Data.prototype, {

    // Get or set the data object
    data: function(data) {
      if (arguments.length === 0) return this._data;
      this._data = data;
      return this;
    },

    get: function(prop) {
      return this._data[prop];
    },

    set: function(prop, value) {
      if (arguments.length !== 2) return this;
      this._data[prop] = value;
      return this;
    },

    unset: function(prop) {
      delete this._data[prop];
      return this;
    },
  });

  // Area represents an Area for drag operations
  var Area = function(el, opts) {
    Data.apply(this, arguments);
    this.el = el;
    this.draggables = [];
    this.dropzones = [];
    this._pointerIsDown = false;
    this._dragged = null;
    this._handleStart = null;
    this._handleMove = null;
    this._handleStop = null;
    this._handleCancel = null;
    this._cache = {};
    this._init(opts);
  };

  Util.extend(Area.prototype, Data.prototype, Events, {

    _init: function(opts) {
      this.opts = opts || {};
      // Available opts:
      // debug: Boolean
      // noDragClass: String (CSS class)
      if (this.opts.debug === true) {
        Area22.debug(this);
      }
      this.on(EVENTS.pointerDown, this._pointerDown);
      this.on(EVENTS.pointerMove, this._pointerMove);
      this.on(EVENTS.pointerUp, this._pointerUp);
      this.el.style[Browser.userSelect] = 'none';
    },

    _pointerDown: function(ev) {
      if (ev.target.classList.contains(this.opts.noDragClass)) return;
      var coords = Coords.getClientXY(ev);
      this._dragged = this.getDraggable(coords);
      if (this._dragged && this._dragged.opts.movable) {
        this._pointerIsDown = true;
        ev.preventDefault();
        if (this.opts.debug) Area.log({ type: 'event',  event: ev.type });
        var dropzone = this.getDropzone(coords);
        this._dragged.setCoords(coords).drag();
        if (this._handleStart) {
          this._handleStart.call(window, coords, this._dragged, dropzone,
            this.dropzones);
        }
      }
    },

    _pointerMove: function(ev) {
      if (this._pointerIsDown && this._dragged) {
        if (this.opts.debug) Area22.log({ type: 'event',  event: ev.type });
        var coords = Coords.getClientXY(ev);
        var dropzone = this.getDropzone(coords);
        this._dragged.setCoords(coords);
        if (this._handleMove) {
          this._handleMove.call(window, coords, this._dragged, dropzone,
            this.dropzones);
        }
      }
    },

    _pointerUp: function(ev) {
      this._pointerIsDown = false;
      if (this._dragged && this._dragged.opts.movable) {
        if (this.opts.debug) Area22.log({ type: 'event',  event: ev.type });
        var coords = Coords.getClientXY(ev);
        var dropzone = this.getDropzone(coords);
        this._dragged.setCoords(coords).drop();
        if (this._handleStop) {
          this._handleStop.call(window, coords, this._dragged, dropzone,
            this.dropzones);
        }
      }
      this._dragged = null;
    },

    cancelDrag: function(ev) {
      this._pointerIsDown = false;
      if (this._dragged && this._dragged.opts.movable) {
        var coords = this._dragged.getCoords();
        var dropzone = this.getDropzone(coords);
        this._dragged.setCoords(coords).drop();
        if (this._handleCancel) {
          this._handleCancel.call(window, coords, this._dragged, dropzone,
            this.dropzones);
        }
      }
      this._dragged = null;
    },

    // Make element Draggable, with optional starting coords
    addDraggable: function(el, opts) {
      if (!el) return;
      var draggable = new Draggable(el, this, opts);
      this.draggables.push(draggable);
      return draggable;
    },

    // Add more Draggables at once using CSS selector
    addDraggables: function(selector, opts) {
      if (!selector) return this.draggables;
      var elements = document.querySelectorAll(selector);
      for (var i = 0; i < elements.length; i++) {
        this.addDraggable(elements[i], opts);
      }
      return this.draggables;
    },

    removeDraggable: function(draggable) {
      for (var i = 0; i < this.draggables.length; i++) {
        if (this.draggables[i] === draggable) {
          this.draggables.splice(i, 1);
          draggable.destroy();
        }
      }
    },

    // Remove all associated draggables at once
    removeDraggables: function() {
      for (var i = 0; i < this.draggables.length; i++) {
        this.draggables[i].destroy();
      }
      this.draggables = [];
    },

    // Make element Dropzone
    addDropzone: function(el, opts) {
      if (!el) return;
      var dropzone = new Dropzone(el, this, opts);
      this.dropzones.push(dropzone);
      return dropzone;
    },

    // Add more Dropzones at once using CSS selector
    addDropzones: function(selector, opts) {
      if (!selector) return dropzones;
      var elements = document.querySelectorAll(selector);
      for (var i = 0; i < elements.length; i++) {
        this.addDropzone(elements[i], opts);
      }
      return this.dropzones;
    },

    removeDropzone: function(dropzone) {
      for (var i = 0; i < this.dropzones.length; i++) {
        if (this.dropzones[i] === dropzone) {
          this.dropzones.splice(i, 1);
          dropzone.destroy();
        }
      }
    },

    // Remove all associated dropzones at once
    removeDropzones: function() {
      for (var i = 0; i < this.dropzones.length; i++) {
        this.dropzones[i].destroy();
      }
      this.dropzones = [];
    },

    // Get draggable for the current cursor position, ignore currently dragged
    getDraggable: function(coords) {
      for (var i = 0; i < this.draggables.length; i++) {
        if (Coords.checkPosition(this.draggables[i].el, coords) &&
            this.draggables[i] !== this._dragged) {
          return this.draggables[i];
        }
      }
      return null;
    },

    // Return dropzone according to the pointer location
    getDropzone: function(coords) {
      for (var i = 0; i < this.dropzones.length; i++) {
        if (Coords.checkPosition(this.dropzones[i].el, coords)) {
          return this.dropzones[i];
        }
      }
      return null;
    },

    onStart: function(fn) {
      if (Util.isFunction(fn)) this._handleStart = fn;
      return this;
    },

    onMove: function(fn) {
      if (Util.isFunction(fn)) this._handleMove = fn;
      return this;
    },

    onStop: function(fn) {
      if (Util.isFunction(fn)) this._handleStop = fn;
      return this;
    },

    onCancel: function (fn) {
      if (Util.isFunction(fn)) this._handleCancel = fn;
      return this;
    },

    destroy: function() {
      this.removeDraggables();
      this.removeDropzones();
      this.off(EVENTS.pointerDown, this.pointerDown);
      this.off(EVENTS.pointerMove, this.pointerMove);
      this.off(EVENTS.pointerUp, this.pointerUp);
      this.data({});
    },
  });

  // Draggable represents movable element
  var Draggable = function(el, area, opts) {
    Data.apply(this, arguments);
    this.el = el;
    this.area = area;
    this._currCoords = null;
    this._prevCoords = null;
    this._pointerDelta = null;
    this._afrid = null; // Animation frame request ID
    this._cache = {};
    this._init(opts);
  };

  Util.extend(Draggable.prototype, Data.prototype, {

    _init: function(opts) {
      this.opts = opts || {};
      // Available opts:
      // movable: Boolean (whether this draggable should be dragged)
      if (this.opts.movable !== false) {
        this.opts.movable = true;
      }
    },

    // Calculate current delta from curr/prev position, or reset the delta
    _calculateDelta: function(reset) {
      if (!this._prevCoords || reset) {
        this._pointerDelta = { x: 0, y: 0 };
      } else {
        this._pointerDelta = {
          x: parseInt(this._pointerDelta.x + (this._currCoords.x - this._prevCoords.x)),
          y: parseInt(this._pointerDelta.y + (this._currCoords.y - this._prevCoords.y))
        };
      }
      if (this.area.opts.debug) Area22.log({ type: 'delta',  delta: this._pointerDelta });
      this._prevCoords = this._currCoords;
      return this;
    },

    // Position Draggable using deltas during movement using CSS transform
    _transformPosition: function() {
      var scroll = Coords.getScroll();
      var offset = Coords.getOffset(this.el);
      // Always check for scroll change
      var scrollDiff = {
        x: this._cache.startScroll.x - scroll.x,
        y: this._cache.startScroll.y - scroll.y
      };
      // Always check for element offset change
      var offsetDiff = {
        x: this._cache.startOffset.x - offset.x,
        y: this._cache.startOffset.y - offset.y
      };
      var x = this._pointerDelta.x + offsetDiff.x - scrollDiff.x;
      var y = this._pointerDelta.y + offsetDiff.y - scrollDiff.y;
      // backface-visibility & perspective are used to force GPU acceleration
      this.el.style[Browser.backfaceVisibility] = 'hidden';
      this.el.style[Browser.perspective] = '1000';
      this.el.style[Browser.transform] = 'translate3d(' + x + 'px,' + y + 'px,0)';
      return this;
    },

    // Cleanup movement properties
    _applyPosition: function() {
      if (this.area.opts.debug) Area22.log({ type: 'position',  position: this._currCoords });
      this._prevCoords = null;
      this._cache.startScroll = null;
      this._cache.startOffset = null;
      this.el.style[Browser.backfaceVisibility] = '';
      this.el.style[Browser.perspective] = '';
      this.el.style[Browser.transform] = '';
      return this;
    },

    getCoords: function() {
      return this._currCoords;
    },

    setCoords: function(coords) {
      this._currCoords = {
        x: parseInt(coords.x),
        y: parseInt(coords.y)
      };
      if (this.area.opts.debug) Area22.log({ type: 'coords',  coords: this._currCoords });
      return this;
    },

    drag: function() {
      // Cache scroll and offset for correct delta calculation during movement
      this._cache.startScroll = Coords.getScroll();
      this._cache.startOffset = Coords.getOffset(this.el);
      this.move();
      return this;
    },

    move: function() {
      var self = this;
      self._calculateDelta()._transformPosition();
      self._afrid = Browser.requestAnimFrame.call(window, function() {
        self.move();
      });
      return self;
    },

    drop: function() {
      this._applyPosition();
      Browser.cancelAnimFrame.call(window, this._afrid);
      return this;
    },

    destroy: function() {
      this.data({});
    },
  });


  // Sortable helper methods
  Util.extend(Draggable.prototype, {

    _shadow: null,

    getShadow: function() {
      return this._shadow;
    },

    setShadow: function(el) {
      this._shadow = el || this.el.cloneNode(true);
    },

    detachShadow: function() {
      var parent = this._shadow.parentNode;
      if (parent) {
        parent.removeChild(this._shadow);
      }
    },

    removeShadow: function () {
      this.detachShadow();
      this._shadow = null;
    },

    placeShadow: function (coords, dragged, dropzone) {
      var shadow = this.getShadow();
      var parent = this._shadow.parentNode;
      var over = this.area.getDraggable(coords);
      var overSelf = Coords.checkPosition(shadow, coords);
      if (dropzone) {
        if (over && !overSelf) {
          var rect = over.el.getBoundingClientRect();
          // TODO: horizontal, only vertical now
          if (rect.top + (rect.height / 2) <= coords.y) {
            dropzone.el.insertBefore(shadow, over.el.nextElementSibling);
          } else {
            dropzone.el.insertBefore(shadow, over.el);
          }
        } else if (!dropzone.el.contains(shadow)) {
          dropzone.el.appendChild(shadow);
        }
      } else {
        this.detachShadow();
      }
    }
  });

  // Dropzone represents possible drop location
  var Dropzone = function(el, area, opts) {
    Data.apply(this, arguments);
    this.el = el;
    this.area = area;
    this._init(opts);
  };

  Util.extend(Dropzone.prototype, Data.prototype, {

    _init: function (opts) {
      this.opts = opts || {};
    },

    destroy: function() {
      this.data({});
    },
  });

  return Area22;

}));
