'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var socket = void 0;
var canvas = void 0;
var ctx = void 0;
var scoreBoard = void 0;

var updated = false;
var placeBomb = false;
var previousKeyDown = false;

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
    KEY_SPACE: 32
  },
  keydown: []
};

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// draw players
var drawPlayers = function drawPlayers() {
  var status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'started';

  var keys = Object.keys(players);

  for (var i = 0; i < keys.length; i++) {
    // ignores this clients object
    if (keys[i] !== user.name) {
      var player = players[keys[i]];
      scoreBoard.innerHTML += '<p>' + player.name + ' Score: ' + player.score + '</p>';

      ctx.fillStyle = 'rgba(' + player.color.r + ', ' + player.color.g + ', ' + player.color.b + ', ' + (player.dead ? 0.25 : 1) + ')';
      ctx.strokeStyle = 'black';
      if (status === 'preparing' && player.ready) {
        ctx.save();
        ctx.shadowColor = '#00FF00';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      ctx.beginPath();
      ctx.arc(player.pos.x, player.pos.y, player.radius, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }
  }

  // draw clients player
  ctx.fillStyle = 'rgba(' + user.color.r + ',' + user.color.g + ',' + user.color.b + ', ' + (user.dead ? 0.25 : 1) + ')';
  if (status === 'preparing' && user.ready) {
    ctx.save();
    ctx.shadowColor = '#00FF00';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  ctx.beginPath();
  ctx.arc(user.pos.x, user.pos.y, user.radius, 0, Math.PI * 2, false);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
};

// draw bombs
var drawBombs = function drawBombs() {
  for (var i = 0; i < bombs.length; i++) {
    var bomb = bombs[i];
    var fill = 'rgba(255, 0, 0, ' + (bomb.exploding ? 0.75 : 0.25) + ')';

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

// draw text
var drawText = function drawText(text, x) {
  ctx.fillStyle = 'black';
  ctx.font = '30px Arial';
  ctx.fillText(text, x, 260);
};

var update = function update(dt, status) {
  updated = false;
  placeBomb = false;

  // movement check
  if (myKeys.keydown[myKeys.KEYBOARD.KEY_W]) {
    user.pos.y += -100 * dt;
    updated = true;
  }
  if (myKeys.keydown[myKeys.KEYBOARD.KEY_A]) {
    user.pos.x += -100 * dt;
    updated = true;
  }
  if (myKeys.keydown[myKeys.KEYBOARD.KEY_S]) {
    user.pos.y += 100 * dt;
    updated = true;
  }
  if (myKeys.keydown[myKeys.KEYBOARD.KEY_D]) {
    user.pos.x += 100 * dt;
    updated = true;
  }

  // skill check
  if (status === 'started') {
    if (myKeys.keydown[myKeys.KEYBOARD.KEY_SPACE] && !previousKeyDown) {
      placeBomb = true;
      updated = true;
    }
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
      placeBomb: placeBomb
    });
  }
};

var checkReady = function checkReady() {
  // emit only when current keypress is down and previous is up;
  if (myKeys.keydown[myKeys.KEYBOARD.KEY_SPACE] && !previousKeyDown) {
    socket.emit('togglePlayerReady', {
      name: user.name,
      ready: !user.ready
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

  // handle update based on game status
  if (data.status === 'preparing') {
    // players can move and update ready status.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    update(data.dt, data.status);
    checkReady();
    drawPlayers(data.status);
    drawText('Waiting for Players to Ready', 100);
  } else if (data.status === 'started') {
    // players can move, place bombs and see bombs
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    update(data.dt, data.status);
    drawBombs();
    drawPlayers();
  } else if (data.status === 'restarting') {
    // freeze screen and loop back to start
    user.pos = _extends({}, players[user.name].pos);

    drawText('Restarting', 180);
  }

  // prevent toggling ready each frame and placing bomb at the beginning
  if (myKeys.keydown[myKeys.KEYBOARD.KEY_SPACE]) {
    previousKeyDown = true;
  } else {
    previousKeyDown = false;
  }

  // center block (used to position things)
  // ctx.fillStyle = 'black';
  // ctx.beginPath();
  // ctx.rect(240, 240, 20, 20);
  // ctx.fill();
  // ctx.closePath();
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
