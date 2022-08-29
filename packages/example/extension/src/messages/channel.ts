import jayson from 'jayson';

import { parse, stringify } from './serialization';
import type { Transport } from './transport';

type ResponseCallback = (result: any) => void;

type Callback = (params: any[], sendResponse: ResponseCallback) => void;

type UnsubscribeFn = () => void;

export interface Channel {
    sendMessage: (method: string, params?: any[]) => Promise<any>;
    onMessage: (method: string, listener: Callback) => UnsubscribeFn;
}

export function createChannel(transport: Transport): Channel {
    function sendMessage(method: string, params: any[] = []) {
        return new Promise((resolve) => {
            const request = jayson.Utils.request(method, params);

            const handleResponse = (dataOrEvent: any) => {
                const wireResponse = dataOrEvent instanceof MessageEvent ? dataOrEvent.data : dataOrEvent;
                const response = parse(wireResponse);

                if (!jayson.Utils.Response.isValidResponse(response)) {
                    return;
                }

                if (response.id !== request.id) {
                    return;
                }

                transport.removeListener(handleResponse);

                resolve(response.result);
            };
            transport.addListener(handleResponse);

            const wireRequest = stringify(request);
            transport.write(wireRequest);
        });
    }

    function onMessage(method: string, listener: Callback) {
        const handleRequest = (dataOrEvent: any) => {
            const wireRequest = dataOrEvent instanceof MessageEvent ? dataOrEvent.data : dataOrEvent;
            const request = parse(wireRequest);

            if (!jayson.Utils.Request.isValidRequest(request)) {
                return;
            }

            if (request.method !== method) {
                return;
            }

            listener(request.params, (result) => {
                const response = jayson.Utils.response(null, result, request.id);
                const wireResponse = stringify(response);
                transport.write(wireResponse);
            });
        };

        transport.addListener(handleRequest);

        return () => {
            transport.removeListener(handleRequest);
        };
    }

    return { sendMessage, onMessage };
}
