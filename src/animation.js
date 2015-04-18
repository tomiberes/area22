'use strict';

// Animations mixin
var Animation = {};

Animation.animationend = 'aniamtionend';

Animation.animate = function() {

};

Animation.flash = function() {

};

Area22.expose('util draggable dropzone');

Area22.Util.extend(Area22.Draggable, Animation);
Area22.Util.extend(Area22.Dropzone, Animation);
