var Game = (function () {
  var states = {
      inGame:            0,
      playerDeathZombie: 1,
      playerDeathKnife:  2,
      fadeIn:            3,
      fadeOut:           4,
      menu:              5,
      home:              6,
      gameFinished:      7
  };

  var settings = {
      font:       'lucida console',
      fontWeight: 'bold',
      fontSize:   '10px',
      textAlign:  'left'
  };

  var currentLevel = 1;
  var level = {
      img: null,
      playerPos: {"x": 500,"y":50},
      objects: [
          {x:0,y:0,width:1032,height:32,type:0},
          {x:1000,y:0,width:32,height:604,type:0},
          {x:0,y:572,width:1032,height:32,type:0},
          {x:0,y:0,width:32,height:1032,type:0},
          {x: 395, y: 200, width: 32, height: 68, type:0},
          {x: 620, y: 200, width: 32, height: 68, type:0},
          {x: 427, y: 232, width: 192, height: 36, type:0},
          {x: 290, y: 318, width: 32, height: 68, type:0},
          {x: 131, y: 350, width: 191, height: 36, type:0},
          {x: 258, y: 126, width: 32, height: 68, type:0},
          {x: 130, y: 158, width: 160, height: 36, type:0},
          {x: 741, y: 126, width: 32, height: 68, type:0},
          {x: 741, y: 158, width: 160, height: 36, type:0},
          {x: 709, y: 318, width: 32, height: 68, type:0},
          {x: 709, y: 350, width: 191, height: 36, type:0},
          {x: 40, y: 158, width: 84, height: 32, type: 1},
          {x: 40, y: 190, width: 84, height: 32, type: 1},
          {x: 40, y: 222, width: 84, height: 32, type: 1},
          {x: 40, y: 254, width: 84, height: 32, type: 1},
          {x: 40, y: 286, width: 84, height: 32, type: 1},
          {x: 40, y: 318, width: 84, height: 32, type: 1},
          {x: 40, y: 350, width: 84, height: 32, type: 1},
          {x: 40, y: 382, width: 84, height: 32, type: 1},
          {x: 40, y: 414, width: 84, height: 32, type: 1},
          {x: 40, y: 446, width: 84, height: 32, type: 1},
          {x: 40, y: 478, width: 84, height: 32, type: 1},
          {x: 40, y: 510, width: 84, height: 32, type: 1},
          {x: 40, y: 542, width: 84, height: 32, type: 1},
          {x: 907, y: 158, width: 84, height: 32, type: 1},
          {x: 907, y: 190, width: 84, height: 32, type: 1},
          {x: 907, y: 222, width: 84, height: 32, type: 1},
          {x: 907, y: 254, width: 84, height: 32, type: 1},
          {x: 907, y: 286, width: 84, height: 32, type: 1},
          {x: 907, y: 318, width: 84, height: 32, type: 1},
          {x: 907, y: 350, width: 84, height: 32, type: 1},
          {x: 907, y: 382, width: 84, height: 32, type: 1},
          {x: 907, y: 414, width: 84, height: 32, type: 1},
          {x: 907, y: 446, width: 84, height: 32, type: 1},
          {x: 907, y: 478, width: 84, height: 32, type: 1},
          {x: 907, y: 510, width: 84, height: 32, type: 1},
          {x: 907, y: 542, width: 84, height: 32, type: 1}
      ]
  };

  var currentSpawnPoint = 0;
  var easyPortalsAmount = 2;

  var spawnPortals = [
      {x: 200, y: 266},
      {x: 490, y: 490},
      {x: 845, y: 266},
      {x: 500, y: 145},
      {x: 200, y: 74},
      {x: 845, y: 74}
  ];

  var lastDeathFrameTimeout = .3;
  var lastDeathFrameTime = -1;
  var zombieSpawnTimoutHardcore = 1;
  var zombieSpawnTimeoutEasy = 5;
  var zombieSpawnTimeout = 3;
  var zombieSpawnTime = 0;
  var hardcoreTimeout = 60;
  var gameTime = 0;

  var updateFunc = undefined;
  var renderFunc = undefined;
  var updateFuncTo = undefined;
  var renderFuncTo = undefined;

  var deathX = undefined;
  var deathY = undefined;

  var lastTime =       null;
  var frameDuration =  0;
  var frameTime =      0;
  var maxDt =          0;
  var animations =     [];
  var spriteImg =      null;
  var state =          states.inGame;
  var newState =       undefined;
  var fadeDuration =   0;
  var fadeTime =       0;
  var fadeAlpha =      0;
  var fadeOutCallBack = undefined;
  var fadeInCallBack = undefined;
  var canSkipScreen = true;

  function setPlayerAsMonstersTarget () {
      for(var i = monsters.length - 1; i >= 0; i--) {
          monsters[i].target = player;
      }
  };

  function scheduleStateSwitch (stateUpdate) {
      if(stateUpdate == undefined || stateUpdate == state) { return; }
      newState = stateUpdate;
  };

  function switchState (stateUpdate) {
      newState = undefined;
      state = stateUpdate;

      var descriptor = getStateDescription(stateUpdate);
      updateFunc = descriptor.updateFunc;
      renderFunc = descriptor.renderFunc;
      viewport.setBlendingMode('source-over');

      switch(stateUpdate) {
          case states.gameFinished:
              
          break;
          case states.home:
          break;
          case states.menu:
          break;
          case states.inGame:
              fadeAlpha = 0;
              viewport.setFont(Game.composeFontString());
              viewport.setTextAlign(settings.textAlign);
          break;
          case states.playerDeathZombie:
          case states.fadeIn:
              viewport.switchToBufferContext();
              fadeAlpha = 1.2;
              updateFuncTo(frameDuration);
              renderFuncTo(viewport);
              viewport.switchToMainContext();
          break;
          case states.fadeOut:
              viewport.flushCurrentFrameToBuffer();
          break;
      }

      resetAnimations();
  };

  function getStateDescription (state) {
      var descriptor = {
          updateFunc: null,
          renderFunc: null
      };

      switch(state) {
          case states.gameFinished:
              descriptor.updateFunc = updateGameFinishedScreen;
              descriptor.renderFunc = renderGameFinishedScreen;
          break;
          case states.home:
              descriptor.updateFunc = updateHomeScreen;
              descriptor.renderFunc = renderHomeScreen;
          break;
          case states.menu:
              descriptor.updateFunc = updateMenuScreen;
              descriptor.renderFunc = renderMenuScreen;
          break;
          case states.inGame:
              descriptor.updateFunc = updateGame;
              descriptor.renderFunc = renderGame;
          break;
          case states.playerDeathZombie:
              descriptor.updateFunc = updateDeathScreen;
              descriptor.renderFunc = renderDeathScreen;
          break;
          case states.fadeIn:
          case states.fadeOut:
              descriptor.updateFunc = updateFade;
              descriptor.renderFunc = renderFade;
          break;
      }

      return descriptor;
  };

  function fadeIn (newState, cb) {
      var descriptor = getStateDescription(newState);
      updateFuncTo = descriptor.updateFunc;
      renderFuncTo = descriptor.renderFunc;
      scheduleStateSwitch(states.fadeIn);
      if(cb) {
          fadeInCallBack = cb;
      } else {
          fadeInCallBack = undefined;
      }
  };

  function fadeOut (cb) {
      scheduleStateSwitch(states.fadeOut);
      if(cb) {
          fadeOutCallBack = cb;
      } else {
          fadeOutCallBack = undefined;
      }
  };

  function transitionTo (state) {
      if(state == undefined) { return; }
      if(!canSkipScreen) { return; }
      fadeOut(function () {
          fadeIn(state, function () {
              scheduleStateSwitch(state)
          });
      });
  };

  function resetAnimations () {
      for(var i in animations) {
          animations[i].reset();
      }
  };

  function deathCallBack () {
      lastDeathFrameTime = 0;
  };

  function extractLifeAreaObjects(objects, lifeAreaObjects) {
      for(var i = objects.length - 1; i >= 0; i--){
          for(var j = objects[i].length - 1; j >= 0; j--){
              if(boxCollides( objects[i][j], world.getLifeAreaBounds() )){
                  lifeAreaObjects.push(objects[i][j]);
              }
          }
      }
  }

  function updateLifeObjects(dt) {
      lifeAreaObjects = [];
      /*
       * update the viewport's target first
       * then adjust position of the camera
       * to work only with inside of camera objects
       */
      viewport.updateTarget(dt);
      viewport.align();
      world.lifeArea.update( viewport.getBounds() );

      extractLifeAreaObjects([
       world.mapObjects,
       sfxPool.getSpawnedGore(),
       monsters,
       sfxPool.getSpawnedScoreSFX(),
       sfxPool.getSpawnedSparkSFX(),
       sfxPool.getSpawnedSmokeSFX()
       ],
       lifeAreaObjects);

      if(boxCollides( player, world.getLifeAreaBounds() )) {
          lifeAreaObjects.push(player);
      }

      for(var i = lifeAreaObjects.length - 1; i >= 0; i--) {
          if(lifeAreaObjects[i].update != undefined) {
              if(lifeAreaObjects[i].trackedByCamera) { continue; }
              lifeAreaObjects[i].update(dt);
          }
      }
  }

  function updateState(dt) {
      for(var i = lifeAreaObjects.length - 1; i >= 0; i--){
          if(lifeAreaObjects[i].updateState != undefined){
              lifeAreaObjects[i].updateState(dt);
          }
      }
  };

  function renderGame(viewport){
      viewport.clear();
      viewport.setBlendingMode('source-over');
      world.render(viewport);

      for(var i = lifeAreaObjects.length - 1; i >= 0; i--){
          if(lifeAreaObjects[i].render != undefined){
              lifeAreaObjects[i].render(viewport);
          }
      }

      player.render(viewport);
      if(Game.debugSettings.drawBoundingBox) {
          viewport.renderIdleZone();
      }
      renderHardcoreTimer();
  }

  function handleCollisions(dt){
      var t = new Date();

      lifeAreaObjects.forEach(function (item, i) {
          for(var j = i + 1; j < lifeAreaObjects.length; j++) {
              if(boxCollides(item, lifeAreaObjects[j])) {
                  if(item.resolveCollision !== undefined) {
                      item.resolveCollision(lifeAreaObjects[j], dt);
                  }
                  if(lifeAreaObjects[j].resolveCollision !== undefined) {
                      lifeAreaObjects[j].resolveCollision(item, dt);
                  }
              }
          }

          if(item.updateState != undefined) {
              item.updateState(dt);
          }
      });
  }

  function getIntersectionPoint(ray, object){
      //parametric form of line
      var r_px = ray.a.x;
      var r_py = ray.a.y;
      var r_dx = ray.b.x - ray.a.x;
      var r_dy = ray.b.y - ray.a.y;

      var objectLines = object.getLinesForm();
      var closest = null;

      for(var i = objectLines.length - 1; i >= 0; i--){
          var o_px = objectLines[i].a.x;
          var o_py = objectLines[i].a.y;
          var o_dx = objectLines[i].b.x - objectLines[i].a.x;
          var o_dy = objectLines[i].b.y - objectLines[i].a.y;

          // SOLVE FOR T1 & T2
          // r_px+r_dx*T1 = s_px+s_dx*T2 && r_py+r_dy*T1 = s_py+s_dy*T2
          // ==> T1 = (s_px+s_dx*T2-r_px)/r_dx = (s_py+s_dy*T2-r_py)/r_dy
          // ==> s_px*r_dy + s_dx*T2*r_dy - r_px*r_dy = s_py*r_dx + s_dy*T2*r_dx - r_py*r_dx
          // ==> T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx)
          var T2 = (r_dx*(o_py-r_py) + r_dy*(r_px-o_px))/(o_dx*r_dy - o_dy*r_dx);
          var T1 = (o_px+o_dx*T2-r_px)/r_dx;
          if(T1<0) {continue};
          if(T2<0 || T2>1) {continue};

          if(!closest || T1 < closest.param){
              closest = {
                  x: r_px + r_dx * T1,
                  y: r_py + r_dy * T1,
                  param: T1
              };
          }
      }

      return closest;
  }

  function handleShootingCollisions () {
      var shootingrays = player.getShootingRays();
      if(!shootingrays) { return; }
      var hitPoints = [];//only for rendering
      var closestHitObjects = [];
      var t = new Date();
      for(var i = 0; i < shootingrays.length; i++) {
          var closest = null;
          var hitObject = null;
          for(var j = lifeAreaObjects.length - 1; j >= 0; j--) {
              if(!lifeAreaObjects[j].imperviousToShootingRay) { continue; }

              var point = getIntersectionPoint(shootingrays[i], lifeAreaObjects[j]);
              if(point == undefined) { continue; }
              if(closest == null || point.param < closest.param){
                  closest = point;
                  hitObject = lifeAreaObjects[j];
              }
          }
          if(closest) {
              closestHitObjects.push({
                  point: closest,
                  entity: hitObject
              });
              hitPoints.push(closest);
          }
      }

      if(closestHitObjects.length) {
          var closest = null;
          var closestCharacter = null;
          var hitCharacters = [];
          for(var i = 0; i < closestHitObjects.length; i++) {
              if(closestHitObjects[i].entity instanceof Character) {
                  hitCharacters.push(closestHitObjects[i]);
              }
              if(closest == null || closestHitObjects[i].point.param < closest.point.param){
                  closest = closestHitObjects[i];
              }
          }

          for(var i = 0; i < hitCharacters.length; i++) {
              if(closestCharacter == null || hitCharacters[i].point.param < closestCharacter.point.param){
                  closestCharacter = hitCharacters[i];
              }
          }

          if(closestCharacter) {
              closest = closestCharacter;
          }

          if(closest.entity.handleShoot != undefined) {
              closest.entity.handleShoot();
              if(closest.entity.dead) {
                  player.obtainScore(closest.entity);
              }
          }

          player.shootSuccess(closest.point, hitPoints);
      } else {
          player.shootFail();
      }
  };

  function updateMonstersWithTarget(dt) {
      for(var i = monsters.length - 1; i >= 0; i--){
          if(this.monsters[i].checkTarget != undefined){
              this.monsters[i].checkTarget(dt);
          }
      }
  }

  function removeDeadMonsters(){
      for(var i = monsters.length - 1; i >= 0; i--){
          if(monsters[i].dead){
              monsters.splice(i, 1);
          }
      }
  }

  function spawnZombies (dt) {
      zombieSpawnTime += dt;
      gameTime += dt;
      var timeout = 0;
      if(Game.isHardcore()) {
          if(gameTime >= 180) {
              timeout = zombieSpawnTimoutHardcore;
          } else {
              timeout = zombieSpawnTimeout;
          }
      } else {
          timeout = zombieSpawnTimeoutEasy;
      }
      if(zombieSpawnTime >= timeout) {
          var zombie = new Zombie();
          zombie.setTarget(player);
          zombie.x = spawnPortals[currentSpawnPoint].x;
          zombie.y = spawnPortals[currentSpawnPoint].y;
          monsters.push(zombie);
          if(gameTime >= hardcoreTimeout) {
              currentSpawnPoint = (currentSpawnPoint + 1) % spawnPortals.length;
          } else {
              currentSpawnPoint = (currentSpawnPoint + 1) % easyPortalsAmount;
          }
          zombieSpawnTime = 0;
          if(gameTime >= 180) {
              zombieSpawnTimeout = zombieSpawnTimoutHardcore;
          }
      }
  };

  function renderHardcoreTimer () {
      var bounds = viewport.getBounds();
      viewport.setFont(Game.composeFontString({
          fontSize: '14px',
          fontWeight: 'normal',
      }));
      viewport.setTextAlign('center');
      viewport.setFillStyle('#FCFC54');
      var text = '';
      if(gameTime <= hardcoreTimeout) {
          text = 'Till hardcore: ' + Math.max(Math.floor(hardcoreTimeout - gameTime), 0);
      } else {
          text = 'SURVIVE!';
      }
      viewport.fillText(text, bounds.x + 320, bounds.y + 32);
  };

  function updateDeathScreen (dt) {
      var animation = animations[state];
      if(animation) {
          animation.update(dt);
      }
      if(lastDeathFrameTime >= 0 && lastDeathFrameTime < lastDeathFrameTimeout) {
          lastDeathFrameTime += dt;
      } else if(lastDeathFrameTime >= lastDeathFrameTimeout) {
          lastDeathFrameTime = -1;
          player.death();
          Game.gameOver();
      }
  };

  function renderDeathScreen (viewport) {
      renderGame(viewport);
      var animation = animations[state];
      if(animation) {
          var x = 0;
          var y = 0;
          x = Math.floor(deathX - animation.width * .5);
          y = Math.floor(deathY - animation.height * .5);
          var bounds = viewport.getBounds();
          var maxRight = bounds.x + bounds.width - animation.width;
          var maxBottom = bounds.y + bounds.height - animation.height;
          x = Math.max(0, Math.min(x, maxRight));
          y = Math.max(0, Math.min(y, maxBottom));
          animation.render(viewport, x, y);
      }
  };

  function updateFade (dt) {
      fadeTime += dt;

      if(fadeTime < fadeDuration) {
          return;
      }

      if(fadeAlpha == 1 && state == states.fadeOut && fadeOutCallBack) {
          fadeOutCallBack();
          return;
      } else if (fadeAlpha == 0 && state == states.fadeIn && fadeInCallBack) {
          fadeInCallBack();
          return;
      }

      var k = state == states.fadeIn ? -1 : 1;
      fadeAlpha += (.4 * k);
      fadeAlpha = Math.max(0, Math.min(1, fadeAlpha));

      fadeTime = 0;
  };

  function renderFade (viewport) {
      var bounds = viewport.getBounds();
      viewport.setBlendingMode('source-over');
      viewport.renderBufferContextToMain();

      if(fadeAlpha < 1) {
          viewport.setBlendingMode('overlay');
      }

      viewport.setFillStyle('rgba(0,0,0,'+ fadeAlpha +')');
      viewport.fillRect(bounds.x,bounds.y,bounds.width, bounds.height);
      viewport.fillRect(bounds.x,bounds.y,bounds.width, bounds.height);
  };

  function updateMenuScreen (dt) {
      if(keyboard.pressed[keyboard.keys.SPACE]) {
          Game.restartGame();
          return;
      }
  };

  function renderMenuScreen (viewport) {
      var bounds = viewport.getBounds();
      viewport.setFont(Game.composeFontString({
          fontSize: '14px',
          fontWeight: 'normal',
      }));
      viewport.setFillStyle('black');
      viewport.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      viewport.setTextAlign('center');
      viewport.setFillStyle('#FCFC54');
      viewport.fillText('GAME  OVER', bounds.x + 320, bounds.y + 216);
      viewport.fillText('YOUR SCORE IS : ' + player.score, bounds.x + 320, bounds.y + 282);
      viewport.fillText('HIT SPACE TO RESTART!', bounds.x + 320, bounds.y + 314);
  };

  function updateHomeScreen (dt) {
      if(keyboard.pressed[keyboard.keys.SPACE]) {
          transitionTo(states.inGame);
          return;
      }
  };

  function renderHomeScreen (viewport) {
      var bounds = viewport.getBounds();
      viewport.setFont(Game.composeFontString({
          fontSize: '14px',
          fontWeight: 'normal',
      }));
      viewport.setTextAlign('left');
      viewport.setFillStyle('black');
      viewport.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      viewport.setFillStyle('#FCFC54');
      viewport.fillText('Jump: Spacebar', bounds.x + 50, bounds.y + 50);
      viewport.fillText('Shoot: alt button', bounds.x + 50, bounds.y + 66);
      viewport.fillText('Drop Down: down + space', bounds.x + 50, bounds.y + 82);
      viewport.fillText('You have 60 seconds and a few zombies to get used to the game', bounds.x + 82, bounds.y + 164);
      viewport.fillText('After that you\'ll be given an infinite ammo', bounds.x + 82, bounds.y + 180);
      viewport.fillText('But zombies will also spawn all over the place!', bounds.x + 82, bounds.y + 196);
      viewport.fillText('Have fun!', bounds.x + 82, bounds.y + 212);
      viewport.setTextAlign('center');
      viewport.fillText('HIT SPACE TO START!', bounds.x + 320, bounds.y + 270);
  };

  function updateGameFinishedScreen (dt) {
      if(state == states.gameFinished && keyboard.pressed[keyboard.keys.SPACE]) {
          Game.restartGame();
      }
  };

  function renderGameFinishedScreen (viewport) {
      var animation = animations[states.gameFinished];
      if(animation) {
          var bounds = viewport.getBounds();
          animation.render(viewport, bounds.x, bounds.y);
          viewport.setFont(Game.composeFontString({
              fontSize: '12px',
              fontWeight: 'normal',
          }));
          viewport.setFillStyle('#fcfc54');
          viewport.setTextAlign('center');
          viewport.fillText('YOUR SCORE IS ' + player.score, bounds.x + (bounds.width * .5) | 0, bounds.y + 330);
      }
  };

  function updateGame (dt, now) {
      removeDeadMonsters();
      spawnZombies(dt);
      updateMonstersWithTarget(dt);
      updateLifeObjects(dt);
      handleCollisions(dt);
      handleShootingCollisions();
  };

  function mainLoop () {
      requestAnimFrame(mainLoop);
      var now = new Date();
      var dt = Math.min( (now - lastTime) / 1000, frameDuration ); //when switching to other tab big dt causes shit
      lastTime = now;
      maxDt = Math.max(dt, maxDt);
      frameTime += dt; 

      if(newState != undefined) {
          switchState(newState);
      }

      updateFunc(dt, now);

      if(frameTime < frameDuration) {
          return;
      }

      var beforeRender = new Date();
      renderFunc(viewport);

      frameTime = 0;
      maxDt = 0;
  }

  return {
      debugSettings: {
          drawBoundingBox: false,
          drawStats: false
      },

      init: function() {
          frameDuration = this.calculateFrameDuration(30);
          fadeDuration = this.calculateFrameDuration(10);
          spriteImg = sprite;
          level.img = mapsprite;
          this.initAnimations();

          world.levelLoadCallBack = function (levelData) {
              viewport.init(world.visibilityOffset.left,
                            world.visibilityOffset.top,
                            world.visibilityOffset.right,
                            world.visibilityOffset.bottom,
                            world.getWidth(),
                            world.getHeight());
              sfxPool.init();
              if(player == null) {
                  player = new Player();
              }
              player.setInitialPosition(levelData.playerPos.x, levelData.playerPos.y);
              viewport.follow(player);
              setPlayerAsMonstersTarget();
          };
          
          world.load(level, function () {
              Game.start();
          });
      },

      start: function () {
          viewport.switchToMainContext();
          switchState(states.home);
          lastTime = new Date();
          mainLoop();
      },

      isHardcore: function () {
          if(gameTime >= hardcoreTimeout) {
              return true;
          }

          return false;
      },

      getFrameDuration: function () {
          return frameDuration;
      },

      composeFontString: function (data) {
          data = data || {};
          return  (data.fontWeight ? data.fontWeight : settings.fontWeight) + ' ' +
                  (data.fontSize ? data.fontSize : settings.fontSize) + ' ' +
                  (data.font ? data.font : settings.font);

      },

      calculateFrameDuration: function (FPS, base) {
          // 16(ms) is the approximate time between requestAnimFrame calls
          if(base) {
              return Math.round( Math.floor(1000 / FPS) / (base * 1000) ) * base;
          }
          return Math.round( Math.floor(1000 / FPS) / 16 ) * .016;
      },

      gameOver: function () {
          transitionTo(states.menu);
      },

      playerDeathByZombie: function (player) {
          if(!(player instanceof Player)) { return; }
          deathX = player.x + player.width * .5;
          deathY = player.y + player.height * .5;
          scheduleStateSwitch(states.playerDeathZombie);
      },

      spawnMonster: function (monster, x, y){
          monster.x = x;
          monster.y = y;
          monster.target = player;
          monsters.push(monster);
      },

      restartGame: function () {
          fadeOut(function () {
              fadeIn(states.home, function () {
                  currentLevel = 1;
                  gameTime = 0;
                  zombieSpawnTime = 0;
                  currentSpawnPoint = 0;
                  zombieSpawnTime = 0;
                  player.reset();
                  world.load(level, function () {
                      scheduleStateSwitch(states.home);
                  });
              });
          });
      },

      initAnimations: function () {
          animations[states.playerDeathZombie] = (new Sprite({
              img:       spriteImg,
              origins:   [
                  {
                      x: 0,
                      y: 66
                  }
              ],
              width:     96,
              height:    96,
              frames:    5,
              animSpeed: 4,
              repeat:    false,
              callbacks: [{
                  frame: 4,
                  cb:    deathCallBack.bind(this)
              }]
          }));
      }
  };
}) ();
/*
* @desc: holds sprite image source object
*        defines the frames and the animation speed
*/

var Sprite = (function () {
  function Sprite (opts) {
      this.finished = false;
      this.img = opts.img || null;
      this.width = opts.width || 0;
      this.height = opts.height || 0;
      this.frames = opts.frames || 0;
      this.repeat = opts.repeat != undefined ? opts.repeat : true;

      this.currentFrame = 0;
      this.frameTime = 0;
      this.frameDuration = Game.calculateFrameDuration(opts.animSpeed || 60);

      this.origins = [];
      this.currentOrigin = 0;

      for(var i = 0; i < opts.origins.length; i++){
          var origin = {
              x:       opts.origins[i].x || 0,
              y:       opts.origins[i].y || 0,
              offsetx: opts.origins[i].offsetx || 0,
              offsety: opts.origins[i].offsety || 0
          };
          this.origins.push(origin);
      }

      this.callbacks = [];
      var len = opts.callbacks ? opts.callbacks.length : 0;
      for(var i = 0; i < len; i++){
          if(typeof opts.callbacks[i].cb === 'function'){
              this.callbacks[opts.callbacks[i].frame] = opts.callbacks[i].cb;
          }
      }
  };

  Sprite.prototype.reset = function () {
      this.finished = false;
      this.currentFrame = 0;
      this.frameTime = 0;
  };

  Sprite.prototype.update = function (dt) {
      if(this.finished) { return; }

      this.frameTime += dt;

      if(this.frameTime >= this.frameDuration) {
          if(this.callbacks[this.currentFrame]) {
              this.callbacks[this.currentFrame]();
          }

          this.frameTime = 0;

          if(this.currentFrame == this.frames - 1){
              if(!this.repeat){
                  this.finished = true;
                  return;
              }
              this.currentFrame = 0
          } else {
              this.currentFrame++;
          }
      }
  };

  Sprite.prototype.switchOrigin = function (origin, reset) {
      if(reset){
          this.reset();
      }

      if(origin > this.origins.length - 1) {
          origin = this.origins.length - 1;
      } else if(origin < 0) {
          origin = 0;
      }

      this.currentOrigin = origin;
  };

  Sprite.prototype.render = function (viewport, dx, dy) {
      var origin = this.origins[this.currentOrigin];
      var x = origin.x + this.width * this.currentFrame;
      dx = Math.floor(dx);
      dy = Math.floor(dy);
      viewport.drawImage(this.img, x, origin.y, this.width, this.height, dx + origin.offsetx, dy + origin.offsety, this.width, this.height);
  };

  return Sprite;
})();
/*
* Object that allows to track pressed keys
* basically the only purpose of this is to have
* convenient access to pressed keys across the system
*/
var keyboard = {

  keys: {
      UP:    38,
      DOWN:  40,
      LEFT:  37,
      RIGHT: 39,
      SPACE: 32,
      TAB:   9,
      ALT:   18
  },

  pressed: [],

  init: function(){
      window.addEventListener('keydown', this.onkeydown.bind(this));
      window.addEventListener('keyup', this.onkeyup.bind(this));
  },

  onkeydown: function(e){
      // switch(e.which){
      //     case this.keys.ALT:
      //         e.preventDefault();
      //         e.stopPropagation();
      //     break;
      // }
      //if F1 - F12 do nothing
      if(116 <= e.which && e.which <= 123){
          return;
      }
      e.preventDefault();
      e.stopPropagation();
      // console.log('keydown:', e.which);
      this.pressed[e.which] = true;
  },

  onkeyup: function(e){
      // console.log('keyup:', e.which);
      this.pressed[e.which] = false;
  }
};
var Surface = function (data) {
  this.y = data.y || 0;
  this.leftMostEdge = data.x || 0;
  this.rightMostEdge = 0;
};

Surface.prototype.expand = function () {
  for (var i = arguments.length - 1; i >= 0; i--) {
      if(arguments[i].x < this.leftMostEdge) {
          this.leftMostEdge = arguments[i].x;
      }

      if(arguments[i].x + arguments[i].width > this.rightMostEdge) {
          this.rightMostEdge = arguments[i].x + arguments[i].width;
      }
  }
};

var world = (function () {
  var MAX_VY = 570;
  var maxScore = 0;
  var mapbg = null;
  var width =  0;
  var height = 0;
  // var STAIR_GAP = 15;
  var surfaces = [];
  // var stairCases = [];

  function generateLevelObjects (levelData) {
      var that = this;
      for(var i = levelData.objects.length - 1; i >= 0; i--) {
          if(levelData.objects[i].type == gameObjects.solid.type) {
              this.mapObjects.push(new SolidBody(levelData.objects[i]));
          } else if (levelData.objects[i].type == gameObjects.jumpable.type) {
              this.mapObjects.push(new JumpableBody(levelData.objects[i]));
          } else if (levelData.objects[i].type == gameObjects.zombie.type) {
              var monster = new Zombie();
              monster.x = levelData.objects[i].x;
              monster.y = levelData.objects[i].y;
              monsters.push(monster);
              if(monster.score >= 100) {
                  maxScore += monster.score;
              }
          }

          if(levelData.objects[i].score >= 100) {
              maxScore += levelData.objects[i].score;
          }
      }
  };

  function detectSurfaces (levelData) {
      var that = this;
      this.mapObjects.forEach(function (item, i) {
          for(var j = i + 1; j < that.mapObjects.length; j++) {
              if(!(item instanceof SolidBody) && !(item instanceof JumpableBody)) { return; }

              if(item.y == that.mapObjects[j].y) {
                  if(!(that.mapObjects[j] instanceof SolidBody) && !(that.mapObjects[j] instanceof JumpableBody)) { continue; }

                  var right1 = item.x + item.width;
                  var right2 = that.mapObjects[j].x + that.mapObjects[j].width;

                  var distLeftAbs = Math.abs(item.x - that.mapObjects[j].x);
                  var distRightAbs = Math.abs(item.x + item.width - that.mapObjects[j].x - that.mapObjects[j].width);

                  if(distRightAbs + distLeftAbs <= item.width + that.mapObjects[j].width + 2 * that.SURFACE_GAP) {
                      if(item.surface != null) {
                          item.surface.expand(that.mapObjects[j]);
                          that.mapObjects[j].surface = item.surface;
                      } else if (that.mapObjects[j].surface != null) {
                          that.mapObjects[j].surface.expand(item);
                          item.surface = that.mapObjects[j].surface;
                      } else {
                          var surface = new Surface({x: item.x, y: item.y});
                          surface.expand(item, that.mapObjects[j]);
                          item.surface = surface;
                          that.mapObjects[j].surface = surface;
                          surfaces.push(surface);
                      }
                  }
              }
          }
      });
  };

  var gameObjects = {
      solid: {
          type: 0,
          strokecolor: '',
          selectcolor: 'rgba(255,255,0, .5)'
      },
      jumpable: {
          type: 1,
          strokecolor: '',
          selectcolor: 'rgba(0,255,0, .5)'
      },
      zombie: {
          width: 35,
          height: 80,
          type: 2,
          strokecolor: '',
          selectcolor: 'rgba(0,250,10,1,.5)'
      },
      goblin: {
          width: 30,
          height: 48,
          type: 3,
          strokecolor: '',
          selectcolor: 'rgba(0,150,10,1,.5)'
      },
      hundred: {
          width: 25,
          height: 25,
          type: 4,
          strokecolor: '',
          selectcolor: 'rgba(168,0,0,.5)',
          score: 100
      },
      thundred: {
          width: 25,
          height: 25,
          type: 4,
          strokecolor: '',
          selectcolor: 'rgba(252,84,84,.5)',
          score: 300
      },
      fhundred: {
          width: 25,
          height: 25,
          type: 4,
          strokecolor: '',
          selectcolor: 'rgba(0,168,168,.5)',
          score: 400
      },
      teleport: {
          type: 5,
          width: 64,
          height: 96,
          strokecolor: '',
          selectcolor: ''
      },
      wardrobe: {
          type: 6,
          width: 64,
          height: 96,
          strokecolor: '',
          selectcolor: 'rgba(168,168,168, .5)',
          score: undefined
      }
  };

  return {
      gravity: 1600,
      SURFACE_GAP: 15,
      //objects that collides with this area are updated
      visibilityOffset: {
          left: 0,
          top: 0,
          right: 0,
          bottom: 0
      },

      lifeArea: {
          x: 0,
          y: 0,
          width:   0,
          height:  0,
          varticalPadding: 250,
          horizontalPadding: 250,

          update: function(cameraBounds){
              var rightBorder = Math.min(cameraBounds.x + cameraBounds.width + this.horizontalPadding, width);
              var leftBorder = Math.max(0, cameraBounds.x - this.horizontalPadding);
              var bottomBorder = Math.min(cameraBounds.y + cameraBounds.height + this.varticalPadding, height);
              var topBorder = Math.max(0, cameraBounds.y - this.varticalPadding);
              this.width = rightBorder - leftBorder;
              this.height = bottomBorder - topBorder;
              this.x = Math.min( Math.max(0, cameraBounds.x - this.horizontalPadding), width - this.width );
              this.y = Math.min( Math.max(0, cameraBounds.y - this.varticalPadding), height - this.height );
          },

          render: function(viewport){
              viewport.setStrokeStyle('rgba(100, 211, 175, 1)');
              viewport.strokeRect(this.x, this.y, this.width, this.height);
          }
      },

      levelLoadCallBack: function (levelData) {},

      isTeleportExists: function (x, y) {
          for(var i = this.mapObjects.length - 1; i >= 0; i--) {
              if(this.mapObjects[i].x == x && this.mapObjects[i].y == y) {
                  return this.mapObjects[i];
              }
          }
          return null;
      },

      resetStorages: function () {
         monsters = [];
         scores = [];
         surfaces = [];
         lifeAreaObjects = [];
         this.mapObjects = [];
      },

      load: function (levelData, cb) {
          if(!levelData) { return; }
          var that = this;
          maxScore = 0;
          this.resetStorages();
          
          generateLevelObjects.call(this, levelData);
          detectSurfaces.call(this, levelData);

          if(levelData.img) {
              mapbg = levelData.img;
              width = mapbg.width;
              height = mapbg.height;
              that.levelLoadCallBack(levelData);
              if(typeof cb === 'function') {
                  cb();
              }
          } else {
              width = 1024;
              height = 600;
              this.levelLoadCallBack(levelData);
              if(typeof cb === 'function') {
                  cb();
              }
          }
      },

      render: function(viewport) {
          if(mapbg) {
              viewport.renderMap(mapbg);
          }
          if(Game.debugSettings.drawBoundingBox) {
              this.renderSurfaces(viewport);
              this.renderSolidsBounds(viewport);
              this.lifeArea.render(viewport);
          }
      },

      renderSolidsBounds: function(viewport) {
          viewport.setFont('12px Arial');

          for(var i = this.mapObjects.length - 1; i >= 0; i--){
              var obj = this.mapObjects[i];
              if(obj instanceof SolidBody) {
                  viewport.setStrokeStyle('green');
              } else if(obj instanceof JumpableBody){
                  viewport.setStrokeStyle('crimson');
              }
              var text = 'x: ' + obj.x + ', y: ' + obj.y + ', width: ' + obj.width + ', height: ' + obj.height;
              viewport.fillText(text, obj.x + 5, obj.y - 5);
              viewport.strokeRect(obj.x, obj.y, obj.width, obj.height);
          }
      },

      renderSurfaces: function (viewport) {
          viewport.setStrokeStyle('rgba(0, 100, 200, 1)');
          for(var i = surfaces.length - 1; i >= 0; i--) {
              viewport.strokeRect(surfaces[i].leftMostEdge, surfaces[i].y, surfaces[i].rightMostEdge - surfaces[i].leftMostEdge, 10);
          }
      },

      renderStairCases: function (viewport) {
          viewport.setStrokeStyle('rgba(150, 10, 200, 1)');
          for(var i = this.stairCases.length - 1; i >= 0; i--) {
              viewport.strokeRect(this.stairCases[i].x, this.stairCases[i].stairs[0], this.stairCases[i].width, this.stairCases[i].bottom - this.stairCases[i].stairs[0]);
          }
      },

      getLifeAreaBounds: function () {
          return {
              x: this.lifeArea.x,
              y: this.lifeArea.y,
              width:  this.lifeArea.width,
              height: this.lifeArea.height
          };
      },

      getWidth: function () {
          return width;
      },

      getHeight: function () {
          return height;
      },

      getMaxScore: function () {
          return maxScore;
      },

      getMaxVY: function () {
          return MAX_VY;
      },

      mapObjects: [],
  };
}) ();

function resolveVertical(obj, h){
  obj.y = Math.min(h - obj.height, Math.max(0, obj.y));
  obj.vy *= -1;
}

function resolveHorizontal(obj, w){
  obj.x = Math.min(w - obj.width, Math.max(0, obj.x));
  obj.vx *= -1;
}

function handleWorldCollision(obj, worldW, worldH){
  if(obj.x + obj.width > worldW || obj.x < 0){
      resolveHorizontal(obj, worldW);
  } else if(obj.y + obj.height > worldH || obj.y < 0) {
      resolveVertical(obj, worldH);
  }
};

function boxCollides(box1, box2){
  var bottom1 = box1.y + box1.height;
  var right1 = box1.x + box1.width;
  var bottom2 = box2.y + box2.height;
  var right2 = box2.x + box2.width;

  return !(bottom1 <= box2.y ||
           box1.y >= bottom2 ||
           box1.x >= right2  ||
           right1 <= box2.x
           );
}
var BasicObject = (function () {
  
  function BasicObject() {
      this.x = 0;
      this.y = 0;
      this.width = 0;
      this.height = 0;
      this.trackedByCamera = false;
      this.imperviousToShootingRay = true;
  }

  BasicObject.prototype.update = function (dt) {};

  BasicObject.prototype.render = function (viewport) {};

  BasicObject.prototype.resolveCollision = function (collided, dt) {};

  BasicObject.prototype.getLinesForm = function () {
      return [
          {
              a: {x: this.x, y: this.y},
              b: {x: this.x + this.width, y: this.y}
          },
          {
              a: {x: this.x + this.width, y: this.y},
              b: {x: this.x + this.width, y: this.y + this.height}
          },
          {
              a: {x: this.x + this.width, y: this.y + this.height},
              b: {x: this.x, y: this.y + this.height}
          },
          {
              a: {x: this.x, y: this.y + this.height},
              b: {x: this.x, y: this.y}
          }
      ];
  };

  BasicObject.prototype.getRightX = function () {
      return this.x + this.width;
  };

  BasicObject.prototype.getBottomY = function () {
      return this.y + this.height;
  };

  BasicObject.prototype.setPos = function (x, y) {
      if(typeof x != 'number' && typeof y != 'number') { console.log('ERR: x and y must be numbers'); return; }
      this.x = x;
      this.y = y;
  };

  return BasicObject;
})();
var Character = (function () {
  var DEFAULT_IDLE_TIME = Game.calculateFrameDuration(60);
  var HIT_TIME = .25;

  var directions = {
      left: -1,
      right: 1
  };

  function Character () {
      this.vx = 0;
      this.vy = 0;
      this.prevy = 0;
      this.prevx = 0;
      this.state = undefined;
      this.idleTime = 0;                          //current amount of time spent in idleness
      this.idleTimeDuration = DEFAULT_IDLE_TIME;  //how much time should be spent in idleness
      this.floor = null;
      this.affectedByGravity = true;

      // this.nextStair = null;
      this.hitPoints = 1;
      this.goreAmount = 2;
      this.score = 0;
      this.dead = false;
      this.target = null;
      this.hitTimer = -1;
      this.beingHit = false;
      this.direction = directions.left;
  };

  Character.prototype = new BasicObject();

  Character.prototype.update = function (dt) {
      this.idleTime += dt;

      this.incrementHitTimer(dt);
      if(this.idleTime < this.idleTimeDuration) {
          return;
      }

      var animation = this.getAnimation();
      if(animation) {
          animation.update(this.idleTime);
      }

      var newData = {
          x:  this.x,
          y:  this.y,
          vx: this.vx,
          vy: this.vy
      };

      this.beforePositionUpdate(this.idleTime);
      newData.x = this.makeStep(this.idleTime);
      this.applyVerticalSpeed(this.idleTime, newData);

      if(this.isPositionChangeValid(world.getLifeAreaBounds(), newData)) {
          this.prevx = this.x;
          this.prevy = this.y;

          this.x = newData.x;
          this.y = newData.y ;
          this.vx = newData.vx;
          this.vy = newData.vy;
      }

      this.idleTime = 0;
      this.floor = null;
      // this.nextStair = null;

      this.resetCustomData();
  };

  Character.prototype.applyVerticalSpeed = function (dt, newData) {
      if(this.affectedByGravity) {
          newData.vy = Math.min(world.getMaxVY(), newData.vy + world.gravity * dt);
      }
      newData.y += newData.vy * dt;
  };

  Character.prototype.isPositionChangeValid = function (bounds, data) {
      if(!bounds) { return; }
      var centerx = bounds.x + bounds.width * .5;
      var centery = bounds.y + bounds.height * .5;

      var right = this.getRightX(data.x, this.width);
      var bottom = this.getBottomY(data.y, this.height);

      // dir > 0 means object moves towards the center of life area, < 0 otherwise (tries to leave)
      var vySign = data.vy >= 0 ? 1 : -1;
      var dirx = (centerx - data.x) / this.direction;
      var diry = (centery - data.y) / vySign;
      var dir = (dirx < 0 || diry < 0) ? -1 : 1;

      if(dir < 0 && (data.x < bounds.x ||
         data.y < bounds.y ||
         right > bounds.x + bounds.width ||
         bottom > bounds.y + bounds.height)) {
          return false;
      }

      return true;
  };

  Character.prototype.render = function (viewport) {
      if(!viewport) { return; }
      if(Game.debugSettings.drawStats) {
          viewport.setFillStyle( 'black' );
          viewport.fillText( 'state: ' + this.state, Math.floor(this.x), Math.floor(this.y) - 23 );
          viewport.fillText( 'direction: ' + this.direction, Math.floor(this.x), Math.floor(this.y) - 15 );
          viewport.fillText( 'targetInRange: ' + this.targetInRange, Math.floor(this.x), Math.floor(this.y) - 3 );
      }
      
      if(Game.debugSettings.drawBoundingBox) {
          viewport.setFillStyle( this.color );
          viewport.fillRect( Math.floor(this.x), Math.floor(this.y), this.width, this.height );
          if(this.killZone) {
              viewport.strokeRect(Math.floor(this.killZone.x), Math.floor(this.killZone.y), this.killZone.width, this.killZone.height);
          }
      }
      
      if(this.hitTimer >= 0) {
          viewport.setBlendingMode('xor');
      }

      var animation = this.getAnimation();
      if(animation) {
          animation.render(viewport, Math.floor(this.x), Math.floor(this.y));
      }
      viewport.setBlendingMode('source-over')
  };

  Character.prototype.setTarget = function (newTarget) {
      if(newTarget && this.target != newTarget) {
          this.target = newTarget;
      }
  };

  //interface methods
  Character.prototype.checkTarget = function () {};

  Character.prototype.beforePositionUpdate = function () {};

  Character.prototype.resetCustomData = function () {};

  //if character bumped the wall or the surface edge
  Character.prototype.bumpCallBack = function () {};

  Character.prototype.getAnimation = function () {
      var state = this.state;
      if(state == undefined) { return; }
      var animation = this.animations[state];
      if(animation) {
          if(this.directionIsRight()) {
              animation.switchOrigin(0);
          } else {
              animation.switchOrigin(1);
          }
      }

      return animation;
  };

  Character.prototype.leftDirection = function () {
      this.direction = directions.left;
  };

  Character.prototype.rightDirection = function () {
      this.direction = directions.right;
  };

  Character.prototype.directionIsLeft = function () {
      if(this.direction == directions.left){ return true; }
      return false;
  };

  Character.prototype.directionIsRight = function () {
      if(this.direction == directions.right){ return true; }
      return false;
  };

  Character.prototype.switchDirection = function () {
      if(this.directionIsLeft()){
          this.rightDirection();
      } else {
          this.leftDirection();
      }
  };

  Character.prototype.incrementHitTimer = function (dt) {
      if(this.hitTimer >= 0 && this.hitTimer < HIT_TIME) {
          this.hitTimer += dt;
      } else {
          this.hitTimer = -1;
      }
  };

  /*
   * @desc: Makes step toward current direction. Changes direction in case
   *        edge of the surface is reached.
   */
  Character.prototype.makeStep = function (dt) {
      var newX = this.x + this.vx * this.direction * dt;
      var leftMostEdge = 0;
      var rightMostEdge = 0;

      if(this.floor != null) {
          if(this.floor.surface != null) {
              leftMostEdge = this.floor.surface.leftMostEdge - world.SURFACE_GAP;
              rightMostEdge = this.floor.surface.rightMostEdge + world.SURFACE_GAP;
          } else {
              leftMostEdge = this.floor.x - world.SURFACE_GAP;
              rightMostEdge = this.floor.x + this.floor.width + world.SURFACE_GAP;
          }

          if(newX < leftMostEdge || newX + this.width > rightMostEdge) {
              newX = this.x;
              this.switchDirection();
              this.bumpCallBack();
          }
      }

      /*
       * @desc: It seems that original dave doesn't have any stairchange mechanism for zombie,
       *        it just falls down on same amount of pixels as stair height.
       *        Anyway I decided to save it for later.
      this.canChangeToDownstairs = false;
      if(this.nextStair == null) {
          this.prevy = this.y;
          this.y += 16;//this.vy * this.idleTime;
      } else if (this.nextStair != null && this.downstairs) {
          this.canChangeToDownstairs = true;
          this.prevy = this.y + 1; //otherwise will cause repultion by stair on collision detection stage
          this.y = this.nextStair - this.height;
      }
      */

      return newX;
  };

  Character.prototype.applyReaction = function (reaction, config) {
      if(!reaction) { return; }
      if(!config) {
          config = {
              ignorx: false,
              ignory: false,
              ignorvx: false,
              ignorvy: false
          };
      }
      if(!config.ignorx) {
          this.x = reaction.x != undefined ? reaction.x : this.x;
      }
      if(!config.ignory) {
          this.y = reaction.y != undefined ? reaction.y : this.y;
      }
      if(!config.ignorvx) {
          this.vx = reaction.vx != undefined ? reaction.vx : this.vx;
      }
      if(!config.ignorvy) {
          this.vy = reaction.vy != undefined ? reaction.vy : this.vy;
      }
  };

  Character.prototype.handleShoot = function () {
      this.hitPoints--;
      this.hitTimer = 0;
      if(this.hitPoints == 0){
          this.dead = true;
          this.hitTimer = -1;
          var gore = sfxPool.allocateGore(this.goreAmount);
          var x = 0;
          var y = this.y;
          var pair = false;
          var vy = 0;
          for(var i = gore.length - 1; i >= 0; i--){
              if(pair) {
                  vx = 0;
                  vy = 0;
              } else {
                  vx = 230;
                  vy = -270;
              }

              if(i % 2 == 0) {
                  gore[i].leftDirection();
                  x = this.x;
                  pair = !pair;
                  if(vy < 0) {
                      y -= gore[i].height * .5;
                  } else {
                      y += gore[i].height;
                  }
              } else {
                  gore[i].rightDirection();
                  x = this.x + this.width;
                  if(vy == 0) {
                      y += gore[i].height * .75;
                  }
              }
              gore[i].spawn(x, y, vx, vy);
          }
      }
  };

  Character.prototype.getRightX = function (x, width) {
      if(x && width) {
          return x + width;
      }
      return this.x + this.width;
  };

  Character.prototype.getBottomY = function (y, height) {
      if(y && height) {
          return y + height;
      }
      return this.y + this.height;
  };

  Character.prototype.getPrevRightX = function () {
      return this.prevx + this.width;
  };

  Character.prototype.getPrevBottomY = function () {
      return this.prevy + this.height;
  };

  return Character;
})();
var JumpableBody = (function () {
  function JumpableBody (data) {
      this.x = data.x || 0;
      this.y = data.y || 0;
      this.width = data.width || 0;
      this.height = data.height || 0;
      this.surface = null;
      this.staircase = null;
      this.imperviousToShootingRay = false;
  };

  JumpableBody.prototype = new BasicObject();

  JumpableBody.prototype.getCollisionReaction = function (collided) {
      var reaction = {
          x: undefined,
          y: undefined,
          vx: undefined,
          vy: undefined
      };
      var prevBottom = undefined;
      var elastic = false;

      if(collided.prevy != undefined) {
          prevBottom = collided.getPrevBottomY();
      }

      if(collided.y < this.y && collided.vy > 0 && prevBottom <= this.y){
          reaction.y = this.y - collided.height
          reaction.vy = elastic ? collided.vy * -1 : 0;
      }

      return reaction;
  };

  return JumpableBody;
})();
var SolidBody = (function () {
  function SolidBody (data) {
      this.x = data.x || 0;
      this.y = data.y || 0;
      this.width = data.width || 0;
      this.height = data.height || 0;
      this.surface = null;
  };

  SolidBody.prototype = new BasicObject();

  SolidBody.prototype.getCollisionReaction = function (collided) {
      var reaction = {
          x: undefined,
          y: undefined,
          vx: undefined,
          vy: undefined
      };
      var prevBottom = undefined;
      var prevRight = undefined;
      var elastic = false;
      var vxSign = collided.direction != undefined ? collided.direction : collided.vx;

      if(collided.prevy != undefined) {
          prevBottom = collided.getPrevBottomY();
      }

      if(collided.prevx != undefined) {
          prevRight = collided.getPrevRightX();
      }

      if(prevBottom <= this.y && collided.vy >= 0) {
          reaction.y = this.y - collided.height;
          reaction.vy = elastic ? collided.vy * -1 : 0;
      } else if (collided.prevy >= this.getBottomY() && collided.vy <= 0) {
          reaction.y = this.y + this.height;
          reaction.vy = elastic ? collided.vy * -1 : 0;
      } else if ( (collided.prevx >= this.getRightX() && vxSign <= 0) || (collided.getRightX() > this.getRightX()) ) {
          reaction.x = this.x + this.width;
          reaction.vx = elastic ? collided.vx * -1 : 0;
      } else if ( (prevRight <= this.x && vxSign >= 0) || collided.x < this.x) {
          reaction.x = this.x - collided.width;
          reaction.vx = elastic ? collided.vx * -1 : 0;
      }
      
      // if(collided.y < this.y && prevBottom <= this.y) {
      //     reaction.y = this.y - collided.height;
      //     reaction.vy = elastic ? collided.vy * -1 : 0;
      // } else if(collided.y + collided.height > this.y + this.height && collided.prevy >= this.y + this.height) {
      //     reaction.y = this.y + this.height + 1;
      //     reaction.vy = elastic ? collided.vy * -1 : 0;
      // } else if(collided.x < this.x) {
      //     var newx = this.x - collided.width - 1;
      //     reaction.x = newx;
      //     reaction.vx = elastic ? collided.vx * -1 : 0;
      //     // collided.leftDirection();
      // } else {
      //     var newx = this.x + this.width + 1;
      //     reaction.x = newx;
      //     reaction.vx = elastic ? collided.vx * -1 : 0;
      //     // collided.rightDirection();
      // }

      return reaction;
  };

  return SolidBody;
})();
var SparkSFX = (function () {

  var LIFE_TIME = .12;
  var WIDTH = 28;
  var HEIGHT = 24;
  
  function SparkSFX () {
      this.imperviousToShootingRay = false;
      this.inUse = false;
      this.lifeTime = 0;

      this.spriteImg = sprite;
      this.animations = [];
      this.initAnimations();
  };

  SparkSFX.prototype = new BasicObject();

  SparkSFX.prototype.update = function (dt) {
      this.lifeTime += dt;
      if(this.lifeTime >= LIFE_TIME) {
          this.inUse = false;
          this.lifeTime = 0;
      }
  };

  SparkSFX.prototype.spawn = function (x, y) {
      this.x = x - WIDTH * .5;
      this.y = y - HEIGHT * .5;
      this.inUse = true;
      this.lifeTime = 0;
  };

  SparkSFX.prototype.render = function (viewport) {
      var animation = this.animations[0];
      if(animation) {
          animation.render(viewport, Math.floor(this.x), Math.floor(this.y));
      }
  };

  SparkSFX.prototype.initAnimations = function () {
      this.animations[0] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 2510
              }
          ],
          width:     WIDTH,
          height:    HEIGHT,
          frames:    1,
          animSpeed: 60
      }));
  };

  return SparkSFX;
})();
var ScoreSFX = (function () {

  var LIFE_TIME = 1;
  var ONE_UP_LIFE_TIME = 2;
  
  function ScoreSFX () {
      this.vy = -50;
      this.score = 0;
      this.imperviousToShootingRay = false;
      this.inUse = false;
      this.lifeTime = 0;

      this.spriteImg = sprite;
      this.animations = [];
      this.initAnimations();
  };

  ScoreSFX.prototype = new BasicObject();

  ScoreSFX.prototype.update = function (dt) {
      this.y += this.vy * dt;
      this.lifeTime += dt;
      var lifetime = this.score == 1 ? ONE_UP_LIFE_TIME : LIFE_TIME;
      if(this.lifeTime >= lifetime) {
          this.inUse = false;
          this.lifeTime = 0;
      }
  };

  ScoreSFX.prototype.spawn = function (x, y) {
      this.x = x;
      this.y = y;
      this.inUse = true;
      this.lifeTime = 0;
  };

  ScoreSFX.prototype.render = function (viewport) {
      if(Game.debugSettings.drawStats) {
          viewport.fillText(this.score, this.x, this.y);
      }
      var animation = this.animations[this.score];
      if(animation) {
          animation.render(viewport, Math.floor(this.x), Math.floor(this.y));
      }
  };

  ScoreSFX.prototype.initAnimations = function () {
      this.animations[100] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 2781
              }
          ],
          width:     48,
          height:    32,
          frames:    1,
          animSpeed: 60
      }));

      this.animations[200] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 2829
              }
          ],
          width:     48,
          height:    32,
          frames:    1,
          animSpeed: 60
      }));

      this.animations[400] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 2877
              }
          ],
          width:     48,
          height:    32,
          frames:    1,
          animSpeed: 60
      }));

      this.animations[1] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 3021
              }
          ],
          width:     48,
          height:    32,
          frames:    1,
          animSpeed: 60
      }));
  };

  return ScoreSFX;
})();
var SmokeSFX = (function () {

  var states = {
      DOWN:     0,
      UP:       1,
      STRAIGHT: 3
  };

  var LIFE_TIME = .4;
  var UPDATE_RATE = 7;
  
  function SmokeSFX () {
      this.vy = -30;
      this.imperviousToShootingRay = false;
      this.inUse = false;
      this.lifeTime = 0;
      this.width = 16;
      this.height = 16;
      this.state = states.STRAIGHT;
      this.idleTimeDuration = Game.calculateFrameDuration(UPDATE_RATE);
      this.affectedByGravity = false;
      this.imperviousToShootingRay = false;

      this.spriteImg = sprite;
      this.animations = [];
      this.initAnimations();
  };

  SmokeSFX.prototype = new Character();

  SmokeSFX.prototype.beforePositionUpdate = function (dt) {
      this.lifeTime += dt;
      if(this.lifeTime >= LIFE_TIME) {
          this.inUse = false;
          this.lifeTime = 0;
      }
  };

  SmokeSFX.prototype.spawn = function (x, y) {
      this.x = x - this.width * .5;
      this.y = y;
      this.inUse = true;
      this.lifeTime = 0;
      var animation = this.getAnimation();
      if(animation) { animation.reset(); }
  };

  SmokeSFX.prototype.render = function (viewport) {
      var animation = this.getAnimation();
      if(animation) {
          animation.render(viewport, Math.floor(this.x), Math.floor(this.y));
      }
  };

  SmokeSFX.prototype.switchToUp = function () {
      this.state = states.UP;
  };

  SmokeSFX.prototype.switchToDown = function () {
      this.state = states.DOWN;
  };

  SmokeSFX.prototype.switchToStraight = function () {
      this.state = states.STRAIGHT;
  };

  SmokeSFX.prototype.initAnimations = function () {
      this.animations[states.DOWN] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 3071
              },
              {
                  x: 3167
              }
          ],
          width:     this.width,
          height:    this.height,
          repeat:    false,
          frames:    2,
          animSpeed: UPDATE_RATE
      }));

      this.animations[states.UP] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 3103
              },
              {
                  x: 3199
              }
          ],
          width:     this.width,
          height:    this.height,
          repeat:    false,
          frames:    2,
          animSpeed: UPDATE_RATE
      }));

      this.animations[states.STRAIGHT] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 3135
              },
              {
                  x: 3231
              }
          ],
          width:     this.width,
          height:    this.height,
          repeat:    false,
          frames:    2,
          animSpeed: UPDATE_RATE
      }));
  };

  return SmokeSFX;
})();
var Zombie = (function(){

  var states = {
      walking:    0,
      falling:    1,
      atacking:   2
  };

  var UPDATERATE = 5;
  var DOWNSAIRS_RATE = 3.5;
  var ATACK_RATE = 9;
  var REGULAR_DURATION = Game.calculateFrameDuration(UPDATERATE);
  var DOWNSTAIRS_DURATION = Game.calculateFrameDuration(DOWNSAIRS_RATE);
  var ATACK_DURATION = Game.calculateFrameDuration(ATACK_RATE);
  var CUSTOM_GRAVITY = 16;
  var VX = 80;
  var MIN_CHECKTARGET_TIMEOUT = .5;
  var MAX_CHECKTARGET_TIMEOUT = 1.5;
  var ATACK_HOLD_TIME = .12;
  var KILL_PADDING = 49;

  var VISION_DISTANCE = 270;

  function generateTimeout () {
      return Math.random() * (MAX_CHECKTARGET_TIMEOUT - MIN_CHECKTARGET_TIMEOUT) + MIN_CHECKTARGET_TIMEOUT;
  };

  function Zombie () {
      this.vx = 0;
      this.width = 35;
      this.height = 80;
      this.state = states.walking;
      this.stateLocked = false;
      this.target = null;
      this.hitPoints = 2;
      this.goreAmount = 4;
      this.score = 100;
      this.damaging = false;
      this.collidedWithPlayer = false;
      this.targetInRange = false;
      this.idleTimeDuration = REGULAR_DURATION;
      this.checkTargetTime = 0;
      this.checkTargetTimeout = 0;
      this.atackHoldTime = -1;

      this.downstairs = false;

      this.color = 'rgba(0,250,10,1)';

      this.spriteImg = sprite;
      this.animations = [];
      this.initAnimations();
  };

  Zombie.prototype = new Character();

  Zombie.prototype.applyVerticalSpeed = function (dt, newData) {
      newData.vy += world.gravity * dt;
      newData.y += CUSTOM_GRAVITY;
  };

  Zombie.prototype.bumpCallBack = function () {
      if(this.targetInRange && this.checkTargetTimeout == 0) {
          this.checkTargetTimeout = generateTimeout();
      }
  };

  Zombie.prototype.resetCustomData = function () {
      this.collidedWithPlayer = false;
  };

  Zombie.prototype.beforePositionUpdate = function (dt) {
      if(this.checkTargetTimeout > 0 && this.checkTargetTime < this.checkTargetTimeout) {
          this.checkTargetTime += dt;
      } else {
          this.checkTargetTime = 0;
          this.checkTargetTimeout = 0;
      }

      if(this.atackHoldTime >= 0 && this.atackHoldTime < ATACK_HOLD_TIME) {
          this.atackHoldTime += dt;
      } else if(this.atackHoldTime >= ATACK_HOLD_TIME) {
          this.atackHoldTime = -1;
          this.stateLocked = false;
          this.damaging = false;
          this.animations[states.atacking].reset();
      }

      if(this.damaging) {
          this.killZone = {
              x: this.direction > 0 ? this.x + this.width * .5 : this.x + this.width * .5 - KILL_PADDING,
              y: this.y,
              width: KILL_PADDING,
              height: this.height
          };

          if(boxCollides(this.target, this.killZone)) {
              Game.playerDeathByZombie(player);
          }
      }
  };

  Zombie.prototype.getAnimation = function () {
      if(this.directionIsRight()) {
          this.animations[this.state].switchOrigin(0);
      } else {
          this.animations[this.state].switchOrigin(1);
      }

      return this.animations[this.state];
  };

  Zombie.prototype.updateState = function () {
      if(this.idleTime > 0) { return; }

      if(this.stateLocked){ return; }

      if(this.vy > 0) {
          this.state = states.falling;
      } else {
          this.state = states.walking;
      }

      if(this.state == states.falling) {
          this.vx = 0;
          this.idleTimeDuration = DOWNSTAIRS_DURATION;
          return;
      } else {
          this.vx = VX;
          this.idleTimeDuration = REGULAR_DURATION;
      }

      if(this.collidedWithPlayer) {
          this.vx = 0;
          this.state = states.atacking;
          this.idleTimeDuration = ATACK_DURATION;
          this.stateLocked = true;
      }
  };

  Zombie.prototype.checkTarget = function (dt) {
      if(this.idleTime > 0) { return; }

      if(this.checkTargetTimeout) {
          return;
      }

      var distanceX = Math.floor( this.x - this.target.x );
      var distanceY = Math.floor( this.y - this.target.y );
      var distance = Math.floor( Math.sqrt( Math.pow(distanceX, 2) + Math.pow(distanceY, 2) ) );

      this.downstairs = false;

      if(distance < VISION_DISTANCE) {
          this.targetInRange = true;
          var targetBottom = this.target.y + this.target.height;
          var currentData = {
              y: this.y,
              vy: this.vy
          };
          this.applyVerticalSpeed(dt, currentData);
          var myFutureBottom = currentData.y + this.height;

          if(this.target.y > this.y && this.target.y < myFutureBottom ||
             targetBottom > this.y && targetBottom < myFutureBottom ) {
              distanceX > 0 ? this.leftDirection() : this.rightDirection();
          }

          if(targetBottom > myFutureBottom) {
              this.downstairs = true;
          }
      } else {
          this.targetInRange = false;
      }
  };

  Zombie.prototype.resolveCollision = function (collided, dt) {
      if(this.idleTime > 0) { return; }

      var reaction = null;

      if(collided instanceof SolidBody) {
          reaction = collided.getCollisionReaction(this);

          if(reaction.y != undefined && reaction.y <= this.y) {
              this.floor = collided;
          } else if(reaction.x + this.width == collided.x) {
              this.leftDirection();
              this.bumpCallBack();
          } else if (reaction.x == collided.x + collided.width) {
              this.rightDirection();
              this.bumpCallBack();
          }
      }

      if(collided instanceof Player) {
          this.collidedWithPlayer = true;
      }

      if(collided instanceof JumpableBody) {
          reaction = collided.getCollisionReaction(this);

          if(reaction.y != undefined && reaction.y <= this.y) {
              if(this.state != states.atacking && this.downstairs && this.x > collided.x && this.x + this.width < collided.x + collided.width) {
                  return;
              }
              this.floor = collided;
          }
      }

      if(reaction) {
          this.applyReaction(reaction);
      }
  };

  Zombie.prototype.atackFinished = function () {
      this.atackHoldTime = 0;
  };

  Zombie.prototype.atackStarted = function () {
      this.damaging = true;
  };

  Zombie.prototype.initAnimations = function () {
      this.animations[states.walking] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 0,
                  y: 164,
                  offsetx: -6
              },
              {
                  x: 494,
                  y: 164,
                  offsetx: -8
              }
          ],
          width:     50,
          height:    80,
          frames:    4,
          animSpeed: UPDATERATE,
      }));

      this.animations[states.falling] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 988,
                  y: 164,
                  offsetx: -6
              }
          ],
          width:     50,
          height:    80,
          frames:    2,
          animSpeed: DOWNSAIRS_RATE,
      }));

      this.animations[states.atacking] = (new Sprite({
          img: this.spriteImg,
          origins:   [
              {
                  x: 200,
                  y: 164,
                  offsetx: -20
              },
              {
                  x: 694,
                  y: 164,
                  offsetx: -43
              }
          ],
          width:     98,
          height:    80,
          frames:    3,
          repeat:    false,
          animSpeed: ATACK_RATE,
          callbacks: [
              {
                  frame: 1,
                  cb:    this.atackStarted.bind(this)
              },
              {
                  frame: 2,
                  cb:    this.atackFinished.bind(this)
              }
          ]
      }));
  };

  return Zombie;
})();
var Gore = (function () {

  var LIFE_TIME = .7;

  var states = {
      falling: 0,
      rising:  1,
      lying:   2
  };

  function initAnimations () {
      this.animations[states.falling] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 2354,
              },
              {
                  x: 2414,
              }
          ],
          width:     30,
          height:    28,
          frames:    2,
          animSpeed: 10,
      }));

      this.animations[states.rising] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 2234,
              },
              {
                  x: 2294,
              }
          ],
          width:     30,
          height:    28,
          frames:    2,
          animSpeed: 10,
      }));

      this.animations[states.lying] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 2474,
              }
          ],
          width:     32,
          height:    28,
          frames:    1,
          animSpeed: 10,
      }));
  };

  function Gore () {
      this.width = 32;
      this.height = 28;
      this.inUse = false;
      this.layingCounter = 0;
      this.state = states.rising;
      this.imperviousToShootingRay = false;
      this.color = 'cyan';

      this.animations = [];
      this.spriteImg = sprite;

      initAnimations.call(this);
  };

  Gore.prototype = new Character();

  Gore.prototype.spawn = function (x, y, vx, vy) {
      this.x = x;
      this.y = y;
      this.vx = vx || 150;
      this.vy = vy || 0;
      this.inUse = true;
      this.layingCounter = 0;
  };

  Gore.prototype.updateState = function () {
      this.prevState = this.state;

      if(this.vy < 0) {
          this.state = states.rising;
      } else if(this.vy > 0){
          this.state = states.falling;
      } else {
          this.state = states.lying;
      }
  };

  Gore.prototype.resolveCollision = function (collided, dt) {
      var reaction = null;
      if(collided instanceof SolidBody || collided instanceof JumpableBody) {
          reaction = collided.getCollisionReaction(this);
      }

      if(reaction) {
          if(reaction.y != undefined && reaction.y <= this.y) {
              this.vx = 0;
              this.layingCounter += dt;
              if(this.layingCounter >= LIFE_TIME) {
                  this.inUse = false;
                  this.layingCounter = 0;
              }
          } else if (reaction.x != undefined) {
              this.vx *= .5;
              this.switchDirection();
          }

          this.applyReaction(reaction, {ignorvx: true});
      }
  };

  Gore.prototype.getAnimation = function () {
      if(this.state != this.prevState) {
          this.animations[this.state].reset();
      }

      if(this.directionIsRight()) {
          this.animations[this.state].switchOrigin(0);
      } else {
          this.animations[this.state].switchOrigin(1);
      }

      return this.animations[this.state];
  };

  return Gore;
})();
var SFXPool = (function () {

  function allocate (pool, amount) {
      if(!pool) { return; }

      if(isNaN(amount) || amount <= 0) {
          amount = 1;
      }

      if(amount > pool.length){
          amount = pool.length;
      }

      var initialAmount = amount;
      var returned = [];

      //try to find free
      for(var i = pool.length - 1; i >= 0; i--) {
          if(!pool[i].inUse){
              returned.push(pool[i]);
              amount--;
              if(amount == 0) { break; }
          }
      }

      //if not enough allocate those in use
      if(returned.length < initialAmount) {
          for(var i = pool.length - 1; i >= 0; i--){
              if(pool[i].inUse){
                  returned.push(pool[i]);
                  amount--;
                  if(amount == 0) { break; }
              }
          }
      }

      return returned;
  };

  function getSpawned (pool) {
      if(!pool) { return; }

      var inUse = [];
      for(var i = pool.length - 1; i >= 0; i--){
          if(pool[i].inUse){
              inUse.push(pool[i]);
          }
      }

      return inUse;
  };

  function SFXPool () {
      this._scoreSFXPool = [];
      this._gorePool = [];
      this._sparkSFXPool = [];
      this._smokeSFXPool = [];
  };

  SFXPool.prototype.init = function () {
      this._scoreSFXPool = [];
      this._gorePool = [];
      this._sparkSFXPool = [];
      this._smokeSFXPool = [];
      
      var scoreSFXAmount = 4;
      var goreAmount =     20;
      var sparksAmount =   4;
      var smokeAmount =    2;

      for(var i = scoreSFXAmount - 1; i >= 0; i--) {
          this._scoreSFXPool.push(new ScoreSFX());
      }

      for(var i = goreAmount - 1; i >= 0; i--) {
          this._gorePool.push(new Gore());
      }

      for(var i = sparksAmount - 1; i >= 0; i--) {
          this._sparkSFXPool.push(new SparkSFX());
      }

      for(var i = smokeAmount - 1; i >= 0; i--) {
          this._smokeSFXPool.push(new SmokeSFX());
      }
  };

  SFXPool.prototype.allocateSmokeSFX = function (amount) {
      return allocate(this._smokeSFXPool, amount);
  };

  SFXPool.prototype.allocateScoreSFX = function (amount) {
      return allocate(this._scoreSFXPool, amount);
  };

  SFXPool.prototype.getSpawnedScoreSFX = function () {
      return getSpawned(this._scoreSFXPool);
  };

  SFXPool.prototype.allocateGore = function (amount) {
      return allocate(this._gorePool, amount);
  };

  SFXPool.prototype.getSpawnedGore = function () {
      return getSpawned(this._gorePool);
  };

  SFXPool.prototype.allocateSparkSFX = function (amount) {
      return allocate(this._sparkSFXPool, amount);
  };

  SFXPool.prototype.getSpawnedSparkSFX = function () {
      return getSpawned(this._sparkSFXPool);
  };

  SFXPool.prototype.getSpawnedSmokeSFX = function () {
      return getSpawned(this._smokeSFXPool);
  };

  return SFXPool;
})();
var Player = (function () {

  function ShootingRay () {
      this.a = { x: 0, y: 0 };
      this.b = { x: 0, y: 0 };
  };

  function buildShootingRays () {
      var rays = [];
      for(var i = 0; i < 3; i++) {
          rays.push(new ShootingRay());
      }

      return rays;
  };

  function oneUp (object) {
      davesLeft++;
      var scoresfx = sfxPool.allocateScoreSFX()[0];
      scoresfx.score = 1;
      scoresfx.spawn(object.x, object.y - 35);
  };

  var states = {
      standing:      0,
      falling:       1,
      jumping:       2,
      running:       3,
      aimup:         4,
      aimdown:       5,
      aimstraight:   6,
      reloading:     7,
      floating:      8,
      shootUp:       9,
      shootDown:     10,
      shootStraight: 11,
      openingDoor:   12,
      enteringDoor:  13
  };

  var davesLeft = 3;

  var smokeSpawnOffsets = {
      up: {
          x: 27,
          y: -16,
      },
      down: {
          x: 38,
          y: 31,
      },
      straight: {
          x: 40,
          y: 5
      }
  };

  var VX            = 200;
  var JUMP_SPEED_0  = -315;
  var AIR_DRAG      = 1500;
  var floatingSpeed = -200;
  var FALLITIMEOUT  = .7; //just for sake of replica quality (dave moves his legs while falling)
  var JUMP_TIME     = .208;
  var IDLETIMEOUT   = .4;
  var RECOIL        = 500;
  var JUMP_SHIFT    = 250;
  var MAXAMMO       = 8;
  var RIGHTOFFSET   = -4;
  var LEFTOFFSET    = -14;
  var ammoOffset    = 20;


  function Player() {
      this.width = 30;
      this.height = 64;
      this.recoil = 0;
      this.ammo = 8;
      this.jumpSpeed = 0;
      this.idleTime = 0;
      this.fallingTime = -1;
      this.jumpTime = -1;
      this.state = states.standing;
      this.prevState = this.state;
      this.stateLocked = false;
      this.shooting = false;
      this.grounded = true;
      this.downstairs = false;
      this.prevy = 0;
      this.imperviousToShootingRay = false;
      this.facedWardrobe = null;
      this.facedPortal = null;
      this.shootingRays = buildShootingRays();
      this.hitPoint = null; // preserved only for debug ray rendering
      this.hitPoints = [];
      this.canPlayCeilBump = true;
      this.airDrag = 0;

      this.spriteImg = sprite;
      this.animations = [];
      this.ammoAnimations = [];

      this.initAnimations();
  };

  Player.prototype = new Character();

  Player.prototype.setInitialPosition = function(x, y) {
      if(!x || !y) { return; }
          
      this.x = x;
      this.y = y;

      this.rightDirection();
  };

  Player.prototype.update = function(dt) {
      var animation = this.getAnimation();

      if(!this.stateLocked && this.state != states.aimdown && this.state != states.falling && keyboard.pressed[keyboard.keys.SPACE] && this.jumpTime < JUMP_TIME) {
          this.jumpSpeed = JUMP_SPEED_0 - world.getMaxVY() - world.gravity * dt;
          this.jumpTime += dt;
      } else if(!keyboard.pressed[keyboard.keys.SPACE]) {
          if(this.grounded) {
              this.jumpTime = 0;
              this.airDrag = 0;
          } else {
              this.jumpTime = JUMP_TIME;
          }
      }

      if(keyboard.pressed[keyboard.keys.LEFT]) {
          if(this.grounded) {
              this.vx = -VX;
              this.airDrag = -VX;
          } else {
              this.airDrag = Math.max(-VX, this.airDrag - AIR_DRAG * dt);
              this.vx = this.airDrag;
          }
          if(this.directionIsRight()) {
              if(this.state == states.running) {
                  animation.reset();
              }
              if(this.vx <= 0) {
                  this.leftDirection();
              }
          }
      } else if(keyboard.pressed[keyboard.keys.RIGHT]) {
          if(this.grounded) {
              this.vx = VX;
              this.airDrag = VX;
          } else {
              this.airDrag = Math.min(VX, this.airDrag + AIR_DRAG * dt);
              this.vx = this.airDrag;
          }
          if(this.directionIsLeft()) {
              if(this.state == states.running) {
                  animation.reset();
              }
              if(this.vx >= 0) {
                  this.rightDirection();    
              }
          }
      } else {
          this.vx = 0;
      }

      if(this.vy == 0 && (keyboard.pressed[keyboard.keys.UP] || keyboard.pressed[keyboard.keys.DOWN])) {
          this.vx = 0;
      }

      if(this.vy == 0) {
          if(this.stateLocked) {
              this.vx = 0;
          }
      }

      if(this.shooting) {
          this.stopShoot();
      }

      if(this.state == states.standing || this.state == states.reloading) {
          this.idleTime += dt;
      } else {
          this.idleTime = 0;
      }

      if(this.fallingTime >= 0 && this.state == states.falling) {
          this.fallingTime += dt;
      }

      animation.update(dt);

      this.vx += this.recoil;

      if(!this.grounded) {
          this.jumpSpeed = Math.min(0, this.jumpSpeed + world.gravity * dt);
      }
      this.vy = world.getMaxVY() + this.jumpSpeed;

      this.prevx = this.x;
      this.prevy = this.y;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.recoil = 0;
  };

  Player.prototype.updateState = function(dt) {
      this.prevState = this.state;

      if(this.stateLocked) { return; }

      this.downstairs = false;

      if(this.vy < floatingSpeed) {
          this.state = states.jumping;
          this.grounded = false;
      } else if((this.vy < 0 && this.vy >= floatingSpeed) || (this.fallingTime >= FALLITIMEOUT && this.vy > 0)) {
          this.state = states.floating;
          this.grounded = false;
      } else if(this.vy > 0){
          this.state = states.falling;
          this.grounded = false;
          if(this.fallingTime == -1) {
              this.fallingTime = 0;
          }
      } else if(this.grounded) {
          this.state = states.standing;
          this.fallingTime = -1;
      }

      if(this.state == states.falling || this.state == states.jumping || this.state == states.floating) { return; }

      if(this.idleTime >= IDLETIMEOUT && this.ammo < MAXAMMO) {
          this.state = states.reloading;
      }

      if(keyboard.pressed[keyboard.keys.DOWN] && keyboard.pressed[keyboard.keys.SPACE]){
          this.downstairs = true;
      }

      if(this.vx != 0) {
          this.state = states.running;
      }

      if(keyboard.pressed[keyboard.keys.UP]) {
          if(this.facedWardrobe) {
              this.state = states.openingDoor;
              this.stateLocked = true;
          } else if(this.facedPortal) {
              if(this.facedPortal.isOpened()) {
                  this.state = states.enteringDoor;
              } else {
                  this.state = states.openingDoor;
              }
              this.stateLocked = true;
          } else {
              this.state = states.aimup;
          }
      } else if(keyboard.pressed[keyboard.keys.DOWN]) {
          this.state = states.aimdown;
      }

      if(keyboard.pressed[keyboard.keys.ALT]) {
          if(!this.shooting){
              if(this.state == states.aimup) {
                  this.state = states.shootUp;
              } else if (this.state == states.aimdown) {
                  this.state = states.shootDown;
              } else {
                  this.state = states.shootStraight;
              }
          }
      } else {
          this.shooting = false;
      }

      if(this.state == states.shootUp || this.state == states.shootDown || this.state == states.shootStraight) {
          if(this.state == states.shootStraight) {
              this.stateLocked = true;
          } else {
              this.shooting = true;
              this.stateLocked = true;
              this.shoot();
          }
      }
  };

  Player.prototype.getShootingRays = function () {
      if(this.shootingRays[0].b.x == this.shootingRays[0].a.x) {
          return null;
      }
      return this.shootingRays;
  };

  Player.prototype.shoot = function () {
      if(this.ammo == 0) {
          this.stateLocked = false;
          return false;
      }

      // if(this.directionIsRight()) {
      //     this.recoil = -500;
      // } else {
      //     this.recoil = 500;
      // }

      var x = 0, y = 0;
      var smokeSFX = sfxPool.allocateSmokeSFX()[0];
      if(this.state == states.shootUp) {
          smokeSFX.switchToUp();
          x = this.x + this.width * .5 + smokeSpawnOffsets.up.x * this.direction;
          y = this.y + smokeSpawnOffsets.up.y;
      } else if (this.state == states.shootDown) {
          smokeSFX.switchToDown();
          x = this.x + this.width * .5 + smokeSpawnOffsets.down.x * this.direction;
          y = this.y + smokeSpawnOffsets.down.y;
      } else if (this.state == states.shootStraight) {
          smokeSFX.switchToStraight();
          x = this.x + this.width * .5 + smokeSpawnOffsets.straight.x * this.direction;
          y = this.y + smokeSpawnOffsets.straight.y;
      }

      if(this.directionIsRight()) {
          smokeSFX.rightDirection();
      } else {
          smokeSFX.leftDirection();
      }

      smokeSFX.spawn(x, y);

      if(!Game.isHardcore()) {
          this.ammo--;
      }
      
      for(var i = 0; i < this.shootingRays.length; i++) {
          this.shootingRays[i].a.x = this.x + this.width * .5;
          this.shootingRays[i].b.x = this.shootingRays[i].a.x + this.direction;
      }
      
      if(this.state == states.shootUp || this.state == states.aimup) {
          for(var i = 0; i < this.shootingRays.length; i++) {
              this.shootingRays[i].a.y = this.y + this.height * .3;
              this.shootingRays[i].b.y = this.shootingRays[i].a.y - (.9 - .2 * i);
          }
      } else if(this.state == states.shootDown || this.state == states.aimdown) {
          for(var i = 0; i < this.shootingRays.length; i++) {
              this.shootingRays[i].a.y = this.y + this.height * .45;
              this.shootingRays[i].b.y = this.shootingRays[i].a.y + (.3 + .15 * i);
          }
      } else if(this.state == states.shootStraight || this.state == states.running || this.state == states.standing) {
          for(var i = 0; i < this.shootingRays.length; i++) {
              this.shootingRays[i].a.y = this.y + this.height * .45;
              this.shootingRays[i].b.y = this.shootingRays[i].a.y - (.01 - .01 * i);
          }
      }

      return true;
  };

  Player.prototype.shootSuccess = function (hitPoint, hitPoints) {
      if(!hitPoint) {
          return;
      }

      var spark = sfxPool.allocateSparkSFX()[0];
      spark.spawn(hitPoint.x, hitPoint.y);
      //play successshoot sound
      this.hitPoint = hitPoint;
      this.hitPoints = hitPoints;
  };

  Player.prototype.shootFail = function () {
      
  };

  Player.prototype.stopShoot = function () {
      for(var i = 0; i < this.shootingRays.length; i++) {
          this.shootingRays[i].b.x = this.shootingRays[i].a.x;
          this.shootingRays[i].b.y = this.shootingRays[i].a.y;
      }
  };

  Player.prototype.shootFinishedCallBack = function () {
      this.stateLocked = false;
  };

  Player.prototype.shootrecoilCallBack = function () {
      if(this.directionIsRight()) {
          this.recoil = -RECOIL;
      } else {
          this.recoil = RECOIL;
      }
  };

  Player.prototype.shootStraightCallBack = function () {
      this.shooting = true;
      if( this.shoot() ) {
          this.shootrecoilCallBack();
      }
  };

  Player.prototype.openedDoorCallBack = function () {
      if(this.facedWardrobe) {
          this.facedWardrobe.open();
          this.facedWardrobe = null;
      } else if(this.facedPortal) {
          this.facedPortal.open();
          this.facedPortal = null;
      }
      this.stateLocked = false;
  };

  Player.prototype.enterDoorCallBack = function () {
      if(this.facedPortal.exit != null) {
          this.stateLocked = false;
      }
      
      if(this.facedPortal) {
          this.facedPortal.enter(this);
          this.facedPortal = null;
      }
  };

  Player.prototype.reloadGun = function () {
      if(this.ammo == MAXAMMO) { return; }
      this.ammo++;
  };

  Player.prototype.renderRay = function (viewport, ray) {
      viewport.setStrokeStyle('red');
      viewport.getContext().beginPath();
      viewport.moveTo(Math.floor(ray.a.x), Math.floor(ray.a.y));
      viewport.lineTo(Math.floor(ray.b.x), Math.floor(ray.b.y));
      viewport.getContext().closePath();
      viewport.getContext().stroke();
  };

  Player.prototype.getAnimation = function () {
      if(this.state != this.prevState) {
          this.animations[this.state].reset();
      }

      if(this.directionIsRight()) {
          this.animations[this.state].switchOrigin(0);
      } else {
          this.animations[this.state].switchOrigin(1);
      }

      return this.animations[this.state];
  };

  Player.prototype.getAmmoAnimation = function () {
      return this.ammoAnimations[this.ammo];
  };

  Player.prototype.render = function(viewport) {
      if(Game.debugSettings.drawStats) {
          viewport.setFillStyle( 'black' );
          viewport.fillText( 'state: ' + this.state, Math.floor(this.x), Math.floor(this.y) - 15 );
          viewport.fillText( 'direction: ' + this.direction, Math.floor(this.x), Math.floor(this.y) - 3 );
      }
      
      if(Game.debugSettings.drawBoundingBox) {
          viewport.setFillStyle( 'rgba(0,250,200,1)' );
          viewport.fillRect( Math.floor(this.x), Math.floor(this.y), this.width, this.height );
      }

      if(Game.debugSettings.drawBoundingBox && this.hitPoint != null) {
          for(var i = 0; i < this.hitPoints.length; i++) {
              this.renderRay(viewport, {a: this.shootingRays[i].a, b: this.hitPoints[i]});
          }
          this.hitPoints = [];
          // this.renderRay(viewport, {a: this.shootingRays.a, b: this.hitPoint});
          // this.hitPoint = null;
      }

      this.getAnimation().render(viewport, this.x, this.y);
      var viewportBounds = viewport.getBounds();
      this.getAmmoAnimation().render(viewport, viewportBounds.x, viewportBounds.y);
  };

  Player.prototype.obtainScore = function (object) {
      if(!object || object.score == undefined) { return; }

      if(object.score == 1) {
          oneUp.call(this, object);
      } else {
          this.score += object.score;
          var scoresfx = sfxPool.allocateScoreSFX()[0];
          scoresfx.score = object.score;
          scoresfx.spawn(object.x, object.y);

          if(this.score % 10000 == 0) {
              oneUp.call(this, object);
          }
      }
  };

  Player.prototype.resolveCollision = function(collided, dt) {
      var landed = false;
      var reaction = null;
      var reactionConfig = {
          ignorx: false,
          ignory: false,
          ignorvx: false,
          ignorvy: false
      };

      if(collided instanceof SolidBody) {
          reaction = collided.getCollisionReaction(this);

          if(reaction.y != undefined && reaction.y <= this.y && collided.y > this.y) {
              if(!this.grounded) {
                  landed = true;
                  this.grounded = true;
              }
          } else if (reaction.y != undefined && reaction.y > this.y && collided.y < this.y) {
              this.grounded = false;
              reactionConfig.ignorvy = true;
              this.jumpSpeed = -world.getMaxVY();
              if(this.canPlayCeilBump) {
                  this.canPlayCeilBump = false;
              }
          }
      }

      if(collided instanceof JumpableBody) {
          if(this.downstairs) {
              return;
          }

          reaction = collided.getCollisionReaction(this);

          if(reaction.y != undefined && reaction.y <= this.y) {
              if(!this.grounded) {
                  landed = true;
                  this.grounded = true;
              }
          }
      }

      if(reaction) {
          this.applyReaction(reaction, reactionConfig);
      }

      if(landed) {
          if(this.directionIsLeft()) {
              this.x -= JUMP_SHIFT * dt;
          } else {
              this.x += JUMP_SHIFT * dt;
          }
      }
  };

  Player.prototype.getStandingSprite = function () {
      return this.animations[states.standing];
  };

  Player.prototype.getLives = function () {
      return davesLeft;
  };

  Player.prototype.death = function () {
      davesLeft--;
  };

  Player.prototype.floatingCallBack = function () {
      this.fallingTime = -1;
  };

  Player.prototype.reset = function (preserveScore, preserveLives) {
      if(!preserveLives) {
          davesLeft = 3;
      }

      if(!preserveScore) {
          this.score = 0;
      }

      this.recoil = 0;
      this.ammo = 8;
      this.idleTime = 0;
      this.state = states.standing;
      this.prevState = this.state;
      this.stateLocked = false;
      this.shooting = false;
      this.grounded = true;
      this.downstairs = false;
      this.prevy = 0;
      this.facedWardrobe = null;
      this.facedPortal = null;
      this.shootingRays = buildShootingRays();
      this.hitPoint = null;
      this.hitPoints = [];
  };

  Player.prototype.initAnimations = function () {
      var ammoSpriteWidth = 70;
      for(var i = this.ammo; i >= 0; i--) {
          this.ammoAnimations.unshift(new Sprite({
              img: this.spriteImg,
              origins: [
                  {
                      x: 1456 + ammoSpriteWidth * i,
                      offsetx: ammoOffset,
                      offsety: ammoOffset
                  }
              ],
              width: ammoSpriteWidth,
              height: 32,
              frames: 1
          }));
      }

      this.animations[states.standing] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 0,
                  offsetx: RIGHTOFFSET
              },
              {
                  x: 384,
                  offsetx: LEFTOFFSET
              }
          ],
          width:     48,
          height:    64,
          frames:    1,
          animSpeed: 60,
      }));

      this.animations[states.falling] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 336,
                  offsetx: RIGHTOFFSET
              },
              {
                  x: 720,
                  offsetx: LEFTOFFSET
              }
          ],
          width:     48,
          height:    64,
          frames:    1,
          animSpeed: 60,
      }));

      this.animations[states.jumping] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 240,
                  offsetx: RIGHTOFFSET - 2
              },
              {
                  x: 624,
                  offsetx: LEFTOFFSET
              }
          ],
          width:     48,
          height:    64,
          frames:    1,
          animSpeed: 60,
      }));

      this.animations[states.floating] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 288,
                  offsetx: RIGHTOFFSET
              },
              {
                  x: 672,
                  offsetx: LEFTOFFSET
              }
          ],
          width:     48,
          height:    64,
          frames:    1,
          animSpeed: 3,
          callbacks : [
              {
                  frame: 0,
                  cb:    this.floatingCallBack.bind(this)
              }
          ]
      }));

      this.animations[states.running] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 48,
                  offsetx: RIGHTOFFSET - 4
              },
              {
                  x: 432,
                  offsetx: LEFTOFFSET + 4
              }
          ],
          width:     48,
          height:    64,
          frames:    4,
          animSpeed: 13
      }));

      this.animations[states.aimup] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 980,
                  offsetx: RIGHTOFFSET + 2
              },
              {
                  x: 1276,
                  offsetx: LEFTOFFSET + 4
              }
          ],
          width:     42,
          height:    64,
          frames:    1,
          animSpeed: 13
      }));

      this.animations[states.aimdown] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 1064,
                  offsetx: RIGHTOFFSET + 2
              },
              {
                  x: 1360,
                  offsetx: LEFTOFFSET - 2
              }
          ],
          width:     48,
          height:    64,
          frames:    1,
          animSpeed: 13
      }));

      this.animations[states.aimstraight] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 864,
                  offsetx: RIGHTOFFSET + 6
              },
              {
                  x: 1160,
                  offsetx: LEFTOFFSET - 12
              }
          ],
          width:     54,
          height:    64,
          frames:    1,
          animSpeed: 5
      }));

      this.animations[states.shootUp] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 980,
                  offsetx: RIGHTOFFSET + 2
              },
              {
                  x: 1276,
                  offsetx: LEFTOFFSET + 4
              }
          ],
          width:     42,
          height:    64,
          frames:    2,
          animSpeed: 5,
          callbacks: [
              {
                  frame: 0,
                  cb:    this.shootrecoilCallBack.bind(this)
              },
              {
                  frame: 1,
                  cb:    this.shootFinishedCallBack.bind(this)
              }
          ]
      }));

      this.animations[states.shootDown] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 1064,
                  offsetx: RIGHTOFFSET + 2
              },
              {
                  x: 1360,
                  offsetx: LEFTOFFSET - 2
              }
          ],
          width:     48,
          height:    64,
          frames:    2,
          animSpeed: 5,
          callbacks: [
              {
                  frame: 0,
                  cb:    this.shootrecoilCallBack.bind(this)
              },
              {
                  frame: 1,
                  cb:    this.shootFinishedCallBack.bind(this)
              }
          ]
      }));

      this.animations[states.shootStraight] = (new Sprite({
          img:       this.spriteImg,
          origins:   [
              {
                  x: 864,
                  offsetx: RIGHTOFFSET + 6
              },
              {
                  x: 1160,
                  offsetx: LEFTOFFSET - 12
              }
          ],
          width:     58,
          height:    64,
          frames:    2,
          animSpeed: 5,
          callbacks: [
              {
                  frame: 0,
                  cb:    this.shootStraightCallBack.bind(this)
              },
              {
                  frame: 1,
                  cb:    this.shootFinishedCallBack.bind(this)
              }
          ]
      }));

      this.animations[states.reloading] = (new Sprite({
          img: this.spriteImg,
          origins: [
              {
                  x: 768,
                  offsetx: -7
              }
          ],
          width: 48,
          height: 64,
          frames: 2,
          animSpeed: 3.6,
          callbacks: [
              {
                  frame: 0,
                  cb:    this.reloadGun.bind(this)
              }
          ]
      }));

      this.animations[states.openingDoor] = (new Sprite({
          img: this.spriteImg,
          origins: [
              {
                  x: 2086
              }
          ],
          width: 36,
          height: 64,
          frames: 1,
          animSpeed: 2,
          callbacks: [{
              frame: 0,
              cb:    this.openedDoorCallBack.bind(this)
          }]
      }));

      this.animations[states.enteringDoor] = (new Sprite({
          img: this.spriteImg,
          origins: [
              {
                  x: 2122
              }
          ],
          width: 36,
          height: 64,
          frames: 3,
          repeat: false,
          animSpeed: 3.5,
          callbacks: [{
              frame: 2,
              cb:    this.enterDoorCallBack.bind(this)
          }]
      }));
  };

  return Player;
})();
(function () {
  var cnv = null;
  var ctx = null;
  var bufferCnv = null;
  var bufferCtx = null;
  var currentCtx = null;
  var offsetX = 0;
  var offsetY = 0;
  var minOffsetX = 0;
  var minOffsetY = 0;
  var maxOffsetX = 0;
  var maxOffsetY = 0;
  var target = null;
  var idleZoneVertPadding = 54;
  var idleZoneHorPadding = 35;
  var idleZone = {
      x:      0,
      y:      0,
      right:  0,
      bottom: 0,

      render: function () {
          ctx.strokeStyle = 'red';
          ctx.strokeRect(this.x, this.y, this.right - this.x, this.bottom - this.y);
      }
  };
  // var quadTreeNodes = [];

  function getViewportToWorldPos (x, y) {
      return {
          x: x - offsetX,
          y: y - offsetY
      };
  };

  function getWorldToViewportPos (x, y) {
      return {
          x: x + offsetX,
          y: y + offsetY
      };
  };

  function refreshIdleZone () {
      idleZone.x = Math.floor(cnv.width * .5) - Math.floor(target.width * .5) - idleZoneHorPadding + 25;
      idleZone.y = Math.floor(cnv.height * .5) - Math.floor(target.height * .5) - idleZoneVertPadding + 31;
      idleZone.right = idleZone.x + idleZoneHorPadding * 2 + target.width;
      idleZone.bottom = idleZone.y + idleZoneVertPadding * 2 + target.height;
  }

  window.viewport = {
      /*
       * @param: spaceW, spaceH - dimensions of the game space. Actually width and height of the map;
       */
      init: function (leftOffset, topOffset, rightOffset, bottomOffset, spaceW, spaceH) {
          cnv = document.querySelector('#viewport');
          ctx = cnv.getContext('2d');
          bufferCnv = document.createElement('canvas');
          bufferCnv.width = cnv.width;
          bufferCnv.height = cnv.height;
          bufferCtx = bufferCnv.getContext('2d');

          offsetX = minOffsetX = leftOffset;
          offsetY = minOffsetY = topOffset;
          maxOffsetX = spaceW - cnv.width - rightOffset;
          maxOffsetY = spaceH - cnv.height - bottomOffset;
          // window.addEventListener('resize', this.resize.bind(this));
          // cnv.removeEventListener('click', this.onclick);
          // cnv.removeEventListener('contextmenu', this.oncontextclick);
          // cnv.addEventListener('click', this.onclick);
          // cnv.addEventListener('contextmenu', this.oncontextclick);
          // this.resize();
      },

      follow: function (newtarget) {
          if(target != null) {
              target.trackedByCamera = false;
          }
          target = newtarget;
          target.trackedByCamera = true;
          refreshIdleZone();
          this.align();
      },

      /*
       * calls update method of the target. This one works in conjunction with main update function
       */
      updateTarget: function (dt) {
          if(typeof target.update !== 'function'){ return; }
          target.update(dt);
      },

      /*
       * updates the viewport position according to target object
       */
      align: function () {
          // offsetX = Math.floor(target.x - cnv.width * .5);
          // offsetY = Math.floor(target.y - cnv.height * .5);

          var targetRltv = getViewportToWorldPos(target.x, target.y);
          var targetRight = targetRltv.x + target.width;
          var targetBottom = targetRltv.y + target.height;

          if(targetRltv.x < idleZone.x){
              offsetX = Math.min( Math.max( minOffsetX, Math.floor(target.x - idleZone.x) ), maxOffsetX );
          }
          if(targetRight > idleZone.right){
              offsetX = Math.min( Math.max( minOffsetX, Math.floor(target.x - idleZone.right + target.width) ), maxOffsetX );
          }
          if(targetRltv.y < idleZone.y){
              offsetY = Math.min( Math.max( minOffsetY, Math.floor(target.y - idleZone.y) ), maxOffsetY );
          }
          if(targetBottom > idleZone.bottom){
              offsetY = Math.min( Math.max( minOffsetY, Math.floor(target.y - idleZone.bottom + target.height) ), maxOffsetY );
          }
      },

      renderIdleZone: function () {
          idleZone.render();
      },

      getContext: function () {
          return currentCtx;
      },

      flushCurrentFrameToBuffer: function () {
          bufferCtx.drawImage(cnv, 0, 0);
      },

      switchToBufferContext: function () {
          currentCtx = bufferCtx;
      },

      switchToMainContext: function () {
          currentCtx = ctx;
      },

      renderBufferContextToMain: function () {
          ctx.drawImage(bufferCnv, 0, 0);
      },

      getBounds: function () {
          return {
              x: offsetX,
              y: offsetY,
              width: cnv.width,
              height: cnv.height
          };
      },

      // getQuadTreeNodes: function() {
      //     this.quadTreeNodes = [];
      //     this.quadTree.findAllNodes(this.quadTreeNodes);
      // },

      oncontextclick: function(e) {
          e.preventDefault();

          var origin = getWorldToViewportPos(e.pageX, e.pageY);
          Game.spawnMonster(new Goblin(), origin.x, origin.y);

          // var probe = {
          //     x: e.pageX,
          //     y: e.pageY,
          //     width:  3,
          //     height: 3
          // };

          // var obj = [];

          // quadTree.findObjects(probe, obj);
          
          // boxes.forEach(function(item){
          //     item.color = 'hotpink';
          // });
          // console.log(obj);
          // obj.forEach(function(item){
          //     item.color = 'blue';
          // });
      },

      onclick: function(e){
          var origin = getWorldToViewportPos(e.pageX, e.pageY);
          Game.spawnMonster(new Zombie(), origin.x, origin.y);
      },

      // resize: function(){
      //     this.cnv.width = window.innerWidth;
      //     this.cnv.height = window.innerHeight;
      //     this.quadTree = new QuadTree({
      //         x: 0,
      //         y: 0,
      //         width:  this.cnv.width,
      //         height: this.cnv.height
      //     });
      // },

      clear: function(){
          currentCtx.fillStyle = 'black';
          currentCtx.fillRect(0, 0, cnv.width, cnv.height);
      },

      moveTo: function (x, y) {
          if(x == undefined || y == undefined) {
              console.error('ERR: x or y undefined');
              return;
          }

          var newOrigin = getViewportToWorldPos(x, y);
          currentCtx.moveTo(newOrigin.x, newOrigin.y);
      },

      lineTo: function (x, y) {
          if(x == undefined || y == undefined) {
              console.error('ERR: x or y undefined');
              return;
          }

          var newOrigin = getViewportToWorldPos(x, y);
          currentCtx.lineTo(newOrigin.x, newOrigin.y);
      },

      setFillStyle: function(color){
          if(!color){ return; }
          currentCtx.fillStyle = color;
      },

      setStrokeStyle: function(color){
          if(!color){ return; }
          currentCtx.strokeStyle = color;
      },

      setBlendingMode: function (blendingMode) {
          if(!blendingMode || blendingMode == currentCtx.globalCompositeOperation) { return; }
          currentCtx.globalCompositeOperation = blendingMode;
      },

      setFont: function(font){
          if(typeof font !== 'string') { return; }
          currentCtx.font = font;
      },

      setTextAlign: function (alignment) {
          if(typeof alignment !== 'string') { return; }
          currentCtx.textAlign = alignment;
      },

      fillRect: function(x, y, width, height) {
          if(x == undefined || y == undefined || width == undefined || height == undefined){
              console.error('ERR: something was undefined:', 'x:', x, 'y:', y, 'width:', width, 'height:', height);
              return;
          }

          var newOrigin = getViewportToWorldPos(x, y);
          currentCtx.fillRect(newOrigin.x, newOrigin.y, width, height);
      },

      strokeRect: function(x, y, width, height) {
          if(x == undefined || y == undefined || width == undefined || height == undefined){
              console.error('ERR: something was undefined:', 'x:', x, 'y:', y, 'width:', width, 'height:', height);
              return;
          }

          var newOrigin = getViewportToWorldPos(x, y);
          currentCtx.strokeRect(newOrigin.x, newOrigin.y, width, height);
      },

      fillText: function(text, x, y){
          var newOrigin = getViewportToWorldPos(x, y);
          currentCtx.fillText(text, newOrigin.x, newOrigin.y);
      },

      strokeText: function(text, x, y){
          var newOrigin = getViewportToWorldPos(x, y);
          currentCtx.strokeText(text, newOrigin.x, newOrigin.y);
      },

      drawImage: function(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight){
          var newOrigin = getViewportToWorldPos(dx, dy);
          currentCtx.drawImage(img, sx, sy, sWidth, sHeight, newOrigin.x, newOrigin.y, dWidth, dHeight);
      },

      renderMap: function(img){
          currentCtx.drawImage(img, offsetX, offsetY, cnv.width, cnv.height, 0, 0, cnv.width, cnv.height);
      }
  };
})();
var requestAnimFrame = 
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

function showCanvas () {
  document.querySelector('.loading').style.display = 'none';
  document.querySelector('canvas').style.display = 'block';
};

/*
* invoke when all assets are loaded
*/
function init() {
  showCanvas();
  sfxPool = new SFXPool();
  keyboard.init();
  Game.init();
};

/*
* @desc: globals
*/
var player = null;
var sfxPool = null;
var monsters = [];
var scores = [];
var sprite = null;
var mapsprite = null;

window.onload = function () {
  sprite = document.querySelector('img#sprite');
  mapsprite = document.querySelector('img#map');
  init();
};