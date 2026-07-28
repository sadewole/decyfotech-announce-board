process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://user:password@localhost:5432/announce_board';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
process.env.JWT_EXPIRATION = '1h';
