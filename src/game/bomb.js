class Bomb {
  constructor() {
    this.pos = {
      x: Math.floor((Math.random() * 460) + 20),
      y: Math.floor((Math.random() * 460) + 20),
    };
    this.fuse = 0;
    this.radius = 0; // temp indication of when its about to explode
    this.exploding = false;
    this.explosionRadius = 60;
    this.explosionDur = 1; // 1 sec
    this.active = true;
    this.update = this.update.bind(this);
  }

  // 
  update(dt) {
    if (!this.exploding) {
      // update fuse and radius
      // check if the bomb should start exploding

      // TO DO reverse fuse to decrease
      this.fuse += dt;
      this.radius = Math.min(this.fuse * 20, this.explosionRadius);

      this.exploding = this.fuse > 3; // 3 sec fuse
    } else {
      // update explosion duration and deactive bomb once done
      this.explosionDur -= dt;

      this.active = this.explosionDur > 0;
    }
  }
}

module.exports = Bomb;
