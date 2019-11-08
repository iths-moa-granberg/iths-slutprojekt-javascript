//GENERATOR

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

    clearValues(difflevel) { //uppdatera så att bara sudokus med en möjlig lösning godkänns
        let clearedList = this.cellList.flat();
        for (let i = 0; i < difflevel; i++) {
            let cell = clearedList.splice(Math.floor(Math.random() * clearedList.length), 1)[0];
            let possibleValue = cell.value[0];
            cell.value = '';
            const solver = new Solve()
            console.log(this);

            if (!solver.solveable(this.cellList)) {
                cell.value = possibleValue;
                i--;
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

    // console.log(reloads);
}


//SOLVER

class SolveCell {
    constructor() {
        this.value
    }

    eliminate(number) {
        this.value = this.value.filter(num => num != number);
    }
}

class Solve {
    constructor(list=false) {
        this.sudokuWrapper = document.querySelector('.sudoku-wrapper');
        this.nodeValueList = this.sudokuWrapper.querySelectorAll('p');
        if (list) {
            this.cellList = list;
        } else {
            this.cellList = [];
        }
    }

    loadCells() {
        let x = 0;
        for (let i = 0; i < 9; i++) {
            let row = [];
            for (let j = 0; j < 9; j++) {
                let newCell = new SolveCell;

                if (this.nodeValueList[x].innerText) {
                    newCell.value = [this.nodeValueList[x].innerText];
                } else {
                    newCell.value = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                }
                row.push(newCell);
                x++;
            }
            this.cellList.push(row);
        }
    }

    render() { //skriv ut alla celler med 1 värde
        let x = 0;
        for (let row in this.cellList) {
            for (let col in this.cellList) {
                if (this.cellList[row][col].value.length == 1) {
                    this.nodeValueList[x].innerText = this.cellList[row][col].value;
                }
                x++;
            }
        }
    }

    solve() {
        for (let row in this.cellList) {
            for (let col in this.cellList) {
                let cell = this.cellList[row][col];
                if (cell.value.length == 1) {
                    this.render();
                    this.clearImpossibleValues();
                } else {
                    this.crosscheck(cell, this.getRow(row));
                    this.crosscheck(cell, this.getColumn(col));
                    this.crosscheck(cell, this.getBox(row, col));
                }
            }
        }
    }

    clearImpossibleValues() {
        for (let row in this.cellList) {
            for (let col in this.cellList[row]) {
                let cell = this.cellList[row][col];
                this.clear(cell, row, col);
            }
        }
    }

    clear(cell, rowIndex, colIndex) {
        let list = this.getRow(rowIndex).concat(this.getColumn(colIndex).concat(this.getBox(rowIndex, colIndex)));

        list.forEach(item => {
            if (item != cell) {
                item.eliminate(cell.value);
            }
        });
    }

    getRow(rowIndex) {
        return this.cellList[rowIndex];
    }

    getColumn(colIndex) {
        return this.cellList.map(row => row[colIndex]);
    }

    getBox(rowIndex, colIndex) {
        let finalList = [];
        let startRowIndex = Math.floor(rowIndex / 3) * 3;
        let startColIndex = Math.floor(colIndex / 3) * 3;
        let newList = this.cellList.filter((row, index) => index >= startRowIndex && index < startRowIndex + 3);
        newList.forEach(row => {
            let newRow = row.filter((cell, index) => index >= startColIndex && index < startColIndex + 3);
            finalList.push(newRow);
        });
        return finalList.flat();
    }

    crosscheck(cell, list) {
        let values = [];
        list.forEach(item => {
            if (item != cell) {
                item.value.forEach(value => values.push(value));
            }
        });
        cell.value.forEach(value => {
            if (!values.includes(value)) {
                cell.value = [value];
            }
        })
    }

    solved() {
        let list = this.cellList.flat();
        list.forEach(cell => {
            if (cell.value.length != 1) {
                this.solve();
            }
        });
        return true;
    }

    solveable() {
        this.solved();
        for (let row of this.cellList) {
            for (let cell of row) {
                if (cell.value.length != 1) {
                    return false;
                }
            }
        }
    }
}


//INIT

function initGeneratorBtns() {
    const btnList = document.querySelectorAll('.generate-btn');
    const easy = 81 - 62;
    const medium = 81 - 53;
    const hard = 81 - 44;
    const veryHard = 81 - 35;
    const insane = 81 - 26;
    let levels = [easy, medium, hard, veryHard, insane];
    let activeLevel = levels[0];

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

    generateSudoku(veryHard);
}

function initSolveBtn() {
    const solveBtn = document.querySelector('.solve-btn');

    solveBtn.addEventListener('click', (event) => {
        let solveSudoku = new Solve;
        solveSudoku.loadCells();
        solveSudoku.solved();
    });
}

initGeneratorBtns();
initSolveBtn();
