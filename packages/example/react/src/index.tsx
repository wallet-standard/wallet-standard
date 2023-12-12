import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const appElement = document.getElementById('app');
if (!appElement) {
    throw new Error('Could not find a DOM element with the id #app');
}
const root = createRoot(appElement);
root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
