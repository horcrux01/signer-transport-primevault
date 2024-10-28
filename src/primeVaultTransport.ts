import {PrimeVaultChannel} from "./primeVaultChannel";
import {type Channel, type Transport,} from "@slide-computer/signer";

export class PrimeVaultTransportError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, PrimeVaultTransportError.prototype);
    }
}

export class PrimeVaultTransport implements Transport {
    async establishChannel(): Promise<Channel> {
        return new PrimeVaultChannel();
    }
}
