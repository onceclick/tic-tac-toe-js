//
// Document Ready, Let's Play
//
$(function() {

  var _game = new Game();
  _game.start();

  $('#restart').click(function(e){
    e.preventDefault();
    clearInterval( _game.timerHandle );
    _game = new Game();
    _game.start();
  });

  // bind input actions
  $('#game tr td').click(function(el, a, b){
    if(_game.over) return;
    var col = $(this).index();
    var row = $(this).closest('tr').index();
    _game.move( row +' '+ col );
  });

  $('#game tr td').hover(function(){
    if(_game.over) return;
    $(this).addClass('hover-'+ _game.activePlayer);
  }, function(){
    if(_game.over) return;
    $(this).removeClass('hover-0 hover-1');
  })

});


var Game = function(){
  this.over = false;
  this.moves = 0;
  this.startTime = Date.now();
  this.endTime = Date.now(); // reset this latter
  this.Player = [];
  this.Board = null;
  this.activePlayer = 0; // current active player (index of this.players)

  this.start = function(){
    // console.log('Starting Game');
    $('#game tr td').attr('class', '');
    $('#status').removeClass('show');
    // create two players
    this.Player.push( new Player(0) );
    this.Player.push( new Player(1) );
    this.Board = new Board();
    this.Board.update();
    // set this.startTime
    this.startTime = Date.now();

    // this.timer();
  };


  this.timer = function(){
    var self = this;
    var then = self.startTime;
    var format = function(now, then){
      return Date.create(then).relative();
    };
    this.timerHandle = setInterval(function(){
      var now = Date.now();
      $('#time').text( format(now, then) );
    }, 500);
  };


  /**
   * Parse a users move input string, e.g. '1 2'
   * 
   * @param  {string} v An input string representing a move in the format 'row col'
   * @return {object}   row, col, and index (the index on the game board)
   */
  this.parseInput = function(v){
    v = v.split(' ');
    var pos = Number(v[1]);
    if(v[0] == 1) pos = (pos+3);
    if(v[0] == 2) pos = (pos+6);
    return {
      row: v[0],
      col: v[1],
      index: pos
    };
  };

  /**
   * Attempt to make a move, basically is it 'possible'
   * 
   * @param  {number} input the index to move to
   * @return {boolean}      
   */
  this.tryMove = function(input){
    if(this.Board.board[input] == '_') return true;
    return false;
  };

  /**
   * Make a move as the active player
   * 
   * @param  {string} v An input string, eg: '1 1'
   * @return {boolean}   return false if we are unable to make the move
   */
  this.move = function(v){
    var Player = this.Player[ this.activePlayer ];
    v = this.parseInput(v);
    if(!this.tryMove(v.index)) return false;

    // console.log('%s: %s, %s', Player.symbol, v.row, v.col);

    Player.moves.push( v.index );
    this.moves++;
    this.Board.board[v.index] = Player.symbol;
    this.activePlayer = (Player._id) ? 0 : 1; // inverse of Player._id
    // update our board.
    this.Board.update();

    this.updateMovesCount();

    if(this.hasWon(Player)){
      $('#status').text('Player '+ Player.symbol +' Wins!').addClass('show');
      this.over = true;
    }

    if(this.moves >= 9){
      // cats game
      $('#status').text('It\'s a Draw!').addClass('show');
    }

    return true;
  };

  /**
   * Check if the player has won
   * @param  {Player}  Player the player
   * @return {Boolean}
   */
  this.hasWon = function(Player){
    var won = false;
    var wins = Player.moves.join(' ');
    this.Board.wins.each(function(n){
      if(wins.has(n[0]) && wins.has(n[1]) && wins.has(n[2])){
        won = true;
        return true;
      }
    });
    return won;
  };

  this.updateMovesCount = function(){
    $('#time').text('Moves: '+ this.moves );
  }

};




/**
 * Player Object
 */
var Player = function(id, computer){
  this._id = id;
  this.symbol = (id == 0) ? 'X' : 'O';
  this.computer = (computer) ? computer : true; // default to computer user
  this.moves = [];
};



/**
 * Board Object
 */
var Board = function(){
  // empty board (3x3)
  this.board = [
    '_','_','_',
    '_','_','_',
    '_','_','_'
  ];

  // array of possible win scenarios
  this.wins = [
    [0,1,2], [3,4,5], [6,7,8], [0,3,6],
    [1,4,7], [2,5,8], [0,4,8], [2,4,6]
  ];

  this.update = function(){
    var board = this.board;
    $('#game tr').each(function(x, el){
      $('td', el).each(function(i, td){
        var pos = Number(i);
        if(x == 1) pos = (pos+3);
        if(x == 2) pos = (pos+6);
        var txt = (board[pos] == '_') ? '' : board[pos];
        $(this).html( txt ).addClass( txt );
      });
    });
  };
};

