import type { FC } from 'react';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AppContext } from './context';

const Root: FC = () => {
    return (
        <StrictMode>
            <BrowserRouter>
                <AppContext>
                    <App />
                </AppContext>
            </BrowserRouter>
        </StrictMode>
    );
};

const rootNode = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(rootNode!);
root.render(<Root />);
