function Ray(pos,dir) {
    this.pos = pos;
    this.dir = dir;
    this.len = Infinity;
  }
  
  Ray.prototype.draw = function() {
    pg.push();
    pg.translate(this.pos.x, this.pos.y);
    pg.rotate(this.dir);
    pg.noFill();
    pg.strokeWeight(2);
    pg.stroke(255,50);
    pg.line(0,0,this.len,0);
  
    pg.pop();
  
  } 
  Ray.prototype.findNearestWall = function() {
    let record = 10000;
    let pLookAt = createVector(1000,0);
    pLookAt.rotate(this.dir);
    pLookAt.add(this.pos);
    
    for (var x = 0; x < cells.length; x++) {
      let cell = cells[x];
      for (var w = 0; w < 4; w++) {
        if (cell.walls[w] === true) {
          var wx1 = 0;
          var wy1 = 0;
          var wx2 = 0;
          var wy2 = 0;
          if (w===0) {
            wx1 = cell.x*cellWidth; //left
            wy1 =cell.y*cellWidth; //top
          
            wx2 = cell.x*cellWidth +cellWidth;//right 
            wy2 = cell.y*cellWidth; // top
          }
          if (w===1) {
            wx1 = cell.x*cellWidth + cellWidth; // right
            wy1 = cell.y*cellWidth; // top
  
            wx2 = cell.x*cellWidth + cellWidth; // right
            wy2 = cell.y*cellWidth + cellWidth; // bottom
  
          }
          if (w===2) {
            wx1 = cell.x*cellWidth; // left
            wy1  = cell.y*cellWidth + cellWidth; // bottom
            
            wx2 = cell.x*cellWidth + cellWidth; // right
            wy2 = cell.y*cellWidth + cellWidth; // bottom
          }
          if (w===3) {
            
            wx1 = cell.x*cellWidth; //left
            wy1 = cell.y*cellWidth; //top
            
            wx2 = cell.x*cellWidth; //left
            wy2 = cell.y*cellWidth + cellWidth; //bottom
          }
          
          let result;
          //if (result = intersectP(this.pos.x, this.pos.y, pLookAt.x, pLookAt.y, wx1, wy1, wx2, wy2)) {          
          if (result =cast( wx1, wy1, wx2, wy2, this.pos.x, this.pos.y, pLookAt.x, pLookAt.y)) {          
            result.sub(this.pos);
            var resultLen = result.mag();
            
            if (resultLen < record) {
              record = resultLen;
            }
          }
        }
      }
      
      this.len = record;
      
    }
  }
  function cast(x1,y1,x2,y2,x3,y3,x4,y4) {
  
      const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
      if (den == 0) {
        return;
      }
  
      const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
      const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
      if (t > 0 && t < 1 && u > 0) {
        const pt = createVector();
        pt.x = x1 + t * (x2 - x1);
        pt.y = y1 + t * (y2 - y1);
        return pt;
      } else {
        return;
      }
    }
  
  function intersectionPt(x1,y1,x2,y2,x3,y3,x4,y4){
    
    var intx = 0.0;
    var inty = 0.0;
      var uA,uB;
    var den,numA,numB;
  
    den  = (y4-y3) * (x2-x1) - (x4-x3) * (y2-y1);
    numA = (x4-x3) * (y1-y3) - (y4-y3) * (x1-x3);
    numB = (x2-x1) * (y1-y3) - (y2-y1) * (x1-x3);
    
    
    //Coincident? - If true, displays intersection in center of line segment
     if (abs(numA) == 0 && abs(numB) == 0 && abs(den) == 0) {
        intx = (x1 + x2) / 2;
        inty = (y1 + y2) / 2;
        return createVector(intx,inty);
     }
  
     //Parallel? - No intersection
     if (abs(den) == 0) {
        intx = 0;
        inty = 0;
        return(false);
     }
  
     //Intersection?
     uA = numA / den;
     uB = numB / den;
    
     //If both lie w/in the range of 0 to 1 then the intersection point is within both line segments.
     if (uA < 0 || uA > 1 || uB < 0 || uB > 1) {
        intx = 0;
        inty = 0;
        return(false);
     }
     intx = x1 + uA * (x2 - x1);
     inty = y1 + uA * (y2 - y1);
     return createVector(intx,inty);
  }
  