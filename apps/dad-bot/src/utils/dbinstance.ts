import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import {
  InsertSetting,
  InsertTask,
  Message,
  Setting,
  Task,
  messages,
  settings,
  tasks,
} from '../db/schema';
import { eq, or } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const sqlite = new Database('daddevbot.db', { fileMustExist: true });
const db: BetterSQLite3Database = drizzle(sqlite);

migrate(db, { migrationsFolder: 'migrations' });

export function getAllSettings(): Setting[] {
  return db.select().from(settings).all();
}

export function getAllMessages(): Message[] {
  return db.select().from(messages).all();
}

export function getAllTasks(): Task[] {
  return db.select().from(tasks).all();
}

export function getSettingByName(
  name: NonNullable<Setting['name']>
): Setting['value'] {
  return db.select().from(settings).where(eq(settings.name, name)).get()?.value;
}

export function getMessageByName(name: NonNullable<Message['name']>): Message {
  return db.select().from(messages).where(eq(messages.name, name)).get();
}

export function getTasksByUser(
  username: NonNullable<Task['username']>
): Task[] {
  return db.select().from(tasks).where(eq(tasks.username, username)).all();
}

export function insertSetting(setting: InsertSetting) {
  if (!setting.name || !setting.value) return;

  const resp = db
    .update(settings)
    .set({ ...setting })
    .where(eq(settings.name, setting.name))
    .run();

  if (resp.changes === 0) {
    return db.insert(settings).values(setting).run();
  }

  return resp;
}

export function insertTask(task: InsertTask) {
  if (!task.task || !task.username) return;

  const resp = db
    .update(tasks)
    .set({ ...task })
    .where(eq(tasks.id, task.id))
    .run();

  if (resp.changes === 0) {
    return db.insert(tasks).values(task).run();
  }

  return resp;
}

export function deleteSetting(name: NonNullable<Setting['name']>) {
  return db.delete(settings).where(eq(settings.name, name)).run();
}

export function deleteTask(taskId: NonNullable<Task['id']>) {
  return db.delete(tasks).where(eq(tasks.id, taskId)).run();
}
