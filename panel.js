export class BismarckBuildingPanel
{
    constructor()
    {
        this.htmlElement = document.createElement("div");
        this.htmlElement.style.backgroundColor = "pink";
        this.htmlElement.style.width = "auto";
        this.htmlElement.style.height = "auto";
        this.htmlElement.style.position = "fixed";
        this.htmlElement.style.top = "50%";
        this.htmlElement.style.left = "20px";
        this.htmlElement.style.display = "flex";
        this.htmlElement.style.flexDirection = "row";
        this.htmlElement.style.flexWrap = "nowrap";
        this.htmlElement.style.justifyContent = "center";
        this.htmlTitle = document.createElement("h1");
        this.htmlElement.appendChild(this.htmlTitle);
    }

    Show(building)
    {
        this.htmlTitle.innerHTML = building.name;
        document.body.appendChild( this.htmlElement );
    }

    Hide()
    {
        document.body.removeChild( this.htmlElement );
        this.htmlElement.remove();
    }
}