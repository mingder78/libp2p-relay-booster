// relay.ts
import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayServer } from '@libp2p/circuit-relay-v2'
import { kadDHT } from '@libp2p/kad-dht'
import { identify } from '@libp2p/identify'
import { ping } from '@libp2p/ping'

async function main() {
  const libp2p = await createLibp2p({
    addresses: {
      listen: [
        '/ip4/0.0.0.0/tcp/9000/ws',   // WebSockets (browser-friendly)
        '/ip4/0.0.0.0/tcp/9001'       // TCP (bootstrap/DHT)
      ]
    },
    transports: [tcp(), webSockets()],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    services: {
      relay: circuitRelayServer({ advertise: true }),
      identify: identify(),
      ping: ping(),                        // ✅ required for kadDHT
      dht: kadDHT({ clientMode: false })   // full DHT node
    }
  })

  await libp2p.start()

  console.log('🚀 Relay + Bootstrap server started')
  console.log('PeerId:', libp2p.peerId.toString())
  console.log('Listening addresses:')
  libp2p.getMultiaddrs().forEach((ma) => {
    console.log(ma.toString())
  })
}

main().catch(console.error)

