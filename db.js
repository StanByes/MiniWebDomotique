import Database from 'better-sqlite3';

const openDb = () => {
  const db = new Database("./database.db", {verbose: console.log});

  db.pragma("journal_mode = WAL");
  db.exec("CREATE TABLE IF NOT EXISTS logs(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, type VARCHAR(100), time TIMESTAMP)");

  return db;
};

const exec = (callback) => {
  const openedDb = openDb();
  const res = callback(openedDb);
  openedDb.close();

  return res;
};

export const getLogs = () => {
  return exec((db) => {
    const stmt = db.prepare("SELECT * FROM logs");
    return stmt.all();
  });
};

export const insertLog = (log) => {
  return exec((db) => {
    const stmt = db.prepare("INSERT INTO logs(type, time) VALUES (?, ?)");
    const res = stmt.run(log.type, log.time);
    return res.lastInsertRowid;
  });
};
