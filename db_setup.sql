-- Table for user roles
CREATE TYPE user_role AS ENUM ('manager', 'cashier');

-- Table to store user information
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- You will need to hash a password and insert it.
-- For example, to insert a manager user with password 'adminpass'
-- and a cashier with password 'cashierpass'
-- You would first generate the hash using a script.