import { InMemoryStatementsRepository } from "../../modules/statements/repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementError } from "../../modules/statements/useCases/createStatement/CreateStatementError";
import { CreateStatementUseCase } from "../../modules/statements/useCases/createStatement/CreateStatementUseCase";
import { GetBalanceError } from "../../modules/statements/useCases/getBalance/GetBalanceError";
import { GetBalanceUseCase } from "../../modules/statements/useCases/getBalance/GetBalanceUseCase";
import { GetStatementOperationError } from "../../modules/statements/useCases/getStatementOperation/GetStatementOperationError";
import { GetStatementOperationUseCase } from "../../modules/statements/useCases/getStatementOperation/GetStatementOperationUseCase";
import { InMemoryUsersRepository } from "../../modules/users/repositories/in-memory/InMemoryUsersRepository";


const statementsRepository = new InMemoryStatementsRepository();
const usersRepository = new InMemoryUsersRepository();
const createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
const getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);
const getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository);

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('CreateStatementUseCase', () => {
  it('should be able to create', async () => {
    const user = await usersRepository.create({ name: 'test', email: 'test@test', password: '1234' });

    const statement = await createStatementUseCase.execute({ user_id: user.id!, type: OperationType.DEPOSIT, amount: 300, description: 'test' })
    const statementFound = await statementsRepository.findStatementOperation({
      statement_id: statement.id!,
      user_id: user.id!
    });

    expect(statement).toEqual(statementFound);
  })

  it('should fail for user not found', async () => {
    expect(async () => {
      await createStatementUseCase.execute({ user_id: '1111', type: OperationType.WITHDRAW, amount: 1000, description: 'should fail' });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  })

  it('should fail for insufficient funds', async () => {
    const user = await usersRepository.create({ name: 'test', email: 'test@test', password: '1234' });

    expect(async () => {
      await createStatementUseCase.execute({ user_id: user.id!, type: OperationType.WITHDRAW, amount: 1000, description: 'should fail' });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  })
})

describe('GetBalanceUseCase', () => {
  it('should return your account balance', async () => {
    const user = await usersRepository.create({ name: 'test', email: 'test@test', password: '1234' });

    await statementsRepository.create({ amount: 300, description: '', type: OperationType.DEPOSIT, user_id: user.id! })

    const balance = await getBalanceUseCase.execute({ user_id: user.id! });

    expect(balance.balance).toEqual(300);
  });

  it('should fail for missing user', () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: '11' });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
})

describe('GetStatementOperationUseCase', () => {
  it('should be able to return the operation', async () => {
    const user = await usersRepository.create({ name: 'test', email: 'test@test', password: '1234' });

    const statement = await statementsRepository.create({ amount: 300, description: '', type: OperationType.DEPOSIT, user_id: user.id! })

    const operation = await getStatementOperationUseCase.execute({ user_id: user.id!, statement_id: statement.id! });

    expect(operation).toEqual(statement);
  });

  it('should fail for user not found', async () => {
    const user = await usersRepository.create({ name: 'test', email: 'test@test', password: '1234' });
    const statement = await statementsRepository.create({ amount: 300, description: '', type: OperationType.DEPOSIT, user_id: user.id! })

    expect(async () => {
      await getStatementOperationUseCase.execute({ user_id: '11', statement_id: statement.id! });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('should fail for statement not found', async () => {
    const user = await usersRepository.create({ name: 'test', email: 'test@test', password: '1234' });
    const statement = await statementsRepository.create({ amount: 300, description: '', type: OperationType.DEPOSIT, user_id: user.id! })

    expect(async () => {
      await getStatementOperationUseCase.execute({ user_id: user.id!, statement_id: '11' });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
})
