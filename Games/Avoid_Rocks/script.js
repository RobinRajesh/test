const gj_console = document.getElementById('gj_console')
const car = document.getElementById('gj_car')
const car_hitbox = document.getElementById('car_hitbox')
const gameover = document.getElementById('gameover')
const new_score = document.getElementById('new_score')
const hi_score = document.getElementById('hi_score')
const press_box = document.getElementById('press_box')
var deer_mode;
var timer = 0
var speed = 3
var score = 0

if(localStorage.getItem('gj-score')) {
  hi_score.innerHTML = 'HI ' + localStorage.getItem('gj-score')
} else {
  localStorage.setItem('gj-score', '000')
  hi_score.innerHTML = 'HI ' + localStorage.getItem('gj-score')
}

function addRock() {
  var r = document.createElement('div')
  r.className = 'rock'
  var num = Math.random()
  r.style.width =  num < .25 ? '30px' : '15px'
  if(deer_mode) {
    r.innerHTML = '&#129420;'  
  } else {
    r.style.background = 'var(--gray)'
    r.style.clipPath = 'polygon(100% 100%, 0% 100%, 10% '+Math.random()*50+'%, 33% '+Math.random()*50+'%, 66% '+Math.random()*50+'%, 90% '+Math.random()*50+'%)'
  }  
  r.style.left = '640px'  
  gj_console.appendChild(r)
}

function startGame(){
  timer = 0
  score = 0
  new_score.innerHTML = 0
  gj_console.classList.toggle('dead')     
  gameover.classList.toggle('not_gameover')
  var offset = gj_console.getBoundingClientRect()

  if(document.querySelector('.rock')) {
    var rocks = document.querySelectorAll('.rock')
    rocks.forEach(function(elm){
      elm.remove()
    })
  }  

  function moveRock(){    
    timer++

    if(timer % 120 === 0) {
      addRock()
      if(Math.random() < .5) {
        setTimeout(function(){
          addRock()  
        },1000)      
      }    
    }
    if(timer % 15 === 0) {
      score++
      new_score.innerHTML = score
    }

    var hook_loc = car_hitbox.getBoundingClientRect()
    var rocks = document.querySelectorAll('.rock')
    rocks.forEach(function(elm){
      var elm_deets = elm.getBoundingClientRect()
      elm.style.left = elm_deets.left - offset.left - speed + 'px'

      var ouch = !(elm_deets.right < hook_loc.left || 
                   elm_deets.left > hook_loc.right || 
                   elm_deets.bottom < hook_loc.top || 
                   elm_deets.top > hook_loc.bottom) 
      if(ouch) { 
        if(deer_mode) {
          elm.classList.toggle('dead_rock')  
        }        
        gj_console.classList.toggle('dead')      
        gameover.innerHTML = 'GAME OVER<br><span></span>'
        gameover.classList.toggle('not_gameover')
        clearInterval(moveStuff) 

        if(localStorage.getItem('gj-score') < score) {
          localStorage.setItem('gj-score', score)
          hi_score.innerHTML = 'HI '+ score
        }
      }    

      if(elm_deets.right < 0 + offset.left) {        
        elm.remove()
      }
    })
  }
  addRock()
  var moveStuff = setInterval(moveRock, 1000/60);
}

press_box.addEventListener('click', function(){
  car.style.background = 'var(--car-up)'
  car_hitbox.style.bottom = '20px'
  setTimeout(function(){ 
    car.style.background = 'var(--car)'
    car_hitbox.style.bottom = ''}, 500)
})

gameover.addEventListener('click', function(e){
  if(e.ctrlKey) {
    console.log('deer_mode')
    deer_mode = true    
  } else {
    deer_mode = false    
  } 
  startGame() 
})