//--------------------------------------
// Updates to this game will be added soon.
//--------------------------------------

// Adjustable Variables
var SPAWN_RATE=[100,350];
var SPAWN_AMOUNT=[1,3];
var ENEMY_SPEED=[0.35,0.5];
var ENEMY_HEALTH=3;
var PLAYER_HEALTH=5;
var KILL_SCORE=100;
var HEALTH_CHANCE=2;
var HEALTH_INCREASE=1;
var SPAWN_RATE_INCREASE=0.025 // %


var score=0;
var lost=false;

// The Game class
class Game {
  constructor() {
    this.container=$('.game');
    
    // Updating
    this.updateQueue=[];
    this.update();
    
    // Controls
    this.controls=new Controls();
    
    // Dust Handler
    this.dustHandler=new DustHandler({
      parentContainer:this.container,
      startUpdating:this.startUpdating.bind(this)
    })
    
    // Powerup handler
    this.powerupHandler=new PowerupHandler({
      parentContainer:this.container
    })
    
    // The player
    this.player=new Player({
      parentContainer:this.container,
      startUpdating:this.startUpdating.bind(this),
      controls:this.controls,      
    })
    
    // Enemies
    this.enemyHandler=new EnemyHandler({
      parentContainer:this.container,
      startUpdating:this.startUpdating.bind(this),
      player:this.player,
      spawnPowerup:this.powerupHandler.spawnPowerup
    })
    
    // Collision handler
    this.collisionHandler=new CollisionHandler({
      player:this.player,
      enemies:this.enemyHandler.list,
      powerups:this.powerupHandler.list,
      startUpdating:this.startUpdating.bind(this),
      createDust:this.dustHandler.createDust
    })  
       
  }
  
  // The update loop
  update() {
    for (var i=0;i<this.updateQueue.length;i++) {
      this.updateQueue[i]();
    }
    window.requestAnimationFrame(this.update.bind(this));
  }
  
  // Add a function to the update queue
  startUpdating(func) {
    this.updateQueue.push(func);
  }
  
  // Losing
  lose() {
    this.player.el.css('display','none');
    $('.lose-interface').css('display','flex');
    $('.lose-score').html(score);
    lost=true;
  }
  
  // Restarting
  restart() {
    this.enemyHandler.reload();
    this.player.reload();
    $('.lose-interface').css('display','none');
    lost=false;
    score=0;
  }
}

// The player class
class Player {
  constructor(options) {
    // Store references
    this.controls=options.controls;
    this.parentContainer=options.parentContainer;
    
    // Dim / Pos
    this.x=window.innerWidth/2;
    this.y=window.innerHeight/2;
    this.width=50;
    this.height=50;
    this.rotation=0;
    
    // Movement
    this.xvel=0;
    this.yvel=0;
    this.friction=0.95;
    this.speed=0.666;
    
    // Bullets
    this.bullets=[];
    this.shoot();
    
    // Create the element
    this.el=this.createElement(options.parentContainer);
    
    // Health / damage
    this.health=PLAYER_HEALTH;
    this.maxHealth=PLAYER_HEALTH;
    this.color='white';    
    this.damageFlashTime=8;
    this.damageTimer=this.damageFlashTime;
    
    // Updating
    options.startUpdating(this.update.bind(this));
  }
  
  // Restarting
  reload() {
    this.health=PLAYER_HEALTH;
    this.xvel=0;
    this.yvel=0;
    this.x=window.innerWidth/2;
    this.y=window.innerHeight/2;
    this.damageTimer=10000;
    this.color='white';
    this.updateHealthBar();
    this.el.css('display','block');
  }
  
  // Create the player element
  createElement(parentContainer) {
    var el=$("<div class='player'></div>");
    parentContainer.append(el);
    return el;
  }
  
  // Uppermost updating loop
  update() {
    if (lost===false) {
      this.aim();
      this.move();
      this.boundary();
      this.updateBullets();
      this.handleDamageFlash();
      this.applyValues();
    }
  }
  
  // Apply values to dom element
  applyValues() {
    this.el.css({
      left:this.x,
      top:this.y,
      width:this.width,
      height:this.height,
      transform:`translateX(-50%) translateY(-50%) rotate(${this.rotation}rad)`,
      background:this.color
    })
  }
  
  // Aim at the mouse
  aim() {
    var mouse=this.controls.mouse;
    this.rotation=Math.atan2((mouse.y-this.y),(mouse.x-this.x));
  }
  
  // Move around!
  move() {
    // Simple physics
    this.x+=this.xvel;
    this.y+=this.yvel;
    this.xvel*=this.friction;
    this.yvel*=this.friction;
    
    // Move
    if (this.controls.right.isDown) {
      this.xvel+=this.speed;
    } else if (this.controls.left.isDown) {
      this.xvel-=this.speed;
    }
    if (this.controls.down.isDown) {
      this.yvel+=this.speed;
    } else if (this.controls.up.isDown) {
      this.yvel-=this.speed;
    }
  }
  
  // Stay on screen
  boundary() {
    var bounce=0.5;
    if (this.x-this.width/2<0) {
      this.x=this.width/2;
      this.xvel*=-bounce;
    } else if (this.x+this.width/2>window.innerWidth) {
      this.x=window.innerWidth-this.width/2;
      this.xvel*=-bounce;
    }
    if (this.y-this.height/2<0) {
      this.y=this.height/2;
      this.yvel*=-bounce;
    } else if (this.y+this.height/2>window.innerHeight) {
      this.y=window.innerHeight-this.height/2;
      this.yvel*=-bounce;
    }
  }
  
  // Shooting listener
  shoot() {
    var kickback=3.25;
    $(window).on('mousedown',function() {
      if (lost===false) {
        var x=this.x+Math.cos(this.rotation)*this.width/2;
        var y=this.y+Math.sin(this.rotation)*this.width/2;
        this.bullets.push(new Bullet({
          x:x,
          y:y,
          dir:this.rotation,
          parentContainer:this.parentContainer
        }))
        this.xvel+=Math.cos(this.rotation+Math.PI)*kickback;
        this.yvel+=Math.sin(this.rotation+Math.PI)*kickback;
      }
    }.bind(this))
  }
  
  // Update all of the bullets
  updateBullets() {
    for (var i=0;i<this.bullets.length;i++) {
      this.bullets[i].update();
      if (this.bullets[i].delete===true) {
        this.bullets[i].el.remove();
        this.bullets.splice(i, 1);
      }
    }
  }
  
  // Getting hit
  hit(angle) {
    var knockback=10;
    this.xvel+=Math.cos(angle)*knockback;
    this.yvel+=Math.sin(angle)*knockback;
    if (this.damageTimer>=this.damageFlashTime) {      
      this.health--;
      this.damageTimer=0;
      this.updateHealthBar();
      this.checkLife();
    }
  }
  
  // Turning red after you get hit
  handleDamageFlash() {
    this.damageTimer++;
    if (this.damageTimer<=this.damageFlashTime) {
      this.color='red';
    } else {
      this.color='white';
    }
  }
  
  // UPdate the health bar on the interface
  updateHealthBar() {
    $('.player-health .amount').css({
      width:(this.health/this.maxHealth*100)+'%'
    })
  }
  
  // Check if you are dead
  checkLife() {
    if (this.health<=0) {
      lose();
    }
  }
  
  // Add health (picking up health)
  addHealth(amount) {
    this.health+=amount;
    if (this.health>this.maxHealth) {
      this.health=this.maxHealth;
    }
    this.updateHealthBar();
  }
}

// The bullet class
class Bullet {
  constructor(options) {
    // Create the element
    this.el=this.createElement(options.parentContainer);    
    
    // Pos/ Dim
    this.width=17;
    this.height=35;
    this.x=options.x;
    this.y=options.y;
    
    // Flash effect
    this.createFlash(options.parentContainer);
    
    // Movement
    this.dir=options.dir;
    this.speed=25;
  }
  
  // Create the element
  createElement(parentContainer) {
    var el=$("<div class='bullet'></div>")
    parentContainer.append(el);
    return el;
  }
  
  // Create the flash
  createFlash(parentContainer) {
    var el=$("<div class='flash'></div>");
    var size=34;
    var duration=15;
    el.css({
      position:'absolute',
      left:this.x,
      top:this.y,
      width:size,
      height:size,
      transform:'translateX(-50%) translateY(-50%)',
      borderRadius:'50%',
      background:'white'
    })
    parentContainer.append(el);
    setTimeout(function() {
      el.remove();
    },duration)
  }
  
  // Update
  update() {   
    this.move();
    this.boundary();
    this.applyValues();
  }
  
  // Move it
  move() {
    this.x+=Math.cos(this.dir)*this.speed;
    this.y+=Math.sin(this.dir)*this.speed;
  }
  
  // Delete when off screen
  boundary() {
    if (this.x<0 || this.x>window.innerWidth || 
       this.y<0 || this.y>window.innerHeight) {
      this.delete=true;
    }
  }

  // Apply to dom element
  applyValues() {
    this.el.css({
      left:this.x,
      top:this.y,
      width:this.width,
      height:this.height,
      transform:`translateX(-50%) translateY(-50%) rotate(${this.dir+Math.PI/2}rad)`
    })
  }
}

// The enemy class
class Enemy {
  constructor(options) {
    // Store references
    this.player=options.player;
    this.spawnPowerup=options.spawnPowerup;
    
    // Dim / pos
    this.x=options.x || getRandom(0,window.innerWidth);
    this.y=options.y || getRandom(0,window.innerHeight);
    this.width=50;
    this.height=50;
    
    // The element
    this.el=this.createElement(options.parentContainer);
    
    // Movement
    this.xvel=0;
    this.yvel=0;
    this.friction=0.9;
    this.speed=getRandom(ENEMY_SPEED[0]*10000,ENEMY_SPEED[1]*10000)/10000;
    
    // White flash
    this.color='#120158';
    this.damageTimer=100;
    this.damageTime=4.75;
    
    // Health/damage
    this.health=ENEMY_HEALTH;
  }
  
  // Create the element
  createElement(parentContainer) {
    var el=$("<div class='enemy'></div>");
    parentContainer.append(el);
    return el;
  }
  
  // Update
  update() {
    this.move();
    this.handleFlash();
    this.applyValues();
  }
  
  // move
  move() {
    // Basic physics
    this.x+=this.xvel;
    this.y+=this.yvel;
    this.xvel*=this.friction;
    this.yvel*=this.friction;
    
    // Move towrads the player
    var dir=Math.atan2((this.player.y-this.y),(this.player.x-this.x));
    this.xvel+=Math.cos(dir)*this.speed;
    this.yvel+=Math.sin(dir)*this.speed;
  }
  
  // Getting hit
  hit(angle) {
    var kickback=2.5;
    this.xvel+=Math.cos(angle)*kickback;
    this.yvel+=Math.sin(angle)*kickback;
    this.health--;
    this.damageTimer=0;
    this.checkLife();
  }
  
  // Check if you're even still alive
  checkLife() {
    if (this.health<=0) {
      score+=KILL_SCORE;
      updateScore();
      this.rollForHealth();
      this.delete=true;
    }
  }
  
  // Check if you should spawn some health or not
  rollForHealth() {
    var roll=getRandom(0,100);
    if (roll<HEALTH_CHANCE) {
      this.spawnPowerup(this.x,this.y);
    }
  }
  
  // Handle the damage flash
  handleFlash() {
    this.damageTimer++;
    if (this.damageTimer<=this.damageTime) {
      this.color='white';
    } else {
      this.color='#120158';
    }
  }
  
  // Apply to dom element
  applyValues() {
    this.el.css({
      left:this.x,
      top:this.y,
      width:this.width,
      height:this.height,
      background:this.color
    })
  }
}

// The enemy handler
class EnemyHandler {
  constructor(options) {
    // Store references
    this.parentContainer=options.parentContainer;
    this.spawnPowerup=options.spawnPowerup;
    this.player=options.player;
    
    // The enemies
    this.list=[];
    
    // Update
    options.startUpdating(this.update.bind(this));
    
    // Generation
    this.timer=0;
    this.timerLim=0;
    this.spawnRatePercentage=100;
  }
  
  // Restarting
  reload() {
    for (var i=0;i<this.list.length;i++) {
      this.list[i].delete=true;
    }
    this.spawnRatePercentage=100;
  }
  
  // Update the enemies
  update() {
    // Individual enemies
    for (var i=0;i<this.list.length;i++) {
      this.list[i].update();
      if (this.list[i].delete===true) {
        this.list[i].el.remove();
        this.list.splice(i, 1);
      }
    }
    // Generation
    this.generate();
  }
  
  // Handle the enemy generation!
  generate() {
    this.timer++;
    if (this.timer>=this.timerLim) {
      var amount=getRandom(SPAWN_AMOUNT[0],SPAWN_AMOUNT[1]);
      for (var i=0;i<amount;i++) {
        this.spawnEnemy();
      }
      this.timer=0;
      var spawnRateMulti=this.spawnRatePercentage/100
      this.timerLim=getRandom(SPAWN_RATE[0]*spawnRateMulti,SPAWN_RATE[1]*spawnRateMulti);      
      console.log('Min: ' + SPAWN_RATE[0]*spawnRateMulti,'Max: ' + SPAWN_RATE[1]*spawnRateMulti);
    }
    
    // Increasing difficulty
    if (SPAWN_RATE[0]*(this.spawnRatePercentage/100)>50) {
      this.spawnRatePercentage-=SPAWN_RATE_INCREASE;
    }
  }
  
  // Spawn an enemy
  spawnEnemy() {    
    var side=Math.floor(getRandom(1,4));
    var x,y;
    if (side===1) { // Left
      x=-window.innerWidth*0.25;
      y=getRandom(0,window.innerHeight);
    } else if (side===2) { // Top
      x=getRandom(0,window.innerWidth);
      y=-window.innerHeight*0.25;
    } else if (side===3) { // Right
      x=window.innerWidth*1.25;
      y=getRandom(0,window.innerHeight);
    } else if (side===4) { // Bottom
      x=getRandom(0,window.innerWidth);
      y=window.innerHeight*1.25;
    }
    this.list.push(new Enemy({
      x:x,y:y,
      parentContainer:this.parentContainer,
      player:this.player,
      spawnPowerup:this.spawnPowerup
    }))
  }
}

// The collision handler
class CollisionHandler {
  constructor(options) {
    // Store references
    this.player=options.player;
    this.bullets=this.player.bullets;
    this.enemies=options.enemies;
    this.powerups=options.powerups;
    this.createDust=options.createDust;
    
    // Update
    options.startUpdating(this.update.bind(this));
  }
  
  update() {
    this.bulletToEnemy();
    this.enemyToPlayer();
    this.enemyToEnemy();
    this.collectPowerup();
  }
  
  // Enemy to Enemy
  enemyToEnemy() {
    if (this.enemies.length>1) {
      for (var i=0;i<this.enemies.length;i++) {
        var enemy1=this.enemies[i];
        for (var ia=0;ia<this.enemies.length;ia++) {
          if (ia!==i) {
            var enemy2=this.enemies[ia];
            var collisionDistance=enemy1.width/2+enemy2.width/2;
            var distance=getDistance(enemy1.x,enemy1.y,enemy2.x,enemy2.y);
            if (distance<=collisionDistance) {
              var angle=Math.atan2((enemy2.y-enemy1.y),(enemy2.x-enemy1.x))+Math.PI;
              enemy1.x=enemy2.x+Math.cos(angle)*enemy2.width;
              enemy1.y=enemy2.y+Math.sin(angle)*enemy2.width;
            }
          }
        }
      }
    }
  }
  
  // Enemies hitting the player
  enemyToPlayer() {
    for (var i=0;i<this.enemies.length;i++) {
      var enemy=this.enemies[i];
      var collisionDistance=this.player.width/2+enemy.width/2;
      if (getDistance(enemy.x,enemy.y,this.player.x,this.player.y)<=collisionDistance) {
        var angle=Math.atan2((enemy.y-this.player.y),(enemy.x-this.player.x))+Math.PI;
        this.player.hit(angle);
      }
    }
  }
  
  // Bullets hitting the enemy
  bulletToEnemy() {
    for (var i=0;i<this.bullets.length;i++) {
      var bullet=this.bullets[i];
      for (var ia=0;ia<this.enemies.length;ia++) {
        var enemy=this.enemies[ia];
        var collisionDistance=bullet.width+enemy.width;        
        if (getDistance(bullet.x,bullet.y,enemy.x,enemy.y)<=collisionDistance) {
          var angle=Math.atan2((bullet.y-enemy.y),(bullet.x-enemy.x));
          bullet.delete=true;
          this.createDust(
            enemy.x+Math.cos(angle)*enemy.width/2,
            enemy.y+Math.sin(angle)*enemy.width/2,
            bullet.dir
          );
          enemy.hit(bullet.dir);
        }
      }
    }
  }
  
  // Collecting powerups
  collectPowerup() {
    for (var i=0;i<this.powerups.length;i++) {
      var powerup=this.powerups[i];
      if (this.player.x+this.player.width/2>powerup.x-powerup.width/2 &&
         this.player.x-this.player.width/2<powerup.x+powerup.width/2 &&
         this.player.y+this.player.height/2>powerup.y-powerup.height/2 &&
         this.player.y-this.player.height/2<powerup.y+powerup.height/2) {
        powerup.remove()
        this.player.addHealth(HEALTH_INCREASE);        
      }
    }
  }
}


// The Dust class
var DUST_AMOUNT=[2,3];
var DUST_SIZE=[5,12];
var DUST_VEL=[5,7];
var DUST_FRICTION=[0.9,0.94];
var DUST_FADESPEED=[0.05,0.1];
class Dust {
  constructor(options) {
    // Positioning / dimensions / animation
    this.x=options.x;
    this.y=options.y;
    this.dir=options.dir;
      
    // Create the objects/elements
    this.dots=this.createDots(options.parentContainer);    
  }
  
  // Create the actual circles of the dust effect
  createDots(parentContainer) {
    var dots=[];
    var amount=getRandom(DUST_AMOUNT[0],DUST_AMOUNT[1]);
    for (var i=0;i<amount;i++) {
      var el=$('<div class="dust"></div>');
      parentContainer.append(el);
      dots.push({
        x:this.x,
        y:this.y,
        vel:getRandom(DUST_VEL[0]*1000,DUST_VEL[1]*1000)/1000,
        friction:getRandom(DUST_FRICTION[0]*1000,DUST_FRICTION[1]*1000)/1000,
        dir:this.dir+getRandom(-Math.PI*0.3*100,Math.PI*0.3*100)/100,
        size:getRandom(DUST_SIZE[0],DUST_SIZE[1]),
        el:el,
        opacity:1,
        fadeSpeed:getRandom(DUST_FADESPEED[0]*1000,DUST_FADESPEED[1]*1000)/1000
      })
    }
    return dots;
  }
  
  // Update
  update() {
    for (var i=0;i<this.dots.length;i++) {
      var v=this.dots[i];
      
      v.x+=Math.cos(v.dir+Math.PI)*v.vel;
      v.y+=Math.sin(v.dir+Math.PI)*v.vel;
      v.vel*=v.friction;
      v.opacity-=v.fadeSpeed;
      
      if (v.opacity<=0) {
        v.delete=true;
      }
      
      // Apply to dom element
      v.el.css({
        left:v.x,
        top:v.y,
        width:v.size,
        height:v.size,
        opacity:v.opacity
      })
      
      if (v.delete===true) {
        v.el.remove();
        this.dots.splice(i, 1);
      }
    }
    if (this.dots.length===0) {
      this.delete=true;
    }
  }  
}

// The dust handler
class DustHandler {
  constructor(options) {
    // Store references
    this.parentContainer=options.parentContainer;
    
    // Update
    options.startUpdating(this.update.bind(this));
    
    // All of tha boize
    this.list=[];
    
    // Binding functions
    this.createDust=this.createDust.bind(this);
  }
  
  // Create dust
  createDust(x,y,dir) {
    this.list.push(new Dust({
      x:x,y:y,
      dir:dir,
      parentContainer:this.parentContainer
    }))
  }
  
  // Updating function
  update() {
    for (var i=0;i<this.list.length;i++) {
      this.list[i].update();
      if (this.list[i].delete===true) {
        this.list.splice(i, 1);
      }
    }
  }
}

// The powerup handler
class PowerupHandler {
  constructor(options) {
    // Store references
    this.parentContainer=options.parentContainer;
  
    this.list=[];
    this.width=35;
    this.height=35;
    
    this.spawnPowerup=this.spawnPowerup.bind(this);
  }
  
  // Restarting
  reload() {
    for (var i=0;i<this.list.length;i++) {
      this.list[i].el.remove();      
    }
    this.list=[];
  }
  
  // Spawning powerups
  spawnPowerup(x,y) {
    var el=$("<div class='health'>+</div>");
    el.css({left:x,top:y,width:this.width,height:this.height})
    this.parentContainer.append(el);
    var thisIndex=this.list.length;
    this.list.push({
      el:el,
      width:this.width,
      height:this.height,
      x:x,
      y:y,
      remove:function() {
        el.remove();
        this.list.splice(thisIndex,1);
      }.bind(this)
    })
  }
}

// The controls class
class Controls {
  constructor() {
    // The control objects
    this.mouse={
      x:0,
      y:0,
      isDown:false,
    }
    this.right={
      keyCode:68,
      isDown:false
    }
    this.left={
      keyCode:65,
      isDown:false
    }
    this.down={
      keyCode:83,
      isDown:false
    }
    this.up={
      keyCode:87,
      isDown:false
    }
    
    // Listen
    this.addListeners();
  }
  
  // Add the listeners
  addListeners() {
    // Mouse
    $(window).on('mousedown', function() {
      this.mouse.isDown=true;
    }.bind(this))
    $(window).on('mouseup',function() {
      this.mouse.isDown=false;
    }.bind(this))
    $(window).on('mousemove',function(e) {
      this.mouse.x=e.pageX;
      this.mouse.y=e.pageY;
    }.bind(this));
    
    // Keys
    var keys=['left','right','down','up'];
    var setKey=function(keyCode,set,_self) {
      for (var i=0;i<keys.length;i++) {
        var thisKey=_self[keys[i]];
        if (keyCode===thisKey.keyCode) {
          thisKey.isDown=set;
        }
      }
    } 
    $(window).on('keydown',function(e) {
      setKey(e.which,true,this);
    }.bind(this))
    $(window).on('keyup',function(e) {
      setKey(e.which,false,this);
    }.bind(this))
  }
}

// Start the game
var game=new Game();

// Lose the game
function lose() {
  game.lose();
}

// Restart the game
function restart() {
  game.restart();
}

// Update the score when you get a kill!
function updateScore() {
  $('.score .amount').html(score);
}


// Get a random number
function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}


// Get distance between two points
function getDistance(x1,y1,x2,y2) {
  var a = x1 - x2
  var b = y1 - y2

  return Math.sqrt( a*a + b*b );
}