var climber;
var ClimbSpeed = -0.10;
var summit;
var ice;
var counter = 0;
var obstacles;
var initClimb;
var count = 50;
var counter=setInterval(timer, 1000); //1000 will  run it every 1 second
var numMoves = 15;
var keyUp = "w";
var keyDown = "s";
var keyLeft = "a";
var keyRight = "d";

function setup() {
  createCanvas(850,500);
  var xStart = random(0,800);
  climber = createSprite(xStart,485, 25, 25);
  initClimb = new Group();
  initClimb.add(climber);
  obstacles = new Group();
  // var xGoal = random(0,800);
  startBlock1 = createSprite(430, 120, 100, 15);
  startBlock2 = createSprite(200, 300, 100, 15);
  startBlock3 = createSprite(600, 250, 100, 15);
  obstacles.add(startBlock1);
  obstacles.add(startBlock2);
  obstacles.add(startBlock3);
}

function draw() {
  background(30,30,30);
  fill('rgba(0,255,0, 0.25)');
  summit = rect(400, 5, 55, 55);

  if(keyWentDown(keyUp)){climber.velocity.y += ClimbSpeed; counter = counter + 1; ice = new Pain();}
  if(keyWentDown(keyDown)){climber.velocity.y -= ClimbSpeed; counter = counter + 1; ice = new Pain();}
  if(keyWentDown(keyLeft)){climber.velocity.x += ClimbSpeed; counter = counter + 1; ice = new Pain();}
  if(keyWentDown(keyRight)){climber.velocity.x -= ClimbSpeed; counter = counter + 1; ice = new Pain();}
 
 // later adjust max speed
  var maxSpeed = 0.75;
  if (climber.velocity.y >= maxSpeed){climber.velocity.y = 0;}
  if (climber.velocity.y <= -maxSpeed){climber.velocity.y = 0;}
  if (climber.velocity.x >= maxSpeed){climber.velocity.x = 0;}
  if (climber.velocity.x <= -maxSpeed){climber.velocity.x = 0;}
  checkWon();

  for (i=0; i<obstacles.length; i++){
    console.log(climber.collide(obstacles[i]));
  }



  drawSprites();
}


function checkWon(){
	if (counter >= numMoves){
		alert("you lose!");
    location.reload();
	}
	if (climber.position.y < 60 & climber.position.x > 410 & climber.position.x < 440){
		alert("you win!");
		location.reload();
	}
}

function Pain() {
	this.width = random(10,200);
	this.height = random(10,200);
	this.x = random(0,800);
	this.y = random(0,400);
	newSprite = createSprite(this.x, this.y, this.width, this.height);
  obstacles.add(newSprite);
  
}


function timer()
{
  count=count-1;
  if (count <= 0)
  {
    alert("you lose!");
    location.reload();
  }
  if (count == 40){
    chilly();
  }
  if (count == 30){
    freezing();
  }
  if (count == 20){
    hypothermia();
    keyUp = "s";
    keyDown = "w";
    keyRight = "d";
    keyLeft = "a";
  }
  displayTimer();
}


function displayTimer(){
  document.getElementById("showCounter").innerHTML=count + " seconds";
}

function chilly(){
  document.getElementById("temperature").innerHTML="Status: Chilly";
}

function freezing(){
  document.getElementById("temperature").innerHTML="Status: Freezing";
  ClimbSpeed = ClimbSpeed - 0.05;
}

function hypothermia(){
  document.getElementById("temperature").innerHTML="<i>Status: Hypothermia</i>";
}
