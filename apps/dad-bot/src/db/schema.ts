import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { InferModel } from 'drizzle-orm';

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(),
  name: text('name'),
  value: text('value'),
});

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey(),
  name: text('name'),
  message: text('message'),
  interval: integer('interval'),
  enabled: integer('enabled', { mode: 'boolean' }),
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  username: text('name'),
  task: text('task'),
  date: integer('date', { mode: 'timestamp_ms' }),
  completed: integer('completed', { mode: 'boolean' }),
  completedAt: integer('completedAt', { mode: 'timestamp_ms' }),
});

export type Setting = InferModel<typeof settings>;
export type InsertSetting = InferModel<typeof settings, 'insert'>;
export type Message = InferModel<typeof messages>;
export type InsertMessage = InferModel<typeof messages, 'insert'>;
export type Task = InferModel<typeof tasks>;
export type InsertTask = InferModel<typeof tasks, 'insert'>;
