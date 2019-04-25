/*
NOTE: You will need to add and modify code in this file to complete this project.
I have defined a few functions and variables to help guide you but that doesn't mean no other variables or functions are necessary.
If you think you have a better / different way to do things, you are free to do so :)
*/

const monsterNames = [
  'Bigfoot',
  'Centaur',
  'Cerberus',
  'Chimera',
  'Ghost',
  'Goblin',
  'Golem',
  'Manticore',
  'Medusa',
  'Minotaur',
  'Ogre',
  'Vampire',
  'Wendigo',
  'Werewolf',
];

const RARITY_LIST = ['Common', 'Unusual', 'Rare', 'Epic'];
const GAME_STEPS = ['SETUP_PLAYER', 'SETUP_BOARD', 'GAME_START'];
let gameStep = 0; // The current game step, value is index of the GAME_STEPS array.
let board = []; // The board holds all the game entities. It is a 2D array.

const items = [
  {
    name: '',
    type: 'potion',
    value: 5, 
    rarity: 0, 
    use: function(target) {
    if ((target.hp + 25) > (target.level * 100)) {
      target.hp = target.level * 100;
    } else {
      target.hp += 25;
    }
    if (this.rarity === 3) {
      getMaxHP();
    }
  }},

  {
    name: '',
    type: 'bomb', 
    value: 7, 
    rarity: 0, 
    use: function(target) {
      if (this.rarity === 3) {
        target.hp *= 0.1;
      } else {
        target.hp -= 50;
      }
  }},
  {
    name: '',
    type: 'key', 
    value: 150, 
    rarity: 3, 
    use: function(door) {
      unlock(door);
  }},    
]; // Array of item objects. These will be used to clone new items with the appropriate properties.

let player = {
  name: '',
  sprite: 'P',
  level: 1,
  items: [],
  skills: [
    {
      name: 'confuse',
      requiredLevel: 1,
      cooldown: 10000,
      use: function(target) {
        target.hp - (player.level * 25);
      }},
      {
        name: 'steal',
        requiredLevel: 3,
        cooldown: 25000,
        use: function(target) {
          let stolenItems = target.items.filter(rarity <= 1);
          player.items += stolenItems;  
          target.items -= stolenItems;
        }},
  ],
  attack: 10,
  speed: 3000,
  hp: 100,
  gold: 0,
  exp: 0,
  type: 'player',
  position: {},
  getMaxHP: function() {
    this.hp = this.level * 100;
  },
  levelUp: function() {
    this.exp -= (this.level * 20);
    this.level += 1;
    this.hp = this.level * 100;
    this.speed = 3000 / this.level;
    this.attack =+ 10;
    console.log("Level up! You are now level" + this.level + " !")
  }, // Level up happens when exp >= [player level * 10])
  getExpToLevel: function (){
   return this.level * 20; 
  }
}; 

// Utility function to print messages with different colors. Usage: print('hello', 'red');
function print(arg, color) {
  if (typeof arg === 'object') console.log(arg);
  else console.log('%c' + arg, `color: ${color};`);
}

// Prints a blue string with the indicated number of dashes on each side of the string. Usage: printSectionTitle('hi', 1) // -hi-
// We set a default value for the count to be 20 (i.e. 20 dashes '-')
function printSectionTitle(title, count = 20) {
  let countArr = [];
  for (let i = 0; i <= count; i++){
  countArr.push('-');
  }
  countArr = countArr.join('');
  let header = countArr + ' ' + title + ' ' + countArr;
  print(header, 'blue');
}


// Returns a new object with the same keys and values as the input object
function clone(entity) {
  let cloneObj = {};
  Object.keys(entity);
  cloneObj = {
    name: RARITY_LIST[entity.rarity] + ' ' + entity.type,
    type: entity.type,
    value: entity.value,
    rarity: entity.rarity, 
    use: entity.use,
  };
  return cloneObj;
}

// returns true or false to indicate whether 2 different objects have the same keys and values
function assertEqual(obj1, obj2) {
    let obj1Position = obj1.filter(objPosition => obj1.position);
    let obj2Position = obj2.filter(objPosition => obj2.position);
    if (obj1Position === obj2Position)
      return true;
      else false;
}

// Clones an array of objects
// returns a new array of cloned objects. Useful to clone an array of item objects
function cloneArray(objs) {

}

// Uses a player item (note: this consumes the item, need to remove it after use)
// itemName is a string, target is an entity (i.e. monster, tradesman, player, dungeon)
// If target is not specified, item should be used on player for type 'potion'. Else, item should be used on the entity at the same position
// First item of matching type is used
function useItem(itemName, target) {

}

// Uses a player skill (note: skill is not consumable, it's useable infinitely besides the cooldown wait time)
// skillName is a string. target is an entity (typically monster).
// If target is not specified, skill shoud be used on the entity at the same position
function useSkill(skillName, target) {

}

// Sets the board variable to a 2D array of rows and columns
// First and last rows are walls
// First and last columns are walls
// All the other entities are grass entities
function createBoard(rows, columns) {
  for (let i = 0; i <= rows - 1; i++){
    let rowsArray = [];
    for (let j = 0; j < columns; j++){
      wall = {};
      wall.type = 'wall';
      wall.sprite = '#';
      wall.position = {row: i, column: j};
      rowsArray.push(wall);
      grass = {};
      grass.type = 'grass';
      grass.sprite = '.';
      grass.position = {row: i, column: j};
    }
    if (i !== 0 && i !== rows - 1) {
      rowsArray.fill(grass, 1, (columns - 1));
    }
    board.push(rowsArray);
  }
  console.log(board);
}
  

// Updates the board by setting the entity at the entity position
// An entity has a position property, each board cell is an object with an entity property holding a reference to the entity at that position
// When a player is on a board cell, the board cell keeps the current entity property (e.g. monster entity at that position) and may need to have an additional property to know the player is there too.
function updateBoard(entity) {
  board[entity.position.row].splice(entity.position.column, 1, entity);
}

// Sets the position property of the player object to be in the middle of the board
// You may need to use Math methods such as Math.floor()
function placePlayer(rows, columns) {
  let rowMiddle = (Math.floor(rows/2));
  let columnMiddle = (Math.floor(columns/2));
  player.position = {row: rowMiddle, column: columnMiddle};
  board[Math.floor(rows/2)].splice((columns/2), 1, player);
}

// Creates the board and places player
function initBoard(rows, columns) {
  createBoard(rows, columns);
  console.log("Creating board and placing player...");
  placePlayer(rows, columns);
}

// Prints the board
function printBoard() {
  for (let i = 0; i < board.length; i++){
    let row = '';
    for (let j = 0; j < board[i].length; j++){
      row += board[i][j].sprite;
    }
    print(row);
  }
}

// Sets the player variable to a player object based on the specifications of the README file
// The items property will need to be a new array of cloned item objects
// Prints a message showing player name and level (which will be 1 by default)
function createPlayer(name, level = 1, items = []) {
  let clonePlayer = {};
  Object.keys(player);
  clonePlayer = {
  name : name,
  level : level,
  items : clone(items),
  skills : player.skills,
  attack : player.attack,
  speed : player.speed,
  hp : player.hp,
  gold : player.gold,
  exp : player.exp,
  type :  player.type,
  position : player.position,
  getMaxHP : player.getMaxHP,
  levelUp : player.levelUp,
  getExpToLevel : player.getExpToLevel,
  }
  console.log('Player name set to ' + name  );
  return clonePlayer;
}

// Creates a monster object with a random name with the specified level, items and position
// The items property will need to be a new array of cloned item objects
// The entity properties (e.g. hp, attack, speed) must respect the rules defined in the README
function createMonster(level, items, position) {
  console.log("Creating monster...");
  let monster = {
  name: monsterNames[Math.floor(Math.random() * monsterNames.length)],
  sprite: 'M',
  level: level,
  hp: level * 100,
  attack: level * 10,
  speed: 6000 / level,
  items: items,
  position: position,
  type: 'monster',
  getmaxHP: function() {
    return this.hp = this.level * 100;
  },
  getExp: function() {
    return player.exp += player.level * 10;
  } 
  };
  return monster;
}

// Creates a tradesman object with the specified items and position. hp is Infinity
// The items property will need to be a new array of cloned item objects
function createTradesman(items, position) {
  let tradesman = {
    name: 'Walmart',
    sprite: 'T',
    hp: Infinity,
    items: items,
    position: position,
    type: 'tradesman',
    getMaxHP: function() {
      return this.hp;
    },}
    return tradesman;
}

// Creates an item entity by cloning one of the item objects and adding the position and type properties.
// item is a reference to one of the items in the items variable. It needs to be cloned before being assigned the position and type properties.
function createItem(item, position) {

}

// Creates a dungeon entity at the specified position
// The other parameters are optional. You can have unlocked dungeons with no princess for loot, or just empty ones that use up a key for nothing.
function createDungeon(position, isLocked = true, hasPrincess = true, items = [], gold = 0) {

}
// Moves the player in the specified direction
// You will need to handle encounters with other entities e.g. fight with monster
function move(direction) {
  if (direction === 'U') {
    if (player.position.row > 1){
      board[player.position.row].splice(player.position.column, 1, grass);
      player.position.row -= 1;
      updateBoard(player);
      printBoard();
    }
    else {
      console.log("*THUMP* Ow! Watch where you're going!");
      printBoard();
    }
  }
  if (direction === 'D') {
    if (player.position.row > board.length - 2){
      board[player.position.row].splice(player.position.column, 1, grass);
      player.position.row += 1;
      updateBoard(player);
      printBoard();
    }
    else {
      console.log("*THUMP* Ow... My face.");
      printBoard();
    }
  }
  if (direction === 'L') {
    if (player.position.column > board[0].length - 2){
      board[player.position.row].splice(player.position.column, 1, grass);
      player.position.column -= 1;
      updateBoard(player);
      printBoard();
    }
    else {
      console.log("*THUMP* Ow... I can't walk through this.");
      printBoard();
    }
  }
  if (direction === 'R') {
    if (player.position.column > 1) {
      board[player.position.row].splice(player.position.column, 1, grass);
      player.position.column += 1;
      updateBoard(player);
      printBoard();
    }
    else {
      console.log("*THUMP* Ow... I can't walk through this.");
      printBoard();
    }
  }
}









function setupPlayer() {
  printSectionTitle('SETUP PLAYER');
  print("Please create a player using the createPlayer function. Usage: createPlayer('Bob')");
  print(
    "You can optionally pass in a level and items, e.g. createPlayer('Bob', 3, [items[0], items[2]]). items[0] refers to the first item in the items variable"
  );
  print("Once you're done, go to the next step with next()");
}

function setupBoard() {
  printSectionTitle('SETUP BOARD');
  print('Please create a board using initBoard(rows, columns)');
  print(
    'Setup monsters, items and more using createMonster(attr), createItem(item, pos), createTradesman(items, pos), createDungeon(pos), updateBoard(entity)'
  );
  print("Once you're done, go to the next step with next()");
}

function startGame() {
  printSectionTitle('START GAME');
  print('Hello ' + player.name);
  print("You are ready to start your adventure. Use move('U' | 'D' | 'L' | 'R') to get going.");
  printBoard();
}

function gameOver() {
  printSectionTitle('GAME OVER');
}

function next() {
  gameStep++;
  run();
}

function run() {
  switch (GAME_STEPS[gameStep]) {
    case 'SETUP_PLAYER':
      setupPlayer();
      break;
    case 'SETUP_BOARD':
      setupBoard();
      break;
    case 'GAME_START':
      startGame();
      break;
  }
}

print('Welcome to the game!', 'gold');
print('Follow the instructions to setup your game and start playing');

run();
