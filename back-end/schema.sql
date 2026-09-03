CREATE TABLE IF NOT EXISTS users (
    userid INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    passwordhash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'authenticated_user'
        CHECK (role IN ('authenticated_user', 'admin_user')),
    createdat TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game (
    gameid INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    releaseyear INTEGER NOT NULL
        CHECK (releaseyear BETWEEN 1950 AND 2100),
    coverurl VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    achievementcount INTEGER NOT NULL DEFAULT 0
        CHECK (achievementcount >= 0)
);

CREATE TABLE IF NOT EXISTS users_game (
    usergameid INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fuserid INTEGER NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
    fgameid INTEGER NOT NULL REFERENCES game(gameid) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'Plan_to_play'
        CHECK (status IN ('Plan_to_play', 'Playing', 'Completed', 'On_hold', 'Dropped')),
    playtimehours NUMERIC(8, 2) NOT NULL DEFAULT 0
        CHECK (playtimehours >= 0),
    obtainedachievements INTEGER NOT NULL DEFAULT 0
        CHECK (obtainedachievements >= 0),
    UNIQUE (fuserid, fgameid)
);

CREATE TABLE IF NOT EXISTS pending_game (
    pendinggameid SERIAL PRIMARY KEY,
    fuserid INTEGER NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    releaseyear INTEGER NOT NULL
        CHECK (releaseyear BETWEEN 1950 AND 2100),
    status VARCHAR(20) NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    reviewedat TIMESTAMPTZ,
    rejectionreason TEXT
);

-- Sample catalog data 
INSERT INTO game (title, genre, platform, releaseyear, coverurl, description, achievementcount)
SELECT * FROM (VALUES
    ('The Legend of Zelda: Breath of the Wild', 'Action-Adventure', 'Switch', 2017,
     'https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg',
     'Explore Hyrule in an open-world adventure.', 76),
    ('Hades', 'Roguelike', 'PC', 2020,
     'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/library_600x900_2x.jpg',
     'Battle out of the underworld in this rogue-like dungeon crawler.', 49),
    ('Elden Ring', 'Action RPG', 'PC', 2022,
     'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900_2x.jpg',
     'A vast fantasy world created by FromSoftware and George R. R. Martin.', 42),
    ('Stardew Valley', 'Simulation', 'PC', 2016,
     'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/library_600x900_2x.jpg',
     'Build your farm and become part of Pelican Town.', 44),
    ('Celeste', 'Platformer', 'Switch', 2018,
     'https://cdn.cloudflare.steamstatic.com/steam/apps/504230/library_600x900_2x.jpg',
     'Help Madeline survive her journey to the top of Celeste Mountain.', 30)
) AS seed(title, genre, platform, releaseyear, coverurl, description, achievementcount)
WHERE NOT EXISTS (SELECT 1 FROM game LIMIT 1);