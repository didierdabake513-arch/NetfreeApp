import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

let db = null;

const LocalDatabase = {
  async init() {
    if (db) return;
    db = await SQLite.openDatabase({ name: 'netfree.db', location: 'default' });

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        email TEXT,
        phone TEXT,
        mb_left REAL DEFAULT 0,
        daily_limit REAL DEFAULT 300,
        ads_watched INTEGER DEFAULT 0,
        esim_active INTEGER DEFAULT 0,
        esim_iccid TEXT,
        last_reset TEXT
      )
    `);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS ad_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        mb_granted REAL,
        brand TEXT,
        viewed_at TEXT
      )
    `);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS daily_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        date TEXT,
        mb_used REAL DEFAULT 0,
        ads_count INTEGER DEFAULT 0
      )
    `);
  },

  // ── USER ─────────────────────────────────────────────────

  async saveUser(user) {
    await db.executeSql(
      `INSERT OR REPLACE INTO user
        (id, email, phone, mb_left, daily_limit, ads_watched, esim_active, last_reset)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, user.email, user.phone, user.mb_left,
       user.daily_limit, user.ads_watched, user.esim_active, user.last_reset]
    );
  },

  async getUser(userId) {
    const [result] = await db.executeSql(
      'SELECT * FROM user WHERE id = ?', [userId]
    );
    return result.rows.length > 0 ? result.rows.item(0) : null;
  },

  async updateMbLeft(userId, mbLeft) {
    await db.executeSql(
      'UPDATE user SET mb_left = ? WHERE id = ?', [mbLeft, userId]
    );
  },

  async updateAdsWatched(userId, count) {
    await db.executeSql(
      'UPDATE user SET ads_watched = ? WHERE id = ?', [count, userId]
    );
  },

  async resetDaily(userId) {
    const today = new Date().toISOString().substring(0, 10);
    await db.executeSql(
      'UPDATE user SET mb_left = 0, ads_watched = 0, last_reset = ? WHERE id = ?',
      [today, userId]
    );
  },

  // ── AD VIEWS ─────────────────────────────────────────────

  async saveAdView({ userId, mbGranted, brand }) {
    const now = new Date().toISOString();
    await db.executeSql(
      'INSERT INTO ad_views (user_id, mb_granted, brand, viewed_at) VALUES (?, ?, ?, ?)',
      [userId, mbGranted, brand, now]
    );
  },

  async getAdHistory(userId) {
    const [result] = await db.executeSql(
      'SELECT * FROM ad_views WHERE user_id = ? ORDER BY viewed_at DESC LIMIT 50',
      [userId]
    );
    const rows = [];
    for (let i = 0; i < result.rows.length; i++) {
      rows.push(result.rows.item(i));
    }
    return rows;
  },

  // ── DAILY USAGE ──────────────────────────────────────────

  async recordDailyUsage({ userId, mbUsed, adsCount }) {
    const today = new Date().toISOString().substring(0, 10);
    const [existing] = await db.executeSql(
      'SELECT * FROM daily_usage WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    if (existing.rows.length === 0) {
      await db.executeSql(
        'INSERT INTO daily_usage (user_id, date, mb_used, ads_count) VALUES (?, ?, ?, ?)',
        [userId, today, mbUsed, adsCount]
      );
    } else {
      await db.executeSql(
        'UPDATE daily_usage SET mb_used = ?, ads_count = ? WHERE user_id = ? AND date = ?',
        [mbUsed, adsCount, userId, today]
      );
    }
  },

  async getWeeklyUsage(userId) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString().substring(0, 10);
    const [result] = await db.executeSql(
      'SELECT * FROM daily_usage WHERE user_id = ? AND date >= ? ORDER BY date ASC',
      [userId, sevenDaysAgo]
    );
    const rows = [];
    for (let i = 0; i < result.rows.length; i++) {
      rows.push(result.rows.item(i));
    }
    return rows;
  },
};

export default LocalDatabase;
