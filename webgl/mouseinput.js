
	window.addEventListener('resize', updatePlayArea, true);
	

	document.addEventListener("touchmove", process_touchmove, false);

	var mousePos = [0.0, 0.0];
	function process_touchmove(evt)
	{
		var rect = canvas.getBoundingClientRect();
		mousePos = [uvLeft + (evt.touches[0].clientX - rect.left)  / canvas.width * uvWidth, uvTop + (evt.touches[0].clientY - rect.top) / canvas.height * uvHeight];
	}
	//state
	document.onmousemove = handleMouseMove;
	function handleMouseMove(event)
	{
		var rect = canvas.getBoundingClientRect();
		mousePos = [uvLeft + (event.pageX - rect.left)  / canvas.width * uvWidth, uvTop + (event.pageY - rect.top) / canvas.height * uvHeight];
	}