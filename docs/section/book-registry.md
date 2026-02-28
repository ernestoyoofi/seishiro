# Book Registry

The Book Registry is a specialized synchronization system designed specifically for the API Action layer.

---

## What is Book Registry?

Book Registry is a metadata extraction system that converts your active registry list into an encrypted and compressed format.

Unlike standard registries that store functions (executable code), Book Registry only takes action identities (keys) that are permitted for public access (API Action). This data is then protected using the **AES-256-CTR** algorithm with a static key (passkey) to ensure that only authorized entities can read it.

## Book Registry For?

The main purpose of the Book Registry is infrastructure scalability. This feature is prepared for the future Seishiro Gateway ecosystem that handles:
- **Global Load Balancing**: Allows the Gateway to know what actions are available on Node A, Node B, or Node C in real-time.
- **Failover System**: If one Node fails, the Gateway uses this "book" to find another Node that has similar actions.
- **Region Switching**: Selects the fastest server in a specific region (e.g., JKT vs. SIN) based on the list of actions registered in each region's Book Registry.
- **Zero-Trust Private Network**: Enables secure communication between servers even without SSL, thanks to built-in AES encryption.

## Who can manage Registry Book?

Only Seishiro Gateway is authorized and capable of fully managing and reading the Book Registry.
- **Strict Access**: Although the Book Registry can be accessed via an endpoint, its contents cannot be read by humans or third parties without the correct passkey.
- **Automated Management**: Seishiro Gateway will act as the sole manager that crawls every server node, reads its Book Registry, and automatically updates the global routing table.
- **Encrypted Communication**: The gateway uses metadata from the Book Registry to perform a private handshake with each services node.