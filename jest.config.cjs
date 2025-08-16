const { createDefaultPreset, pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig");

const tsJestTransformCfg = createDefaultPreset().transform;

require("dotenv").config({ path: ".env.test" });

/** @type {import("jest").Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: "<rootDir>/",
  }),
  moduleFileExtensions: ["ts", "js", "json", "node"],
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  setupFiles: ["<rootDir>/jest.setup.ts"],
};
