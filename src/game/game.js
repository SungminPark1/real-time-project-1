const Player = require('./player.js');
const Bomb = require('./bomb.js');

function circlesDistance(c1, c2) {
  const dx = c2.x - c1.x;
  const dy = c2.y - c1.y;
  const distance = Math.sqrt((dx * dx) + (dy * dy));
  return distance;
}

class Game {
  constructor(data) {
    this.room = data;
    this.ended = false;
    this.started = false;
    this.players = {};
    this.bombs = [];
    this.bombTimer = 3;
    this.currentTimer = this.bombTimer;
    this.time = new Date().getTime();
    this.dt = 0;
  }

  addPlayer(user) {
    this.players[user.name] = new Player(user);
  }

  deletePlayer(name) {
    delete this.players[name];
  }

  createBombs(dt) {
    this.currentTimer -= dt;

    if (this.currentTimer < 0 && this.bombs.length <= 15) {
      this.bombs.push(new Bomb());

      this.bombTimer = Math.max(this.bombTimer * 0.9, 0.1);
      this.currentTimer = this.bombTimer;
    }
  }

  filterBombs() {
    this.bombs = this.bombs.filter(bomb => bomb.active);
  }

  checkCollision(user) {
    const player = user;

    // increase score
    player.score++;

    // check player collision with exploding bombs
    for (let i = 0; i < this.bombs.length; i++) {
      const bomb = this.bombs[i];

      if (bomb.exploding) {
        if (circlesDistance(player.pos, bomb.pos) < (player.radius + bomb.explosionRadius)) {
          player.score = 0;
        }
      }

      bomb.update(this.dt);
    }
  }

  update() {
    const now = new Date().getTime();

    // in seconds
    this.dt = (now - this.time) / 1000;

    this.time = now;

    const keys = Object.keys(this.players);

    // check each players for collisions
    for (let i = 0; i < keys.length; i++) {
      const player = this.players[keys[i]];

      this.checkCollision(player);
    }

    // filter out non active bombs and create new ones
    this.filterBombs();
    this.createBombs(this.dt);
  }
}


module.exports = Game;
