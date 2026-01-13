CREATE EXTENSION IF NOT EXISTS "pgcrypto";

create table users(
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	full_name TEXT NOT NULL,
	email TEXT UNIQUE NOT NULL,
	password TEXT,
    otp CHAR(6),
    otp_created_at TIMESTAMP,
    otp_expires_at TIMESTAMP,
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

CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,
    description TEXT NOT NULL,

    difficulty TEXT NOT NULL
        CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE problem_languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    problem_id UUID NOT NULL
        REFERENCES problems(id)
        ON DELETE CASCADE,

    language TEXT NOT NULL
        CHECK (language IN ('JAVA', 'PYTHON', 'CPP', 'JS')),

    boilerplate_code TEXT NOT NULL,
    test_runner_template TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (problem_id, language)
);

CREATE TABLE test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    problem_id UUID NOT NULL
        REFERENCES problems(id)
        ON DELETE CASCADE,

    input TEXT NOT NULL,
    output TEXT NOT NULL,

    visibility TEXT NOT NULL
        CHECK (visibility IN ('SAMPLE', 'HIDDEN')),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE problem_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    problem_id UUID NOT NULL
        REFERENCES problems(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    language TEXT NOT NULL
        CHECK (language IN ('JAVA', 'PYTHON', 'CPP', 'JS')),

    code TEXT NOT NULL,

    status TEXT NOT NULL
        CHECK (
            status IN (
                'ACCEPTED',
                'REJECTED',
                'ERROR',
                'TIME_LIMIT_EXCEEDED'
            )
        ),

    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);