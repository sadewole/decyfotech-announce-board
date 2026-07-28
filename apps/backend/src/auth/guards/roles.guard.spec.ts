import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  const mockContext = (role: string) =>
    ({
      getHandler: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role } }),
      }),
    }) as any;

  beforeEach(() => {
    reflector = { get: jest.fn() } as any;
    guard = new RolesGuard(reflector);
  });

  it('should allow if no roles required', () => {
    reflector.get.mockReturnValue(undefined);
    expect(guard.canActivate(mockContext('viewer'))).toBe(true);
  });

  it('should allow if user has required role', () => {
    reflector.get.mockReturnValue(['admin']);
    expect(guard.canActivate(mockContext('admin'))).toBe(true);
  });

  it('should deny if user lacks required role', () => {
    reflector.get.mockReturnValue(['admin']);
    expect(guard.canActivate(mockContext('viewer'))).toBe(false);
  });
});
