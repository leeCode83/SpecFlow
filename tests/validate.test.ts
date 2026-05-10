import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateBody } from '../server/middleware/validate';
import { z } from 'zod';

describe('Validation Middleware', () => {
  const schema = z.object({
    name: z.string(),
    age: z.number().min(18)
  });

  let mockReq: any;
  let mockRes: any;
  let nextFunction: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      body: {}
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    nextFunction = vi.fn();
  });

  it('should call next() if validation succeeds', async () => {
    mockReq.body = { name: 'John', age: 25 };
    const middleware = validateBody(schema);
    await middleware(mockReq, mockRes, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 400 if validation fails', async () => {
    mockReq.body = { name: 'John', age: 10 }; // Age too low
    const middleware = validateBody(schema);
    await middleware(mockReq, mockRes, nextFunction);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Validation failed' }));
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 400 if required field is missing', async () => {
    mockReq.body = { age: 25 }; // Name missing
    const middleware = validateBody(schema);
    await middleware(mockReq, mockRes, nextFunction);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
