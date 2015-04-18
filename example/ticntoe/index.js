(function() {

  // use whole document for dragging
  var area = Area22.area($('body').get(0), { debug: true });
  // make draggables
  var draggables = area.addDraggables('.draggable');
  // make dropzones
  var dropzones = area.addDropzones('.dropzone');
  var activeDropzones = [];
  var COLORS = [
    {
      name: 'light',
      hex: '#fff',
    },
    {
      name: 'dark',
      hex: '#444',
    },
    {
      name: 'stable',
      hex: '#f8f8f8',
    },
    {
      name: 'positive',
      hex: '#387ef5',
    },
    {
      name: 'calm',
      hex: '#11c1f3',
    },
    {
      name: 'balanced',
      hex: '#33cd5f',
    },
    {
      name: 'energized',
      hex: '#ffc900',
    },
    {
      name: 'assertive',
      hex: '#ef473a',
    },
    {
      name: 'royal',
      hex: '#886aea',
    },
  ];

  Area22.expose('coords');

  // make tic tac toe
  dropzones.forEach(function(dropzone, i, arr) {
    var $el = $(dropzone.el);
    if (i % 2 === 0) {
      dropzone.set('color', COLORS[1]);
      dropzone.active = false;

    } else {
      dropzone.set('color', COLORS[2]);
      activeDropzones.push(dropzone);
    }
    $el.css({ 'background-color': dropzone.get('color').hex });
  }, this);
  draggables.forEach(function(draggable, i, arr) {
    var dropzone = activeDropzones[i];
    draggable.snap(dropzone.el);
    dropzone.active = false;
    draggable.set('color', COLORS[i + 2]); // Start after the white and black
    draggable.set('dropzone', dropzone);
    $(draggable.el).css({ 'background-color': draggable.get('color').hex });
    $(dropzone.el).css({ 'background-color': draggable.get('color').hex });
  }, this);

  // assign filters and hnadlers
  area.onStart({
    filter: function(dropzones) {
      return dropzones;
    },
    handler: function(coords, dragged, dropzone, dropzones) {
      var position;
      if (dropzone) {
        dropzone.active = true;
        $(dropzone.el).css({ 'background-color': dropzone.get('color').hex });
        position = Area22.Coords.getCenter(dropzone.el);
        dragged.set('home', position);
      }
    }
  });
  area.onMove({
    filter: function(dropzones) {
      return dropzones;
    },
    handler: function(coords, dragged, dropzone, dropzones) {

    }
  });
  area.onStop({
    filter: function(dropzones) {
      return dropzones;
    },
    handler: function(coords, dragged, dropzone, dropzones) {
      if (dropzone) {
        if (dropzone.active) {
          dropzone.active = false;
          dragged.set('home', coords);
          dragged.set('dropzone', dropzone);
          dragged.snap(dropzone.el);
          $(dropzone.el).css({ 'background-color': dragged.get('color').hex });
        } else {
          // Reset the color to the dragged one otherwise
          var $el = $(dragged.get('dropzone').el);
          $el.css({ 'background-color': dragged.get('color').hex });
          dragged.place(dragged.get('home'));
        }
      } else {
        // dragged.set('home', coords);
      }
    }
  });

})();
