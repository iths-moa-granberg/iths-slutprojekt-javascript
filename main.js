//Generate Sudoku
//array med nummer alt null
//fyll board med siffror
//bara en av aktiv siffra inom row/column/square
//checkfunktion eller if-sats?
//ta bort x antal siffor svårighetsgrad

class Cell {
    markup() {
        const sudokuWrapper = document.querySelector('.sudoku-wrapper');
        const newCell = document.createElement('div');
        newCell.classList.add('cell');
        sudokuWrapper.appendChild(newCell);
        // this.cell = newCell;
    }
}

class Board {
    generateCells() {
        for (let i = 0; i < 81; i++) {
            let cell = new Cell();
            cell.markup();
        }
    }
}

function init() {
    let board = new Board();
    board.generateCells();
}

init();



//Solve Sudoku:
// function findCellRow(cell) { //findCellColumn()(%??), findCellBox()(kombo)
//     return Math.floor(cell/9);
// }