import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersRepository } from '../repositories/users.repository';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let usersRepo: jest.Mocked<UsersRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashed',
    name: 'Test',
    role: 'viewer' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateRole: jest.fn(),
      findAllPaginated: jest.fn(),
    } as any;
    jwtService = { signAsync: jest.fn().mockResolvedValue('mock-token') } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: usersRepo },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should create first user as admin', async () => {
      usersRepo.findByEmail.mockResolvedValue(undefined as any);
      usersRepo.findAllPaginated.mockResolvedValue({ total: 0, items: [] } as any);
      usersRepo.create.mockResolvedValue({ ...mockUser, role: 'admin' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      const result = await service.signup({ email: 'test@example.com', password: 'password123', name: 'Test' });

      expect(result.token).toBe('mock-token');
      expect(result.user.role).toBe('admin');
      expect(usersRepo.create).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }));
    });

    it('should throw if email exists', async () => {
      usersRepo.findByEmail.mockResolvedValue(mockUser);
      await expect(service.signup({ email: 'test@example.com', password: 'p', name: 'T' })).rejects.toThrow(ConflictException);
    });

    it('should assign viewer if users exist', async () => {
      usersRepo.findByEmail.mockResolvedValue(undefined as any);
      usersRepo.findAllPaginated.mockResolvedValue({ total: 1 } as any);
      usersRepo.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      const result = await service.signup({ email: 'test@example.com', password: 'password123', name: 'Test' });
      expect(result.user.role).toBe('viewer');
    });
  });

  describe('signin', () => {
    it('should return token for valid credentials', async () => {
      usersRepo.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);

      const result = await service.signin({ email: 'test@example.com', password: 'password123' });
      expect(result.token).toBe('mock-token');
    });

    it('should throw if email not found', async () => {
      usersRepo.findByEmail.mockResolvedValue(undefined as any);
      await expect(service.signin({ email: 'x@y.com', password: 'p' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password wrong', async () => {
      usersRepo.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false as never);
      await expect(service.signin({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateUserRole', () => {
    it('should update and omit password', async () => {
      usersRepo.updateRole.mockResolvedValue(mockUser);
      const result = await service.updateUserRole(1, { role: 'admin' });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw if user missing', async () => {
      usersRepo.updateRole.mockResolvedValue(undefined as any);
      await expect(service.updateUserRole(999, { role: 'admin' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const paginated = { items: [mockUser], total: 1, page: 1, limit: 10, totalPages: 1 };
      usersRepo.findAllPaginated.mockResolvedValue(paginated);
      expect(await service.getUsers(1, 10)).toEqual(paginated);
    });
  });
});
