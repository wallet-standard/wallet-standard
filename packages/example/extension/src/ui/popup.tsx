import type { FC } from 'react';
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { App } from './App';
import { AppContext } from './context';

const Root: FC = () => {
    return (
        <StrictMode>
            <AppContext>
                <App />
            </AppContext>
        </StrictMode>
    );
};

const rootNode = document.getElementById('root');
ReactDOM.render(<Root />, rootNode);
