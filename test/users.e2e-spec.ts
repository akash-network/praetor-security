import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UsersModule } from './../src/users/users.module';

describe('UsersController (e2e)', () => {
  let users: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    users = moduleFixture.createNestApplication();
    await users.init();
  });
});
