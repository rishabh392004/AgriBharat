#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/0b661f95651561bbeee3c1647d21d3e6b614a872a9e8d68bc876a4f59b29dd36/contract';
import endContract from '../../snapshots/0b661f95651561bbeee3c1647d21d3e6b614a872a9e8d68bc876a4f59b29dd36/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/0dea0b671eaf4c9a638e07849be66695a9ed68c0c748bf2b58435d93ffa804d2/contract';
import startContract from '../../snapshots/0dea0b671eaf4c9a638e07849be66695a9ed68c0c748bf2b58435d93ffa804d2/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'diseaseResult',
        columns: [
          col('actions', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('confidence', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('disease', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('etlStatus', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('flagOfficerReview', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('foliarDamagePercent', 'float8', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/float8@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('precautions', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('provider', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('scanId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('severity', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('top3Predictions', 'text', {
            notNull: true,
            default: lit('[]'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('urgency', 'text', {
            notNull: true,
            default: lit('LOW'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('weatherContext', 'text', {
            notNull: true,
            default: lit('{}'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'message',
        columns: [
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('fromUserId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isRead', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('toUserId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'officerProfile',
        columns: [
          col('badgeNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('department', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('designation', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('district', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('flaggedScansCount', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('jurisdiction', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('officeAddress', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('state', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'scan',
        column: col('cropName', 'text', {
          notNull: true,
          default: lit('Auto'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'scan',
        column: col('latitude', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'scan',
        column: col('longitude', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'diseaseResult',
        constraint: 'diseaseResult_scanId_key',
        columns: ['scanId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'officerProfile',
        constraint: 'officerProfile_userId_key',
        columns: ['userId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'officerProfile',
        constraint: 'officerProfile_badgeNumber_key',
        columns: ['badgeNumber'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'message',
        index: 'message_fromUserId_idx_9c2ca0ee',
        columns: ['fromUserId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'message',
        index: 'message_toUserId_idx_397e108f',
        columns: ['toUserId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'diseaseResult',
        foreignKey: {
          name: 'diseaseResult_scanId_fkey',
          columns: ['scanId'],
          references: { schema: 'public', table: 'scan', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'message',
        foreignKey: {
          name: 'message_fromUserId_fkey',
          columns: ['fromUserId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'message',
        foreignKey: {
          name: 'message_toUserId_fkey',
          columns: ['toUserId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'officerProfile',
        foreignKey: {
          name: 'officerProfile_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
