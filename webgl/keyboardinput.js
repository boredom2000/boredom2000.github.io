// A dictionary to track the current pressed state of directional keys
const keysPressed = {
    'ArrowUp': false,
    'ArrowDown': false,
    'ArrowLeft': false,
    'ArrowRight': false,
    // Add WASD equivalents for flexibility
    'w': false,
    's': false,
    'a': false,
    'd': false
};

// The resulting vector (x, y)
let movementVector = { x: 0, y: 0 };

/**
 * Calculates the movement vector based on the currently pressed keys.
 * X is Left (-1) / Right (+1)
 * Y is Down (-1) / Up (+1)
 */
function updateMovementVector() {
    let x = 0;
    let y = 0;

    // --- Calculate X component ---
    if (keysPressed['ArrowRight'] || keysPressed['d']) {
        x = 1;
    } else if (keysPressed['ArrowLeft'] || keysPressed['a']) {
        x = -1;
    }
    // Note: If both left and right are pressed, the final state
    // depends on the `if/else if` order. Here, it results in -1 if ArrowLeft is pressed.
    // However, if we only track keydown/keyup, the resulting vector will be 0 if
    // the first key released is one of the two. A more robust system (below) is better.

    // --- Calculate Y component ---
    // Y is often inverted in screen coordinates (up is -1, down is +1).
    // Here, we follow the convention: Up = +1, Down = -1.
    if (keysPressed['ArrowUp'] || keysPressed['w']) {
        y = 1;
    } else if (keysPressed['ArrowDown'] || keysPressed['s']) {
        y = -1;
    }

    // Update the global vector
    movementVector.x = x;
    movementVector.y = y;

    // Optional: Log the result
    //console.log(`Vector: (${movementVector.x}, ${movementVector.y})`);

    // In a game or animation loop, you'd typically use this vector here
    // to apply movement, or a loop would check this global variable.
}

/**
 * Handles the keydown event.
 * @param {KeyboardEvent} event
 */
function handleKeyDown(event) {
    const key = event.key.toLowerCase(); // Use toLowerCase for WASD

    // Prevent default browser actions for arrow keys (e.g., scrolling)
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        event.preventDefault();
    }

    // Only update if the key wasn't already pressed (to avoid spamming updates)
    if (keysPressed.hasOwnProperty(key) && !keysPressed[key]) {
        keysPressed[key] = true;
        updateMovementVector();
    }
}

/**
 * Handles the keyup event.
 * @param {KeyboardEvent} event
 */
function handleKeyUp(event) {
    const key = event.key.toLowerCase();

    if (keysPressed.hasOwnProperty(key) && keysPressed[key]) {
        keysPressed[key] = false;
        updateMovementVector();
    }
}

// Attach the event listeners to the document
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// Initial state check
console.log(`Initial Vector: (${movementVector.x}, ${movementVector.y})`);