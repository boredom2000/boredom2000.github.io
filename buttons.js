class BismarckButton
{
    constructor(buttonBar, id, building)
    {
        this.name = building.name;
        this.selected = false;
        this.htmlElement = document.createElement("div");
        this.htmlElement.classList.add("building-button");

        buttonBar.htmlElement.appendChild(this.htmlElement);

        this.htmlElement.onclick = function ()
        {
            buttonBar.ButtonSelection(id);
        }
    }

    Remove()
    {
        htmlElement.remove();
    }

    SetSelected(selected)
    {
        if (selected && !this.selected)
        {
            this.htmlElement.classList.add("building-button-selected");
        }
        else if (!selected && this.selected)
        {
            this.htmlElement.classList.remove("building-button-selected");
        }

        this.selected = selected;
    }
}

export class BismarckButtonBar extends EventTarget
{
    constructor()
    {
        super();

        this.buttonMap = new Map();
        this.currentSelection = null;

        this.htmlElement = document.createElement("div");
        this.htmlElement.style.backgroundColor = "pink";
        this.htmlElement.style.width = "auto";
        this.htmlElement.style.height = "70px";
        this.htmlElement.style.position = "fixed";
        this.htmlElement.style.bottom = "20px";
        this.htmlElement.style.left = "50%";
        this.htmlElement.style.transform = "translate(-50%)";
        this.htmlElement.style.display = "flex";
        this.htmlElement.style.flexDirection = "row";
        this.htmlElement.style.flexWrap = "nowrap";
        this.htmlElement.style.justifyContent = "center";
        document.body.appendChild( this.htmlElement );
    }

    ButtonSelection(id)
    {
        if (this.currentSelection == id)
        {
            this.buttonMap.get(id).SetSelected(false);
            this.currentSelection = null;
        }
        else
        {
            if (this.currentSelection != null)
            {
                this.buttonMap.get(this.currentSelection).SetSelected(false);
            }

            if (id != null)
            {
                this.buttonMap.get(id).SetSelected(true);
            }
            
            this.currentSelection = id;
        }

        const event = new CustomEvent("onSelectionChange");
        event.id = this.currentSelection;
        this.dispatchEvent(event);
    }

    AddButton(id, building)
    {
        let button = new BismarckButton(this, id, building);
        this.buttonMap.set(id, button);
    }

    RemoveButton(id)
    {
        this.htmlElement.removeChild(this.buttonMap[id].htmlElement);
        this.buttonMap.delete(id);
    }
}