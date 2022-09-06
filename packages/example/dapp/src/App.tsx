import type { FC } from 'react';
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { Home } from './pages/Home';

export const App: FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
        </Routes>
    );
};
