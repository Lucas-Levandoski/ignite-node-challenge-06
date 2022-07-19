import { InMemoryStatementsRepository } from "../modules/statements/repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementError } from "../modules/statements/useCases/createStatement/CreateStatementError";
import { CreateStatementUseCase } from "../modules/statements/useCases/createStatement/CreateStatementUseCase";
import { InMemoryUsersRepository } from "../modules/users/repositories/in-memory/InMemoryUsersRepository";


const statementsRepository = new InMemoryStatementsRepository();
const usersRepository = new InMemoryUsersRepository();
const createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);

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