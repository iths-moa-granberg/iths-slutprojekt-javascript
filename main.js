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
        newCellValue.innerText = this.value;
    }

    setRandomValue() {
        let num = this.value.sort(function () { return .5 - Math.random() })[0];
        if (num) {
            this.value = [num];
        } else {
            this.value = [];
        }
    }

    eliminate(number) {
        this.value = this.value.filter(num => num != number);
    }
}

class Board {
    constructor() {
        this.cellList = [];
        this.generateCells();
        this.setCellsValue();
    }

    generateCells() { //this.cellList[radIndex][columnIndex]
        for (let i = 0; i < 9; i++) {
            let row = [];
            for (let j = 0; j < 9; j++) {
                row.push(new Cell());
            }
            this.cellList.push(row);
        }
    }

    setCellsValue() {
        for (let row in this.cellList) {
            for (let col in this.cellList[row]) {
                let cell = this.cellList[row][col];
                cell.setRandomValue();
                this.clearRow(row, cell.value, col);
                this.clearColumn(col, cell.value, row);
                this.clearBox(row, col, cell.value);
            }
        }
    }

    clearRow(row, number, skipCellIndex) {
        for (let cellIndex in this.cellList[row]) {
            if (cellIndex != skipCellIndex) {
                this.cellList[row][cellIndex].eliminate(number);
            }
        }
    }

    clearColumn(column, number, skipCellIndex) {
        for (let rowIndex in this.cellList) {
            if (rowIndex != skipCellIndex) {
                this.cellList[rowIndex][column].eliminate(number);
            }
        }
    }

    clearBox(skipRow, skipCol, number) {
        let startRow = Math.floor(skipRow / 3) * 3;
        let startCol = Math.floor(skipCol / 3) * 3;
        for (let x = startRow; x < startRow + 3; x++) {
            for (let y = startCol; y < startCol + 3; y++) {
                if (y != skipCol && x != skipRow) {
                    this.cellList[x][y].eliminate(number);
                }
            }
        }
    }

    render() {
        for (let row in this.cellList) {
            for (let col in this.cellList[row]) {
                this.cellList[row][col].markup();
            }
        }
    }

    clearValues(difflevel) {
        let clearedList = this.cellList.flat(); //lista att klipppa ut celler från
        let cellsToBeCleared = []; //lista med celler vars värde ska tas bort

        for (let i = 0; i < difflevel; i++) {
            let cell = clearedList.splice(Math.floor(Math.random() * clearedList.length), 1);
            cellsToBeCleared.push(cell[0]);
        }

        for (let cell of this.cellList.flat()) {
            for (let removeCell of cellsToBeCleared) {
                if (cell == removeCell) {
                    cell.value = '';
                }
            }
        }
    }
}

function generateSudoku(difflevel) {
    let board = new Board();
    let reloads = 0;

    while (board.cellList.flat().some(cell => !cell.value.length)) {
        let divs = document.querySelectorAll('div');
        divs.forEach(div => div.remove());
        board = new Board();
        reloads++;
    }
    board.clearValues(difflevel);
    board.render();

    console.log(reloads);
}

function initGeneratorBtns() {
    const btnList = document.querySelectorAll('.generate-btn');
    const easy = 81 - 62;
    const medium = 81 - 53;
    const hard = 81 - 44;
    const veryHard = 81 - 35;
    const insane = 81 - 26;
    let levels = [easy, medium, hard, veryHard, insane];

    for (let i = 0; i < btnList.length; i++) {
        btnList[i].addEventListener('click', (event) => {
            generateSudoku(levels[i]);
            activeLevel = levels[i];
            btnList.forEach(btn => btn.style.backgroundColor = 'white');
            btnList[i].style.backgroundColor = 'lightgrey';
        })
    }

    const refreshBtn = document.querySelector('.refresh-btn');
    refreshBtn.addEventListener('click', (event) => generateSudoku(activeLevel));

    generateSudoku(easy);
}

initGeneratorBtns();
