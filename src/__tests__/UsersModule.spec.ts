import 'reflect-metadata';
import { validate } from 'uuid';
import { verify } from 'jsonwebtoken';


import authConfig from '../config/auth';

import { CreateUserUseCase } from '../modules/users/useCases/createUser/CreateUserUseCase';
import { InMemoryUsersRepository } from '../modules/users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserError } from '../modules/users/useCases/createUser/CreateUserError';
import { AuthenticateUserUseCase } from '../modules/users/useCases/authenticateUser/AuthenticateUserUseCase';
import { IncorrectEmailOrPasswordError } from '../modules/users/useCases/authenticateUser/IncorrectEmailOrPasswordError';


const usersRepository = new InMemoryUsersRepository();
const createUserUseCase = new CreateUserUseCase(usersRepository);
const authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);

describe('CreateUserUseCase', () => {
  it('should be able to create and find a new user', async () => {
    const user = await createUserUseCase.execute({ name: 'test', email: 'test@test', password: '1234' });

    expect(validate(user.id!)).toBeTruthy();

    const findByEmail = await usersRepository.findByEmail(user.email);

    expect(findByEmail).toEqual(user);

    const findById = await usersRepository.findById(user.id!);

    expect(findById).toEqual(user);
  });

  it('should not be able to create two users with the same e-mail', async () => {
    expect(async () => {
      await createUserUseCase.execute({ name: 'test', email: 'test@test', password: '1234' });
      await createUserUseCase.execute({ name: 'test2', email: 'test@test', password: '4321' })
    }).rejects.toBeInstanceOf(CreateUserError);
  });
})