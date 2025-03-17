import net from 'node:net';

const TCP_PORT = 5555; // TCP port for actual communication

// TCP Server for DHT messages
const tcpServer = net.createServer((socket) => {
    console.log('Peer connected:', socket.remoteAddress, socket.remotePort);

    const message = {
      message: "Hello from Server!",
      action: "hello",
    }
    socket.write(JSON.stringify(message));

    socket.on('data', (data) => {
      try {
        const clientRequest = JSON.parse(data.toString().trim());
        console.log(`Received data:`, clientRequest)
      } catch (err) {
        console.log(err)
      }
    });

    socket.on('end', () => console.log('TCP Peer disconnected'));
});

function startTcpServer(port: number) {
    tcpServer.listen(port, 'backend', () => console.log(`DHT Server listening on port ${port}`));
}

export { startTcpServer, TCP_PORT };
