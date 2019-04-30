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
let enemyAttackInt;
let playerAttackInt;
let currentObj = [];
let tradesman = {};
let confuseCooldownInt;
let stealCooldownInt;

let grass = {
  type: 'grass',
  sprite: '.',
}

let wall = {
  type: 'wall',
  sprite: '#',
}

const items = [
  {
    name: 'Common potion',
    type: 'potion',
    value: 5, 
    rarity: 0, 
    use: function(target) {
      let maxHP = target.getMaxHP();
      if(target.hp < maxHP){
        target.hp = Math.min(maxHP, target.hp + 25);
      }
        // if (this.rarity === 3) {
        //   target.hp = target.getMaxHP();
        //   return 25;
        // }
      }
    },
  {
    name: 'Common bomb',
    type: 'bomb', 
    value: 7, 
    rarity: 0, 
    use: function(target) {
      let minHP = 0;
      if (this.rarity === 3) {
        target.hp *= 0.1;
      } else {
        target.hp = Math.max(minHP, target.hp - 50);
      }
  }},
  {
    name: 'Epic key',
    type: 'key', 
    value: 150, 
    rarity: 3, 
    use: function() {
      if (board[player.position.row][player.position.column].sprite === 'D'){
      dungeon.isLocked = false;
    }
      else {
      print('Need to use this on a dungeon door...', 'red');
      }
    },
  }    
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
      disabled: false,
      use: function(target) {
        if (board[player.position.row][player.position.column] === board[target.position.row][target.position.column]){
          if (this.disabled !== true){
            let nameArr = target.name.split('');
            let reverseArr = nameArr.reverse();
            let joinArr = reverseArr.join('');
            print('Confusing ' + target.name);
            print('...' + joinArr + ', target is confused and hurts itself in the process', 'red');
            print(joinArr + ' hit! -' + (player.level*25) + ' hp', 'purple');
            target.hp = Math.max(0, target.hp - (player.level * 25));
            print('HP remaining: ' + target.hp, 'purple');
            this.disabled = true;
            }
          else {
            print('Skill is on cooldown! ');
          }
        } 
        else{
          print('You can\'t use this from far away!')
        }
      }
    },
      {
        name: 'steal',
        requiredLevel: 3,
        cooldown: 25000,
        disabled: false,
        use: function(target) {
          if (player.level < this.requiredLevel){
            return print('You need to be level 3 to use this skill.');
          }
          if (this.disabled !== true) {
            print('*YOINK* You use steal!');
            let commonItems = [];
            commonItems = commonItems.concat(target.items);
            let stolenItems = [];
            for (let i = 0; i < commonItems.length; i++){
              if (commonItems[i].rarity <= 1){
                stolenItems = stolenItems.concat(commonItems[i]);
                player.items.push(commonItems[i]);
                target.items.splice(commonItems[i], 1);
                this.disabled = true;
              }
            }
              print('You stole the following items: ');
              print(stolenItems);
          }
          else {
            print('Skill is on cooldown!');
          }
        }

      },
  ],
  attack: 10,
  speed: 3000,
  hp: 100,
  gold: 0,
  exp: 0,
  type: 'player',
  position: {},
  getMaxHP: function() {
    return this.level * 100;
  },
  levelUp: function() {
    this.exp -= (this.level * 20);
    this.level += 1;
    this.hp = this.level * 100;
    this.speed = 3000 / this.level;
    this.attack =+ 10;
    console.log('Level up! You are now level ' + this.level + '!')
  }, // Level up happens when exp >= [player level * 10])
  getExpToLevel: function (){
   return (this.level * 20) - (player.exp); 
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
  Object.keys(entity);
  let cloneEntity = {
  name: entity.name,
  sprite: entity.sprite,
  level: entity.level,
  hp: entity.hp,
  attack: entity.attack,
  speed: entity.speed,
  items: entity.items,
  position: entity.position,
  type: entity.type,
  getmaxHP: entity.getmaxHP,
  getExp: entity.getExp,
  };
  return cloneEntity;
}

// returns true or false to indicate whether 2 different objects have the same keys and values
function assertEqual(obj1, obj2) {
   return obj1 === obj2 ? true : false;
}

// Clones an array of objects
// returns a new array of cloned objects. Useful to clone an array of item objects
function cloneArray(objs) {
  let cloneObj = objs;
  return cloneObj;
}


// Uses a player item (note: this consumes the item, need to remove it after use)
// itemName is a string, target is an entity (i.e. monster, tradesman, player, dungeon)
// If target is not specified, item should be used on player for type 'potion'. Else, item should be used on the entity at the same position
// First item of matching type is used
function useItem(itemName, target) {
  function hasPotion(item) {
      return item.type === 'potion';
    }
  function hasBomb(item){
      return item.type === 'bomb';
    } 
  function hasKey(item){  
      return item.type === 'key';
    }

  if (itemName === 'Common potion'){
    if(player.items.some(hasPotion)){
      let itemIdx = player.items.findIndex(hasPotion);
      player.items[itemIdx].use(target);
      print('Used potion! +25hp (Total HP: ' + target.hp + ')', 'green');
      player.items.splice(items[0], 1);
    } else print('You don\'t have any potions!');
  }
  if (itemName === 'Common bomb'){
    if(player.items.some(hasBomb)){
      let itemIdx = player.items.findIndex(hasBomb);
      player.items[itemIdx].use(target);
      print('You used a bomb!', 'gold');
      print(target.name + ' hit! -50hp', 'purple');
      if (target.hp === 0) {
        print('It\'s not about killing, it\'s about sending a message.');
      }
      print(target.name + ' HP remaining: ' + target.hp, 'purple')
      player.items.splice(items[1], 1);
    } else print('You don\'t have any bombs!');
  }
  if (itemName === 'Epic key'){
    if(player.items.some(hasKey)){
      let itemIdx = player.items.findIndex(hasKey);
      player.items[itemIdx].use();
      if (dungeon.isLocked === false){
        player.items.splice(items[2], 1);
      print('Unlocking dungeon...', 'red');
      print('The dungeon is unlocked!' );
      if (dungeon.hasPrincess === true){
        print('You have freed the princess! Congratulations!');
        gameOver();
        return;
      }
      }
    }
      else {
        print('You don\'t have any keys!');
      }
    }
}

// Uses a player skill (note: skill is not consumable, it's useable infinitely besides the cooldown wait time)
// skillName is a string. target is an entity (typically monster).
// If target is not specified, skill shoud be used on the entity at the same position
function useSkill(skillName, target) {
  if (skillName === 'confuse'){
    if (target === undefined){
      target = board[player.position.row][player.position.column];
      if (target.sprite !== 'M'){
        print('Needs to be used on a monster'); 
        return;
      }
      else {
        setTimeout(() => player.skills[0].disabled = false, 10000);
        player.skills[0].use(target);
      }
    } 
    else {
      player.skills[0].use(target);
        setTimeout(() => player.skills[0].disabled = false, 10000);
  }
  }
  if (skillName === 'steal'){
    if (target === undefined){
      target = board[player.position.row][player.position.column];
      if (target.sprite === 'M' || target.sprite === 'T'){
        player.skills[1].use(target);
        setTimeout(() => player.skills[1].disabled = false, 25000);
      }
      else if (target.sprite === '.') {
        print('You stole some grass. I see you like to live life on the edge. No level requirement');
        player.items.push(grass);
      }
      else {
        print('There\'s nothing to steal here.');
      }
    } 
    else if (board[player.position.row][player.position.column] !== board[target.position.row][target.position.column]){
      print('You\'re too far from your target.');
    } 
    else {
      player.skills[1].use(target);
      setTimeout(() => player.skills[1].disabled = false, 25000);
    }
  }
}

// Sets the board variable to a 2D array of rows and columns
// First and last rows are walls
// First and last columns are walls
// All the other entities are grass entities
function createBoard(rows, columns) {
  for (let i = 0; i <= rows - 1; i++){
    let rowsArray = [];
    for (let j = 0; j < columns; j++){
      let wall = {};
      wall.type = 'wall';
      wall.sprite = '#';
      wall.position = {row: i, column: j};
      let grass = {};
      grass.type = 'grass';
      grass.sprite = '.';
      grass.position = {row: i, column: j};
      if (i === 0 || i === rows - 1 || j === 0 || j === columns - 1) {
      rowsArray.push(wall);        
      } else rowsArray.push(grass);
    }
    board.push(rowsArray);
  }
  console.log(board);
}
  

// Updates the board by setting the entity at the entity position
// An entity has a position property, each board cell is an object with an entity property holding a reference to the entity at that position
// When a player is on a board cell, the board cell keeps the current entity property (e.g. monster entity at that position) and may need to have an additional property to know the player is there too.
function updateBoard(entity) {
  board[entity.position.row][entity.position.column] = entity;
}

// Sets the position property of the player object to be in the middle of the board
// You may need to use Math methods such as Math.floor()
function placePlayer(rows, columns) {
  let rowMiddle = (Math.floor(rows/2));
  let columnMiddle = (Math.floor(columns/2));
  player.position = {row: rowMiddle, column: columnMiddle};
}

// Creates the board and places player
function initBoard(rows, columns) {
  createBoard(rows, columns);
  console.log('Creating board and placing player...');
  placePlayer(rows, columns);
}

// Prints the board
function printBoard() {
  for (let i = 0; i < board.length; i++){
    let row = '';
    for (let j = 0; j < board[i].length; j++){
      if (player.position.row === i && player.position.column === j){
        row += player.sprite;
      } else row += board[i][j].sprite;
    }
    print(row);
  }
}

// Sets the player variable to a player object based on the specifications of the README file
// The items property will need to be a new array of cloned item objects
// Prints a message showing player name and level (which will be 1 by default)
function createPlayer(name, level = 1, items = []) {
  player.name = name,
  player.level = level,
  player.items = [cloneArray(items)],
  player.speed = 3000 / player.level,
  console.log('Player name set to ' + name  );
}

// Creates a monster object with a random name with the specified level, items and position
// The items property will need to be a new array of cloned item objects
// The entity properties (e.g. hp, attack, speed) must respect the rules defined in the README
function createMonster(level, items, position) {
  console.log('Creating monster...');
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
    return this.level * 100;
  },
  getExp: function() {
    let experience = this.level * 10;
    player.exp += experience;
    return experience;
    } 
  };
  return monster;
}

// Creates a tradesman object with the specified items and position. hp is Infinity
// The items property will need to be a new array of cloned item objects
function createTradesman(items, position) {
  tradesman = {
    name: 'Walmart',
    sprite: 'T',
    hp: Infinity,
    items: cloneArray(items),
    position: position,
    type: 'tradesman',
    getMaxHP: function() {
      return this.hp;
    },}
    print('Building Walmart...')
    return tradesman;
}


// Creates an item entity by cloning one of the item objects and adding the position and type properties.
// item is a reference to one of the items in the items variable. It needs to be cloned before being assigned the position and type properties.
function createItem(item, position) {
  Object.keys(item);
  let newItem = {
    name: RARITY_LIST[item.rarity] + ' ' + item.type,
    type: item.type,
    value: item.value, 
    rarity: item.rarity,
    position: position,
    sprite: 'I',
    use: item.use,
  };

  print('Tinkering with items...');
  return newItem;
}

// Creates a dungeon entity at the specified position
// The other parameters are optional. You can have unlocked dungeons with no princess for loot, or just empty ones that use up a key for nothing.
function createDungeon(position, isLocked = true, hasPrincess = true, items = [], gold = 0) {
  let dungeon = {
    isLocked: isLocked,
    sprite: 'D',
    hasPrincess: hasPrincess,
    items: items,
    gold: gold,
    position: position,
    type: 'dungeon',
  }
  return dungeon;
}

function battle(enemy){
  if (player.hp <= 0 ) {
    gameOver();
    clearInterval(playerAttackInt);
    return;
  }
  if (board[player.position.row][player.position.column] !== board[enemy.position.row][enemy.position.column]){
    clearInterval(playerAttackInt);
    return;
  }
    enemy.hp = Math.max(0, enemy.hp - player.attack);
// Battle Victory
    if (enemy.hp <= 0) {
      clearInterval(playerAttackInt);
      print('Way to go! You defeated ' + enemy.name + '!' + '\n' + 'You gained ' + (enemy.level * 10) + ' exp! \nYou\'ve recieved the following items:');
      print(enemy.items);
      player.items = player.items.concat(enemy.items);
      enemy.getExp();
      if (player.exp >= (player.level * 20)){
        player.levelUp();
      }
      return;
    }
    print(enemy.name + ' hit!' + ' -' + player.attack + ' hp', 'purple');
    print(enemy.name + ' HP remaining: ' + enemy.hp, 'purple');
}

function enemyAttack(enemy){
  if (enemy.hp <= 0) {
    clearInterval(enemyAttackInt);
    board[enemy.position.row][enemy.position.column] = grass;
    return;
  }

  if (board[player.position.row][player.position.column] !== board[enemy.position.row][enemy.position.column]){
    clearInterval(enemyAttackInt);
    print('You ran away.')
    return;
  }

  if (player.hp > 0) {
    player.hp = Math.max(0, player.hp - enemy.attack);
    print(enemy.name + ' hit you for ' + enemy.attack + ' hp', 'red');
    print('Player HP remaining: ' + player.hp, 'red');
  }

  if (player.hp <= 0) {
    clearInterval(enemyAttackInt);
    return;
  }
}

function buy(itemIdx){
  if (board[player.position.row][player.position.column] === board[tradesman.position.row][tradesman.position.column]){
    if (tradesman.items[itemIdx] !== undefined) {
      if (player.gold >= tradesman.items[itemIdx].value){
        player.items.push(tradesman.items[itemIdx]);
        player.gold -= tradesman.items[itemIdx].value;
        print('*CHA-CHING* \nPurchased: ' + tradesman.items[itemIdx].name + '\nYour total was: ' + tradesman.items[itemIdx].value + ' gold. \nThank you for shopping at Walmart! Please don\'t forget your receipt.');
        print('You have ' + player.gold + ' gold remaining.');
        tradesman.items.splice(tradesman.items[itemIdx], 1);
      }
      else {
        print('You don\'t have enough gold! \nRequired: ' + tradesman.items[itemIdx].value + ' gold: ' + player.gold);
      } 
    } 
    else {
      print('Sorry, we\'re fresh out of that one.');
    }
  
  } else {
    print('You need to go to Walmart to buy items.');
  }
}

function sell(itemIdx){
  if (board[player.position.row][player.position.column] === board[tradesman.position.row][tradesman.position.column]){
    if (player.items[itemIdx] !== undefined) {
      tradesman.items.push(player.items[itemIdx]);
      player.gold += player.items[itemIdx].value;
      print('*CHA-CHING* You sold your ' + player.items[itemIdx].name + ' for ' + player.items[itemIdx].value + ' gold. Thank you for shopping at Walmart! Please don\'t forget your receipt.');
      print('You now have ' + player.gold + ' gold.');
      player.items.splice(player.items[itemIdx], 1);
    }
    else {
    return print('You don\'t have any of those to sell.');
    }
  } else {
    print('You need to go to Walmart to sell items.');
  }
}

// Moves the player in the specified direction
// You will need to handle encounters with other entities e.g. fight with monster
function move(direction) {

  let monster = {};

  if (direction === 'U') {
    if (player.position.row > 1){
      player.position.row -= 1;
      currentObj = board[player.position.row][player.position.column];
      printBoard();
      if (currentObj.type === 'monster') {
        let monster = currentObj;
        console.log('You encountered a(n) ' + currentObj.name + '!');
        playerAttackInt = setInterval(() => battle(monster), player.speed);
        enemyAttackInt = setInterval(() => enemyAttack(monster), monster.speed);
      }
      if (currentObj.type === 'potion'){
        print('You found a '+ items[0].name + '!', 'green');
        player.items.push(items[0]);
        grass.position = player.position;
        board[player.position.row][player.position.column] = grass;
      }
      if (currentObj.type === 'bomb'){
        print('You found a '+ items[1].name + '!', 'green');
        player.items.push(items[1]);
        board[player.position.row][player.position.column] = grass;
      }
      if (currentObj.type === 'key'){
        print('You found a '+ items[2].name + '!', 'green');
        player.items.push(items[2]);
        board[player.position.row][player.position.column] = grass;
      }
      if (currentObj.type === 'tradesman'){
        print('You decided to go to Walmart! You can buy(itemIdx) and sell(itemIdx) here.');
        print('Items for sale:');
        print(tradesman.items);
      }
      if (currentObj.type === 'dungeon'){
        if (currentObj.isLocked === true){
          print("It's locked. You need to find a key! \n If you have a key, try useItem('Epic key')");
        }
        else {
          print('You found the dungeon!');
          print('...and it\'s unlocked!');
          print('No princess here... but hey, you found treasure! That\'s almost as good!');
          print('You\'ve received ' + dungeon.items.length + ' item(s) and ' + dungeon.gold + ' gold.');
          print(dungeon.items);
          player.items = player.items.concat(dungeon.items);
          dungeon.items = [];
          player.gold += dungeon.gold;
          dungeon.gold = 0;
          print('You now have ' + player.gold + ' gold.');
        }
      }
    }
    else {
      console.log('*THUMP* Ow! Watch where you\'re going!');
      printBoard();
    }
  }

  if (direction === 'D') {
    if (board[player.position.row + 1][player.position.column].sprite !== '#') {
      player.position.row += 1;
      currentObj = board[player.position.row][player.position.column];
      printBoard();
      if (currentObj.type === 'monster') {
        let monster = currentObj;
        console.log('You encountered a(n) ' + currentObj.name + '!');
        playerAttackInt = setInterval(() => battle(monster), player.speed);
        enemyAttackInt = setInterval(() => enemyAttack(monster), monster.speed);
      }
      if (currentObj.type === 'potion'){
        print('You found a '+ items[0].name + '!', 'green');
        player.items.push(items[0]);
        grass.position = player.position;
        board[player.position.row][player.position.column] = grass;
      }
      if (currentObj.type === 'bomb'){
        print('You found a '+ items[1].name + '!', 'green');
        player.items.push(items[1]);
        board[player.position.row][player.position.column] = grass;
      }
      if (currentObj.type === 'key'){
        print('You found a '+ items[2].name + '!', 'green');
        player.items.push(items[2]);
        board[player.position.row][player.position.column] = grass;
      }
      if (currentObj.type === 'tradesman'){
        print('You decided to go to Walmart! You can buy(itemIdx) and sell(itemIdx) here.');
        print('Items for sale:');
        print(tradesman.items);
      }
      if (currentObj.type === 'dungeon'){
        if (currentObj.isLocked === true){
          print("It's locked. You need to find a key! \n If you have a key, try useItem('Epic key')");
        }
        else {
          print('You found the dungeon!');
          print('...and it\'s unlocked!');
          print('No princess here... but hey, you found treasure! That\'s almost as good!');
          print('You\'ve received ' + dungeon.items.length + ' item(s) and ' + dungeon.gold + ' gold.');
          print(dungeon.items);
          player.items = player.items.concat(dungeon.items);
          dungeon.items = [];
          player.gold += dungeon.gold;
          dungeon.gold = 0;
          print('You now have ' + player.gold + ' gold.');
        }
      }
    }
    else {
      console.log('*THUMP* Ow... My face.');
      printBoard();
    }
  }
  if (direction === 'L') {
    if (player.position.column >= 2){
      player.position.column -= 1;
      currentObj = board[player.position.row][player.position.column];
      printBoard();
      if (currentObj.type === 'monster') {
        let monster = currentObj;
        console.log('You encountered a(n) ' + currentObj.name + '!');
        playerAttackInt = setInterval(() => battle(monster), player.speed);
        enemyAttackInt = setInterval(() => enemyAttack(monster), monster.speed);
      }
      if (currentObj.type === 'potion'){
        print('You found a '+ items[0].name + '!', 'green');
        player.items.push(items[0]);
        grass.position = player.position;
        board[player.position.row][player.position.column] = grass;
      }
      if (currentObj.type === 'bomb'){
        print('You found a '+ items[1].name + '!', 'green');
        player.items.push(items[1]);
        board[player.position.row][player.position.column] = grass;
      }
      if (currentObj.type === 'key'){
        print('You found a '+ items[2].name + '!', 'green');
        player.items.push(items[2]);
        board[player.position.row][player.position.column] = grass;
      }
      if (currentObj.type === 'tradesman'){
        print('You decided to go to Walmart! You can buy(itemIdx) and sell(itemIdx) here.');
        print('Items for sale:');
        print(tradesman.items);
      }
      if (currentObj.type === 'dungeon'){
        if (currentObj.isLocked === true){
          print("It's locked. You need to find a key! \n If you have a key, try useItem('Epic key')");
        }
        else {
          print('You found the dungeon!');
          print('...and it\'s unlocked!');
          print('No princess here... but hey, you found treasure! That\'s almost as good!');
          print('You\'ve received ' + dungeon.items.length + ' item(s) and ' + dungeon.gold + ' gold.');
          print(dungeon.items);
          player.items = player.items.concat(dungeon.items);
          dungeon.items = [];
          player.gold += dungeon.gold;
          dungeon.gold = 0;
          print('You now have ' + player.gold + ' gold.');
        }
      }
    }
    else {
      console.log('*THUMP* Ow... I can\'t walk through this.');
      printBoard();
    }
  }
  if (direction === 'R') {
    if (board[player.position.row][player.position.column + 1].sprite !== '#') {
      player.position.column += 1;
      currentObj = board[player.position.row][player.position.column];
      printBoard();
      if (currentObj.type === 'monster') {
        let monster = currentObj;
        console.log('You encountered a(n) ' + currentObj.name + '!');
        playerAttackInt = setInterval(() => battle(monster), player.speed);
        enemyAttackInt = setInterval(() => enemyAttack(monster), monster.speed);
      }
      if (currentObj.type === 'potion'){
        print('You found a '+ items[0].name + '!', 'green');
        player.items.push(items[0]);
        grass.position = player.position;
        board[player.position.row][player.position.column] = grass;
      }
      if (currentObj.type === 'bomb'){
        print('You found a '+ items[1].name + '!', 'green');
        player.items.push(items[1]);
        board[player.position.row][player.position.column] = grass;
      }
      if (currentObj.type === 'key'){
        print('You found a '+ items[2].name + '!', 'green');
        player.items.push(items[2]);
        board[player.position.row][player.position.column] = grass;
      }
      if (currentObj.type === 'tradesman'){
        print('You decided to go to Walmart! You can buy(itemIdx) and sell(itemIdx) here.');
        print('Items for sale:');
        print(tradesman.items);
      }
      if (currentObj.type === 'dungeon'){
        if (currentObj.isLocked === true){
          print("It's locked. You need to find a key! \n If you have a key, try useItem('Epic key')");
        }
        else {
          print('You found the dungeon!');
          print('...and it\'s unlocked!');
          print('No princess here... but hey, you found treasure! That\'s almost as good!');
          print('You\'ve received ' + dungeon.items.length + ' item(s) and ' + dungeon.gold + ' gold.');
          print(dungeon.items);
          player.items = player.items.concat(dungeon.items);
          dungeon.items = [];
          player.gold += dungeon.gold;
          dungeon.gold = 0;
          print('You now have ' + player.gold + ' gold.');
        }
      }
    }
    else {
      console.log('*THUMP* Ow... I can\'t walk through this.');
      printBoard();
    }
  }
}



function skipSetup() {
initBoard(7,15);
createPlayer('Boy', 1, items[0]);
let monster1 = createMonster(1, items[0], {row: 2, column: 7});
updateBoard(monster1);
let monster2 = createMonster(1, [items[0], items[1]], {row:2, column: 6});
updateBoard(monster2);
updateBoard(createTradesman(items, {row: 4, column: 7} ));
updateBoard(createItem(items[0], {row:2, column: 2}));
updateBoard(createDungeon({row: 2, column: 3}, isLocked = true, hasPrincess = true));
printBoard();
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
