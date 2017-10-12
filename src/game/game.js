const Player = require('./player.js');
const Bomb = require('./bomb.js');
const utils = require('../utils.js');

class Game {
  constructor(data) {
    this.room = data;
    this.ended = false;
    this.started = false;
    this.players = {};
    this.bombs = [];
    this.bombTimer = 1;
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

    if (this.currentTimer < 0 && this.bombs.length <= 30) {
      this.bombs.push(new Bomb(utils.getRandomInt(3)));

      this.bombTimer = Math.max(this.bombTimer * 0.98, 0.1);
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
        if (utils.circlesDistance(player.pos, bomb.pos) < (player.radius + bomb.explosionRadius)) {
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

      // check skillUsed and cooldown when dead
      // check collision when alive
      if (player.health <= 0) {
        if (player.cooldown <= 0 && player.skillUsed) {
          player.cooldown = 4;
          this.bombs.push(new Bomb(2));
        } else if (player.cooldown > 0) {
          player.cooldown -= this.dt;
        }
      } else {
        this.checkCollision(player);
      }
    }

    // filter out non active bombs and create new ones
    this.filterBombs();
    this.createBombs(this.dt);
  }
}


module.exports = Game;
