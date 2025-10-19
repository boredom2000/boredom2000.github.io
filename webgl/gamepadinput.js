function updateGamepad() {
  const gamepads = navigator.getGamepads();
  const gp = gamepads[0]; // first connected gamepad

  if (gp) {
    // Standard mapping: axes 0 = left stick X, axes 1 = left stick Y
    const x = gp.axes[0];
    const y = gp.axes[1];

    // Optional: invert Y if you want up to be positive
    const leftStick = [x, y];

    movementVector.x = x;
    movementVector.y = -y;

    //console.log("Left stick:", leftStick);
  }

  requestAnimationFrame(updateGamepad);
}

// Start the loop once a gamepad connects
window.addEventListener("gamepadconnected", (e) => {
  console.log("Gamepad connected:", e.gamepad.id);
  updateGamepad();
});