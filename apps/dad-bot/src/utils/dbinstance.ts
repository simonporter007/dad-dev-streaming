import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { InsertSetting, Message, Setting, messages, settings } from '../db/schema';
import { eq } from 'drizzle-orm'
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const sqlite = new Database('daddevbot.db', {fileMustExist: true});
const db: BetterSQLite3Database = drizzle(sqlite);

migrate(db, { migrationsFolder: "migrations" });

export function getAllSettings(): Setting[] {
    return db.select().from(settings).all();
}

export function getAllMessages(): Message[] {
    return db.select().from(messages).all();
}

export function getSettingByName(name: NonNullable<Setting['name']>): Setting['value'] {
    return db.select().from(settings).where(eq(settings.name, name)).get()?.value;
}

export function getMessageByName(name: NonNullable<Message['name']>): Message {
    return db.select().from(messages).where(eq(messages.name, name)).get();
}


export function insertSetting(setting: InsertSetting) {
  if (!setting.name || !setting.value) return

  const resp = db.update(settings)
    .set({ ...setting })
    .where(eq(settings.name, setting.name))
    .run();

  if (resp.changes === 0) {
    return db.insert(settings).values(setting).run()
  }
  
  return resp
}

export function deleteSetting(name: NonNullable<Setting['name']>) {
  return db.delete(settings).where(eq(settings.name, name)).run();
}