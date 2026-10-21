import { afterEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ version: undefined as string | undefined, origin: 'https://example.test' }));
vi.mock('@tanstack/react-start/server', () => ({
  setResponseHeader: vi.fn(),
  getRequest: () => new Request('https://example.test/admin', { headers: { origin: state.origin } }),
  useSession: async () => ({ data: { version: state.version } }),
}));
import { digest, requireAdmin } from '@/lib/admin-security.server';
afterEach(() => { vi.unstubAllEnvs(); state.version = undefined; state.origin = 'https://example.test'; });
describe('Protected service writes', () => {
  it('denies writes without a verified admin session', async () => {
    vi.stubEnv('SESSION_SECRET', 'test-session-secret-only'); vi.stubEnv('ADMIN_PASSWORD', 'test-password-only');
    await expect(requireAdmin()).rejects.toThrow('يرجى تسجيل الدخول أولاً');
  });
  it('allows writes for the verified admin session', async () => {
    vi.stubEnv('SESSION_SECRET', 'test-session-secret-only'); vi.stubEnv('ADMIN_PASSWORD', 'test-password-only');
    state.version = digest('test-password-only');
    await expect(requireAdmin()).resolves.toBeUndefined();
  });
  it('denies cross-origin writes even for an admin', async () => {
    vi.stubEnv('SESSION_SECRET', 'test-session-secret-only'); vi.stubEnv('ADMIN_PASSWORD', 'test-password-only');
    state.version = digest('test-password-only'); state.origin = 'https://other.test';
    await expect(requireAdmin()).rejects.toThrow('طلب غير مسموح');
  });
});