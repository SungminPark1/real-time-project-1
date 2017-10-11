function circlesDistance(c1, c2) {
  const dx = c2.x - c1.x;
  const dy = c2.y - c1.y;
  const distance = Math.sqrt((dx * dx) + (dy * dy));
  return distance;
}

class createGame {
  constructor(data) {
    this.room = data;
    this.ended = false;
    this.started = false;
    this.players = {};
    this.bombs = [];
    this.time = new Date().getTime();
    this.dt = 0;
  }

  addPlayer(user) {
    this.players[user.name] = {
      name: user.name,
      pos: {
        x: 250,
        y: 250,
      },
      radius: 20,
      score: 0,
      color: {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256),
      },
    };
  }

  deletePlayer(name) {
    delete this.players[name];
  }

  updatePlayerPos(user) {
    this.players[user.name].pos.x = user.pos.x;
    this.players[user.name].pos.y = user.pos.y;
  }

  createBombs() {
    if (this.bombs.length < 3) {
      this.bombs.push({
        pos: {
          x: Math.floor((Math.random() * 460) + 20),
          y: Math.floor((Math.random() * 460) + 20),
        },
        radius: 5,
        active: true,
        points: 15,
      });
    }
  }

  updateBomb(bomb) {
    const updatedBomb = bomb;

    updatedBomb.radius = Math.min(bomb.radius + this.dt, 20);
    updatedBomb.points = Math.max(bomb.points - this.dt, 1);
  }

  filterBombs() {
    this.bombs = this.bombs.filter(bomb => bomb.active);
  }

  checkCollision(user) {
    const player = user;
    // check player collision with bombs
    for (let i = 0; i < this.bombs.length; i++) {
      const bomb = this.bombs[i];

      if (circlesDistance(player.pos, bomb.pos) < (player.radius + bomb.radius)) {
        player.score += bomb.points;
        bomb.active = false;
      } else {
        this.updateBomb(bomb);
      }
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
    this.createBombs();
  }
}


module.exports = createGame;
