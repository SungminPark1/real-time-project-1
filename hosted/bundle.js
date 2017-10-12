'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var socket = void 0;
var canvas = void 0;
var ctx = void 0;
var scoreBoard = void 0;

var updated = false;
var user = {
  name: 'user' + Math.floor(Math.random() * 1000 + 1),
  pos: {
    x: 0,
    y: 0
  }
};
var players = {};
var bombs = [];

// keyboard stuff
var myKeys = {
  KEYBOARD: {
    KEY_W: 87,
    KEY_A: 65,
    KEY_S: 83,
    KEY_D: 68,
    KEY_SPACE: 49
  },
  keydown: []
};

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// draw players
var drawPlayers = function drawPlayers() {
  var keys = Object.keys(players);

  for (var i = 0; i < keys.length; i++) {
    // ignores this clients object
    if (keys[i] !== user.name) {
      var drawCall = players[keys[i]];
      scoreBoard.innerHTML += '<p>' + drawCall.name + ' Score: ' + drawCall.score + '</p>';

      ctx.fillStyle = 'rgb(' + drawCall.color.r + ', ' + drawCall.color.g + ', ' + drawCall.color.b + ')';
      ctx.beginPath();
      ctx.arc(drawCall.pos.x, drawCall.pos.y, drawCall.radius, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.closePath();
    }
  }

  // draw clients player
  ctx.fillStyle = 'rgb(' + user.color.r + ',' + user.color.g + ',' + user.color.b + ')';
  ctx.beginPath();
  ctx.arc(user.pos.x, user.pos.y, user.radius, 0, Math.PI * 2, false);
  ctx.fill();
  ctx.closePath();
};

var drawBombs = function drawBombs() {
  for (var i = 0; i < bombs.length; i++) {
    var bomb = bombs[i];
    var fill = 'rgba(255, 0, 0, ' + (bomb.exploding ? 1 : 0.5) + ')';

    ctx.strokeStyle = 'white';
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(bomb.pos.x, bomb.pos.y, bomb.radius, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.arc(bomb.pos.x, bomb.pos.y, bomb.explosionRadius, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.closePath();
  }
};

var update = function update(dt) {
  updated = false;

  // movement check
  if (myKeys.keydown[myKeys.KEYBOARD.KEY_W] === true) {
    user.pos.y += -100 * dt;
    updated = true;
  }
  if (myKeys.keydown[myKeys.KEYBOARD.KEY_A] === true) {
    user.pos.x += -100 * dt;
    updated = true;
  }
  if (myKeys.keydown[myKeys.KEYBOARD.KEY_S] === true) {
    user.pos.y += 100 * dt;
    updated = true;
  }
  if (myKeys.keydown[myKeys.KEYBOARD.KEY_D] === true) {
    user.pos.x += 100 * dt;
    updated = true;
  }

  // skill check
  if (myKeys.keydown[myKeys.KEYBOARD.KEY_S] === true) {
    user.placeBomb = true;
    updated = true;
  } else {
    user.placeBomb = false;
  }

  // prevent player from going out of bound
  user.pos.x = clamp(user.pos.x, user.radius, 500 - user.radius);
  user.pos.y = clamp(user.pos.y, user.radius, 500 - user.radius);

  // if this client's user moves, send to server to update server
  if (updated === true) {
    socket.emit('updatePlayer', {
      name: user.name,
      pos: {
        x: user.pos.x,
        y: user.pos.y
      },
      placeBomb: user.placeBomb
    });
  }
};

// called when server sends update update user pos?
var handleUpdate = function handleUpdate(data) {
  players = data.players;
  bombs = data.bombs;
  user = _extends({}, players[user.name], {
    pos: _extends({}, user.pos)
  });

  scoreBoard.innerHTML = '<p>Your Score ' + players[user.name].score + '</p>';

  update(data.dt);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBombs();
  drawPlayers();
};

var setupSocket = function setupSocket() {
  socket.emit('join', { user: user });

  socket.on('update', handleUpdate);

  // get other clients data from server
  socket.on('initData', function (data) {
    players = data.players;
    bombs = data.bombs;
    user = data.players[user.name];

    drawPlayers();
  });
};

var init = function init() {
  socket = io.connect();
  canvas = document.querySelector('#main');
  ctx = canvas.getContext('2d');

  canvas.setAttribute('width', 500);
  canvas.setAttribute('height', 500);

  scoreBoard = document.querySelector('#score__board');

  setupSocket();

  // event listeners
  window.addEventListener('keydown', function (e) {
    // console.log(`keydown: ${e.keyCode}`);
    myKeys.keydown[e.keyCode] = true;
  });

  window.addEventListener('keyup', function (e) {
    // console.log(`keyup: ${e.keyCode}`);
    myKeys.keydown[e.keyCode] = false;
  });
};

window.onload = init;

window.onunload = function () {
  socket.emit('disconnect');
};
