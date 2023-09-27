import jsonResources from './resources.json' assert { type: 'json' };
export class BismarckStockpilePanel
{
    constructor(gameState)
    {
        this.htmlElement = document.createElement("div");
        this.htmlElement.style.backgroundColor = "pink";
        this.htmlElement.style.width = "auto";
        this.htmlElement.style.height = "auto";
        this.htmlElement.style.position = "fixed";
        this.htmlElement.style.top = "20%";
        this.htmlElement.style.right = "20px";
        //this.htmlElement.style.display = "flex";
        //this.htmlElement.style.flexDirection = "row";
        //this.htmlElement.style.flexWrap = "nowrap";
        //this.htmlElement.style.justifyContent = "center";

        for (var key in jsonResources)
        {
            var resourceLineElement = document.createElement("div");
            resourceLineElement.style.backgroundColor = "white";
            var nameElement = document.createElement('h2');
            nameElement.innerHTML = jsonResources[key].name;

            var quantityElement = document.createElement('h2');
            quantityElement.innerHTML = gameState.stockpile.GetResourceAmount(key);

            resourceLineElement.appendChild(nameElement);
            resourceLineElement.appendChild(quantityElement);
            this.htmlElement.appendChild(resourceLineElement);
        }

        document.body.appendChild( this.htmlElement );
    }

    
}