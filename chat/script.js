const joinRoomButton = document.getElementById("room-button");
const messageButton = document.getElementById("send-button");
const joinRoomInput = document.getElementById("room-input");
const messageInput = document.getElementById("message-input");
const messageContainer = document.getElementById("message-container");
const form = document.getElementById("form123");

function submitForm(e)
{
    e.preventDefault();
    
    const message = messageInput.value;

    if (message === "") return;

    addMessage(messageInput.value);
    messageInput.value = "";
}

function addMessage(message)
{
    const div = document.createElement("div");
    div.textContent = message;
    messageContainer.append(div);
}

form.addEventListener("submit", submitForm);

console.log("v1" + form);