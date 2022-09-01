import type { FC } from 'react';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppContext } from './context';
import { initialize } from './initialize';
import { Home } from './pages/Home';

initialize();

const Root: FC = () => {
    return (
        <StrictMode>
            <AppContext>
                <Home />
            </AppContext>
        </StrictMode>
    );
};

const rootNode = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(rootNode!);
root.render(<Root />);
