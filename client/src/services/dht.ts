// @ts-ignore
import DHT from "bittorrent-dht";
import net from "node:net";
import magnet from "magnet-uri";

const dht = new DHT();
const uri = "magnet:?xt=urn:btih:e3a111a811b9539cacff680e418124272177c47477157";
const parsed = magnet(uri);
const infoHash = parsed.infoHash; // Unique ID for discovery

const DHT_PORT = 20000; // DHT port for peer discovery

// Set to track unique peers
const peerSet = new Set<string>(); // Set to track unique peers

// Function to connect to a peer
function tryConnectToPeer(host: string, port: number) {
  host = 'backend'
  const tcpClient = new net.Socket();
  console.log(`Attempting to connect to peer ${host}:${port}`);

  tcpClient.connect(port, host, () => {
    console.log(`Connected to peer ${host}:${port}`);
    const message = {
      message: "Hello from client!",
      action: "hello",
    }
    tcpClient.write(JSON.stringify(message));
  });

  tcpClient.on("data", (data) => {
    const serverMessage = JSON.parse(data.toString().trim());
    console.log(`Received data from peer:`, serverMessage);
  });

  tcpClient.on("error", (err) => {
    console.error(`Connection error: ${err.message}. Peer: ${host}:${port}`);
  });

  tcpClient.on("end", () => {
    console.log("Disconnected from peer");
  });
}

// Start DHT node and announce to the network
dht.listen(DHT_PORT, () => {
  console.log(`DHT node listening on port ${DHT_PORT}`);

  // Announce the torrent AFTER the node is ready
  dht.announce(infoHash, DHT_PORT, () => {
    console.log(`✅ Announced to DHT: ${infoHash} on port ${DHT_PORT}`);
  });

  // Lookup for peers after announcing
  dht.lookup(infoHash);
  console.log(`🔎 Looking for peers with infoHash: ${infoHash}`);
});

// Handle peer discovery
dht.on("peer", (peer: { port: number; host: any }, hash: any, from: any) => {
  // Avoid connecting back to DHT node
  if (peer.port === DHT_PORT) return; // Ignore DHT port

  const peerKey = `${peer.host}:${peer.port}`;
  if (!peerSet.has(peerKey)) {
    console.log(`🌐 New peer discovered: ${peer.host}:${peer.port}`);
    peerSet.add(peerKey);
    
    // Attempt to connect to the peer
    tryConnectToPeer(peer.host, peer.port);
  } else {
    // console.log(`🔄 Already discovered peer ${peer.host}:${peer.port}`);
  }
});

export { dht, infoHash };
