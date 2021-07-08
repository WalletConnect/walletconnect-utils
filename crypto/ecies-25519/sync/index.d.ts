// This manual redirection of types is necessary until TS supports
// the package.json exports field
// https://github.com/microsoft/TypeScript/issues/33079#issuecomment-738033267
export * from '../dist/cjs/sync.js';
