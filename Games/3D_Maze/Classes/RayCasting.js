function RayCasting(pos, dir, w,  thickness) {
    this.fov = Math.PI/2 * 100 / 90;
    this.pos = pos;
    this.dir = dir;
    this.hSteps = w / thickness;
    this.thickness = thickness;
    this.rays = [];
    
    var aStep = this.fov/this.hSteps;
    
    for (var a = -this.fov/2; a < this.fov/2; a+= aStep) {
      this.rays.push(new Ray(this.pos, a+this.dir));
      
    }
    for (let x = 0; x < this.rays.length; x++) {
      let r = this.rays[x];
      r.findNearestWall();
    }
    
    
    this.update = function(pos) {
      this.pos = pos;
      
      
      
    }
    this.rotate = function(a) {
      this.dir += a;
    }
    
    this.draw = function() {
      colorMode(HSB);
      rg.background(50);
      rg.noStroke();
      
      rg.rectMode(CORNER);
      rg.fill(TRACK_COLOR);
      rg.rect(0,0,rg.width, rg.height/2);
      setGradient(0,0, rg.width, rg.height/2, color(CURRENT_HUE,100,100), color(CURRENT_HUE,50,50));
      
      setGradient(0,rg.height/2, rg.width, rg.height/2, color(0,0,0), color(0,0,50));
      rg.rectMode(CENTER);
      
      for (var i = 0; i < this.rays.length; i++) {
        var ray = this.rays[i];
        
        ray.draw();
        
        var h = 9/ray.len;
        var a = abs(this.dir-ray.dir);        
        var h_cor = h /Math.cos(a);
        
        
        rg.noStroke();
        var c = lerpColor(color(0),color(255), constrain(h,0,1));
        rg.fill(c);
        rg.rect(i*this.thickness + this.thickness/2, rg.height/2, this.thickness, h_cor*pg.height);      
        
      }
    }
  }
  
  
  function setGradient(x, y, w, h, c1, c2) {
    rg.noFill();
  
      // Top to bottom gradient
      for (let i = y; i <= y + h; i++) {
        let inter = map(i, y, y + h, 0, 1);
        let c = lerpColor(c1, c2, inter);
        rg.stroke(c);
        rg.line(x, i, x + w, i);
      }
  }
  
  
  
  
  