// let textTexture;
// let canvas;
// let gl;
// The resulting vector (x, y)
var MINIMUM_CAMERA_HEIGHT = 4.0;
var MINIMUM_CAMERA_WIDTH = 2.0;

const CollisionTarget = Object.freeze({
	All: 'All',
	Ball: 'Ball',
	Player: 'Player'
})

const CollisionType = Object.freeze({
	Bounce: 'Bounce',
	Death: 'Death',
	Gravity: 'Gravity',
	Trigger: 'Trigger'
})


let movementVector = { x: 0, y: 0 };

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}


/** Display an error message to the DOM, beneath the demo element */
function showError(errorText) {
	console.error(errorText);
	const errorBoxDiv = document.getElementById('error-box');
	if (errorBoxDiv === null) {
		return;
	}
	const errorElement = document.createElement('p');
	errorElement.innerText = errorText;
	errorBoxDiv.appendChild(errorElement);
}


function showLog(logText)
{
	const errorBoxDiv = document.getElementById('log-box');
	if (errorBoxDiv === null) {
		return;
	}
	errorBoxDiv.innerHTML = logText;
}



function getRandomInRange(min, max) {
	return Math.random() * (max - min) + min;
}