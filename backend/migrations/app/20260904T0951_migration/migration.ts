#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/73dab0e45450d07508081e5b657a3cb42697b3b3529ace8c7f6bb280334a8cb1/contract';
import startContract from '../../snapshots/73dab0e45450d07508081e5b657a3cb42697b3b3529ace8c7f6bb280334a8cb1/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/da854799a25e779176993deefb4be7337b0e13130cdb1f3604f4b26eeb650099/contract';
import endContract from '../../snapshots/da854799a25e779176993deefb4be7337b0e13130cdb1f3604f4b26eeb650099/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'scan',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('farmId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('imageUrl', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
