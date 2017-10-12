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
    this.clientBombs = [];
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

  checkCollision(keys) {
    // loop through bombs
    for (let i = 0; i < this.bombs.length; i++) {
      const bomb = this.bombs[i];

      // check collision with player if exploding
      if (bomb.exploding) {
        for (let j = 0; j < keys.length; j++) {
          const player = this.players[keys[j]];

          if (player.health > 0) {
            const distance = utils.circlesDistance(player.pos, bomb.pos);
            if (distance < (player.radius + bomb.explosionRadius)) {
              player.score = 0;
            }
          }
        }
      }

      bomb.update(this.dt);
    }
  }

  update() {
    const now = new Date().getTime();
    const keys = Object.keys(this.players);

    // in seconds
    this.dt = (now - this.time) / 1000;
    this.time = now;

    // bomb update in check collision
    this.checkCollision(keys);

    // check player skill if dead
    // update players score
    for (let j = 0; j < keys.length; j++) {
      const player = this.players[keys[j]];

      if (player.health <= 0) {
        if (player.cooldown <= 0 && player.placeBomb) {
          player.cooldown = 4;
          this.bombs.push(new Bomb(2));
        } else if (player.cooldown > 0) {
          player.cooldown -= this.dt;
        }
      } else {
        player.score++;
      }
    }
    // filter out non active bombs and create new ones
    this.filterBombs();
    this.createBombs(this.dt);

    // filter bomb data to send only necessary info
    this.clientBombs = this.bombs.map(bomb => ({
      pos: bomb.pos,
      radius: bomb.radius,
      exploding: bomb.exploding,
      explosionRadius: bomb.explosionRadius,
    }));
  }
}


module.exports = Game;
