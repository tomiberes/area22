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

  Area22.VERSION = '0.0.0';

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

  // Get page x/y coordinates
  Coords.getPageXY = function(ev, page) {
    page = page || {};
    Coords.getXY('page', ev, page);
    return {
      x: page.x,
      y: page.y
    };
  };

  Coords.getScrollXY = function() {
    return {
      x: window.scrollX || document.documentElement.scrollLeft,
      y: window.scrollY || document.documentElement.scrollTop
    };
  };

  // Retrieve element rectangle position and dimensions
  Coords.getElRect = function(el) {
    // TODO: check if required (iOS), test on iOS
    var scroll = /ipad|iphone|ipod/i.test(navigator.userAgent) ? { x: 0, y: 0 } : Coords.getScrollXY(),
        clientRect = el.getClientRects()[0];
    return {
      left: clientRect.left + scroll.x,
      right: clientRect.right + scroll.x,
      top: clientRect.top + scroll.y,
      bottom: clientRect.bottom + scroll.y,
      width: clientRect.width || clientRect.right - clientRect.left,
      height: clientRect.height || clientRect.bottom - clientRect.top
    };
  };

  // Check whether coordinates are within element
  Coords.checkPosition = function(el, coords) {
      var horizontal, vertical,
          rect = Coords.getElRect(el);
      horizontal = (coords.x > rect.left) && (coords.x < rect.right);
      vertical = (coords.y > rect.top) && (coords.y < rect.bottom);
      return horizontal && vertical;
  };

  Coords.getCenter = function(el) {
    var rect = Coords.getElRect(el);
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
    return typeof obj == 'function' || false;
  };

  // Browser helpers
  var Browser = {};

  Browser.isMac = /Mac OS X/.test(navigator.userAgent);
  Browser.isIOS = /iP(?:ad|hone|od)/.test(navigator.userAgent);

  Browser.isWebKit = /WebKit\//.test(navigator.userAgent);
  Browser.isGecko = /Gecko\//.test(navigator.userAgent);
  Browser.isMSIE = /Trident\//.test(navigator.userAgent);

  // TODO: input type detection
  Browser.supportMouse = null;
  Browser.supportTouch = null;
  Browser.supportPointer = null;

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
    }

  });

  // Area represents an Area for drag operations
  var Area = function(el, opts) {
    Data.apply(this, arguments);
    this.el = el;
    this.pointerIsDown = false;
    this.draggables = [];
    this.dropzones = [];
    this.dragged = null;
    this.dropped = null;
    this.handleStart = null;
    this.handleMove = null;
    this.handleStop = null;
    this.filterStart = null;
    this.filterMove = null;
    this.filterStop = null;
    this.debug = false;
    this._init(opts);
  };

  Util.extend(Area.prototype, Data.prototype, Events, {

    _init: function(opts) {
      if (opts) {
        if (opts.debug) {
          this.debug = true;
          Area22.debug(this);
        }
      }
      this.on(EVENTS.pointerMove, this.pointerMove);
      this.on(EVENTS.pointerUp, this.pointerUp);
    },

    // Remove event listeners and destroy associated Draggables/Dropzones
    destroy: function() {
      this.removeDraggables();
      this.removeDropzones();
      this.off(EVENTS.pointerMove, this.pointerMove);
      this.off(EVENTS.pointerUp, this.pointerUp);
      this.data({});
    },

    // Make element Draggable, with optional starting coords
    addDraggable: function(el, coords) {
      if (!el) return;
      var draggable = new Draggable(el, coords, this);
      this.draggables.push(draggable);
      return draggable;
    },

    // Add more Draggables at once using CSS selector
    addDraggables: function(selector) {
      if (!selector) return this.draggables;
      var elements = document.querySelectorAll(selector);
      for (var i = 0; i < elements.length; i++) {
        this.addDraggable(elements[i]);
      }
      return this.draggables;
    },

    // Remove all associated draggables at once
    removeDraggables: function() {
      for (var i = 0; i < this.draggables.length; i++) {
        this.draggables[i].destroy();
      }
      this.draggables = [];
    },

    // Make element Dropzone, with optional active flag
    addDropzone: function(el, active) {
      if (!el) return;
      var dropzone = new Dropzone(el, active, this);
      this.dropzones.push(dropzone);
      return dropzone;
    },

    // Add more Dropzones at once using CSS selector
    addDropzones: function(selector) {
      if (!selector) return dropzones;
      var elements = document.querySelectorAll(selector);
      for (var i = 0; i < elements.length; i++) {
        this.addDropzone(elements[i]);
      }
      return this.dropzones;
    },

    // Remove all associated dropzones at once
    removeDropzones: function() {
      for (var i = 0; i < this.dropzones.length; i++) {
        this.dropzones[i].destroy();
      }
      this.dropzones = [];
    },

    // Apply dropzones filter or return all associated dropzones
    filterDropzones: function(filter) {
      if (Util.isFunction(filter)) {
        return filter.call(this, this.dropzones);
      } else {
        return this.dropzones;
      }
    },

    // Return first (the only) dropzone according to the pointer location
    getDropzone: function(coords) {
      for (var i = 0; i < this.dropzones.length; i++) {
        if (this.dropzones[i].pointed(coords)) {
          return this.dropzones[i];
        }
      }
    },

    // Assign handler and filter for movement start operation
    onStart: function(opts) {
      if (opts) {
        if (Util.isFunction(opts.handler)) this.handleStart = opts.handler;
        if (Util.isFunction(opts.filter)) this.filterStart = opts.filter;
      }
      return this;
    },

    // Assign handler and filter for movement move operation
    onMove: function(opts) {
      if (opts) {
        if (Util.isFunction(opts.handler)) this.handleMove = opts.handler;
        if (Util.isFunction(opts.filter)) this.filterMove = opts.filter;
      }
      return this;
    },

    // Assign handler and filter for movement stop operation
    onStop: function(opts) {
      if (opts) {
        if (Util.isFunction(opts.handler)) this.handleStop = opts.handler;
        if (Util.isFunction(opts.filter)) this.filterStop = opts.filter;
      }
      return this;
    },

    // Get event coords, Draggable/Dropzones on start and invoke handler
    doStart: function(ev) {
      var coords = Coords.getPageXY(ev),
          dropzone = this.getDropzone(coords) || null,
          dropzones = this.filterDropzones(this.filterStart);
      // Default action
      this.dragged.setCoords(coords).startAnimLoop();
      if (Util.isFunction(this.handleStart)) {
        return this.handleStart.call(this, coords, this.dragged, dropzone, dropzones);
      }
    },

    // Get event coords, Draggable/Dropzones during movemnt and invoke handler
    doMove: function(ev) {
      var coords = Coords.getPageXY(ev),
          dropzone = this.getDropzone(coords) || null,
          dropzones = this.filterDropzones(this.filterMove);
      // Default action
      this.dragged.setCoords(coords);
      if (Util.isFunction(this.handleMove)) {
        return this.handleMove.call(this, coords, this.dragged, dropzone, dropzones);
      }
    },

    // Get event coords, Draggable/Dropzones on stop and invoke handler
    doStop: function(ev) {
      var coords = Coords.getPageXY(ev),
          dropzone = this.getDropzone(coords) || null,
          dropzones = this.filterDropzones(this.filterStop);
      // Default action;
      this.dragged.setCoords(coords).stopAnimLoop().pointer();
      // Set new home
      this.dragged.dropzone = dropzone;
      if (Util.isFunction(this.handleStop)) {
        return this.handleStop.call(this, coords, this.dragged, dropzone, dropzones);
      }
    },

    // Event handlers

    pointerDown: function(ev, dragged) {
      if (this.debug) Area22.log({ type: 'event',  event: ev.type });
      ev.preventDefault();
      this.pointerIsDown = true;
      this.dragged = dragged;
      this.doStart(ev);
    },

    pointerMove: function(ev) {
      if (this.debug) Area22.log({ type: 'event',  event: ev.type });
      if (!this.pointerIsDown) return;
      if (this.dragged) {
        this.doMove(ev);
      }
      return false;
    },

    pointerUp: function(ev) {
      if (this.debug) Area22.log({ type: 'event',  event: ev.type });
      this.pointerIsDown = false;
      if (this.dragged) {
        this.doStop(ev);
      }
      // Reset currently dragged element
      this.dragged = null;
      return false;
    },

  });

  // Draggable represents movable element
  var Draggable = function(el, coords, area) {
    Data.apply(this, arguments);
    this.el = el;
    this.area = area;
    this.dropzone = null;
    this.currCoords = coords || null;
    this.prevCoords = null;
    this.pointerDelta = null;
    this._afrid = null; // Animation frame request ID
    this._init();
  };

  Util.extend(Draggable.prototype, Data.prototype, Events, {

    _init: function() {
      this.on(EVENTS.pointerDown, this.pointerDown);
      // Draggable have to be absolutely positioned
      this.el.style.position = 'absolute';
      if (this.currCoords) this.applyPosition();
    },

    // Remove event listeners
    destroy: function() {
      this.off(EVENTS.pointerDown, this.pointerDown);
      this.data({});
    },

    // Set new set of coordinates for Draggable
    setCoords: function(coords) {
      this.currCoords = {
        x: parseInt(coords.x),
        y: parseInt(coords.y)
      };
      if (this.area.debug) Area22.log({ type: 'coords',  coords: this.currCoords });
      return this;
    },

    // Position Draggable using deltas during movement using CSS transform
    translateElPosition: function() {
      // backface-visibility & perspective are used to force GPU acceleration
      var transform = 'translate3d(' + this.pointerDelta.x + 'px,' + this.pointerDelta.y + 'px,0)',
          perspective = '1000',
          backfaceVisibility = 'hidden';
      if (Browser.isWebKit) {
        this.el.style.webkitBackfaceVisibility = backfaceVisibility;
        this.el.style.webkitPerspective = perspective;
        this.el.style.webkitTransform = transform;
      } else {
        this.el.style.backfaceVisibility = backfaceVisibility;
        this.el.style.perspective = perspective;
        this.el.style.transform = transform;
      }
      return this;
    },

    // Position Draggable persistently on current coords
    absoluteElPosition: function() {
      if (this.area.debug) Area22.log({ type: 'position',  position: this.currCoords });
      this.el.style.left = this.currCoords.x + 'px';
      this.el.style.top = this.currCoords.y + 'px';
      this.prevCoords = null;
      return this;
    },

    // Calculate current delta from curr/prev position, or reset the delta
    calculateDelta: function(reset) {
      if (!this.prevCoords || reset) {
        this.pointerDelta = { x: 0, y: 0 };
      } else {
        this.pointerDelta = {
          x: parseInt(this.pointerDelta.x + (this.currCoords.x - this.prevCoords.x)),
          y: parseInt(this.pointerDelta.y + (this.currCoords.y - this.prevCoords.y))
        };
      }
      if (this.area.debug) Area22.log({ type: 'delta',  delta: this.pointerDelta });
      this.prevCoords = this.currCoords;
      return this;
    },

    // Move Draggable using latest coordinates,
    // invoked in requestAnimationFrame loop
    move: function() {
      this.calculateDelta()
        .translateElPosition();
      return this;
    },

    // Apply current coordinates position
    applyPosition: function() {
      this.calculateDelta(true) // Reset pointer delta and apply it
        .translateElPosition()
        .absoluteElPosition(); // Position element using style.left/top
      return this;
    },

    // Place Draggable using latest pointer coordinates
    pointer: function() {
      var rect = Coords.getElRect(this.el);
      this.setCoords({
        x: this.currCoords.x - (this.currCoords.x - rect.left),
        y: this.currCoords.y - (this.currCoords.y - rect.top)
      }).applyPosition();
      return this;
    },

    // Place Draggable center to the coordinates
    place: function(coords) {
      var rect = Coords.getElRect(this.el);
      this.setCoords({
        x: coords.x - Math.round(rect.width / 2),
        y: coords.y - Math.round(rect.height / 2)
      }).applyPosition();
      return this;
    },

    // Snap draggable into element center
    snap: function(el) {
      this.place(Coords.getCenter(el));
      return this;
    },

    startAnimLoop: function() {
      var self = this;
      self.move();
      // Native requestAnimationFrame function to work properly,
      // it have to be executed in the context of window object
      self._afrid = Browser.requestAnimFrame.call(window, function() {
        self.startAnimLoop();
      });
      return this;
    },

    stopAnimLoop: function() {
      var self = this;
      Browser.cancelAnimFrame.call(window, self._afrid);
      return this;
    },

    // Event handler, passing it directly to Area handler,
    // with dragged object reference
    pointerDown: function(ev) {
      return this.area.pointerDown(ev, this);
    },

  });

  // Dropzone represents possible drop location
  var Dropzone = function(el, active, area) {
    Data.apply(this, arguments);
    this.el = el;
    this.area = area;
    this.active = active || true;
  };

  Util.extend(Dropzone.prototype, Data.prototype, {

    destroy: function() {
      this.data({});
    },

    // Check whether the pointer is over the Dropzone
    pointed: function(coords) {
      return Coords.checkPosition(this.el, coords);
    },

  });

  return Area22;

}));
