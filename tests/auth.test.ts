import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth } from '../server/middleware/auth';
import { supabase } from '../server/lib/supabase';

// Mock Supabase
vi.mock('../server/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    }
  }
}));

describe('Auth Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let nextFunction: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    nextFunction = vi.fn();
  });

  it('should return 401 if no authorization header is present', async () => {
    await requireAuth(mockReq, mockRes, nextFunction);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Unauthorized') }));
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    mockReq.headers.authorization = 'Bearer invalid-token';
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null }, error: { message: 'Invalid token' } });

    await requireAuth(mockReq, mockRes, nextFunction);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Unauthorized') }));
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should call next() if token is valid', async () => {
    mockReq.headers.authorization = 'Bearer valid-token';
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: '123' } }, error: null });

    await requireAuth(mockReq, mockRes, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockReq.user).toEqual({ id: '123' });
  });
});
