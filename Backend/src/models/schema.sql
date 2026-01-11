CREATE EXTENSION IF NOT EXISTS "pgcrypto";

create table users(
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	full_name TEXT NOT NULL,
	email TEXT UNIQUE NOT NULL,
	password TEXT NOT NULL,
	role TEXT NOT NULL CHECK (role IN ('USER','ADMIN')),
	image_url TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    code TEXT NOT NULL,
    status TEXT NOT NULL CHECK (
        status IN ('PENDING', 'RUNNING', 'EXECUTED', 'ERROR', 'TIMEOUT')
    ),
    output TEXT,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

