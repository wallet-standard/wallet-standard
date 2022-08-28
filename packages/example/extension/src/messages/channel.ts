import type { Transport } from './transport';

export interface Channel {
    sendMessage: (method: string, params?: any[]) => Promise<any>;
    onMessage: (method: string, listener: (params: any[], sendResponse: (result: any) => void) => void) => () => void;
}

function isRequest(data: any) {
    return typeof data.method !== 'undefined';
}

export function createChannel(transport: Transport) {
    let id = 0;

    function sendMessage(method: string, params: any[] = []) {
        return new Promise((resolve) => {
            const request = {
                id: id++,
                method,
                params,
            };

            const handleResponse = (dataOrEvent: any) => {
                const data = dataOrEvent instanceof MessageEvent ? dataOrEvent.data : dataOrEvent;

                if (isRequest(data)) {
                    return;
                }

                const response = data;

                if (response.id !== request.id) {
                    return;
                }

                transport.removeListener(handleResponse);

                resolve(response.result);
            };
            transport.addListener(handleResponse);

            transport.write(request);
        });
    }

    function onMessage(method: string, listener: (params: any[], sendResponse: (result: any) => void) => void) {
        const handleRequest = (dataOrEvent: any) => {
            const data = dataOrEvent instanceof MessageEvent ? dataOrEvent.data : dataOrEvent;

            if (!isRequest(data)) {
                return;
            }

            const request = data;

            if (request.method !== method) {
                return;
            }

            listener(request.params, (result) => {
                const response = {
                    id: request.id,
                    result,
                };
                transport.write(response);
            });
        };

        transport.addListener(handleRequest);

        return () => {
            transport.removeListener(handleRequest);
        };
    }

    return { sendMessage, onMessage };
}
