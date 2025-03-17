import net from 'node:net';

const TCP_PORT = 5555; // TCP port for actual communication

// TCP Server for DHT messages
const tcpServer = net.createServer((socket) => {
    console.log('Peer connected:', socket.remoteAddress, socket.remotePort);

    socket.write('Hello from server!\n');

    socket.on('data', (data) => {
        const clientRequest = data.toString().trim();
        console.log(`Received data: ${clientRequest}`)
        // Echo message back
        // socket.write(`TCP Echo: ${data}`);
    });

    socket.on('end', () => console.log('TCP Peer disconnected'));
});

function startTcpServer(port: number) {
    tcpServer.listen(port, 'localhost', () => console.log(`DHT Server listening on port ${port}`));
}

export { startTcpServer, TCP_PORT };
