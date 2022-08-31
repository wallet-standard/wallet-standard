import { POPUP_PORT_NAME, createRPC, createPortTransport } from '../messages';

const port = chrome.runtime.connect({ name: POPUP_PORT_NAME });

const transport = createPortTransport(port);

export const rpc = createRPC(transport);
