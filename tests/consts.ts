export const getUseMocks = () => process.env.USE_MOCKS === 'true';

export const mockedToken = 'mocked-token';
export const wrongPass = 'wrongpass';
export const wrongEmail = 'wrong@posdemo.pl';

export const linkLogin = '/auth/login';
export const linkProductsRemote = '/products/remote';
export const linkProductsLocal = '/products/local';
export const linkProductsSync = '/products/sync';
export const linkOrders = '/orders';

export const correctPassword = 'test1234'; // schema.sql
export const correctEmail = 'anna@posdemo.pl'; // schema.sql

export const error = 'Database query error:';
export const user = 'Users in the database:';

export const SELECT_USERS = 'SELECT * FROM users';
export const DELETE_USER = `DELETE FROM users WHERE email = $1`;
export const INSERT_USER = `
        INSERT INTO users (email, password)
        VALUES ($1, $2)
        ON CONFLICT (email) DO NOTHING
      `;
