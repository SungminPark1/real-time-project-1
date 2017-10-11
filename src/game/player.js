class Player {
  constructor(user) {
    this.name = user.name;
    this.pos = {
      x: 250,
      y: 250,
    };
    this.radius = 20;
    this.score = 0;
    this.color = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    };
  }

  update(user) {
    this.pos = user.pos;
  }
}

module.exports = Player;
