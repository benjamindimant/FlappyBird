// the Game object used by the phaser.io library
var stateActions = { preload: preload, create: create, update: update };

// Phaser parameters:
// - game width
// - game height
// - renderer (go for Phaser.AUTO)
// - element where the game will be drawn ('game')
// - actions on the game state (or null for nothing)
var game = new Phaser.Game(790, 400, Phaser.AUTO, 'game', stateActions);

// Global variables:
var score;
var labelScore;
var player;
var pipes;

/*
 * Loads all resources for the game and gives them names.
 */
function preload() {
  game.load.image("playerImg", "../assets/jamesBond.gif");
  game.load.audio("score", "../assets/point.ogg");
  game.load.image("pipe", "../assets/pipe.png");
}

/*
 * Initialises the game. This function is only called once.
 */
function create() {
    // set the background colour of the scene
  game.stage.setBackgroundColor("ffffff");
  // game.add.text(20, 20, "Welcome to my game", {font: "30px Arial", fill: "#FFFFFF"});
  // game.add.sprite(10, 270, "playerImg");
  // game.input.onDown.add(clickHandler);
  game.input
      .keyboard.addKey(Phaser.Keyboard.SPACEBAR)
      .onDown.add(spaceHandler);
  score = 0;
  labelScore = game.add.text(20, 20, "0");
  player = game.add.sprite(100, 200, "playerImg");
  game.physics.arcade.enable(player);
  player.body.velocity.x = 50;
  player.body.velocity.y = -100;
  player.body.gravity.y = 300;
  pipes = [];
  // player.kill();
  game.input.keyboard.addKey(Phaser.Keyboard.RIGHT).onDown.add(moveRight);
  generatePipe();
  game.physics.startSystem(Phaser.Physics.Arcade);
  game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(playerJump);
  game.time.events.loop(1.75 * Phaser.Timer.SECOND, generatePipe);
}

function clickHandler(event) {
  // alert("click");
  // alert("The position is " + event.x + ", " + event.y);
  game.add.sprite(event.x, event.y, "playerImg");
}

function spaceHandler() {
  game.sound.play("score");
}

function changeScore() {
  score = score + 1;
  labelScore.setText(score.toString());
}

function moveRight() {
  player.x = player.x + 1;
}

function playerJump() {
  player.body.velocity.y = -200;
}

function generatePipe() {
  var gapStart = game.rnd.integerInRange(1, 5);
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 8; j++) {
      if (j != gapStart && j != gapStart + 1) {
          addPipeBlock(i * 200, j * 50);
      }
    }
    gapStart = game.rnd.integerInRange(1, 5);
    changeScore();
  }
  // for (var count = 0; count < 8; count++) {
  //   game.add.sprite(20, 50 * count, "pipe");
  //   game.add.sprite(150, 50 * count, "pipe");
  //   game.add.sprite(200 * count, 50, "pipe");
  // }
}

function addPipeBlock(x, y) {
  var block = game.add.sprite(x, y, "pipe");
  pipes.push(block);
  game.physics.arcade.enable(block);
  block.body.velocity.x = -200;
}

/*
 * This function updates the scene. It is called for every new frame.
 */
function update() {
  for (var index = 0; index < pipes.length; index++) {
    game.physics.arcade.overlap(player, pipes[index], gameOver);
  }
}

function gameOver() {
  game.destroy();
}