class Cell {
    constructor() {
        this.value = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }

    markup() {
        const sudokuWrapper = document.querySelector('.sudoku-wrapper');
        const newCell = document.createElement('div');
        const newCellValue = document.createElement('p');
        newCell.classList.add('cell');
        sudokuWrapper.appendChild(newCell);
        newCell.appendChild(newCellValue);
    }

    setRandomValue() { //tar bort alla utom random number från this.value
        let num = this.value.sort(function () { return .5 - Math.random() })[0];        
        this.value = num;
    }
}

class Board {
    constructor() {
        this.cellList = [];
    }

    generateCells() { //this.cellList[radIndex][columnIndex]
        for (let i = 0; i < 9; i++) {
            let cells = [];
            for (let j = 0; j < 9; j++) {
                let cell = new Cell();
                cell.markup();
                cells.push(cell);
            }
            this.cellList.push(cells);
        }
    }

    setCellValue() {
        for (let i = 0; i < 9; i++) { //row-counter
            for (let j = 0; j < 9; j++) { //cell & column-counter
                this.cellList[i][j].setRandomValue();                
                this.clearRow(this.cellList[i], this.cellList[i][j].value, j);
            }
        }
    }

    clearRow(row, number, skipCellIndex){ //row = array, number = värdet som ska tas bort, skipCellIndex = i som ej ska tas bort
        this.cellList[row] 
        for (let i in this.cellList[row]) {
            
        }

    }
}

function init() {
    let board = new Board();
    board.generateCells();
    board.setCellValue();
}

init();



//Solve Sudoku:
// function findCellRow(cell) { //findCellColumn()(%??), findCellBox()(kombo)
//     return Math.floor(cell/9);
// }