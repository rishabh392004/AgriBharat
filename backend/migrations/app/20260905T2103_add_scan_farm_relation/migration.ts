#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/0dea0b671eaf4c9a638e07849be66695a9ed68c0c748bf2b58435d93ffa804d2/contract';
import endContract from '../../snapshots/0dea0b671eaf4c9a638e07849be66695a9ed68c0c748bf2b58435d93ffa804d2/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/aaee25f7415688fd9e9ae96ab6001b76c2c97f74e725388691e44edc739f85bc/contract';
import startContract from '../../snapshots/aaee25f7415688fd9e9ae96ab6001b76c2c97f74e725388691e44edc739f85bc/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createIndex({
        schema: 'public',
        table: 'scan',
        index: 'scan_farmId_idx_786bd89b',
        columns: ['farmId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'scan',
        foreignKey: {
          name: 'scan_farmId_fkey',
          columns: ['farmId'],
          references: { schema: 'public', table: 'farm', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
