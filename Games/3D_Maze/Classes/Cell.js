
function Cell(x,y, r, type) {
    this.x = x; 
    this.y = y;
    this.r = r;
    this.walls  = [true,true,true,true];
    this.visited = false;
    this.type = type || "default";
    
  }
  
  Cell.prototype.drawBackground = function() {
     var cellIndex = getIndex(this.x, this.y)
    
    var x1 = this.x * cellWidth;
    var y1 = this.y * cellWidth;
    if (posHistory.indexOf(cellIndex) > -1) {
      mg.fill(BG_COLOR)
    } else {
      mg.fill(0);
    }
    
    mg.rect(x1,y1,cellWidth,cellWidth);
    
  }
  Cell.prototype.draw = function() {
    var x1 = this.x * cellWidth;
    var y1 = this.y * cellWidth;
    var x2 = x1 + this.r*2;
    var y2 = y1 + this.r*2;
   
    mg.noFill();
    mg.stroke(WALL_COLOR);  
    mg.strokeWeight(wallWidth);
    
    if (this.walls[0]) {
      // top
      mg.line(x1,y1,x2,y1);
    }
    if (this.walls[1]) {
      // right    
      mg.line(x2,y1,x2,y2);
    }
    if (this.walls[2]) {
      //bottom
      mg.line(x1,y2,x2,y2);
    }
    if (this.walls[3]) {
      //left
      mg.line(x1,y1,x1,y2);
    }
    
    if (this.type == "end") {
      mg.noStroke();
      mg.fill(TARGET_COLOR);
      mg.ellipse(x1 + cellWidth /2, y1 + cellWidth/2, cellWidth/2);
    }
  }
  Cell.prototype.removeWallBetween = function(other) {
    var dx = this.x - other.x;
    var dy = this.y - other.y;
    if (dx == 1 && dy == 0) {
      // remove left wall
      this.walls[3] = false;
      other.walls[1] = false;
    } else if (dx == -1 && dy == 0) {
      // remove right wall
      this.walls[1] = false;
      other.walls[3] = false;
    } else if (dy == 1 && dx == 0) {
      // remove bottom wall
      this.walls[0] = false;
      other.walls[2] = false;
    } else if (dy == -1 && dx == 0) {
      // remove top wall    
      this.walls[2] = false;
      other.walls[0] = false;
    }
  }