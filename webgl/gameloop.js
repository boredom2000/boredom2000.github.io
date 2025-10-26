try {
	movementAndColorDemo();
    let lastFrameTime = performance.now();
	const frame = function () {
		const thisFrameTime = performance.now();
		const dt = (thisFrameTime - lastFrameTime) / 1000;
		lastFrameTime = thisFrameTime;

		updateGame(thisFrameTime, dt);
		renderGame(thisFrameTime, dt);

		requestAnimationFrame(frame);
	};
	requestAnimationFrame(frame);
} catch (e) {
	showError(`Uncaught JavaScript exception: ${e}`);
}