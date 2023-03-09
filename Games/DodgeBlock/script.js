function setup() {
 if(windowWidth*5/8 > windowHeight) {
  createCanvas(windowHeight*8/5, windowHeight);
  } else{
    createCanvas(windowWidth, windowWidth*5/8);
  }
  textAlign(CENTER, CENTER);
  frameRate(60);
}

var gravity = 0.3;

var scene = "MENU";

var camY = 0;

var offGround = 10;
var timeSinceJump = 0;
var jumps = 0;
var framesPerBlock;
var score;
var scoreCoins = 0;
var frameDiff = 0;
var jKeyLetGo = 455;

function rectrect(rect1, rect2) {
  return ( ((rect1.x <= rect2.x) && (rect2.x <= rect1.x + rect1.w)) ||
             ((rect2.x <= rect1.x) && (rect1.x <= rect2.x + rect2.w)) ) &&
           ( ((rect1.y <= rect2.y) && (rect2.y <= rect1.y + rect1.h)) ||
             ((rect2.y <= rect1.y) && (rect1.y <= rect2.y + rect2.h)) );
}

function windowResized() {
   if(windowWidth*5/8 > windowHeight) {
    resizeCanvas(windowHeight*8/5, windowHeight);
  } else{
    resizeCanvas(windowWidth, windowWidth*5/8);
  }
}

function gameOver() {
  scene = "DEAD";
  pop();
  scale(width / 800, height / 500);
  noStroke();
  background(220);
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(60);
  textStyle(BOLD);
  text("Game Over", 400, 50);
  textAlign(LEFT, BOTTOM);
  textSize(40);
 
  
  textAlign(CENTER, CENTER);
  textSize(70);
  text("Click to play again.", 400, 450);
  textStyle(NORMAL);
}

var keys = [];
function keyPressed() {
  keys[keyCode] = true;
}
function keyReleased() {
  keys[keyCode] = false;
}

var Player = {
  x: 385,
  y: 270,
  w: 30,
  h: 30,
  yVel: 0,
  xVel: 0,

  hMov: 1.25,
  shieldTimer: 0,
  hTimer: 0,
  vTimer: 0,
  dTimer: 0,
  powerups: []
}

Player.jump = function() {
 
  if((offGround < 3 && timeSinceJump > 2) ||(this.dTimer > 0 && jumps < 2 && jKeyLetGo === 1)) {
  
    if(this.vTimer > 0) {
      this.yVel = 9;
    } else {
      this.yVel = 8;
    }
    timeSinceJump = 0;
    jumps++;
  }
}
Player.walk = function(dir) {
  this.xVel += dir;
}

Player.walkedInPlatform = function() {
  
  for(var i = 0; i < platforms.length; i++) {
 
    slope = 0;
    while(slope < 20 && platforms[i].checkCollision()) {
      this.y-=0.2;
      slope++;
    }
    if(slope === 20) {
      
      this.x -= this.xVel;
      this.xVel = 0;
      this.y += slope*0.2;
    }
  }
}

Player.updateX = function() {
  this.originalPos = this.x;
  this.xVel *= 0.8;
  this.x += this.xVel;
  this.x = constrain(this.x, -100, 900-this.w)
}
Player.updateY = function() {
  this.originalPos = Player.y;
  if(this.yVel < 4 || keys[UP_ARROW] || keys[87]) {//to make higher jumps the longer the up arrow is pressed
    this.yVel -= gravity;
  } else {
    this.yVel -= gravity * 2;
  }
  this.y -= this.yVel;
}
Player.draw = function() {
  noStroke();
  fill(255, 0, 0);
  rect(this.x, this.y, this.w, this.h, this.w / 10);
  fill(0);
  
  //jump costumes
  if(this.yVel > 0.5) {
    //jump looking right
    if(this.xVel > 0.8) {
      
      //eyes
      rect(this.x + this.w * 0.3, this.y + this.h * 0.22, this.w * 0.15, this.h * 0.15);
      rect(this.x + this.w * 0.75, this.y + this.h * 0.22, this.w * 0.15, this.h * 0.15);
      
      //mouth
      rect(this.x + this.w * 0.40, this.y + this.h * 0.54, this.w * 0.4, this.h * 0.25);
    } else if(this.xVel < -0.8) {//jump looking left
      
      //eyes
      rect(this.x + this.w * 0.1, this.y + this.h * 0.22, this.w * 0.15, this.h * 0.15);
      rect(this.x + this.w * 0.55, this.y + this.h * 0.22, this.w * 0.15, this.h * 0.15);
      
      //mouth
      rect(this.x + this.w * 0.20, this.y + this.h * 0.54, this.w * 0.4, this.h * 0.25);
    } else {//jump regular
      
      //eyes
      rect(this.x + this.w * 0.2, this.y + this.h * 0.22, this.w * 0.15, this.h * 0.15);
      rect(this.x + this.w * 0.65, this.y + this.h * 0.22, this.w * 0.15, this.h * 0.15);
      
      //mouth
      rect(this.x + this.w * 0.30, this.y + this.h * 0.54, this.w * 0.4, this.h * 0.25);
    }
  } else if(this.yVel < -3.3) {//falling
    //falling looking right
    if(this.xVel > 0.8) {
      
      //eyes
      rect(this.x + this.w * 0.3, this.y + this.h * 0.43, this.w * 0.15, this.h * 0.15);
      rect(this.x + this.w * 0.75, this.y + this.h * 0.43, this.w * 0.15, this.h * 0.15);
      
      //mouth
      rect(this.x + this.w * 0.40, this.y + this.h * 0.73, this.w * 0.4, this.h * 0.25);
    } else if(this.xVel < -0.8) {//falling looking left
      
      //eyes
      rect(this.x + this.w * 0.1, this.y + this.h * 0.43, this.w * 0.15, this.h * 0.15);
      rect(this.x + this.w * 0.55, this.y + this.h * 0.43, this.w * 0.15, this.h * 0.15);
      
      //mouth
      rect(this.x + this.w * 0.20, this.y + this.h * 0.73, this.w * 0.4, this.h * 0.25);
    } else {//falling regular
      
      //eyes
      rect(this.x + this.w * 0.2, this.y + this.h * 0.43, this.w * 0.15, this.h * 0.15);
      rect(this.x + this.w * 0.65, this.y + this.h * 0.43, this.w * 0.15, this.h * 0.15);
      
      //mouth
      rect(this.x + this.w * 0.30, this.y + this.h * 0.73, this.w * 0.4, this.h * 0.25);
    }
  } else {
    //looking right
    if(this.xVel > 0.8) {
      
      //eyes
      rect(this.x + this.w * 0.3, this.y + this.h / 3, this.w * 0.15, this.h * 0.15);
      rect(this.x + this.w * 0.75, this.y + this.h / 3, this.w * 0.15, this.h * 0.15);
      
      //mouth
      rect(this.x + this.w * 0.40, this.y + this.h * 2 / 3, this.w * 0.4, this.h * 0.25);
    } else if(this.xVel < -0.8) {//looking left
      //eyes
      rect(this.x + this.w * 0.1, this.y + this.h / 3, this.w * 0.15, this.h * 0.15);
      rect(this.x + this.w * 0.55, this.y + this.h / 3, this.w * 0.15, this.h * 0.15);
      
      //mouth
      rect(this.x + this.w * 0.20, this.y + this.h * 2 / 3, this.w * 0.4, this.h * 0.25);
    } else {//regular
      //eyes
      rect(this.x + this.w * 0.2, this.y + this.h / 3, this.w * 0.15, this.h * 0.15);
      rect(this.x + this.w * 0.65, this.y + this.h / 3, this.w * 0.15, this.h * 0.15);
      
      //mouth
      rect(this.x + this.w * 0.30, this.y + this.h * 2 / 3, this.w * 0.4, this.h * 0.25);
    }
  }
  if(this.shieldTimer > 0) {
    //shield ellipse
    noFill();
    strokeWeight(this.w/15);
    stroke(27, 209, 130);
    ellipse(this.x + this.w / 2, this.y + this.h / 2, this.w*1.414, this.h*1.414);
  }
}

function shield(x, y, w, h) {
  this.type = "I";
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.yVel = 0;
  this.timer = 0;
  this.draw = function() {
    stroke(27, 209, 130);
    noFill();
    ellipse(this.x+this.w/2, this.y+this.h/2, this.w, this.h);
  }
}
function hSpeed(x, y, w, h) {
  this.type = "H";
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.yVel = 0;
  this.timer = 0;
  this.draw = function() {
    textSize(this.w/2);
    strokeWeight(this.w/10);
    stroke(0);
    fill(163, 209, 27);
    rect(this.x, this.y, this.w, this.h);
    fill(0);
    text("<->", this.x+this.w/2, this.y+this.h/2);
  }
}
function dJump(x, y, w, h) {
  this.type = "D";
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.yVel = 0;
  this.timer = 0;
  this.draw = function() {
    textSize(this.w/2);
    strokeWeight(this.w/10);
    stroke(0);
    fill(163, 209, 27);
    rect(this.x, this.y, this.w, this.h);
    fill(0);
    text("↑↑", this.x+this.w/2, this.y+this.h/2);
  }
}
function vSpeed(x, y, w, h) {
  this.type = "V";
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.yVel = 0;
  this.timer = 0;
  this.draw = function() {
    textSize(this.w);
    strokeWeight(this.w/10);
    stroke(0);
    fill(163, 209, 27);
    rect(this.x, this.y, this.w, this.h);
    fill(0);
    text("↕", this.x+this.w/2, this.y+this.h/2);
  }
}
function coin(x, y, w, h) {
  this.type = "S";
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.yVel = 0;
  this.timer = 0;
  this.draw = function() {
    strokeWeight(this.w/10);
    stroke(186, 159, 0);
    fill(255, 215, 0);
    ellipse(this.x+this.w/2, this.y+this.h/2, this.w, this.h);
    textSize(this.w/3);
    fill(0);
    noStroke();
    text("+200", this.x + this.w/2, this.y + this.h / 2)
  }
}
var powerups = [];

function Block(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.yVel = 0;
  this.originalPos;
  this.draw = function() {
    if(this.y+camY < -this.h) {
      fill(255, 0, 0);
      noStroke();
      rect(this.x, -camY, this.w, 5);
    }
    strokeWeight(this.w/30);
    stroke(50);
    fill(222,184,135);
    rect(this.x, this.y, this.w, this.h, this.w/20);
  }
  this.update = function() {
    this.originalPos = this.y;
    this.yVel += gravity;
    this.y += this.yVel;
  }
}
var blocks = [];
blocks.add = function(x, y, w, h) {blocks.push(new Block(x, y, w, h))};
var Ground = {
  x:-100, y:300, w:1000, h:900
}
//}//the reset function closing brace
//reset();
function draw() {
  switch(scene) {
    case "MENU":
      scale(width/800, height/500);
      background(215, 236, 250);
      fill(222,184,135);
      stroke(50);
      strokeWeight(2);
      rect(30, 100, 60, 40, 3);
      rect(710, 100, 60, 40, 3);
      strokeWeight(3);
      line(40, 50, 40, 90);
      line(60, 40, 60, 90);
      line(80, 50, 80, 90);
      line(720, 50, 720, 90);
      line(740, 40, 740, 90);
      line(760, 50, 760, 90);
      noStroke();
      fill(0);
      textSize(80);
      text("Click to start", 400, 200);
      textSize(40);
      text("Arrow keys or WASD to move.\nAvoid falling blocks and don't get trapped.", 400, 400)
      if(mouseIsPressed) {
        frameDiff = frameCount;
        scene = "GAME";
      }
      break;
    case "GAME":
      displayShield = new shield(0.2*width/30, height/40, width/40, height/25);
      displayH = new hSpeed(1.2*width/30, height/40, width/40, height/25);
      displayD = new dJump(2.2*width/30, height/40, width/40, height/25);
      displayV = new vSpeed(3.2*width/30, height/40, width/40, height/25);
      framesPerBlock = round(12000000/((frameCount-frameDiff)*350+100000));
      if(Player.hTimer > 0) {
        Player.hMov = 2;
      } else {
        Player.hMov = 1.25;
      }
      jKeyLetGo++;
      if(keys[UP_ARROW] || keys[87]) {
        Player.jump();
      } else {
        jKeyLetGo = 0;
      }
      if(keys[LEFT_ARROW] || keys[65]) {
        Player.walk(-Player.hMov);
      }
      if(keys[RIGHT_ARROW] || keys[68]) {
        Player.walk(Player.hMov);
      }
      if(keys[DOWN_ARROW] || keys[83]) {
        if(Player.vTimer > 0) {
          Player.yVel -= 0.6;
        }
      }
      background(176, 232, 255);
      push();
      scale(width/800, height/500);
      translate(-constrain(Player.x-400, -100, 100), camY);
      noStroke();
      rect(Ground.x, Ground.y, Ground.w, Ground.h);
      if((frameCount-frameDiff) % framesPerBlock === 0) {
        blocks.add(random(-100, 840), -camY-280+1000/framesPerBlock, 60, 40);
        switch(floor(random(0, 70))) {
          case 0:
            powerups.push(new shield(random(-100, 840), -camY-40, 20, 20));
            break;
          case 1:
            powerups.push(new hSpeed(random(-100, 840), -camY-40, 20, 20));
            break;
          case 2:
            powerups.push(new dJump(random(-100, 840), -camY-40, 20, 20));
            break;
          case 3:
            powerups.push(new vSpeed(random(-100, 840), -camY-40, 20, 20));
            break;
          case 4:
            powerups.push(new coin(random(-100, 840), -camY-40, 20, 20));
            break;
        }
      }
      for(var i = 0; i < blocks.length; i++) {
        blocks[i].update();
        if(rectrect(blocks[i], Ground)) {
          blocks[i].yVel = 0;
          while(rectrect(blocks[i], Ground)) {
            blocks[i].y-=0.2;

          }            
        }
        for(var j = i - 1; j > -1; j--) {
          if(rectrect(blocks[i], blocks[j])) {
            blocks[i].yVel = 0;
            while(rectrect(blocks[i], blocks[j])) {
              blocks[i].y-=0.2;
            }
          }
        }
        blocks[i].draw();
        if(blocks[i].y > 500-camY) {
          }
      }
      for(i = 0; i < blocks.length; i++) {
        if(rectrect(Player, blocks[i])) {
          if(Player.y<blocks[i].y) {
            while(rectrect(Player, blocks[i])) {//normal jump on top of a block
              Player.y -= 0.2;
            }
            Player.yVel = 0;
            offGround = 0;
            jumps = 0;
          } else if(blocks[i].yVel > 3) {//squished by a falling block
            if(Player.shieldTimer > 0) {
              blocks.splice(i, 1);
              i--;
              continue;
            }
            scene = "DEAD";
          } else {
            Player.yVel = 0;
            while(rectrect(Player, blocks[i])) {
              Player.y += 0.2;
            }
          }
        }
      }

      Player.shieldTimer--;
      Player.hTimer--;
      Player.vTimer--;
      Player.dTimer--;

      Player.updateX();
      for(i = 0; i < blocks.length; i++) {
        if(rectrect(Player, blocks[i])) {
          Player.x = Player.originalPos;
          Player.xVel = 0;
        }
      }
      Player.updateY();
      if(rectrect(Player, Ground)) {
        while(rectrect(Player, Ground)) {//normal jump on top of a block
              Player.y -= 0.2;
            }
        Player.yVel = 0;
        offGround = 0;
      }
      for(i = 0; i < blocks.length; i++) {
        if(rectrect(Player, blocks[i])) {
          if(Player.y<blocks[i].y) {
            while(rectrect(Player, blocks[i])) {//normal jump on top of a block
              Player.y -= 0.2;
            }
            Player.yVel = 0;
            offGround = 0;
            jumps = 0;
          } else if(blocks[i].yVel > 3) {//squished by a falling block
            if(Player.shieldTimer > 0) {
              blocks.splice(i, 1);
              i--;
              continue;
            }
            scene = "DEAD";
          } else {//probably ceiling
            Player.yVel = 0;
            while(rectrect(Player, blocks[i])) {//normal jump on top of a block
              Player.y += 0.2;
            }
          }
        }
      }
      Player.draw();
      for(i = 0; i < powerups.length; i++) {
        powerups[i].yVel+=gravity;
        powerups[i].y += powerups[i].yVel;
        //checks collision with ground
        if(rectrect(powerups[i], Ground)) {
            powerups[i].yVel = 0;
            while(rectrect(powerups[i], Ground)) {
              powerups[i].y-=0.2;

            }
          }
        //checks collision with blocks
        for(j = 0; j < blocks.length; j++) {
          if(rectrect(powerups[i], blocks[j])) {
            powerups[i].yVel = 0;
            while(rectrect(powerups[i], blocks[j])) {
              powerups[i].y-=0.2;

            }
          }
        }

        if(powerups[i].timer < 240 || frameCount % 16 < 8) {
          powerups[i].draw();
        }

        if(rectrect(powerups[i], Player)) {
          switch(powerups[i].type) {
            case "I":
              Player.shieldTimer = constrain(Player.shieldTimer, 0, 99999);
              Player.shieldTimer += 600;
              break;
            case "H":
              Player.hTimer = constrain(Player.hTimer, 0, 99999);
              Player.hTimer += 600;
              break;
            case "D":
              Player.dTimer = constrain(Player.dTimer, 0, 99999);
              Player.dTimer += 600;
              break; 
            case "V":
              Player.vTimer = constrain(Player.vTimer, 0, 99999);
              Player.vTimer += 1000;
              break;
            case "S":
              scoreCoins += 200;
              break;
          }
          Player.powerups.push(powerups[i].type);
          powerups.splice(i, 1);
       
          i--;
          continue;
        }
        powerups[i].timer++;
        //5 second lifetime
        if(powerups[i].timer > 
           300) {
          powerups.splice(i, 1);
          i--;
        }
      }
      offGround++;
      timeSinceJump++;
      pop();
      camY += 2/framesPerBlock;

      //checks if the player is really high in the frame
      if(Player.y+camY < 150) {
        //makes it so that the camY can never go down
        if(-Player.y + 150 > camY) {
          //bases the camera off the player position when it gains a new high jump
          camY = -Player.y + 150;
        }

      }
      score = round(camY) + blocks.length + scoreCoins;
      if(Player.y> -camY + 500) {
        scene = "DEAD";
      }
      //powerup indicators (at top left)
      if(Player.shieldTimer > 120 || Player.shieldTimer > 0 && Player.shieldTimer < 120 && frameCount % 16 < 8) {
        displayShield.draw();
      }
      if(Player.hTimer > 120 || Player.hTimer > 0 && Player.hTimer < 120 && frameCount % 16 < 8) {
        displayH.draw();
      }
      if(Player.dTimer > 120 || Player.dTimer > 0 && Player.dTimer < 120 && frameCount % 16 < 8) {
        displayD.draw();
      }
      if(Player.vTimer > 120 || Player.vTimer > 0 && Player.vTimer < 120 && frameCount % 16 < 8) {
        displayV.draw();
      }
      noStroke();
      fill(0);
      textAlign(RIGHT, CENTER);
      // textSize(25) on a "normal" sized canvas
      textSize(width/32);
      text("Score: " + score, width*0.99, height/30);
      textAlign(CENTER, CENTER);
      break;
    case "DEAD":
      gameOver();
      if(mouseIsPressed) {
        textAlign(CENTER, CENTER);
        rectMode(CORNER);
        blocks = [];
        blocks.add = function(x, y, w, h) {blocks.push(new Block(x, y, w, h))};
        powerups = [];
        
        score = 0;
        
        Player.x = 385;
        Player.y = 270;
        Player.yVel = 0;
        Player.xVel = 0;
        Player.hMov = 0;
        Player.shieldTimer = 0;
        Player.vTimer = 0;
        Player.hTimer = 0;
        Player.dTimer = 0;
        
        camY = 0;
        scoreCoins = 0;
        offGround = 10;
        timeSinceJump = 0;
        jumps = 0;

        frameDiff = frameCount;
        scene = "GAME";
      }
  }
}