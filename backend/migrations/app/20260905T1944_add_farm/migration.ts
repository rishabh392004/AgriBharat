#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/aaee25f7415688fd9e9ae96ab6001b76c2c97f74e725388691e44edc739f85bc/contract';
import endContract from '../../snapshots/aaee25f7415688fd9e9ae96ab6001b76c2c97f74e725388691e44edc739f85bc/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/da854799a25e779176993deefb4be7337b0e13130cdb1f3604f4b26eeb650099/contract';
import startContract from '../../snapshots/da854799a25e779176993deefb4be7337b0e13130cdb1f3604f4b26eeb650099/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'farm',
        columns: [
          col('area', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('cropType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('location', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'farm',
        index: 'farm_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'farm',
        foreignKey: {
          name: 'farm_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
