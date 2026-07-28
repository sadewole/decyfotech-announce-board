import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    authService = {
      signup: jest.fn(),
      signin: jest.fn(),
      getUsers: jest.fn(),
      updateUserRole: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should delegate signup', async () => {
    const dto = { email: 'a@b.com', password: '123456', name: 'A' };
    authService.signup.mockResolvedValue({ token: 't', user: { id: 1, email: 'a@b.com', name: 'A', role: 'viewer' } });
    expect(await controller.signup(dto)).toEqual({ token: 't', user: { id: 1, email: 'a@b.com', name: 'A', role: 'viewer' } });
    expect(authService.signup).toHaveBeenCalledWith(dto);
  });

  it('should delegate signin', async () => {
    authService.signin.mockResolvedValue({ token: 't', user: { id: 1, email: 'a@b.com', name: 'A', role: 'viewer' } });
    expect(await controller.signin({ email: 'a@b.com', password: 'p' })).toEqual({ token: 't', user: { id: 1, email: 'a@b.com', name: 'A', role: 'viewer' } });
  });

  it('should delegate getUsers', async () => {
    const paginated = { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    authService.getUsers.mockResolvedValue(paginated);
    expect(await controller.getUsers({ page: 1, limit: 10 })).toEqual(paginated);
    expect(authService.getUsers).toHaveBeenCalledWith(1, 10);
  });

  it('should delegate updateUserRole', async () => {
    authService.updateUserRole.mockResolvedValue({ id: 1, role: 'admin', email: 'a@b.com', name: 'A', createdAt: new Date(), updatedAt: new Date() });
    expect(await controller.updateUserRole(1, { role: 'admin' })).toBeDefined();
    expect(authService.updateUserRole).toHaveBeenCalledWith(1, { role: 'admin' });
  });
});
