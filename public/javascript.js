

const body = document.querySelector('body');
console.log("body=" + body);

let currentSelection = null;

const socket = io();

class MovableDiv
{
    constructor(x, y, color)
    {
        this.htmlElement = document.createElement('div');
        this.htmlElement.classList.add('moveablebox');
        this.htmlElement.style.backgroundColor = color;
        this.htmlElement.style.left = x + "px";
        this.htmlElement.style.top = y + "px";
        var movablediv = this;
        this.htmlElement.onclick = function(event)
        {
            console.log("currentSelection is now " + movablediv);
            currentSelection = movablediv;
        };
        body.append(this.htmlElement);

        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
    }

    onClick(event)
    {
        console.log("on click detected event.target=" + event.target);
        console.log("on click detected x=" + this.x);
    }

    moveTo(x, y)
    {
        this.targetX = x;
        this.targetY = y;
    }

    update()
    {
        this.x += (this.targetX - this.x) / 8;
        this.y += (this.targetY - this.y) / 8;
        this.htmlElement.style.left = this.x + "px";
        this.htmlElement.style.top = this.y + "px";
    }
}

let Moveable1 = new MovableDiv(10, 10, "pink");
let Moveable2 = new MovableDiv(200, 200, "yellow");




document.onclick= function(event) {
    // Compensate for IE<9's non-standard event model
    //
    if (event===undefined) event= window.event;
    var target= 'target' in event? event.target : event.srcElement;

    if (currentSelection == null) return;

    currentSelection.moveTo(event.clientX, event.clientY);

    console.log("on click detected event.target=" + event.target);
};


function loop()
{
    Moveable1.update();
    Moveable2.update();

    window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);