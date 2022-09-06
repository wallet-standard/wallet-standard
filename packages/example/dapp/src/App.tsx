import type { FC } from 'react';
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { Connect } from './pages/Connect';
import { Home } from './pages/Home';

export const App: FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/connect" element={<Connect />} />
        </Routes>
    );
};
