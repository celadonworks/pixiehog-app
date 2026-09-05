import assert from 'node:assert/strict';
import test from 'node:test';
import { customerEventProperties } from './customer-properties';

const customer = {
  email: 'customer@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  phone: '+390000000000',
};

test('anonymized events omit Shopify customer properties', () => {
  assert.deepEqual(customerEventProperties(customer, true), {});
});

test('identified events keep Shopify customer properties', () => {
  assert.deepEqual(customerEventProperties(customer, false), customer);
});
