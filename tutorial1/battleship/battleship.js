const optionContainer = document.querySelector('.option-container');
const flipButton = document.querySelector("#flip-button");
const boardsContainer = document.querySelector('#gamesboard-container');

let angle = 0;
function flip ()
{
    console.log(optionContainer.children);

    angle = angle == 0 ? 90 : 0;

    optionContainer.children.array.forEach(ship => {
        ship.style.transform = `rotate(${angle})`;
    });

}

const width = 10;
function createBoard(color, user)
{
    const board = document.createElement('div');
    board.classList.add('game-board');
    board.style.backgroundColor = color;
    board.id = user;
    boardsContainer.append(board);

    for (let i = 0; i<width*width; i++)
    {
        const block = document.createElement('div');
        block.id = i;
        block.classList.add('block');
        board.append(block);
    }

}


class Ship
{
    constructor(name, width)
    {
        this.name = name;
        this.width = width;
    }
}

let destroyer = new Ship('destroyer', 2);
let submarine = new Ship('submarine', 3);
let cruiser = new Ship('cruiser', 3);
let battleship = new Ship('battleship', 4);
let carrier = new Ship('carrier', 5);

allShips = [destroyer, submarine, cruiser, battleship, carrier];



function addShipPiece(ship)
{
    const allBoardBlocks = document.querySelectorAll('#computer div');
    console.log('allBoardBlocks=' + allBoardBlocks.length);
}

createBoard('yellow', 'player');
createBoard('pink', 'computer');

addShipPiece(destroyer);


flipButton.addEventListener('click', flip);

