import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s', '!src/main.ts', '!src/seed.ts'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  setupFiles: ['./test/setup.ts'],
  moduleNameMapper: {
    '^@announce-board/db$': '<rootDir>/../../packages/db/src/index.ts',
  },
};

export default config;
