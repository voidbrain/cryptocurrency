// @ts-ignore
import DHT from 'bittorrent-dht';
import magnet from 'magnet-uri';

const dht = new DHT();
const uri = 'magnet:?xt=urn:btih:e3a111a811b9539cacff680e418124272177c47477157';
const parsed = magnet(uri);
const infoHash = parsed.infoHash; // Unique ID for discovery
const DHT_PORT = 20001; // DHT port for peer discovery

// Start DHT node
dht.listen(DHT_PORT, () => {
    console.log(`DHT node listening on port ${DHT_PORT}`);
});

// Announce server on DHT with localhost
function announce(port: number) {
    dht.announce(infoHash, port, () => {
        console.log(`Announced to DHT network with infoHash ${infoHash} on port ${port}`);
    });
}

export { dht, announce, DHT_PORT };
