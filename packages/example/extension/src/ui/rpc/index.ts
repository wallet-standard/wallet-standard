import { createPortTransport, createRPC, POPUP_PORT_NAME } from '../../messages/index';

const port = chrome.runtime.connect({ name: POPUP_PORT_NAME });

const transport = createPortTransport(port);

export const rpc = createRPC(transport);
