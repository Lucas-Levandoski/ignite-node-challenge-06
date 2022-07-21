import { env } from 'process';
import { createConnection, getConnectionOptions } from 'typeorm';

(
  async () => {
    const defaultOptions = await getConnectionOptions();

    const nodeEnv = JSON.stringify(env.NODE_ENV).trim();
    const testEnv = JSON.stringify('INTEGRATION_TEST');

    return await createConnection(
      Object.assign(defaultOptions, {
        database: nodeEnv === testEnv
          ? 'integration_tests'
          : defaultOptions.database
      })
    )
  }
)();
