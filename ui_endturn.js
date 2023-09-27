export class BismarckEndTurnButton
{
    constructor(gameState)
    {
        this.htmlElement = document.createElement("div");
        this.htmlElement.style.backgroundColor = "pink";
        this.htmlElement.style.width = "100px";
        this.htmlElement.style.height = "100px";
        this.htmlElement.style.position = "fixed";
        this.htmlElement.style.bottom = "20px";
        this.htmlElement.style.right = "20px";

        var localGameState = gameState;

        this.htmlElement.onclick = function ()
        {
            localGameState.EndTurn();
        }

        var endTurnLabel = document.createElement('h2');
        endTurnLabel.innerHTML = "End Turn";

        this.htmlElement.appendChild(endTurnLabel);

        document.body.appendChild( this.htmlElement );
    }

    
}