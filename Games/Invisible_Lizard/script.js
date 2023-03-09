var render, isRunning = false, lizards, resolution = 1;
function getWH(){
	return {
		width: Math.floor(c.clientWidth * window.devicePixelRatio * resolution),
		height: Math.floor(c.clientHeight * window.devicePixelRatio * resolution)
	}
}

var scales = [
	["A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5"],
	["A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4"],
	["A2", "B2", "C3", "D3", "E3", "F3", "G3", "A3"]
];


function getColor(h, b){
	if(window.location.search == "?cb=1")
		return "hsl(" + (180 + h % 360 / 2) + ", 100%, " + (b == undefined ? 50 : b) + "%)";
	if(window.location.search == "?cb=2")
		return "hsl(0, 0%, " +  h % 360 / 360 * (b == undefined ? 100 : b * 2) + "%)";
	if(window.location.search == "?cb=3")
		return "hsl(" + (0 + h % 360 / 2) + ", 100%, " + (b == undefined ? 50 : b) + "%)";
	if(window.location.search == "?cb=4")
		return "hsl(" + (270 + h % 360 / 2) + ", 100%, " + (b == undefined ? 50 : b) + "%)";
	return "hsl(" + h + ", 60%, " + (b == undefined ? 50 : b) + "%)";
}

function game(){
	var c = document.getElementById("c");
	var splatImg = document.getElementById("splat");
	var splat2Img = document.getElementById("splat2");
	var width; var height;
	width = getWH().width;
	height = getWH().height;
	c.width = width;
	c.height = height;
	var ctx = c.getContext("2d");
	// ctx.imageSmoothingEnabled = false;
	var PCR = -0.03;
	var rrrDist = 1.5;
	var ammo = 60;
	var stillAlive = 30;
	var health = 1;
	var shadowDist = 0.05;
	var lizardSpeed = 0.05;
	var cameraSize = 8;
	
	var camera = {cx: 0, cy: 0, w: cameraSize * width / Math.min(width, height), h: cameraSize * height / Math.min(width, height)};
	var player = {x: 0, y: 0};
	
	var mouse = {x: 0, y: 0, down: false};
	c.onmousemove = function(e){
		mouse.x = e.clientX;
		mouse.y = e.clientY;
	}
	
	c.onmousedown = function(e){
		c.onmousemove(e);
		mouse.down = true;
	}
	
	c.onmouseup = function(e){
		c.onmousemove(e);
		mouse.down = false;
	}
	
	var map = [];
	var edges = [];
	var ammoPickups = [];
	
	for(var i = 0; i < 200; i++){
		var w, h, x, y, ind, e, co;
		if(i == 0){
			x = -3; y = -3; w = 6; h = 6; e = {side: -1, c: Math.floor(360 * Math.random())};
		}else{
			if(edges.length == 0){
				console.log(i);
				break;
			}
			ind = Math.floor(Math.random() * edges.length);
			e = edges.splice(ind, 1)[0];
			w = Math.random() * 5 + 3;
			h = Math.random() * 5 + 3;
			w -= w % 0.8;
			h -= h % 0.8;
			x = e.side % 2 == 1 ? e.x - Math.random() * w : e.side == 0 ? e.x - w : e.x;
			y = e.side % 2 == 0 ? e.y - Math.random() * h : e.side == 1 ? e.y - h : e.y;
			x -= x % 0.8;
			y -= y % 0.8;
		}
		co = Math.floor(e.c + Math.random() * 100);
		// console.log(e.c);
		map.push({x: x, y: y, w: w, h: h, color: co});
		if(Math.random() < 1 / (i / 25 + 1) && e.side != 2 && (Math.random() < 0.5 || e.side % 2 == 0 || i == 0))
			edges.push({x: x, y: y + h / 2, side: 0, c: co});
		if(Math.random() < 1 / (i / 25 + 1) && e.side != 3 && (Math.random() < 0.5 || e.side % 2 == 1 || i == 0))
			edges.push({x: x + w / 2, y: y, side: 1, c: co});
		if(Math.random() < 1 / (i / 25 + 1) && e.side != 0 && (Math.random() < 0.5 || e.side % 2 == 0 || i == 0))
			edges.push({x: x + w, y: y + h / 2, side: 2, c: co});
		if(Math.random() < 1 / (i / 25 + 1) && e.side != 1 && (Math.random() < 0.5 || e.side % 2 == 1 || i == 0))
			edges.push({x: x + w / 2, y: y + h, side: 3, c: co});
	
	}
	
	lizards = [];
	
	for(var i = 0; i < stillAlive; i++){
		
		var x, y;
		function getSpawnPoint(){
			x = Math.random() * 4000 - 2000;
			y = Math.random() * 4000 - 2000;
			x = Math.pow(Math.abs(x), .5) * Math.sign(x);
			y = Math.pow(Math.abs(y), .5) * Math.sign(y);
			for(var i = 0; i < map.length; i++)
				if(map[i].x < x && map[i].y < y && map[i].x + map[i].w > x && map[i].y + map[i].h > y && Math.hypot(x, y) > 10)
					return;
			getSpawnPoint();
		}
		getSpawnPoint();
		var s = [
			{w: 0.3, h: 0.3, x: x, y: y, r: 0},
			{w: 0.4, h: 0.2, x: x, y: y + Math.random(), r: 0},
			{w: 0.4, h: 0.2, x: x, y: y + Math.random(), r: 0},
			{w: 0.3, h: 0.2, x: x, y: y + Math.random(), r: 0},
			{w: 0.2, h: 0.2, x: x, y: y + Math.random(), r: 0},
			{w: 0.17, h: 0.2, x: x, y: y + Math.random(), r: 0},
			{w: 0.15, h: 0.17, x: x, y: y + Math.random(), r: 0},
			{w: 0.13, h: 0.15, x: x, y: y + Math.random(), r: 0},
			{w: 0.1, h: 0.13, x: x, y: y + Math.random(), r: 0},
			{w: 0.08, h: 0.11, x: x, y: y + Math.random(), r: 0}
		];
		var feet = [
			{x: x, y: y, r: 0, count: 0},
			{x: x, y: y, r: 0, count: -0.25},
			{x: x, y: y, r: 0, count: -0.5},
			{x: x, y: y, r: 0, count: -0.75}
		];
		var rrr = Math.random() * Math.PI * 2;
		var notes = [];
		var A = [];
		var scale = scales[Math.floor(Math.random() * scales.length)];
		for(var t = 0; t < 2;){
			var l = t >= 1.75 ? 0.25 : Math.pow(1/2, Math.floor(Math.random() * 2) + 1);
			A.push({
				note: Math.floor(Math.random() * scale.length),
				length: l
			});
			t += l;
		}
		var B = [];
		var n = 0;
		for(var t = 0; t < 2;){
			if(t < 1.5){
				t += A[n].length;
				B.push(A[n++]);
				continue;
			}
			var l = t >= 1.75 ? 0.25 : Math.pow(1/2, Math.floor(Math.random() * 2) + 1);
			B.push({
				note: Math.floor(Math.random() * scale.length),
				length: l
			});
			t += l;
		}
		var C = [];
		n = 0;
		for(var t = 0; t < 2;){
			if(t < 1.25){
				t += B[n].length;
				C.push(B[n++]);
				continue;
			}
			var l = t >= 1.75 ? 0.25 : Math.pow(1/2, Math.floor(Math.random() * 2) + 1);
			C.push({
				note: Math.floor(Math.random() * scale.length),
				length: l
			});
			t += l;
		}
		for(var n = 0; n < A.length; n++)
			notes.push(A[n]);
		for(var n = 0; n < B.length; n++)
			notes.push(B[n]);
		for(var n = 0; n < A.length; n++)
			notes.push(A[n]);
		for(var n = 0; n < C.length; n++)
			notes.push(C[n]);
		var l = {
			mode: 0,
			color: 0,
			s: s,
			f: feet,
			target: {
				x: Math.sin(rrr) * rrrDist,
				y: Math.cos(rrr) * rrrDist
			},
			randDir: Math.random() * Math.PI * 2,
			health: 1,
			black: 0,
			synth: new Tone.Synth({
				oscillator: {
					type: "sawtooth"
				},
				portamento: 0
			}).toDestination(),
			n: 0,
			notes: notes,
			scale: scale,
			timeout: setTimeout(0),
			nextNote: function(me){
				if(me.health <= 0 || health <= 0)
					return;
				me.synth.triggerAttackRelease(me.scale[me.notes[me.n].note], me.notes[me.n].length / me.tempo);
				me.n = (me.n + 1) % me.notes.length;
				me.timeout = setTimeout(me.nextNote, me.notes[me.n].length * 1000 / me.tempo, me);
			},
			tempo: 2 / Math.pow(2, Math.floor(Math.random() * 3))
		};
		lizards.push(l);
	}
	
	var keys = [];
	
	window.onkeydown = function(e){
		if(e.code == "KeyW")
			keys[0] = true;
		if(e.code == "KeyA")
			keys[1] = true;
		if(e.code == "KeyS")
			keys[2] = true;
		if(e.code == "KeyD")
			keys[3] = true;
	}
	
	window.onkeyup = function(e){
		if(e.code == "KeyW")
			keys[0] = false;
		if(e.code == "KeyA")
			keys[1] = false;
		if(e.code == "KeyS")
			keys[2] = false;
		if(e.code == "KeyD")
			keys[3] = false;
	}
	
	var bullets = [];
	var blood = [];
	
	function rect(x, y, w, h, color, r, cx, cy, splat){
		cx = cx ? cx : 0;
		cy = cy ? cy : 0;
		ctx.fillStyle = color;
		var x = (x - camera.cx + camera.w / 2) * width / camera.w;
		var y = (y - camera.cy + camera.h / 2) * height / camera.h;
		ctx.translate(x, y);
		ctx.rotate(r);
		if(splat)
			ctx.drawImage(splat == 1 ? splatImg : splat2Img, 0, 0, 447, 439, -cx * width / camera.w, -cy * width / camera.w, w * width / camera.w, h * height / camera.h);
		else
			ctx.fillRect(-cx * width / camera.w, -cy * width / camera.w, w * width / camera.w, h * height / camera.h);
		ctx.rotate(-r);
		ctx.translate(-x, -y);
	}
	var x = 0;
	render = function(){
		isRunning = true;
		if(health <= 0){
			setTimeout(menu, 500);
			isRunning = false;
		}else
			requestAnimationFrame(render);
		var fire = false;
		if(getWH().width != width || getWH().height != height){
			width = getWH().width;
			height = getWH().height;
			c.width = width;
			c.height = height;
			camera.w = cameraSize * width / Math.min(width, height);
			camera.h = cameraSize * height / Math.min(width, height);
		}
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, width, height);
		if(keys[0]){
			var good = false;
			for(var i = 0; i < map.length; i++)
				if(player.x > map[i].x + PCR && player.x < map[i].x + map[i].w - PCR && player.y - 0.05 > map[i].y + PCR && player.y - 0.05 < map[i].y + map[i].h - PCR){
					good = true;
					break;
				}
			if(good)
				player.y -= 0.05;
		}
		if(keys[1]){
			var good = false;
			for(var i = 0; i < map.length; i++)
				if(player.x - 0.05 > map[i].x + PCR && player.x - 0.05 < map[i].x + map[i].w - PCR && player.y > map[i].y + PCR && player.y < map[i].y + map[i].h - PCR){
					good = true;
					break;
				}
			if(good)
				player.x -= 0.05;
		}
		if(keys[2]){
			var good = false;
			for(var i = 0; i < map.length; i++)
				if(player.x > map[i].x + PCR && player.x < map[i].x + map[i].w - PCR && player.y + 0.05 > map[i].y + PCR && player.y + 0.05 < map[i].y + map[i].h - PCR){
					good = true;
					break;
				}
			if(good)
				player.y += 0.05;
		}
		if(keys[3]){
			var good = false;
			for(var i = 0; i < map.length; i++)
				if(player.x + 0.05 > map[i].x + PCR && player.x + 0.05 < map[i].x + map[i].w - PCR && player.y > map[i].y + PCR && player.y < map[i].y + map[i].h - PCR){
					good = true;
					break;
				}
			if(good)
				player.x += 0.05;
		}
		for(var i = 0; i < map.length; i++){
			rect(map[i].x - 0.2, map[i].y - 0.2, map[i].w + 0.4, map[i].h + 0.4, getColor(map[i].color));
		}
		var gunDir = Math.atan2((mouse.y / c.clientHeight - 0.5) * camera.h + camera.cy - player.y, (mouse.x / c.clientWidth - 0.5) * camera.w + camera.cx - player.x);
		if(mouse.down && ammo > 0){
			var rdi = gunDir + Math.random() * 0.1 - 0.05
			bullets.push({x: player.x + 0.2 * Math.cos(rdi), y: player.y + 0.2 * Math.sin(rdi), dir: rdi});
			fire = true;
			camera.cx += Math.cos(bullets[bullets.length - 1].dir) * 0.2;
			camera.cy += Math.sin(bullets[bullets.length - 1].dir) * 0.2;
			mouse.down = false;
			ammo--;
		}
		document.getElementById("ammo").innerHTML = ammo;
		document.getElementById("alive").innerHTML = stillAlive;
		for(var i = 0; i < lizards.length; i++){
			if(lizards[i].health <= 0){
				if(!lizards[i].dead){
					var num = Math.floor(Math.random() * 3) + 3;
					var cx = lizards[i].s[3].x;
					var cy = lizards[i].s[3].y;
					for(var n = 0; n < num; n++){
						var rr = Math.random() * Math.PI * 2;
						var rd = Math.random() * 0.85;
						ammoPickups.push({x: cx, y: cy, tx: cx + rd * Math.cos(rr), ty: cy + rd * Math.sin(rr), r: Math.random() * Math.PI * 2, count: 0});
					}
					stillAlive--;
					lizardSpeed += 0.002;
				}
				lizards[i].dead = true;
				lizards[i].black = lizards[i].black * 0.8 + 1 * 0.2;
				for(var n = 0; n < lizards[i].s.length; n++)
					rect(lizards[i].s[n].x, lizards[i].s[n].y, lizards[i].s[n].w, lizards[i].s[n].h, getColor(lizards[i].color, 50 * (1 - lizards[i].black)), lizards[i].s[n].r, lizards[i].s[n].w / 2, lizards[i].s[n].h / 2);
				for(var n = 0; n < lizards[i].f.length; n++)
					rect(lizards[i].f[n].x, lizards[i].f[n].y, 0.15, 0.15, getColor(lizards[i].color, 50 * (1 - lizards[i].black)), lizards[i].f[n].r, 0.15 / 2, 0.15 / 2);
			}
		}
		for(var i = 0; i < blood.length; i++){
			rect(blood[i].x, blood[i].y, blood[i].size, blood[i].size, "black", blood[i].r, blood[i].size / 2, blood[i].size / 2, blood[i].type);
		}
		ctx.globalAlpha = 0.2;
		rect(player.x - shadowDist, player.y + shadowDist, 0.4, 0.4, "black", 0, 0.2, 0.2);
		rect(player.x - shadowDist, player.y + shadowDist, 0.4, 0.1, "black", gunDir, 0, 0.05);
		ctx.globalAlpha = 1;
		rect(player.x, player.y, 0.4, 0.4, "white", 0, 0.2, 0.2);
		rect(player.x, player.y, 0.4, 0.1, "white", gunDir, 0, 0.05);
		for(var i = 0; i < bullets.length; i++){
			bullets[i].x += 0.2 * Math.cos(bullets[i].dir);
			bullets[i].y += 0.2 * Math.sin(bullets[i].dir);
			ctx.globalAlpha = 0.2;
			rect(bullets[i].x - shadowDist, bullets[i].y + shadowDist, 0.1, 0.1, "black", bullets[i].dir, 0.05, 0.05);
			ctx.globalAlpha = 1;
			rect(bullets[i].x, bullets[i].y, 0.1, 0.1, "white", bullets[i].dir, 0.05, 0.05);
			if(Math.hypot(camera.cx - bullets[i].x, camera.cy - bullets[i].y) > Math.hypot(camera.w, camera.h) + 0.5){
				bullets.splice(i--, 1);
				continue;
			}
			var px = bullets[i].x;
			var py = bullets[i].y;
			var good = false;
			for(var q = 0; q < map.length; q++)
				if(px > map[q].x + PCR && px < map[q].x + map[q].w - PCR && py > map[q].y + PCR && py - 0.05 < map[q].y + map[q].h - PCR){
					good = true;
					break;
				}
			if(!good)
				bullets.splice(i--, 1);
			
		}
		for(var i = 0; i < ammoPickups.length; i++){
			ammoPickups[i].x = ammoPickups[i].x * 0.9 + 0.1 * ammoPickups[i].tx;
			ammoPickups[i].y = ammoPickups[i].y * 0.9 + 0.1 * ammoPickups[i].ty;
			ctx.globalAlpha = 0.2;
			rect(ammoPickups[i].x - shadowDist, ammoPickups[i].y + shadowDist, 0.15, 0.15, "black", ammoPickups[i].r, 0.15 / 2, 0.15 / 2);
			ctx.globalAlpha = 1;
			rect(ammoPickups[i].x, ammoPickups[i].y, 0.15, 0.15, "white", ammoPickups[i].r, 0.15 / 2, 0.15 / 2);
			ammoPickups[i].count += 0.1;
			if(ammoPickups[i].count > 1 && Math.hypot(ammoPickups[i].x - player.x, ammoPickups[i].y - player.y) < 0.3){
				ammo++;
				ammoPickups.splice(i--, 1);
				health = Math.min(health + 0.05, 1);
			}else if(ammoPickups[i].count > 1 && Math.hypot(ammoPickups[i].x - player.x, ammoPickups[i].y - player.y) < 1){
				var ddir = Math.atan2(ammoPickups[i].y - player.y, ammoPickups[i].x - player.x);
				var ddist = Math.hypot(ammoPickups[i].x - player.x, ammoPickups[i].y - player.y);
				ammoPickups[i].x -= Math.cos(ddir) * (1 - ddist) * 0.1;
				ammoPickups[i].y -= Math.sin(ddir) * (1 - ddist) * 0.1;
				ammoPickups[i].tx = ammoPickups[i].x; ammoPickups[i].ty = ammoPickups[i].y;
			}
		}
		for(var i = 0; i < lizards.length; i++){
			lizards[i].synth.volume.value = -Math.hypot(player.x - lizards[i].s[0].x, player.y - lizards[i].s[0].y) * 3;
			if(lizards[i].health <= 0){
				continue;
			}
			var lizardMove = 0;
			for(var n = 0; n < lizards[i].s.length; n++){
				if(n == 0){
					var ogx = lizards[i].s[0].x, ogy = lizards[i].s[0].y;
					if(lizards[i].mode == 0){
						var px = Math.sin(lizards[i].randDir) * lizardSpeed;
						var py = -Math.cos(lizards[i].randDir) * lizardSpeed;
						var good = false;
						for(var q = 0; q < map.length; q++)
							if(lizards[i].s[0].x + px > map[q].x + PCR && lizards[i].s[0].x + px < map[q].x + map[q].w - PCR && lizards[i].s[0].y + py > map[q].y + PCR && lizards[i].s[0].y + py - 0.05 < map[q].y + map[q].h - PCR){
								good = true;
								break;
							}
						if(good){
							lizards[i].s[0].x += px;
							lizards[i].s[0].y += py;
						}
						lizards[i].s[0].r = lizards[i].s[1].r * 0.9 + 0.1 * lizards[i].randDir;
						lizards[i].randDir += 1 * (Math.random() - 0.5);
						if(fire && Math.hypot(lizards[i].s[0].x - player.x, lizards[i].s[0].y - player.y) < 7)
							lizards[i].mode = Math.random() < 0.5 ? 1 : 2;
						if(Math.hypot(lizards[i].s[0].x - player.x, lizards[i].s[0].y - player.y) < 5 && Math.random() < 0.01)
							lizards[i].mode = 1;
						if(Math.hypot(lizards[i].s[0].x - player.x, lizards[i].s[0].y - player.y) < 2)
							lizards[i].mode = 1;
					}else if(lizards[i].mode == 1){
						if(Math.hypot(lizards[i].s[0].x - player.x - lizards[i].target.x, lizards[i].s[0].y - player.y - lizards[i].target.y) < 0.4){
							var rrr = Math.random() * Math.PI * 2;
							lizards[i].target = {x: Math.sin(rrr) * rrrDist, y: Math.cos(rrr) * rrrDist};
						}
						var toDir = -Math.atan2(lizards[i].s[0].x - player.x - lizards[i].target.x, lizards[i].s[0].y - player.y - lizards[i].target.y);
						var px = Math.sin(toDir) * 0.15;
						var py = -Math.cos(toDir) * 0.15;
						var good = false;
						for(var q = 0; q < map.length; q++)
							if(lizards[i].s[0].x + px > map[q].x + PCR && lizards[i].s[0].x + px < map[q].x + map[q].w - PCR && lizards[i].s[0].y + py > map[q].y + PCR && lizards[i].s[0].y + py - 0.05 < map[q].y + map[q].h - PCR){
								good = true;
								break;
							}
						if(good){
							lizards[i].s[0].x += px;
							lizards[i].s[0].y += py;
						}else{
							var rrr = Math.random() * Math.PI * 2;
							lizards[i].target = {x: Math.sin(rrr) * rrrDist, y: Math.cos(rrr) * rrrDist};
						}
						lizards[i].s[0].r = toDir;
						if(fire && Math.random() < 0.05)
							lizards[i].mode = 2;
					}else if(lizards[i].mode == 2){
						if(Math.hypot(lizards[i].s[0].x - player.x, lizards[i].s[0].y - player.y) > 10)
							lizards[i].mode = 0;
						var dir = Math.atan2(lizards[i].s[0].x - player.x, lizards[i].s[0].y - player.y);
						var px = Math.sin(dir) * 0.15;
						var py = Math.cos(dir) * 0.15;
						var good = false;
						for(var q = 0; q < map.length; q++)
							if(lizards[i].s[0].x + px > map[q].x + PCR && lizards[i].s[0].x + px < map[q].x + map[q].w - PCR && lizards[i].s[0].y + py > map[q].y + PCR && lizards[i].s[0].y + py - 0.05 < map[q].y + map[q].h - PCR){
								good = true;
								break;
							}
						if(good){
							lizards[i].s[0].x += px;
							lizards[i].s[0].y += py;
						}else if(Math.random() < 0.5)
							lizards[i].mode = 1;
						lizards[i].s[0].r = -Math.atan2(player.x - lizards[i].s[0].x, player.y - lizards[i].s[0].y);
					}
					lizardMove = Math.hypot(lizards[i].s[0].x - ogx, lizards[i].s[0].y - ogy);
				}else{
					lizards[i].s[n].r = -Math.atan2(lizards[i].s[n - 1].x - lizards[i].s[n].x, lizards[i].s[n - 1].y - lizards[i].s[n].y);
					var px = lizards[i].s[n - 1].x + Math.sin(lizards[i].s[n].r) * (lizards[i].s[n - 1].h + lizards[i].s[n].h) / 2;
					var py = lizards[i].s[n - 1].y - Math.cos(lizards[i].s[n].r) * (lizards[i].s[n - 1].h + lizards[i].s[n].h) / 2;
					var good = false;
					for(var q = 0; q < map.length; q++)
						if(px > map[q].x + PCR && px < map[q].x + map[q].w - PCR && py > map[q].y + PCR && py - 0.05 < map[q].y + map[q].h - PCR){
							good = true;
							break;
						}
					if(good){
						lizards[i].s[n].x = px;
						lizards[i].s[n].y = py;
					}
				}
				for(var j = 0; j < bullets.length; j++)
					if(Math.hypot(bullets[j].x - lizards[i].s[n].x, bullets[j].y - lizards[i].s[n].y) < Math.max(lizards[i].s[n].w, lizards[i].s[n].h)){
						lizards[i].health -= (Math.random() * 0.5 + 0.2);
						lizards[i].mode = Math.random() < 0.5 ? 1 : 2;
						for(var m = 0; m < 5; m++){
							var dr = Math.random() * 0.2 - 0.1;
							var d = (Math.random() * 0.5 + 0.2);
							blood.push({
								x: bullets[j].x + d * Math.cos(bullets[j].dir + dr),
								y: bullets[j].y + d * Math.sin(bullets[j].dir + dr),
								size: Math.random() * 0.9 + 0.03,
								r: Math.random() * Math.PI * 2,
								type: 1
							});
						}
						bullets.splice(j--, 1);
						clearTimeout(lizards[i].timeout);
						lizards[i].nextNote(lizards[i]);
					}
				rect(lizards[i].s[n].x, lizards[i].s[n].y, lizards[i].s[n].w, lizards[i].s[n].h, getColor(lizards[i].color, 50 * (1 - lizards[i].black)), lizards[i].s[n].r, lizards[i].s[n].w / 2, lizards[i].s[n].h / 2);
				if(n == 3){
					var color = lizards[i].color;
					var p = lizards[i].s[3];
					for(var j = 0; j < map.length; j++){
						if(map[j].x < p.x && map[j].y < p.y && map[j].x + map[j].w > p.x && map[j].y + map[j].h > p.y)
							color = map[j].color;
					}
					lizards[i].color = lizards[i].color * 0.9 + color * 0.1;
				}
				if(Math.hypot(player.x - lizards[i].s[n].x, player.y - lizards[i].s[n].y) < 0.3){
					health -= 0.005;
					// if(Math.random() < 0.3){
					// 	var dr = Math.random() * Math.PI * 2;
					// 	var d = (Math.random() * 0.3);
					// 	blood.push({
					// 		x: player.x + d * Math.cos(dr),
					// 		y: player.y + d * Math.sin(dr),
					// 		size: Math.random() * 0.9 + 0.03,
					// 		r: Math.random() * Math.PI * 2,
					// 		type: 2
					// 	});
					// }
				}
			}
			for(var n = 0; n < lizards[i].f.length; n++){
				var model = lizards[i].s[n < 2 ? 1 : 3];
				if(lizards[i].f[n].count < 0.4){
					var px = (model.x + (n < 2 ? 0.4 : 0.3) * Math.sin(model.r + (n < 2 ? 3 : 1) * (n % 2 == 0 ? 1 : -1) * Math.PI / 4));
					var py = (model.y - (n < 2 ? 0.4 : 0.3) * Math.cos(model.r + (n < 2 ? 3 : 1) * (n % 2 == 0 ? 1 : -1) * Math.PI / 4));
					var good = false;
					for(var q = 0; q < map.length; q++)
						if(px > map[q].x + PCR && px < map[q].x + map[q].w - PCR && py - 0.05 > map[q].y + PCR && py < map[q].y + map[q].h - PCR){
							good = true;
							break;
						}
					if(good){
						lizards[i].f[n].x = lizards[i].f[n].x * 0.5 + 0.5 * px;
						lizards[i].f[n].y = lizards[i].f[n].y * 0.5 + 0.5 * py;
					}
					lizards[i].f[n].r = lizards[i].f[n].r * 0.5 + (model.r) * 0.5;
				}
				if(lizards[i].f[n].count <= 0)
					lizards[i].f[n].count += 1;
				rect(lizards[i].f[n].x, lizards[i].f[n].y, 0.15, 0.15, getColor(lizards[i].color), lizards[i].f[n].r, 0.15 / 2, 0.15 / 2);
				lizards[i].f[n].count -= lizardMove * 1;
			}
		}
		ctx.fillStyle = "hsl(0, 70%, 60%)";
		ctx.fillRect(0, 0, width, 30);
		ctx.fillStyle = "hsl(120, 70%, 60%)";
		ctx.fillRect(0, 0, width * health, 30);
		// health = Math.min(1, health + 0.0002);
		x += 0.01;
		camera.cx = 0.1 * (player.x + 0.5 * (mouse.x / c.clientWidth - 0.5) * camera.w) + 0.9 * camera.cx;
		camera.cy = 0.1 * (player.y + 0.5 * (mouse.y / c.clientHeight - 0.5) * camera.h) + 0.9 * camera.cy;
	}
}

function menu(){
	game();
	document.getElementById("menu").style.display = "block";
	var men = document.getElementById("menu");
	var width; var height;
	width = getWH().width;
	height = getWH().height;
	men.width = width;
	men.height = height;
	var mctx = men.getContext("2d");
	var rects = [];
	for(var i = 0; i < 100; i++){
		rects.push({
			x: Math.random() * 20 - 10,
			y: -Math.random() * 100 - 10,
			s: i / 80,
			c: getColor(Math.floor(Math.random() * 360)),
			w: 0.2 + Math.random() * 0.4,
			h: 5 + 5 * Math.random()
		});
	}
	mctx.textAlign = "center";
	mctx.textBaseline = "middle";
	var angle = 0.5;
	function renderMenu(){
		if(getWH().width != width || getWH().height != height){
			width = getWH().width;
			height = getWH().height;
			men.width = width;
			men.height = height;
			console.log(width, height);
			mctx.textAlign = "center";
			mctx.textBaseline = "middle";
			mctx = men.getContext("2d");
		}
		mctx.fillStyle = "black";
		mctx.fillRect(0, 0, width, height);
		var scale = Math.max(width, height) / 10;
		if(!isRunning)
			requestAnimationFrame(renderMenu);
		mctx.translate(width / 2, height / 2);
		mctx.rotate(angle);
		for(var i = 0; i < Math.floor(rects.length * 0.8); i++){
			var r = rects[i];
			r.y += r.s * 0.1;
			if(r.y > 10)
				r.y = -100;
			mctx.fillStyle = r.c;
			mctx.fillRect(scale * (r.x - r.w / 2) + width / 2, scale * (r.y - r.h / 2) + height / 2, r.w * scale, r.h * scale);
		}
		mctx.rotate(-angle);
		mctx.translate(-width / 2, -height / 2);
		mctx.fillStyle = "white";
		mctx.font = (Math.min(width, height) * 0.012) + "vmin Lato";
		mctx.fillText("INVISIBLE  HUNTER", width / 2, height / 2);
		mctx.font = (Math.min(width, height) * 0.007) + "vmin Lato";
		mctx.fillText("PRESS  TO  START", width / 2, height / 5 * 3);
		mctx.translate(width / 2, height / 2);
		mctx.rotate(angle);
		for(var i = Math.floor(rects.length * 0.8); i < rects.length; i++){
			var r = rects[i];
			r.y += r.s * 0.1;
			if(r.y > 10)
				r.y = -100;
			mctx.fillStyle = r.c;
			mctx.fillRect(scale * (r.x - r.w / 2) + width / 2, scale * (r.y - r.h / 2) + height / 2, r.w * scale, r.h * scale);
		}
		mctx.rotate(-angle);
		mctx.translate(-width / 2, -height / 2);
		// angle += 0.001;
	}
	renderMenu();
	men.onclick = function(){
		men.style.display = "none";
		for(var i = 0; i < lizards.length; i++)
			lizards[i].nextNote(lizards[i]);
		render();
		// men.onclick = undefined;
	}
}
menu();
// The game should be ready now.