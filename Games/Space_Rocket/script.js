var l = document.querySelector('#lane')
var ll = l.getBoundingClientRect()
var ship = document.querySelector('#ship')
var sh = document.querySelector('.ship')
var s = ship.getBoundingClientRect()

function color() {
  return "hsl("+Math.floor(Math.random()*360)+",100%, 50%)"
}

var score = 0

// ASTERIOD AVOID
function asteroids() {
  var ll = l.getBoundingClientRect()
  var xx = Math.random()*ll.width  
  var b = document.createElement('div')
  b.id = "ball"
  b.style.background = color()
  b.style.left = xx - 25 + "px"

  l.appendChild(b)

  score++
  document.querySelector("#score span").innerHTML = score
  setTimeout(function(){
    remove() 
  },2000)
}

// BARS GAME
function bars() {
  var c = color()
  var div = document.createElement('div')
  div.id = "barBar"  
  div.style.background = "linear-gradient(to bottom,transparent," + c + ",white," + c + ",transparent)"

  var bar = document.createElement('div')
  bar.className = "bar"
  var os = Math.floor(ll.width*.66)
  var num = Math.floor(Math.random()*os)
  bar.style.left = num+"px"
  bar.style.borderRight = "5px solid " + c
  bar.style.borderLeft = "5px solid " + c

  l.appendChild(div).appendChild(bar)

  score++
  document.querySelector("#score span").innerHTML = score

  setTimeout(function(){    document.querySelector("#barBar").remove(document.querySelector("#barBar"))
                       },1925)
}


function turnCanyon() {
  var num = Math.floor(Math.random()*45)
  var d = Math.random() < .5 ? -num : num
  var box = document.querySelector("#canyonBox")
  box.style.transform = "skewX("+d+"deg) translateX("+ d/2 +"%)"
}

function canyon() {  
  var box = document.querySelector("#canyonBox")
  var c = color()
  var div = document.createElement('div')
  div.id = "can"  
  div.style.background = c

  var bar = document.createElement('div')
  bar.className = "yon"  
  // bar.style.left = num+"px"  
  box.appendChild(div).appendChild(bar)

  score++
  document.querySelector("#score span").innerHTML = score

  setTimeout(function(){    document.querySelector("#can").remove(document.querySelector("#can"))  
                       },2000)
}

// SHIP MOVEMENT
setTimeout(function(){
  var hw = window.innerWidth/2
  window.addEventListener('mousemove', function(e){
    var x = e.clientX
    var rx = x < hw ? -(1-(x/hw)) : (1-(hw/x))*2;
    // console.log(rx)
    ship.style.transform = "translateX("+rx*200+"%) rotateZ("+rx*10+"deg)"
  })  
},500)



// GAME SETUP
var btn = document.querySelectorAll('input')
var menu = document.querySelector('#menu')
for(var i=0;i<btn.length;i++){
  btn[i].addEventListener('click',function(e){
    menu.style.top = "-100%"
    score = 0
    document.querySelector("#score span").innerHTML = score
    e = this
    var v = e.value
    if(e.value == "Easy") {
      var play = setInterval(bars, 650)
      var dead = setInterval(hitBars, 1000/30)  
      }
    if(e.value == "Path") {
      var box = document.createElement('div')
      box.id = "canyonBox"
      l.appendChild(box)
      var play = setInterval(canyon, 250) 
      var can = setInterval(turnCanyon,2000)      
      var dead = setInterval(hitCan, 1000/30)  
      }
    if(e.value == "Hard") {
      l.style.background = 'rgba(255,255,255,.01)'
      var play = setInterval(asteroids, 250)
      var dead = setInterval(hit, 1000/30)  
      }

    function hit() {
      var s = ship.getBoundingClientRect()
      if(document.querySelector('#ball')) {
        var b = document.querySelector('#ball').getBoundingClientRect()

        if(s.left < b.right 
           && s.right > b.left 
           && s.top < b.bottom
           && s.bottom > b.bottom){   

          ship.classList.add("dead")
          setTimeout(function(){
            ship.classList.remove("dead")
          },2000)
          clearInterval(play)
          clearInterval(dead)

          menu.style.top = "50%"
          l.style.background = ''
        }      
      }  
    }

    function hitBars() {
      var s = ship.getBoundingClientRect()
      if(document.querySelector('#barBar')) {
        var b = document.querySelector('.bar').getBoundingClientRect()
        var ease = Math.floor(s.width*.25)
        if((s.top < b.bottom
            && s.right - ease > b.right)
           || (s.top < b.bottom
               && s.left + ease < b.left)
          ) {   

          ship.classList.add("dead")
          setTimeout(function(){
            ship.classList.remove("dead")
          },2000)
          clearInterval(play)
          clearInterval(dead)
          clearInterval(can)

          menu.style.top = "50%"
        }      
      }  
    }  

    function hitCan() {
      var s = ship.getBoundingClientRect()
      if(document.querySelector('#can')) {
        var b = document.querySelector('.yon').getBoundingClientRect()
        var ease = Math.floor(s.width*.25)
        if((s.top < b.bottom
            && s.right - ease > b.right)
           || (s.top < b.bottom
               && s.left + ease < b.left)
          ) {   

          ship.classList.add("dead")
          setTimeout(function(){
            ship.classList.remove("dead")
            document.querySelector("#canyonBox").remove(document.querySelector("#canyonBox"))
          },2000)
          clearInterval(play)
          clearInterval(dead)    
          clearInterval(can)     

          menu.style.top = "50%"
        }      
      }  
    }  
  })
}

function remove() {
  document.querySelector('#ball').remove(document.querySelector('#ball'))
}

ship.addEventListener('click',function(e){
  e = this
  e.style.filter = "hue-rotate("+Math.floor(Math.random()*360)+"deg)"
})

// window.addEventListener('click', function() {
//   sh.classList.add('barrel')
//   setTimeout(function(){
//     sh.classList.remove('barrel')
//   },250)
// })