import type { FC } from 'react';
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { App } from './App';

const Root: FC = () => {
    return (
        <StrictMode>
            <App />
        </StrictMode>
    );
};

const rootNode = document.getElementById('root');
ReactDOM.render(<Root />, rootNode);
