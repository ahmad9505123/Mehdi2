import { describe, expect, it } from 'vitest';
import { serviceSchema } from '@/lib/service-schema';
import { authorizedSession, passwordMatches, digest } from '@/lib/admin-security.server';
describe('Service administration rules', () => {
  it('keeps an unavailable service and its exact price', () => {
    const result = serviceSchema.parse({ name: 'تحويل', price: 25.5, currency: 'ريال', available: false });
    expect(result.available).toBe(false); expect(result.price).toBe(25.5);
  });
  it('rejects negative prices', () => { expect(serviceSchema.safeParse({ name: 'تحويل', price: -1, currency: '', available: true }).success).toBe(false); });
  it('rejects empty service names', () => { expect(serviceSchema.safeParse({ name: ' ', price: 0, currency: '', available: true }).success).toBe(false); });
  it('rejects a session without a verified password', () => { expect(authorizedSession(undefined, 'test-only-password')).toBe(false); });
  it('accepts only the current password session', () => { expect(authorizedSession(digest('test-only-password'), 'test-only-password')).toBe(true); expect(authorizedSession(digest('old-test-password'), 'test-only-password')).toBe(false); });
  it('rejects an incorrect password even with a different length', () => { expect(passwordMatches('bad', 'test-only-password')).toBe(false); });
});
