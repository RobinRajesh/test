const gridBoard = document.getElementsByClassName('grid-board')[0];
const playButton = document.getElementById("play-btn");
const difficultyMenu = document.getElementById("difficulty-level");
let level;
const goal = document.getElementsByClassName("goal")[0];
const size = 20;
let player = {x:20, y:1};
let oldPlayer = {x:20, y:1};
let enemyCount;
let randomx, randomy; // for spawning enemies
let enemies = [];
let playable = false;
let legalInput = true;
let moveCount = 0;
let foundKey = false;
let won = false;
let lost = false;
const lossMsg = "Boo hoo! You lost! ";
const winMsg = "Congrats! You won! ";


setUp();


function setUp()
{
	playButton.addEventListener("click", ()=>{startGame()});
	window.addEventListener("keydown", (e)=>{if(playable)newTurn(e)});
}


function startGame()
{
	setDifficulty();
	document.getElementsByClassName("controls")[0].remove();
	gridBoard.style.display = "grid";
	spawnEnemiesRandomly(enemyCount);
	playable= true;
}


function setDifficulty()
{
	level = difficultyMenu.value;
	switch(level)
	{
		case "Difficult":
			enemyCount = 5;
			break;
		case "Medium":
			enemyCount = 4;
			break;
		case "Easy":
			enemyCount = 3;
			break;	
	}
}

function spawnEnemiesRandomly(num)
{
	for (let i = 0; i < num; i++) 
	{
		do
		{
			randomx = Math.floor(Math.random()*size) + 1;
			randomy = Math.floor(Math.random()*size) + 1;			
		}
		while(illegalEnemyPosition());
		enemies.push({x:randomx, y:randomy});
	}
	renderEnemies();
}


function illegalEnemyPosition()
{
	if(randomx===size && randomy===1) return true; // player overlap
	if(randomx===size-1 && randomy===2) return true; // at this position, loss is certain in 1st move
	if(randomx===1 && randomy===size) return true; //goal overlap
	if(randomx===size/2 && randomy===size/2) return true; //key overlap
	if(enemies.some((enemy)=>randomx===enemy.x && randomy===enemy.y)) return true;
	return false;
}


function newTurn(e)
{
	takeInput(e);
	if(!legalInput) 
	{
		legalInput=true;
		return;
	}
	playerTurn();
	checkLost();
	checkWon();	
	if(lost)
		endGame(lossMsg);
	else if(won)
		endGame(winMsg);
	else
	{
		setTimeout(()=>
		{
			enemyTurn();
			checkLost();
			if(lost)
				endGame(lossMsg);
		}, 200);	
	}	
}


function takeInput(e)
{
	oldPlayer = Object.assign(oldPlayer,player);  //save last position in case new move is impossible
	switch(e.key)
	{
		case "ArrowUp" :
			player.x--;
			break;
		case "ArrowDown" :
			player.x++;
			break;
		case "ArrowLeft" :
			player.y--;
			break;
		case "ArrowRight" :
			player.y++;
			break;
		default:
			legalInput = false;			
	}	
}


function playerTurn()
{
	if(canMove(player))
	{
		clearOldPlayer();
		renderPlayer();
		moveCount++;
		checkHasKey();
	}
	else  // revert to old position if new move is impossible 
		player = Object.assign(player,oldPlayer); 
}


function canMove(character)
{
	if(character.x<=size && character.x>0 && character.y<=size && character.y>0)
		return true;
	return false;		
}


function clearOldPlayer()
{
	document.getElementsByClassName("player")[0].remove();
}


function renderPlayer()
{
	const newPlayer = document.createElement("div");
	newPlayer.classList.add("player");
	if(foundKey)
		newPlayer.style.backgroundColor = "lightgreen";
	newPlayer.style.gridRowStart = `${player.x}`;
	newPlayer.style.gridColumnStart = `${player.y}`;
	gridBoard.appendChild(newPlayer);
}


function checkHasKey()
{
	if(player.x===size/2 && player.y===size/2)
	{
		foundKey =true;
		document.getElementsByClassName("key")[0].remove();
		document.getElementsByClassName("player")[0].style.backgroundColor = "lightgreen";
		goal.style.setProperty("border", "2px solid lightgreen");
	}
}


function enemyTurn()
{
	clearOldEnemies();
	updateEnemyPosition();
	renderEnemies();
}


function clearOldEnemies()
{
	for(let i=0; i<enemies.length; i++)
	{
		document.getElementsByClassName("enemy")[0].remove();
	}
}


function updateEnemyPosition()
{
	for(let i=0; i<enemies.length; i++)
	{
		if(enemies[i].x===player.x)
			enemies[i].y+= player.y>enemies[i].y?1:-1;
		else if(enemies[i].y===player.y)
			enemies[i].x+= player.x>enemies[i].x?1:-1;		
		else
		{
			let toss = Math.random() - 0.5;
			if(toss<0)
				enemies[i].y+= player.y>enemies[i].y?1:-1;
			else
				enemies[i].x+= player.x>enemies[i].x?1:-1;
		}
	}
	removeDuplicates();
}


function removeDuplicates()
{
	for(let i=0; i<enemies.length; i++)
	{
		for(let j=1; j<enemies.length; j++)
		{
			if(i!==j && enemies[i].x===enemies[j].x && enemies[i].y===enemies[j].y)
			{
				enemies.splice(j,1);
				j--;
			}
		}
	}
}


function renderEnemies()
{
	for(let i=0; i<enemies.length; i++)
	{	
		const newEnemy = document.createElement("div");
		newEnemy.classList.add("enemy");
		newEnemy.style.gridRowStart = `${enemies[i].x}`;
		newEnemy.style.gridColumnStart = `${enemies[i].y}`;
		gridBoard.appendChild(newEnemy);
	}
}


function checkWon()
{
	if(player.x===1 && player.y===size && foundKey)
		won = true;
}


function checkLost()
{
	for(let i=0; i<enemies.length; i++)
	{	
		console.log(enemies[i]);
		if(player.x===enemies[i].x && player.y===enemies[i].y)
		{
			lost = true;
			break;
		}
	}
}


function endGame(msg)
{
	playable = false;
	setTimeout(()=>
	{
		if(confirm(msg + getStats() +"Select OK to play again."))
		{
			location.reload();
		}
	}, 200);
}


function getStats()
{
	const enemiesKilled = enemyCount - enemies.length;
	let achievement="";
	if(enemiesKilled===enemyCount-1 && won && moveCount===38)
		achievement = "You played a PERFECT game!";
	else if(won && (enemiesKilled===enemyCount-1 || moveCount===38))
		achievement = "You played a NEAR PERFECT game!"
	return `${achievement}

Stats:
You used a total of ${moveCount} MOVES.
The level of the game was : ${level.toUpperCase()}.
You killed ${enemiesKilled} ENEM${enemiesKilled===1?'Y':'IES'} by utilising their rage against each other!

`;
}