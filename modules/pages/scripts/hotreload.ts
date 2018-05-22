if (window.location.protocol === "http:") {
    let socket = new WebSocket("ws://localhost:6969", "jeffery");
    socket.onmessage = (event) => {
        window.location.reload();
    };
}
// socket.onclose = (event) => {
//     if (event.code === 1006) window.location.reload();
//     // else console.error('Could not connect to hot reload system');
// };