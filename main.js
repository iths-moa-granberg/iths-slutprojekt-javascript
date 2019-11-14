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
        if (this.value.length) {
            this.value = [this.value.sort(function () { return .5 - Math.random() })[0]];
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
        this.setValues();
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

    setValues() {
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

    clearRow(row, number, skipCellIndex) { //använd getRow() + clear() istället?
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
        this.cellList.flat().forEach(cell => cell.markup());
    }

    clearValues(difflevel) { //optimize
        let clearedList = this.cellList.flat();
        for (let i = 0; i < difflevel; i++) {            
            let index = Math.floor(Math.random() * clearedList.length);
            let cell = clearedList.splice(index, 1)[0];

            let possibleValue = cell.value;
            cell.value = [];

            let divs = document.querySelectorAll('divs');
            divs.forEach(div => div.remove());

            const solver = new Solve(this.cloneCellList());
            if (!solver.solveable()) {
                cell.value = possibleValue;
                clearedList.splice(index, 0, cell);
                i--;
            }
        }
    }

    cloneCellList() {
        return this.cellList.map(row => row.map(oldCell => {
            let cell = new Cell();
            cell.value = oldCell.value.map(value => value);
            return cell;
        }));
    }
}

function generateSudoku(difflevel) {
    let board = new Board();
    // let reloads = 0;

    while (board.cellList.flat().some(cell => !cell.value.length)) {
        let divs = document.querySelectorAll('div');
        divs.forEach(div => div.remove());
        board = new Board();
        // reloads++;
    }

    console.log('generated full sudoku');

    board.clearValues(difflevel);

    console.log('cleared values');

    board.render();
    // console.log(reloads);
}


//SOLVER

class SolveCell {
    constructor() {
        this.value = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }

    eliminate(number) {
        this.value = this.value.filter(num => num != number);
    }
}

class Solve {
    constructor(list = []) {
        this.sudokuWrapper = document.querySelector('.sudoku-wrapper');
        this.nodeValueList = this.sudokuWrapper.querySelectorAll('p');
        this.cellList = list;
    }

    loadCells() {
        let x = 0;
        for (let i = 0; i < 9; i++) {
            let row = [];
            for (let j = 0; j < 9; j++) {
                let newCell = new SolveCell;

                if (this.nodeValueList[x].innerText) {
                    newCell.value = [this.nodeValueList[x].innerText];
                }
                row.push(newCell);
                x++;
            }
            this.cellList.push(row);
        }
    }

    render() {
        let list = this.cellList.flat();
        for (let i in list) {
            if (list[i].value.length == 1) {
                this.nodeValueList[i].innerText = list[i].value;
            }
        }
    }

    solve() {
        for (let row in this.cellList) {
            for (let col in this.cellList) {
                let cell = this.cellList[row][col];
                if (cell.value.length == 1) {
                    this.clearImpossibleValues();
                } else {
                    this.crosscheck(cell, this.getRow(row));
                    this.crosscheck(cell, this.getColumn(col));
                    this.crosscheck(cell, this.getBox(row, col));
                }
            }
        }

        for (let row in this.cellList) {
            if (row == 0 || row == 3 || row == 6) {
                for (let col in this.cellList) {
                    if (col == 0 || col == 3 || col == 6) {
                        this.boxcheck(row, col);
                    }
                }
            }
        }
    }

    clearImpossibleValues() {
        for (let row in this.cellList) {
            for (let col in this.cellList[row]) {
                let cell = this.cellList[row][col];
                this.clearRowColBox(cell, row, col);
            }
        }
    }

    clearRowColBox(cell, rowIndex, colIndex) {
        let list = this.getRow(rowIndex).concat(this.getColumn(colIndex).concat(this.getBox(rowIndex, colIndex)));

        list.forEach(item => {
            if (item != cell) {
                item.eliminate(cell.value);
            }
        });
    }

    getRow(rowIndex, list = false) {
        if (list) {
            return list[rowIndex];
        }
        return this.cellList[rowIndex];
    }

    getColumn(colIndex, list = false) {
        if (list) {
            return list.map(row => row[colIndex]);
        }
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
                values.concat(item.value);
            }
        });
        cell.value.forEach(value => {
            if (!values.includes(value)) {
                cell.value = [value];
            }
        })
    }

    reformatBoxcheckRow(boxList) { //[xxxyyyzzz] -> [[xxx][yyy][zzz]]
        let newList = [];
        let x = 0;
        for (let i = 0; i < 3; i++) {
            let row = [];
            // newList.push(boxList.splice(0, 3));
            for (let j = 0; j < 3; j++) {
                row.push(boxList[x]);
                x++;
            }
            newList.push(row);
        }
        return newList;
    }

    reformatBoxcheckCol(boxList) { //[xxxyyyzzz] -> [[xyz][xyz][xyz]]
        let newList = [];
        for (let i = 0; i < 3; i++) {
            let col = [];
            for (let j = 0; j < 3; j++) {
                col.push(boxList[j * 3 + i]);
            }
            newList.push(col);
        }
        return newList;
    }

    clearList(list, skipCells, value) {
        list.forEach(item => {
            if (!skipCells.includes(item)) {
                item.eliminate(value);
            }
        })
    }

    getObjList(list) {
        let newList = [];
        for (let i in list) {
            for (let cell of list[i]) {
                let obj = {
                    value: cell.value,
                    index: i
                }
                newList.push(obj);
            }
        }
        return newList;
    }

    boxcheck(row, col) {
        let boxList = this.getBox(row, col);

        let rows = this.reformatBoxcheckRow(boxList);
        let rowObjs = this.getObjList(rows);
        this.clearBoxcheck(rows, rowObjs, row, this.getRow);

        let cols = this.reformatBoxcheckCol(boxList);
        let colObjs = this.getObjList(cols);
        this.clearBoxcheck(cols, colObjs, col, this.getColumn)
    }

    clearBoxcheck(refomateBoxList, objList, index, callback) {
        for (let i in refomateBoxList) {
            let compareValues = [];
            objList.forEach(obj => {
                if (obj.index != i) {
                    compareValues = compareValues.concat(obj.value);
                }
            });

            objList.forEach(obj => {
                if (obj.index == i) {
                    obj.value.forEach(value => {
                        if (!compareValues.includes(value)) {
                            this.clearList(callback(Number(index) + Number(obj.index), this.cellList), refomateBoxList[i], value);
                        }
                    });
                }
            });
        }
    }

    solved() {
        let list = this.cellList.flat();
        list.forEach(cell => {
            if (cell.value.length != 1) {
                this.solve();
            }
        });
    }

    solveable() {
        let list = this.cellList.flat();

        for (let cell of list) {
            if (!cell.value.length) {
                cell.value = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                //kolla igenom box, row, col, ta bort värde från aktiv cell om det finns
            }
        }

        this.solved();

        for (let cell of list) {
            if (cell.value.length != 1) {
                return false;
            }
        }
        return true;
    }
}


//INIT

function initGeneratorBtns() {
    const btnList = document.querySelectorAll('.generate-btn');
    const easy = 19; //62 ifyllda
    const medium = 28; //53 ifyllda
    const hard = 37; //44 ifyllda
    const veryHard = 46; //35 ifyllda
    const insane = 55; //26 ifyllda
    const impossible = 64; //17 ifyllda
    let levels = [easy, medium, hard, veryHard, insane, impossible];
    let activeLevel = levels[3];

    for (let i = 0; i < btnList.length; i++) {
        btnList[i].addEventListener('click', (event) => {
            generateSudoku(levels[i]);
            activeLevel = levels[i];
            btnList.forEach(btn => btn.style.backgroundColor = 'white');
            btnList[i].style.backgroundColor = 'lightgrey';
        });
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
        solveSudoku.render();
    });
}

initGeneratorBtns();
initSolveBtn();
