//Greensock plugin initialization
gsap.registerPlugin(Draggable, InertiaPlugin);

// selectors
const gameTitle = document.querySelector('#game-title');
const gameSpace = document.querySelector('.gamespace');
const basket = document.querySelector('.basket');
const timerDisplay = document.querySelector('#timer');
const counterDisplay = document.querySelector('#counter');
const startBtn = document.querySelector('#start');

// used to global scope setInterval, timeOut values
let startTimer, runTimerDisplay, startAddingCircles;

// to allow game color changes with time
let color = '#48c78e';

// game data
const gameState = {
  counter: 0,
  time: 20000, //in milliseconds
  circleUnit: function () {
    return 1000;
  },
  timerUnit: function () {
    return this.time / 1000;
  },
  draggableArr: [],
};
let timer = gameState.time;

// game dimensions
// set basket size
const gameWidth = 600;
const basketWidth = 100;
const circleWidth = 50;
basket.style.width = `${basketWidth}px`;
basket.style.height = `${basketWidth}px`;

// create circle postions with one that is outside of the basket
function elPos() {
  let num1 = Math.random() * gameWidth;
  while (
    num1 > gameWidth / 2 - basketWidth / 2 - circleWidth &&
    num1 < gameWidth / 2 - basketWidth / 2 + basketWidth + circleWidth
  ) {
    num1 = Math.random() * gameWidth;
  }
  let num2 = Math.random() * gameWidth;
  return { a: num1, b: num2 };
}

// create div with circle class and set postition
function makeCircle() {
  let circle = document.createElement('div');
  circle.classList.add('circle', 'box');
  circle.style.backgroundColor = color;
  let pos = elPos();
  let top, left;
  if (Math.random() < 0.5) {
    top = pos.a;
    left = pos.b;
  } else {
    top = pos.b;
    left = pos.a;
  }
  circle.style.top = `${top}px`;
  circle.style.left = `${left}px`;
  return circle;
}

// add circle and make it draggable
function addCircle() {
  let circle = makeCircle();
  gameSpace.appendChild(circle);
  makeDraggable(circle);
}

// call Greensock Draggable class to create a draggable object
// also add to the gamestate arr of draggable objects
function makeDraggable(circle) {
  let dragCircle = Draggable.create(circle, {
    bounds: gameSpace,
    edgeResistance: 0.1,
    type: 'x,y',
    inertia: true,
    onDragEnd: function (e) {
      //hittest checks if at least 20 pixels are overlapping
      if (this.hitTest(basket, 20)) {
        console.log('hit!');
        basketAnim();
        circle.remove();
        gameState.counter += 1;
        counterDisplayUpdate();
      }
    },
  });
  gameState.draggableArr.push(dragCircle[0]);
}

// Uses Greensock timeline to animate the basket
function basketAnim() {
  let tl = gsap.timeline();
  tl.to(basket, {
    duration: 0.15,
    scale: 1.05,
    backgroundColor: color,
  }).to(
    basket,
    { duration: 0.05, scale: 1, backgroundColor: '#b5b5b5' },
    '-=.05'
  );
  return tl;
}

// starts timer, sets interval to add circles and update the timer display
function startGame() {
  resetGame();
  startBtn.classList.add('is-loading');
  startBtn.disabled = true;
  startTimer = setTimeout(endGame, gameState.time);
  runTimerDisplay = setInterval(timerDiplayUpdate, gameState.timerUnit());
  addCircle();
  startAddingCircles = setInterval(addCircle, gameState.circleUnit());
}

// clears intervals disables draggleable objects
function endGame() {
  console.log('game over');
  clearInterval(runTimerDisplay);
  timerDisplay.value = 0;
  clearInterval(startAddingCircles);
  gameState.draggableArr.forEach((draggable) => draggable.disable());
  startBtn.disabled = false;
  startBtn.classList.remove('is-loading');
}

// resets gameState values, display values, and removes any remaining circles
function resetGame() {
  gameState.counter = 0;
  counterDisplayUpdate();
  gameState.draggableArr = [];
  timer = gameState.time;
  timerDisplay.value = 100;
  timerDisplay.classList.remove('is-danger');
  timerDisplay.classList.add('is-success');
  gameTitle.classList.remove('has-text-danger');
  gameTitle.classList.add('has-text-success');
  startBtn.classList.remove('is-danger');
  startBtn.classList.add('is-success');
  color = '#48c78e';
  let circles = document.querySelectorAll('.circle');
  for (let circle of circles) {
    circle.remove();
  }
}

// updates the timer display
// display value range 100 to 0
// a timer unit from gameState adjusts the timer decrement
// also used to adjust the timer display value decrement
// has color state changes as timerValue progresses
function timerDiplayUpdate() {
  timer -= gameState.timerUnit();
  let timerValue = timer / (gameState.timerUnit() * 10);
  if (timerValue < 40 && timerValue > 15) {
    gameTitle.classList.remove('has-text-success');
    gameTitle.classList.add('has-text-warning');
    startBtn.classList.remove('is-success');
    startBtn.classList.add('is-warning');
    timerDisplay.classList.remove('is-success');
    timerDisplay.classList.add('is-warning');
    color = '#ffe08a';
    for (let circle of document.querySelectorAll('.circle')) {
      circle.style.backgroundColor = color;
    }
  } else if (timerValue < 15) {
    gameTitle.classList.remove('has-text-warning');
    gameTitle.classList.add('has-text-danger');
    startBtn.classList.remove('is-warning');
    startBtn.classList.add('is-danger');
    timerDisplay.classList.remove('is-warning');
    timerDisplay.classList.add('is-danger');
    color = '#f14668';
    for (let circle of document.querySelectorAll('.circle')) {
      circle.style.backgroundColor = color;
    }
  }
  timerDisplay.value = timerValue;
}

// updates the counter display
function counterDisplayUpdate() {
  counterDisplay.innerText = String(gameState.counter).padStart(2, '0');
}

startBtn.addEventListener('click', startGame);
