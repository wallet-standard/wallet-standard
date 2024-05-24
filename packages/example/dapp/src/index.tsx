import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Root } from './routes/root';

const router = createBrowserRouter([
    {
        Component: Layout,
        children: [
            {
                Component: Root,
                index: true,
            },
        ],
    },
]);

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const rootNode = document.getElementById('root')!;
const root = createRoot(rootNode);
root.render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
