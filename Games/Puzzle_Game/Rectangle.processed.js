var Rectangle = (function() {
    function Rectangle(pos, img, i) {
      this.pos = pos;
      this.img = img;
      this.i = i;
      this.drawWithFilter = false;
      this.width = img.width;
      this.height = img.height;
    }
    Rectangle.prototype.draw = function() {
      image(this.img, this.pos.x, this.pos.y);
    };
    Rectangle.prototype.hits = function(hitpos) {
      if (hitpos.x > this.pos.x &&
        hitpos.x < this.pos.x + this.width &&
        hitpos.y > this.pos.y &&
        hitpos.y < this.pos.y + this.height) {
        return true;
      }
      return false;
    };
    return Rectangle;
  }());