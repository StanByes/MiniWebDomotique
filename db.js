import Database from 'better-sqlite3';

// Function which opens the SQLite database and creates the table "logs" if it needs
const openDb = () => {
  const db = new Database("./database.db", {verbose: console.log});

  db.pragma("journal_mode = WAL");
  db.exec("CREATE TABLE IF NOT EXISTS logs(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, type VARCHAR(100), time TIMESTAMP)");

  return db;
};

// General function to execute an action to the database. The function opens the database, call the callback function and close the file to avoid file concurrent reading
const exec = (callback) => {
  const openedDb = openDb();
  const res = callback(openedDb);
  openedDb.close();

  return res;
};

// Model function to get all logs
export const getLogs = () => {
  return exec((db) => {
    const stmt = db.prepare("SELECT * FROM logs");
    return stmt.all();
  });
};

// Model function to insert a new log
export const insertLog = (log) => {
  return exec((db) => {
    const stmt = db.prepare("INSERT INTO logs(type, time) VALUES (?, ?)");
    const res = stmt.run(log.type, log.time);
    return res.lastInsertRowid;
  });
};
