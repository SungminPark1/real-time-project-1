const utils = require('../utils.js');

class Player {
  constructor(user) {
    this.name = user.name;
    this.pos = {
      x: 250,
      y: 250,
    };
    this.radius = 20;
    this.health = 3;
    this.score = 0;
    this.color = {
      r: utils.getRandomInt(256),
      g: utils.getRandomInt(256),
      b: utils.getRandomInt(256),
    };
    this.placeBomb = false;
    this.cooldown = 0;
  }

  update(user) {
    this.pos = user.pos;
    this.placeBomb = user.placeBomb;
  }
}

module.exports = Player;
