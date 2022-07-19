import 'reflect-metadata';
import { validate } from 'uuid';
import { verify } from 'jsonwebtoken';

import authConfig from '../config/auth';

import { CreateUserUseCase } from '../modules/users/useCases/createUser/CreateUserUseCase';
import { InMemoryUsersRepository } from '../modules/users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserError } from '../modules/users/useCases/createUser/CreateUserError';
import { AuthenticateUserUseCase } from '../modules/users/useCases/authenticateUser/AuthenticateUserUseCase';
import { IncorrectEmailOrPasswordError } from '../modules/users/useCases/authenticateUser/IncorrectEmailOrPasswordError';
import { ShowUserProfileUseCase } from '../modules/users/useCases/showUserProfile/ShowUserProfileUseCase';


const usersRepository = new InMemoryUsersRepository();
const createUserUseCase = new CreateUserUseCase(usersRepository);
const authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
const showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);

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

describe('AuthenticateUser', () => {

  it('should return a JWT', async () => {
    usersRepository.create({ name: 'test', email: 'test@test', password: '1234' });

    const { token, user } = await authenticateUserUseCase.execute({ email: 'test@test', password: '1234' });

    expect(user).toBeTruthy();

    expect(token).toBeTruthy();
    expect(verify(token, authConfig.jwt.secret)).toBeTruthy();
  });

  it('should not find a user and throw', async () => {
    const user = await usersRepository.create({ name: 'matchEmail', email: 'match@email', password: '1111' })

    expect(async () => {
      await authenticateUserUseCase.execute({ email: 'not the same email', password: '1111' })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('should not match password and throw', async () => {
    const user = await usersRepository.create({ name: 'matchPass', email: 'match@pass', password: '1111' })

    expect(async () => {
      await authenticateUserUseCase.execute({ email: user.email, password: '1' })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
})

describe('ShowUserProfile', () => {
  it('should return user profile', async () => {
    const user = await usersRepository.create({ name: 'profile use case', email: 'profile@useCase', password: '1234' })

    const userFound = await showUserProfileUseCase.execute(user.id!);

    expect(userFound).toEqual(user);
  });
})