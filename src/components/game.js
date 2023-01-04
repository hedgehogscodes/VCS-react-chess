import React from 'react';

import '../index.css';
import Board from './board.js';
import King from '../pieces/king'
import Commit from '../helpers/Commit'
import FallenSoldierBlock from './fallen-soldier-block.js';
import initialiseChessBoard from '../helpers/board-initialiser.js';
import PopupWithComits from './PopupWithComits.js'
let _ = require('lodash');

let squares;

export default class Game extends React.Component {
  constructor() {
    super();
    this.Commits = new Commit(null, initialiseChessBoard(), 1, 'white', [], [], []);
    this.state = {
      squares: initialiseChessBoard(),
      whiteFallenSoldiers: [],
      blackFallenSoldiers: [],
      player: 1,
      sourceSelection: -1,
      status: '',
      turn: 'white',
      popupOpened: false,
    }
  }

  handleClick(i) {
    squares = [...this.state.squares];
    
    if (this.state.sourceSelection === -1) {
      if (!squares[i] || squares[i].player !== this.state.player) {
        this.setState({ status: "Неправильный выбор. Выберите фигуры " + this.state.player + " игрока." });
        if (squares[i]) {
          squares[i].style = { ...squares[i].style, backgroundColor: "" };
        }
      }
      else {
        squares[i].style = { ...squares[i].style, backgroundColor: "RGB(111,143,114)" }; 
        this.setState({
          status: "Выберите место для выбранной фигуры",
          sourceSelection: i
        })
      }
      return
    }

    squares[this.state.sourceSelection].style = { ...squares[this.state.sourceSelection].style, backgroundColor: "" };

    if (squares[i] && squares[i].player === this.state.player) {
      this.setState({
        status: "Неправильный выбор. Выберите правильную фигуру и место еще раз.",
        sourceSelection: -1,
      });
    }
    else {

      const whiteFallenSoldiers = [];
      const blackFallenSoldiers = [];
      const isDestEnemyOccupied = Boolean(squares[i]);
      const isMovePossible = squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, isDestEnemyOccupied);

      if (isMovePossible) {
        if (squares[i] !== null) {
          if (squares[i].player === 1) {
            whiteFallenSoldiers.push(squares[i]);
          }
          else {
            blackFallenSoldiers.push(squares[i]);
          }
        }

        squares[i] = squares[this.state.sourceSelection];
        squares[this.state.sourceSelection] = null;

        const isCheckMe = this.isCheckForPlayer(squares, this.state.player)

        if (isCheckMe) {
          this.setState(oldState => ({
            status: "Неправильный выбор. Выберите правильную фигуру и место еще раз. Теперь у вас есть Шах!",
            sourceSelection: -1,
          }))
        } else {
          let player = this.state.player === 1 ? 2 : 1;
          let turn = this.state.turn === 'white' ? 'black' : 'white';
        
          this.Commits.commitSquares(squares,this.state.player, this.state.turn, [...this.state.whiteFallenSoldiers, ...whiteFallenSoldiers], [...this.state.blackFallenSoldiers, ...blackFallenSoldiers])
          // console.log(this.Commits);

          this.setState(oldState => ({
            sourceSelection: -1,
            squares,
            whiteFallenSoldiers: [...oldState.whiteFallenSoldiers, ...whiteFallenSoldiers],
            blackFallenSoldiers: [...oldState.blackFallenSoldiers, ...blackFallenSoldiers],
            player,
            status: '',
            turn
          }));
        }
      }
      else {
        this.setState({
          status: "Неправильный выбор. Выберите правильную фигуру и место еще раз.",
          sourceSelection: -1,
        });
      }
    }
  }

  handleBack() {
    if(this.Commits.prevCommit !== null){
      this.setState({
        squares: _.cloneDeep(this.Commits.prevCommit.currentSquares),
        player: _.cloneDeep(this.Commits.prevCommit.currentPlayer),
        turn: _.cloneDeep(this.Commits.prevCommit.currentTurn),
        whiteFallenSoldiers: _.cloneDeep(this.Commits.prevCommit.whiteFallenSoldiers),
        blackFallenSoldiers: _.cloneDeep(this.Commits.prevCommit.blackFallenSoldiers),
        sourceSelection: -1,
        status: '',
      });
      this.Commits.goPreviousCommit();
    }else{
      if(this.Commits.nextCommits.length !== 0){
        this.setState({
          squares: _.cloneDeep(this.Commits.currentSquares),
          player: _.cloneDeep(this.Commits.currentPlayer),
          turn: _.cloneDeep(this.Commits.currentTurn),
          whiteFallenSoldiers: _.cloneDeep(this.Commits.whiteFallenSoldiers),
          blackFallenSoldiers: _.cloneDeep(this.Commits.blackFallenSoldiers),
          sourceSelection: -1,
          status: "Вы вернулись до первого сохраненного хода. Выберите фигуру и место.",
        });
      } else {
        this.setState({
          status: "Вы ещё не сделали ход. Выберите фигуру и место.",
          sourceSelection: -1,
        });
      }
    }
  }


  handleNext(){
    if(this.Commits.nextCommits.length !== 0){

      if(this.Commits.nextCommits.length - 1 === 0){
        this.setState({
          squares: _.cloneDeep(this.Commits.nextCommits[0].currentSquares),
          player: _.cloneDeep(this.Commits.nextCommits[0].currentPlayer),
          turn: _.cloneDeep(this.Commits.nextCommits[0].currentTurn),
          whiteFallenSoldiers: _.cloneDeep(this.Commits.nextCommits[0].whiteFallenSoldiers),
          blackFallenSoldiers: _.cloneDeep(this.Commits.nextCommits[0].blackFallenSoldiers),
          sourceSelection: -1,
          status: '',
        });
        this.Commits.goNextCommit(0);
      }else{
        this.setState({
          popupOpened: true,
        });
      }

    }else{
      this.setState({
        status: "Вы ещё не сделали ход. Выберите фигуру и место.",
        sourceSelection: -1,
      });
    }
  }

  handleClose(){
    this.setState({
      popupOpened: false,
    });
  }

  handleCheckout(i){
    this.setState({
      squares: _.cloneDeep(this.Commits.nextCommits[i].currentSquares),
      player: _.cloneDeep(this.Commits.nextCommits[i].currentPlayer),
      turn: _.cloneDeep(this.Commits.nextCommits[i].currentTurn),
      whiteFallenSoldiers: _.cloneDeep(this.Commits.nextCommits[i].whiteFallenSoldiers),
      blackFallenSoldiers: _.cloneDeep(this.Commits.nextCommits[i].blackFallenSoldiers),
      sourceSelection: -1,
      status: '',
      popupOpened: false,
    });
    this.Commits.goNextCommit(i);
  }

  getKingPosition(squares, player) {
    return squares.reduce((acc, curr, i) =>
      acc || //King may be only one, if we had found it, returned his position
      ((curr //current squre mustn't be a null
        && (curr.getPlayer() === player)) //we are looking for aspecial king 
        && (curr instanceof King)
        && i), // returned position if all conditions are completed
      null)
  }

  isCheckForPlayer(squares, player) {
    const opponent = player === 1 ? 2 : 1
    const playersKingPosition = this.getKingPosition(squares, player)
    const canPieceKillPlayersKing = (piece, i) => piece.isMovePossible(playersKingPosition, i, squares)
    return squares.reduce((acc, curr, idx) =>
      acc ||
      (curr &&
        (curr.getPlayer() === opponent) &&
        canPieceKillPlayersKing(curr, idx)
        && true),
      false)
  }

  render() {
    return (
      <div>
        <div className="game">
          <div className="game-board">
          <div className="button-container">
            <button className={"popup__btn popup__btn_action_moving"}
             onClick={this.handleBack.bind(this)}
            >Предыдущий ход</button>
            <button className={"popup__btn popup__btn_action_moving"}
             onClick={this.handleNext.bind(this)}
            >Следующий ход</button>
          </div>
            <Board
              squares={this.state.squares}
              onClick={(i) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <h3>Очередь игрока:</h3>
            <div id="player-turn-box" style={{ backgroundColor: this.state.turn, borderRadius: '5px' }}>

            </div>
            <div className="game-status">{this.state.status}</div>

            <div className="fallen-soldier-block">

              {<FallenSoldierBlock
                whiteFallenSoldiers={this.state.whiteFallenSoldiers}
                blackFallenSoldiers={this.state.blackFallenSoldiers}
              />
              }
            </div>

          </div>

          {this.state.popupOpened ? 
            <PopupWithComits
              isOpen={this.state.popupOpened}
              onClose={this.handleClose.bind(this)}
              commits={this.Commits.nextCommits}
              onCheckout={this.handleCheckout.bind(this)}
            /> 
            : '' 
          }

        </div>
      </div>


    );
  }
}

