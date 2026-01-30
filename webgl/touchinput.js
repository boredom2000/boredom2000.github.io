// Create the joystick UI elements
const joystickContainer = document.createElement('div');
const joystickStick = document.createElement('div');

// Style the container
joystickContainer.id = 'virtual-joystick';
joystickContainer.style.position = 'fixed';
joystickContainer.style.display = 'none';
joystickContainer.style.width = '60px';
joystickContainer.style.height = '60px';
joystickContainer.style.borderRadius = '50%';
joystickContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
joystickContainer.style.border = '2px solid rgba(255, 255, 255, 0.3)';
joystickContainer.style.touchAction = 'none'; // Prevent browser scrolling
joystickContainer.style.zIndex = '10000';

// Style the stick
joystickStick.style.position = 'absolute';
joystickStick.style.top = '50%';
joystickStick.style.left = '50%';
joystickStick.style.width = '30px';
joystickStick.style.height = '30px';
joystickStick.style.borderRadius = '50%';
joystickStick.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
joystickStick.style.transform = 'translate(-50%, -50%)';
joystickStick.style.pointerEvents = 'none'; // Let events pass through to container

// Assemble and add to DOM
joystickContainer.appendChild(joystickStick);
document.body.appendChild(joystickContainer);

// State variables
let isJoystickDragging = false;
const joystickMaxRadius = 60; // Max distance the stick can move from center
let joystickOriginX = 0;
let joystickOriginY = 0;
let decayAnimationFrameId = null;
let decayReleaseTime = 0;
let decayStartVector = { x: 0, y: 0 };

// Event Handlers
function handleJoystickStart(e) {
    // Cancel any active decay
    if (decayAnimationFrameId) {
        cancelAnimationFrame(decayAnimationFrameId);
        decayAnimationFrameId = null;
    }

    if ((e.touches && e.touches.length === 1) || (!e.touches && e.button === 0)) {
        isJoystickDragging = true;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        joystickOriginX = clientX;
        joystickOriginY = clientY;
        
        joystickContainer.style.display = 'block';
        joystickContainer.style.left = joystickOriginX + 'px';
        joystickContainer.style.top = joystickOriginY + 'px';
        joystickContainer.style.transform = 'translate(-50%, -50%)';
        
        updateJoystick(e);
    }
}

function handleJoystickMove(e) {
    if (!isJoystickDragging) return;
    if (e.cancelable) e.preventDefault(); // Stop scrolling
    updateJoystick(e);
}

function handleJoystickEnd(e) {
    if ((e.touches && e.touches.length === 0) || !e.touches) {
        isJoystickDragging = false;
        
        if (typeof movementVector !== 'undefined') {
            decayStartVector = { x: movementVector.x, y: movementVector.y };
            decayReleaseTime = performance.now();
            decayAnimationFrameId = requestAnimationFrame(updateDecay);
        } else {
            joystickContainer.style.display = 'none';
        }
    }
}

function updateDecay(timestamp) {
    const timeSinceRelease = (timestamp - decayReleaseTime) / 1000;
    const delay = 0.05;
    const speed = 3.0; // units per second

    let currentVector = { x: 0, y: 0 };
    let finished = false;

    if (timeSinceRelease < delay) {
        // Hold position
        currentVector = decayStartVector;
    } else {
        // Move back to center
        const moveTime = timeSinceRelease - delay;
        const startMag = Math.sqrt(decayStartVector.x * decayStartVector.x + decayStartVector.y * decayStartVector.y);
        const distMoved = speed * moveTime;
        const currentMag = Math.max(0, startMag - distMoved);

        if (currentMag === 0) {
            finished = true;
        } else if (startMag > 0) {
            const scale = currentMag / startMag;
            currentVector.x = decayStartVector.x * scale;
            currentVector.y = decayStartVector.y * scale;
        }
    }

    if (typeof movementVector !== 'undefined') {
        movementVector.x = currentVector.x;
        movementVector.y = currentVector.y;
    }

    const deltaX = currentVector.x * joystickMaxRadius;
    const deltaY = -currentVector.y * joystickMaxRadius;
    joystickStick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;

    if (finished) {
        joystickContainer.style.display = 'none';
        decayAnimationFrameId = null;
    } else {
        decayAnimationFrameId = requestAnimationFrame(updateDecay);
    }
}

function updateJoystick(e) {
    // Support both touch and mouse events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    let deltaX = clientX - joystickOriginX;
    let deltaY = clientY - joystickOriginY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Clamp stick to max radius
    if (distance > joystickMaxRadius) {
        const angle = Math.atan2(deltaY, deltaX);
        deltaX = Math.cos(angle) * joystickMaxRadius;
        deltaY = Math.sin(angle) * joystickMaxRadius;
    }
    
    // Update visual position
    joystickStick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
    
    // Update global movement vector
    // Normalize to -1..1 range
    // Note: In game coordinates, Y is Up (+), but screen Y is Down (+). Invert Y.
    if (typeof movementVector !== 'undefined') {
        movementVector.x = deltaX / joystickMaxRadius;
        movementVector.y = -(deltaY / joystickMaxRadius);
    }
}

// Add Event Listeners
window.addEventListener('touchstart', handleJoystickStart, { passive: false });
window.addEventListener('touchmove', handleJoystickMove, { passive: false });
window.addEventListener('touchend', handleJoystickEnd);
window.addEventListener('touchcancel', handleJoystickEnd);

// Mouse fallbacks for testing on desktop
window.addEventListener('mousedown', handleJoystickStart);
window.addEventListener('mousemove', handleJoystickMove);
window.addEventListener('mouseup', handleJoystickEnd);