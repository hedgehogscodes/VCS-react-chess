let _ = require('lodash');

export default class Commit {
  constructor(prevCommit, currentSquares, currentPlayer, currentTurn, whiteFallenSoldiers = [], blackFallenSoldiers = [], nextCommits = []) {
    this.prevCommit = prevCommit;
    this.currentSquares = currentSquares;
    this.currentPlayer = currentPlayer;
    this.currentTurn = currentTurn;
    this.whiteFallenSoldiers = whiteFallenSoldiers;
    this.blackFallenSoldiers = blackFallenSoldiers;
    this.nextCommits = nextCommits;
  }

  goPreviousCommit(){
    this.currentSquares = this.prevCommit.currentSquares;
    this.currentPlayer = this.prevCommit.currentPlayer;
    this.currentTurn = this.prevCommit.currentTurn;
    this.whiteFallenSoldiers = this.prevCommit.whiteFallenSoldiers;
    this.blackFallenSoldiers = this.prevCommit.blackFallenSoldiers;
    this.nextCommits = this.prevCommit.nextCommits;
    this.prevCommit = this.prevCommit.prevCommit;
  }

  cloneThisObject(){
    this.currentSquares = _.cloneDeep(this.currentSquares);
    this.currentPlayer = _.cloneDeep(this.currentPlayer);
    this.currentTurn = _.cloneDeep(this.currentTurn);
    this.whiteFallenSoldiers = _.cloneDeep(this.whiteFallenSoldiers);
    this.blackFallenSoldiers = _.cloneDeep(this.blackFallenSoldiers);
    this.nextCommits = _.cloneDeep(this.nextCommits);
  }

  goNextCommit(i){
    this.prevCommit = this.nextCommits[i].prevCommit;
    this.currentSquares = this.nextCommits[i].currentSquares;
    this.currentPlayer = this.nextCommits[i].currentPlayer;
    this.currentTurn = this.nextCommits[i].currentTurn;
    this.whiteFallenSoldiers = this.nextCommits[i].whiteFallenSoldiers;
    this.blackFallenSoldiers = this.nextCommits[i].blackFallenSoldiers;
    this.nextCommits = this.nextCommits[i].nextCommits;
  }

  checkSquares(squares){
    for (const key in this.nextCommits) {
      if (JSON.stringify(this.nextCommits[key].currentSquares)===JSON.stringify(squares)){
        return this.nextCommits[key];
      } 
    }
    return false;
  }

  commitSquares(squares, player, turn, whiteFallenSoldiers, blackFallenSoldiers) {
    let squaresCommitstmp = {
      nextCommits: [],
    }
    let check;

    check = this.checkSquares(squares);

    if(check){
      this.prevCommit = _.cloneDeep(check.prevCommit);
      this.currentSquares = _.cloneDeep(check.currentSquares);
      this.currentPlayer = _.cloneDeep(check.currentPlayer);
      this.currentTurn = _.cloneDeep(check.currentTurn);
      this.whiteFallenSoldiers = _.cloneDeep(check.whiteFallenSoldiers);
      this.blackFallenSoldiers = _.cloneDeep(check.blackFallenSoldiers);
      this.nextCommits = _.cloneDeep(check.nextCommits);

    } else {
      squaresCommitstmp.prevCommit = this;
      squaresCommitstmp.currentSquares = [...squares];

      if(player === 1){
        squaresCommitstmp.currentPlayer = 2;
      } else {
        squaresCommitstmp.currentPlayer = 1;
      }

      if(turn === 'white'){
        squaresCommitstmp.currentTurn = 'black';
      } else {
        squaresCommitstmp.currentTurn = 'white';
      }

      squaresCommitstmp.whiteFallenSoldiers = [...whiteFallenSoldiers];
      squaresCommitstmp.blackFallenSoldiers = [...blackFallenSoldiers];

      this.nextCommits.push(squaresCommitstmp);

      this.cloneThisObject();

      for (const key in squaresCommitstmp) {
        delete squaresCommitstmp[key];
      }

      this.goNextCommit(this.nextCommits.length - 1);

    }
  }

}