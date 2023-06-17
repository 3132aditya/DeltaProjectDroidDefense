const board = document.getElementById("canvas");
const ctx = board.getContext("2d");
const Score = document.querySelector("#score");
const Home = document.querySelector("#home");
const player = document.querySelector("#player");

// Declaring  Game Audio
const bgMusic = new Audio ();
bgMusic.src = "backgroundMusic.mp3";

const overMusic = new Audio ();
overMusic.src = "gameOverMusic.wav";

const powerupMusic = new Audio();
powerupMusic.src = "powerupMusic.wav";

const shootingMusic = new Audio();
shootingMusic.src = "shootingMusic.wav";




let homeImg = new Image;
homeImg.src = "home.png"; 

let backImg = new Image;
backImg.src = "back.png";

let score=0;
let homeHealth=100;
let playerHealth=100;
//Board
let tileSize = 25;
let rows = 25;
let columns = 25;

board.width = tileSize * rows;
board.height = tileSize * columns;




//Ship
let  shipX= board.width/2 -tileSize*4 ;
let shipY=  board.height - tileSize*4;
let shipVelocityX = 2*tileSize;
let shipVelocityY = tileSize;
let shipWidth = tileSize*1.5;
let shipHeight = tileSize*2;
let shipImage = new Image();
shipImage.src = "spaceship.png"

let ship={
  x:shipX,
  y:shipY,
  img: shipImage,
  width: shipWidth,
  height: shipHeight,
}



//Aliens
let alienArray = [];
let alienX= 4*tileSize;
let alienY=2*tileSize;
let alienWidth = tileSize*1.5;
let alienHeight = tileSize*1.5;
let alienShipImage = new Image();
alienShipImage.src = "Bot.png";

let alienRows = Math.floor(Math.random()*2 + 3);
let alienColumns = Math.floor(Math.random()*3 + 3);
let alienCount = 0;
let alienVelocityX=2.5;
//Shooting Alien
let invaderArray=[];
let invaderX = 20;
let invaderY = 20;
let invaderWidth = tileSize*2;
let invaderHeight = tileSize*2; 
let invaderImage = new Image();
invaderImage.src = "shooting.png";
let invaderCount=0;
let invaderRows = 1;
let invaderColumns = 1;
let invaderVelocityX= 2;




//Bullets
let bulletArray = [];
let bulletVelocityY=-15;

//invader bullets
let invaderBulletArray = [];
let invaderBulletVelocityY = 10;

//power up
let powerUpX = Math.floor(Math.random()*(board.width - 2*tileSize) + 2*tileSize);
let powerUpY =  Math.floor(Math.random()*(board.height -2*tileSize) +2*tileSize);
let powerUPImage = new Image();
powerUPImage.src = "powerUp.png";
let powerUPWidth = 1.5*tileSize;
let powerUPHeight = 1.5*tileSize;

let powerUp = {
  img: powerUPImage,
  x:powerUpX,
  y:powerUpY,
  width: powerUPWidth,
  height:powerUPHeight,
  taken: false
}

window.onload = function() { 
  document.addEventListener("keydown", moveShip);
  document.addEventListener("keyup", shootBullet);
  
  createInvader();
  createAlien();
  gameUpdate();
}

function gameUpdate(){
  bgMusic.play();
  requestAnimationFrame(gameUpdate);
  ctx.clearRect(0,0,board.width,board.height);
  //BackGround
ctx.drawImage(backImg,0,0,board.width,board.height);

//Border of home
ctx.fillStyle="white";
ctx.fillRect(0,board.height-7*tileSize,board.width,0.2*tileSize);

//home image
ctx.drawImage(homeImg,board.width/2-homeImg.width/2,board.height-7*tileSize,0.6*board.width,homeImg.height);

  

//SpaceShip
ctx.drawImage(ship.img,ship.x,ship.y,ship.width,ship.height);

//Power up
if(!powerUp.taken){
  ctx.drawImage(powerUp.img,powerUp.x,powerUp.y,powerUPWidth,powerUPHeight);
}


//Rendering Aliens

for(let i=0;i<alienArray.length;i++){
  let aliens = alienArray[i];
  //moving ALiens
  aliens.x+=alienVelocityX;
  //if alien touch border of canvas
  if (aliens.x + 2*aliens.width + 3.5*tileSize>= board.width || aliens.x-4*tileSize<=0){
    alienVelocityX *= -1;
    aliens.x += alienVelocityX*2;

    for(let j=0;j<alienArray.length;j++){
      alienArray[j].y += alienHeight;
    }
  }
  
  if(aliens.alive){
    ctx.drawImage(aliens.img,aliens.x,aliens.y,aliens.width,aliens.height);
  }  
  
}


//Invader bullets
for(let i=0;i<invaderBulletArray.length;i++){
  let invaderBullet = invaderBulletArray[i];
  invaderBullet.y += invaderBulletVelocityY;
  ctx.fillStyle="red";
  ctx.fillRect(invaderBullet.x,invaderBullet.y,invaderBullet.width,invaderBullet.height);
}


//Rendering Shooting Aliens
for(let i=0;i<invaderArray.length;i++){
  let invader = invaderArray[i];
  // Moving invaders
  invader.x += invaderVelocityX;
  

  invader.x2-=invaderVelocityX;
  if(invader.x>=board.width - invaderWidth || invader.x<=0){
   
    invaderVelocityX *= -1;
  } 

  if(invader.alive){

    ctx.drawImage(invader.img,invader.x,invader.y,invader.width,invader.height);
      
  }
}



//Bullets
for(let i=0;i<bulletArray.length;i++){
  let bullet = bulletArray[i];
  bullet.y += bulletVelocityY;
  ctx.fillStyle="red";
  ctx.fillRect(bullet.x,bullet.y,bullet.width,bullet.height);

  // Bullet collision with aliens
for(let i=0;i<alienArray.length;i++){
  let alien = alienArray[i];
  if(!bullet.used && alien.alive && collision(bullet , alien)){
  
    bullet.used = true;
    alien.alive = false;
    score++;
    alienCount--;
    alienArray.splice(i,1);
  }  
}

  //Bullet Collisions with shooting aliens
  for(let i=0;i<invaderArray.length;i++){
    let invader = invaderArray[i];
    if(!bullet.used && invader.alive && collision(bullet , invader)){
    
      bullet.used = true;
      invader.alive = false;
      score++;
      invaderCount--;
      invaderArray.splice(i,1);
    }  
  
  }

}


//Removing aliens after crossing ship

for(let i=alienArray.length-1;i>=0;i--){

if(alienArray[i].y>=board.height-7*tileSize){
  alienArray[i].alive = false;
  alienArray.splice(i,1);
  homeHealth--;
}

//Removing invader bullets after hitting home base
for(let i=0;i<invaderBulletArray.length;i++){
  let invaderBullet = invaderBulletArray[i];
  if(invaderBullet.y>=board.height-7*tileSize){
    invaderBullet.used = true;
    invaderBulletArray.splice(i,1);
    homeHealth = homeHealth-2;
  }

   if(!invaderBullet.used && collision(invaderBullet , ship)){
    invaderBullet.used = true;
    invaderBulletArray.splice(i,1);
    playerHealth = playerHealth - 2;
   }

}

}
//Removing used bullets
while(bulletArray.length>0 && (bulletArray[0].used || bulletArray[0].y<0)){
  bulletArray.shift();
}



//Aliens collision with spaceship
for(i=0;i<alienArray.length;i++){
  let alien = alienArray[i];
  if(alien.alive && collision(alien , ship))
  {
    alien.alive = false;
    alienArray.splice(i,1);
    playerHealth--;
    alienCount--;

  }
}

//player collision with power up
if(collision(ship,powerUp)){
  powerupMusic.play();
  powerUp.taken=true;
  powerUp.x = Math.floor(Math.random()*board.width-4*tileSize);
  powerUp.y = Math.floor(Math.random()*board.height-4*tileSize);
  playerHealth += 5;
  homeHealth +=5;

   
}


if(alienCount===0){
  alienArray = [];
  bulletArray = [];
  
 alienRows = Math.floor(Math.random()*2 + 3);
 alienColumns = Math.floor(Math.random()*3 + 3);
 alienVelocityX+=0.8;
  createAlien();
}



if(alienArray.length ===0){
 alienRows = Math.floor(Math.random()*2 + 3);
 alienColumns = Math.floor(Math.random()*3 + 3);
  bulletArray=[];
  createAlien();
}

if(homeHealth<=0 || playerHealth<=0){
  Over();
}

//calls bullet shooting function at random interval
let a = Math.floor(Math.random()*50);
if(a===3){
  invaderShootingBullet();
}


console.log(homeHealth);

Home.innerText = `Home:${homeHealth}`;
Score.innerText = `Score:${score*10}`;
player.innerText = `Player Hp:${playerHealth} `;

}

function moveShip(e){
  
  
  if(e.key==="ArrowLeft" && ship.x - ship.width>0){
    ship.x -= shipVelocityX;
  }
  else if(e.key === "ArrowRight" && ship.x<board.width-shipWidth-tileSize){
    ship.x+= shipVelocityX;
    
  }
  else if(e.key==="ArrowUp" && ship.y>0){
    ship.y -= shipVelocityY;
  }
  else if(e.key === "ArrowDown" && ship.y<board.height - ship.height){
    ship.y+= shipVelocityY;
  }

  
}

//Shooting bullet iff spacebar is pressed

function shootBullet(e){
  if(e.key === " "){
    shootingMusic.play();
    let bullet={
      x: ship.x + ship.width/2,
      y:ship.y,
      width: tileSize/5,
      height:tileSize/2.5,
      used:false
    }
    bulletArray.push(bullet);
  }
}

//Creating Alien Ships using Array
function createAlien(){
  
  
  for(let i=0;i<alienColumns;i++){
    for(let j=0;j<alienRows;j++){
      let aliens ={
        img: alienShipImage,
        x:alienX + i*alienWidth,
        y:alienY + j*alienHeight,
        width:alienWidth,
        height:alienHeight,
        
        alive:true
      };
      alienArray.push(aliens);
      
    }
  }
  alienCount=alienArray.length;
}

//create invaders
function createInvader(){
  
  
  for(let i=0;i<invaderColumns;i++){
    for(let j=0;j<invaderRows;j++){
      let invader ={
        img: invaderImage,
        x:invaderX + i*invaderWidth,
        
        y:invaderY + j*invaderHeight,
        width:invaderWidth,
        height:invaderHeight,
        
        alive:true
      };
      invaderArray.push(invader);
      
    }
  }
  invaderCount=invaderArray.length;
}

//Invaders bullet
function invaderShootingBullet(){

  for(let i=0;i<invaderArray.length;i++){
    let invader = invaderArray[i];
  let invaderBullet={
    x:invader.x +17,
    y:invader.y,
    width: tileSize/4,
    height:tileSize/2,
    used:false
  }
  invaderBulletArray.push(invaderBullet);
  }
}

//Over function
function Over(){
  alert("GAME OVER!! Press Enter To Restart ");
  bgMusic.pause();
  overMusic.play();
  alienArray=[];
  bulletArray=[];
  createAlien();
  location.reload();
  score=0;
  homeHealth = 100;
  playerHealth =100;
  ship.x= board.width/2 -tileSize*4;
  ship.y=  board.height - tileSize*4;
  
}

//  collision function
function collision(a,b){
  return a.x < b.x + b.width &&
          a.x + a.width >b.x &&
          a.y < b.y + b.height &&
          a.y +a.height >b.y;

}

setInterval(function(){if(invaderCount===0){
  invaderArray=[];
  createInvader();
}},10000);

setInterval(function(){
  powerUp.taken = false;
},15000)

