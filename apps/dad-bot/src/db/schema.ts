import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { InferModel } from 'drizzle-orm';

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(),
  name: text('name'),
  value: text('value'),
})

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey(),
  name: text('name'),
  message: text('message'),
  interval: integer('interval'),
})

export type Setting = InferModel<typeof settings>
export type InsertSetting = InferModel<typeof settings, 'insert'>
export type Message = InferModel<typeof messages>
export type InsertMessage = InferModel<typeof messages, 'insert'>