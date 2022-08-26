import { inject } from './utils';

const windowScript = new URL('./window.ts', import.meta.url);
inject(windowScript.href);
