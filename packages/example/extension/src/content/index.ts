import { CONTENT_PORT_NAME } from '../messages/ports';
import { inject } from './utils';

const windowScript = new URL('./window.ts', import.meta.url);
inject(windowScript.href);

// Proxy messages between website and background process.
const port = chrome.runtime.connect({ name: CONTENT_PORT_NAME });
window.addEventListener('message', (event) => {
    port.postMessage(event.data);
});
port.onMessage.addListener((message) => {
    window.postMessage(message);
});
