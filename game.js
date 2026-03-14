const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// GÖRSELLER
let playerImg = new Image();
playerImg.src = "player.png";
let enemyImg = new Image();
enemyImg.src = "enemy.png";

// SESLER
let motorSound = new Audio("motor.mp3");
motorSound.loop = true;
motorSound.volume = 0.3;
motorSound.play();

let crashSound = new Audio("crash.mp3");
crashSound.volume = 0.7;

// OYUNCU
let player = {
  x:180,
  y:500,
  width:50,
  height:80,
  speed:8,
  level:1
};

let enemies = [];
let roadLines = [];
let coins = [];

let score = 0;
let coinScore = 0;
let highScore = localStorage.getItem("highScore") || 0;

let gameSpeed = 4.5; // başlangıç hızı

document.getElementById("score").innerText =
  `Skor: 0 | Rekor: ${highScore} | Coin: 0 | Seviye: ${player.level}`;

// DÜŞMAN OLUŞTURMA
function spawnEnemy(){
  let x = Math.random()*350;
  enemies.push({x:x, y:-100, width:50, height:80, speed:gameSpeed});
}
setInterval(spawnEnemy,1200);

// COIN OLUŞTURMA
function spawnCoin(){
  let x = Math.random()*350;
  coins.push({x:x, y:-50, width:20, height:20, speed:gameSpeed-1});
}
setInterval(spawnCoin,2000);

// YOL ÇİZGİLERİ
for(let i=0;i<10;i++){roadLines.push({x:195,y:i*60,width:10,height:40});}

// TUŞ BASILI TUTMA KONTROLÜ
let keys = { left:false, right:false };

document.addEventListener("keydown", e=>{
  if(e.key==="ArrowLeft") keys.left = true;
  if(e.key==="ArrowRight") keys.right = true;
  if(e.key==="u" || e.key==="U"){upgradeCar();}
});

document.addEventListener("keyup", e=>{
  if(e.key==="ArrowLeft") keys.left = false;
  if(e.key==="ArrowRight") keys.right = false;
});

// MOBİL DOKUNMATİK HAREKET
canvas.addEventListener("touchstart", function(e){
  let touchX = e.touches[0].clientX;
  let screenWidth = window.innerWidth;
  if(touchX < screenWidth/2){player.x -= player.speed*5;}
  else{player.x += player.speed*5;}
  motorSound.volume = 0.5;
});

canvas.addEventListener("touchend", function(e){
  motorSound.volume = 0.3;
});

canvas.addEventListener("touchmove", function(e){
  e.preventDefault();
  let touchX = e.touches[0].clientX;
  player.x = touchX - player.width/2;
}, {passive:false});

// YOL ÇİZME
function drawRoad(){
  ctx.fillStyle="#333";
  ctx.fillRect(0,0,400,600);
  ctx.fillStyle="white";
  for(let i=0;i<roadLines.length;i++){
    let line = roadLines[i];
    line.y += gameSpeed;
    if(line.y>600){line.y=-40;}
    ctx.fillRect(line.x,line.y,line.width,line.height);
  }
  ctx.fillStyle="yellow";
  ctx.fillRect(0,0,10,600);
  ctx.fillRect(390,0,10,600);
}

// ÇARPMA EFEKTI
function crashEffect(){
  ctx.fillStyle="orange";
  ctx.beginPath();
  ctx.arc(player.x+25,player.y+40,60,0,Math.PI*2);
  ctx.fill();
}

// ARABA UPGRADE
function upgradeCar(){
  if(coinScore >= 10){
    coinScore -= 10;
    player.level +=1;
    player.speed +=0.5; // hız artışı dengelendi
    player.width +=2;
    player.height +=3;
    document.getElementById("score").innerText =
      `Skor: ${score} | Rekor: ${highScore} | Coin: ${coinScore} | Seviye: ${player.level}`;
    alert("Araba geliştirildi! Seviye: " + player.level);
  }else{
    alert("Upgrade için en az 10 coin gerekli!");
  }
}

// OYUN GÜNCELLEME
function update(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  drawRoad();
  ctx.drawImage(playerImg,player.x,player.y,player.width,player.height);

  // Motor sesi oyun hızına bağlı
  motorSound.playbackRate = 1 + (gameSpeed - 4.5) * 0.05;

  // TUŞ BASILI TUTMA AKICI HAREKET
  if(keys.left) player.x -= player.speed;
  if(keys.right) player.x += player.speed;

  // DÜŞMAN ARABALAR
  for(let i=0;i<enemies.length;i++){
    let e = enemies[i];
    e.y += gameSpeed;
    ctx.drawImage(enemyImg,e.x,e.y,e.width,e.height);

    if(player.x < e.x + e.width &&
       player.x + player.width > e.x &&
       player.y < e.y + e.height &&
       player.y + player.height > e.y){
      crashEffect();
      crashSound.currentTime = 0;
      crashSound.play();
      setTimeout(()=>{alert(`Kaza yaptın! Skor: ${score}`); location.reload();},200);
    }

    if(e.y>600){
      score++;
      if(score%10===0){gameSpeed += 0.5;}
      if(score>highScore){highScore=score; localStorage.setItem("highScore",highScore);}
      document.getElementById("score").innerText =
        `Skor: ${score} | Rekor: ${highScore} | Coin: ${coinScore} | Seviye: ${player.level}`;
      enemies.splice(i,1);
    }
  }

  // COINLER
  for(let i=0;i<coins.length;i++){
    let c = coins[i];
    c.y += c.speed;
    ctx.fillStyle="yellow";
    ctx.beginPath();
    ctx.arc(c.x+10,c.y+10,10,0,Math.PI*2);
    ctx.fill();

    if(player.x < c.x + c.width &&
       player.x + player.width > c.x &&
       player.y < c.y + c.height &&
       player.y + player.height > c.y){
      coinScore++;
      coins.splice(i,1);
      document.getElementById("score").innerText =
        `Skor: ${score} | Rekor: ${highScore} | Coin: ${coinScore} | Seviye: ${player.level}`;
    }
  }

  requestAnimationFrame(update);
}

update();