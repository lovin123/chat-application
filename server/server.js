// server.js
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("New client connected");

  // Listen for messages from clients
  ws.on("message", (message) => {
    // Broadcast the received message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message); // Broadcast message to each client
      }
    });
  });

  // Log when client disconnects
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
