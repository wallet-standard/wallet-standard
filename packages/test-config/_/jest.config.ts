import type { Config } from '@jest/types';

const config: Partial<Config.InitialProjectOptions> = {
    displayName: {
        color: 'grey',
        name: 'Unit Test (Browser)',
    },
    globals: {
        __BROWSER__: true,
        __NODEJS__: false,
        __REACTNATIVE__: false,
    },
    moduleNameMapper: {
        '^(\\./.+|\\../.+).js$': '$1',
    },
    resetMocks: true,
    restoreMocks: true,
    roots: ['<rootDir>/src/'],
    transform: {
        '^.+\\.(ts|js)x?$': [
            '@swc/jest',
            {
                jsc: {
                    target: 'es2020',
                },
            },
        ],
    },
};

export default config;
