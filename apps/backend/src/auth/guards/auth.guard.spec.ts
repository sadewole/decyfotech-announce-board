import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: jest.Mocked<JwtService>;

  const mockContext = (token?: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: token ? `Bearer ${token}` : undefined },
        }),
      }),
    }) as any;

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() } as any;
    guard = new AuthGuard(jwtService);
  });

  it('should allow with valid token', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 1, email: 'a@b.com', role: 'admin' });
    await expect(guard.canActivate(mockContext('valid'))).resolves.toBe(true);
  });

  it('should reject without token', async () => {
    await expect(guard.canActivate(mockContext())).rejects.toThrow(UnauthorizedException);
  });

  it('should reject with invalid token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('bad'));
    await expect(guard.canActivate(mockContext('bad'))).rejects.toThrow(UnauthorizedException);
  });
});
