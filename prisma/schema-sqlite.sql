-- SQLite schema for Club Connect
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  emailVerified TIMESTAMP,
  image TEXT,
  password TEXT,
  role TEXT NOT NULL DEFAULT 'STUDENT',
  studentId TEXT UNIQUE,
  department TEXT,
  semester TEXT,
  phone TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS clubs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  department TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  logoUrl TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  advisor TEXT,
  foundedYear INTEGER,
  vision TEXT,
  mission TEXT,
  activities TEXT,
  leaderId TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL,
  FOREIGN KEY (leaderId) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  clubId TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  role TEXT DEFAULT 'Member',
  joinedAt TIMESTAMP,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (clubId) REFERENCES clubs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  venue TEXT,
  location TEXT,
  startDate TIMESTAMP,
  endDate TIMESTAMP,
  capacity INTEGER,
  price REAL,
  isPublic BOOLEAN DEFAULT 1,
  requirements TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL,
  clubId TEXT NOT NULL,
  FOREIGN KEY (clubId) REFERENCES clubs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_rsvps (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  eventId TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ATTENDING',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS budget_requests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  amount REAL NOT NULL,
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  requestedBy TEXT NOT NULL,
  reviewedBy TEXT,
  clubId TEXT NOT NULL,
  requestedAt TIMESTAMP,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL,
  FOREIGN KEY (requestedBy) REFERENCES users(id),
  FOREIGN KEY (clubId) REFERENCES clubs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  recipients TEXT NOT NULL,
  sentAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX memberships_userId_clubId_key ON memberships(userId, clubId);
CREATE UNIQUE INDEX event_rsvps_userId_eventId_key ON event_rsvps(userId, eventId);
