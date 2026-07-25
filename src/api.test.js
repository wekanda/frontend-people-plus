import test from 'node:test';
import assert from 'node:assert/strict';
import { getBaseUrl } from './api.js';

test('uses the local backend for 127.0.0.1 hosts', () => {
  assert.equal(getBaseUrl('127.0.0.1'), 'http://localhost:8000');
});

test('uses the production backend for non-local hosts', () => {
  assert.equal(getBaseUrl('people-pluse-app.com'), 'https://people-pluse-backend-1.onrender.com');
});
