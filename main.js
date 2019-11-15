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

    clearValues(difflevel) { //optimize -- if clearedList.lenght == 0, restart
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

    while (board.cellList.flat().some(cell => !cell.value.length)) {
        let divs = document.querySelectorAll('div');
        divs.forEach(div => div.remove());
        board = new Board();
    }

    board.clearValues(difflevel);
    board.render();

    initManualSolve();
    watch = new Stopwatch;
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
        this.clearGrid();
    }

    loadCells() {
        let x = 0;
        for (let i = 0; i < 9; i++) {
            let row = [];
            for (let j = 0; j < 9; j++) {
                let newCell = new SolveCell;

                if (this.nodeValueList[x].innerText) {
                    newCell.value = [Number(this.nodeValueList[x].innerText)];
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

    clearSelf(cell, row, col) {
        let list = this.getRow(row).concat(this.getColumn(col)).concat(this.getBox(row, col));
        let compareList = [];

        list.forEach(compareCell => {
            if (compareCell != cell && compareCell.value.length == 1 && !compareList.includes(compareCell.value[0])) {
                compareList.push(compareCell.value[0]);
            }
        });

        for (let value of cell.value) {
            if (compareList.includes(value)) {
                cell.eliminate(value);
            }
            if (cell.value.length < 2) { break }
        }
    }

    allCellsClearSelf() {
        for (let row in this.cellList) {
            for (let col in this.cellList[row]) {
                let cell = this.cellList[row][col];
                if (cell.value.length != 1) {
                    this.clearSelf(cell, row, col);
                }
            }
        }
    }

    solveable() {
        let list = this.cellList.flat();

        for (let cell of list) {
            if (!cell.value.length) {
                cell.value = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            }
        }

        this.allCellsClearSelf();
        this.solved();

        for (let cell of list) {
            if (cell.value.length != 1) {
                return false;
            }
        }
        return true;
    }

    clearGrid() {
        let inputs = this.sudokuWrapper.querySelectorAll('input');
        inputs.forEach(input => input.remove());
    }
}


//MANUAL SOLVE

class ManualSolveCell {
    constructor(value, row, col) {
        this.value = value;
        this.rowIndex = row;
        this.colIndex = col;
    }

    eliminate(number) {
        this.value = this.value.filter(num => num != number);
    }
}

class ManualSolve {
    constructor() {
        this.sudokuWrapper = document.querySelector('.sudoku-wrapper');
        this.nodeList = this.sudokuWrapper.querySelectorAll('div');
        this.cellList = [];
        this.numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.loadCells();
        this.initBtns();
    }

    loadCells() {
        let x = 0;
        for (let row = 0; row < 9; row++) {
            let rowArr = [];
            for (let col = 0; col < 9; col++) {
                if (this.nodeList[x].innerText) {
                    let cell = new ManualSolveCell([this.nodeList[x].innerText], row, col);
                    rowArr.push(cell);
                } else {
                    let cell = new ManualSolveCell([], row, col);
                    rowArr.push(cell);

                    let input = document.createElement('input');
                    input.setAttribute('type', 'number');
                    this.nodeList[x].appendChild(input);

                    this.addListeners(input, cell);
                }
                x++;
            }
            this.cellList.push(rowArr);
        }
    }

    addListeners(input, cell) {
        input.addEventListener('keydown', e => {
            if (input.value.length >= 1) {
                input.value = '';
            }
        });

        input.addEventListener('keyup', e => {
            if (!this.numbers.includes(Number(input.value))) {
                input.value = '';
                input.classList.remove('incorrect');
            } else {
                cell.value[0] = input.value;
                if (!this.checkIfCorrectCell(cell, input) && this.displayIncorrect) {
                    input.classList.add('incorrect');
                } else {
                    input.classList.remove('incorrect');
                    this.renderCorrectness();
                    this.checkIfDone();
                }
            }
        });
    }

    checkIfCorrectCell(cell) {
        let list = this.getRow(cell.rowIndex)
            .concat(this.getColumn(cell.colIndex))
            .concat(this.getBox(cell.rowIndex, cell.colIndex));

        for (let item of list) {
            if (cell != item && cell.value[0] == item.value[0]) {
                return false;
            }
        }
        return true;
    }

    renderCorrectness() {
        if (!this.displayIncorrect) {
            const incorrects = this.sudokuWrapper.querySelectorAll('.incorrect');
            incorrects.forEach(node => node.classList.remove('incorrect'));
        } else {
            let list = this.cellList.flat();
            for (let i in list) {
                if (list[i].value.length) {
                    if (!this.checkIfCorrectCell(list[i]) && this.nodeList[i].querySelector('input')) {
                        let input = this.nodeList[i].querySelector('input');
                        input.classList.add('incorrect');
                    }
                }
            }
        }
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

    clear() {
        for (let i = 0; i < this.nodeList.length; i++) {
            let input = this.nodeList[i].querySelector('input');
            if (input) {
                input.value = '';
                this.cellList.flat()[i].value = [];
            }
        }
    }

    initBtns() {
        this.displayIncorrect = false;
        const displayIncorrectBtn = document.querySelector('.display-incorrect-btn');
        displayIncorrectBtn.addEventListener('change', event => {
            this.displayIncorrect = !this.displayIncorrect;
            this.renderCorrectness();
        });

        const clearBtn = document.querySelector('.clear-btn');
        clearBtn.addEventListener('click', event => {
            this.clear();
        });
    }

    checkIfDone() {
        let list = this.cellList.flat();
        for (let cell of list) {
            if (cell.value.length == 1) {
            } else {
                return false;
            }
        };
        this.checkIfCorrect();
    }

    checkIfCorrect() {
        const solver = new Solve(this.cloneCellList());
        if (solver.solveable()) {
            document.body.innerHTML += this.renderWin(watch.endTime());
            clearInterval(timer);

            const reloadBtn = document.querySelector('.reload-btn');
            reloadBtn.addEventListener('click', event => {
                location.reload();
            });
        }
    }

    renderWin(time) {
        return `
        <section class="win">
        <h1>You win</h1>
        <p>Time it took: ${time}</p>
        <button class="reload-btn">Go again</button>
        </section>
        `
    }

    cloneCellList() {
        return this.cellList.map(row => row.map(oldCell => {
            let cell = new Cell();
            cell.value = oldCell.value.map(value => value);
            return cell;
        }));
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
    let activeLevel = levels[0];

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

    generateSudoku(easy);
}

function initSolveBtn() {
    const solveBtn = document.querySelector('.solve-btn');

    solveBtn.addEventListener('click', (event) => {
        let solveSudoku = new Solve;
        solveSudoku.loadCells();
        solveSudoku.allCellsClearSelf();
        solveSudoku.solved();
        solveSudoku.render();
    });
}

function initManualSolve() {
    new ManualSolve;
}

function initTimerBtn() {
    const counterWrapper = document.querySelector('.counter');
    const displayTimerBtn = document.querySelector('.display-timer-btn');
    displayTimerBtn.addEventListener('click', event => {
        counterWrapper.classList.toggle('hidden');
    });
}

class Stopwatch {
    constructor() {
        this.counterWrapper = document.querySelector('.counter');
        this.min = 0;
        this.sec = 0;
        this.start = new Date();
    }

    updateTime() {
        let now = new Date();
        const timerP = this.counterWrapper.querySelector('p');
        timerP.innerText = this.msecToMinAndSec(now.getTime() - this.start.getTime());
    }

    msecToMinAndSec(msec) {
        let sec = Math.floor((msec / 1000) % 60);
        let min = Math.floor((msec / (1000 * 60)) % 60);

        min = (min < 10) ? '0' + min : min;
        sec = (sec < 10) ? '0' + sec : sec;
        return min + ':' + sec;
    }

    endTime() {
        let now = new Date();
        return this.msecToMinAndSec(now.getTime() - this.start.getTime());
    }
}

initGeneratorBtns();
initSolveBtn();
initTimerBtn();
timer = setInterval(function () { watch.updateTime(); }, 1000);