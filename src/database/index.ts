import { env } from 'process';
import { createConnection, getConnectionOptions } from 'typeorm';

(
  async () => {
    const defaultOptions = await getConnectionOptions();

    return await createConnection(
      Object.assign(defaultOptions, {
        database: env.NODE_ENV === 'INTEGRATION_TESTS'
          ? 'integration_tests'
          : defaultOptions.database
      })
    )
  }
)();
