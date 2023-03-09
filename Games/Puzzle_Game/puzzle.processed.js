var Puzzle = (function() {
    function Puzzle(x, y, img, side) {
      this.x = x;
      this.y = y;
      this.img = img;
      this.side = side;
      this.isDragging = false;
      this.width = img.width;
      this.height = img.height;
      this.rects = [];
      this.w = this.width / side;
      this.h = this.height / side;
      this.placeImages();
    }
    Puzzle.prototype.placeImages = function() {
      for (var y = 0; y < this.side; y++) {
        for (var x = 0; x < this.side; x++) {
          var img = createImage(this.w, this.h);
          img.copy(this.img, this.w * x, this.h * y, this.w, this.h, 0, 0, this.w, this.h);
          var pos = this.randomPos(this.w, this.h);
          var index = x + y * this.side;
          this.rects.push(new Rectangle(pos, img, index));
        }
      }
    };
    Puzzle.prototype.randomPos = function(marginRight, marginBottom) {
      return createVector(random(0, windowWidth - marginRight), random(0, windowHeight - marginBottom));
    };
    Puzzle.prototype.draw = function() {
      rect(this.x - 1, this.y - 1, this.width + 1, this.height + 1);
      noFill();
      this.rects.forEach(function(r) {
        return r.draw();
      });
    };
    Puzzle.prototype.mousePressed = function(x, y) {
      var _this = this;
      var m = createVector(x, y);
      var index;
      this.rects.forEach(function(r, i) {
        if (r.hits(m)) {
          _this.clickOffset = p5.Vector.sub(r.pos, m);
          _this.isDragging = true;
          _this.dragRec = r;
          index = i;
        }
      });
      if (this.isDragging) {
        this.putOnTop(index);
      }
    };
    Puzzle.prototype.mouseDragged = function(x, y) {
      if (this.isDragging) {
        var m = createVector(x, y);
        this.dragRec.pos.set(m).add(this.clickOffset);
      }
    };
    Puzzle.prototype.mouseReleased = function() {
      if (this.isDragging) {
        this.isDragging = false;
        this.snapTo(this.dragRec);
        this.checkEndGame();
      }
    };
    Puzzle.prototype.putOnTop = function(index) {
      this.rects.splice(index, 1);
      this.rects.push(this.dragRec);
    };
    Puzzle.prototype.snapTo = function(r) {
      var dx = this.w / 2;
      var dy = this.h / 2;
      var x2 = this.x + this.width;
      var y2 = this.y + this.height;
      for (var y = this.y; y < y2; y += this.h) {
        for (var x = this.x; x < x2; x += this.w) {
          if (this.isOnGrid(r.pos.x, x, dx) && this.isInsideFrame(r.pos.y, this.y, y2 - this.h, dy)) {
            r.pos.x = x;
          }
          if (this.isOnGrid(r.pos.y, y, dy) && this.isInsideFrame(r.pos.x, this.x, x2 - this.w, dx)) {
            r.pos.y = y;
          }
        }
      }
    };
    Puzzle.prototype.isOnGrid = function(actualPos, gridPos, d) {
      return actualPos > gridPos - d && actualPos < gridPos + d;
    };
    Puzzle.prototype.isInsideFrame = function(actualPos, frameStart, frameEnd, d) {
      return actualPos > frameStart - d && actualPos < frameEnd + d;
    };
    Puzzle.prototype.checkEndGame = function() {
      var _this = this;
      var nrCorrectNeeded = this.side * this.side;
      var nrCorrect = 0;
      this.rects.forEach(function(r) {
        var correctIndex = r.i;
        var actualIndex = (r.pos.x - _this.x) / _this.w + (r.pos.y - _this.y) / _this.h * _this.side;
        if (actualIndex === correctIndex) {
          nrCorrect += 1;
        }
      });
      if (nrCorrect === nrCorrectNeeded) {
        console.log("Good Job!");
      } else {
        console.log("Right places: " + nrCorrect);
      }
    };
    return Puzzle;
  }());