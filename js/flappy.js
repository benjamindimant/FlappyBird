var actions = {preload: preload, create: create, update: update};
// Game dimensions
var width = 700;
var height = 400;
var game = new Phaser.Game(width, height, Phaser.AUTO, 'game', actions);
var score = 0;
var labelScore;
var flashMessage;
var player;
var pipes = [];
// Physics variables
var gameGravity = 400;
var gameSpeed = 200;
var jumpPower = 200;
var pipeInterval = 1.75;
var pipeGap = 100;
// Global variables to store the bonuses
var balloons = [];
var weights = [];

function preload() {
  game.load.audio('score', '../assets/point.ogg');
  game.load.image('playerImg', '../assets/ball.png');
  game.load.image('pipe', '../assets/pipe.png');
  game.load.image('pipeEnd', '../assets/pipe-end.png');
  game.load.image('balloons', '../assets/balloons.png');
  game.load.image('weight', '../assets/weight.png');
  game.load.spritesheet('playerImg', '../assets/wobble.png', 20, 20);
}
function create() {
  game.stage.setBackgroundColor('#b4a86b');
  labelScore = game.add.text(20, 60, '0',
      {font: '30px Arial', fill: '#FFFFFF'});
  flashMessage = game.add.text(180, 60, '',
      {font: '30px Arial', fill: '#FFFFFF'});
  player = game.add.sprite(80, 200, 'playerImg');
  player.scale.setTo(1.5, 1.5);
  player.anchor.setTo(0.5, 0.5);
  player.animations.add('wobble', [0, 1, 0, 2, 0, 1, 0, 2, 0], 10);
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.enable(player);
  player.body.gravity.y = gameGravity;
  game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(playerJump);
  game.time.events.loop(pipeInterval * Phaser.Timer.SECOND, generate);
}

// This function updates the scene. It is called for every new frame.
function update() {
  game.physics.arcade.overlap(player, pipes, gameOver);
  // Call game over if the player oversteps the boundaries of the game
  if (0 > player.body.y || player.body.y > width) {
    gameOver();
  }
  // Rotate the player according to its speed
  player.rotation = Math.atan(player.body.velocity.y / gameSpeed);

  // Check if the player gets a bonus
  checkBonus(balloons, -50);
  checkBonus(weights, 50);
}

function checkBonus(bonusArray, bonusEffect) {
// Step backwards in the array to avoid index errors from splice
  for (var i = bonusArray.length - 1; i >= 0; i--) {
    game.physics.arcade.overlap(player, bonusArray[i], function() {
      // destroy sprite
      bonusArray[i].destroy();
      // remove element from array
      bonusArray.splice(i, 1);
      // apply the bonus effect
      changeGravity(bonusEffect);
    });
  }
}

function addPipeBlock(x, y) {
  var block = game.add.sprite(x, y, 'pipe');
  pipes.push(block);
  game.physics.arcade.enable(block);
  block.body.velocity.x = -gameSpeed;
}

function addPipeEnd(x, y) {
  var block = game.add.sprite(x, y, 'pipeEnd');
  pipes.push(block);
  game.physics.arcade.enable(block);
  block.body.velocity.x = -gameSpeed;
}

function generate() {
  var diceRoll = game.rnd.integerInRange(1, 10);
  if (diceRoll === 1) {
    generateBalloons();
  } else if (diceRoll === 2) {
    generateWeight();
  } else {
    generatePipe();
  }
}

function generatePipe() {
  var gapStart = game.rnd.integerInRange(50, height - 50 - pipeGap);
  addPipeEnd(width - 5, gapStart - 25);
  for (var y1 = gapStart - 75; y1 > -50; y1 -= 50) {
    addPipeBlock(width, y1);
  }
  addPipeEnd(width - 5, gapStart + pipeGap);
  for (var y2 = gapStart + pipeGap + 25; y2 < height; y2 += 50) {
    addPipeBlock(width, y2);
  }
  changeScore();
}

function generateBalloons() {
  var bonus = game.add.sprite(width, height, 'balloons');
  balloons.push(bonus);
  game.physics.arcade.enable(bonus);
  bonus.body.velocity.x = -gameSpeed;
  bonus.body.velocity.y = -game.rnd.integerInRange(60, 100);
}

function generateWeight() {
  var bonus = game.add.sprite(width, 0, 'weight');
  weights.push(bonus);
  game.physics.arcade.enable(bonus);
  bonus.body.velocity.x = -gameSpeed;
  bonus.body.velocity.y = game.rnd.integerInRange(60, 100);
}

function changeGravity(g) {
  gameGravity += g;
  player.body.gravity.y = gameGravity;
}

function playerJump() {
  player.animations.play('wobble');
  player.body.velocity.y = -jumpPower;
}

function changeScore() {
  score++;
  labelScore.setText(score.toString());
  if (score % 5 === 0) {
    game.sound.play('score');
    flashMessage.setText("Wow! You have " + score.toString() + " points!");
  } else {
    flashMessage.setText('');
  }
}

function gameOver() {
  score = 0;
  gameGravity = 400;
  game.state.restart();
}