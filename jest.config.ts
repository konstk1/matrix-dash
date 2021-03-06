import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    setupFiles: [
      'dotenv/config',
    ],
    setupFilesAfterEnv: [
      '<rootDir>/test/jest.setup.ts',
    ]
};

export default config;