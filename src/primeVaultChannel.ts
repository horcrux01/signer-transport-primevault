import {
    type Channel,
    type JsonRequest,
    type JsonResponse,
} from "@slide-computer/signer";
import {PrimeVaultTransportError} from "./primeVaultTransport";

export class PrimeVaultChannel implements Channel {
    readonly #closeListeners = new Set<() => void>();
    readonly #responseListeners = new Set<(response: JsonResponse) => void>();

    get closed(): boolean {
        return (
            !("ic" in window) ||
            typeof window.ic !== "object" ||
            !window.ic ||
            !("primevault" in window.ic) ||
            typeof window.ic.primevault !== "object" ||
            !window.ic.primevault ||
            !("request" in window.ic.primevault) ||
            typeof window.ic.primevault.request !== "function"
        );
    }

    addEventListener(
        ...[event, listener]:
            | [event: "close", listener: () => void]
            | [event: "response", listener: (response: JsonResponse) => void]
    ): () => void {
        switch (event) {
            case "close":
                this.#closeListeners.add(listener);
                return () => {
                    this.#closeListeners.delete(listener);
                };
            case "response":
                this.#responseListeners.add(listener);
                return () => {
                    this.#responseListeners.delete(listener);
                };
        }
    }

    async send(request: JsonRequest): Promise<void> {
        if (this.closed) {
            throw new PrimeVaultTransportError("PrimeVault wallet cannot be found");
        }

        // @ts-ignore
        const response = await window.ic.primevault.request(request);

        if (request.id === undefined) return;

        this.#responseListeners.forEach((listener) => listener(response));
    }

    async close(): Promise<void> {
        if (this.closed) return;

        // @ts-ignore
        if (window?.ic?.primevault) {
            // @ts-ignore
            window.ic.primevault.close();
        }
    }
}
