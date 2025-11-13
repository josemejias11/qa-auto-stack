#!/usr/bin/env tsx
/**
 * Convert Newman JSON summary into Allure results so API smoke tests appear in unified report.
 * Minimal mapping: each request becomes a test case in a single suite "API Smoke".
 *
 * Input: reports/api/newman-results.json (from --reporter-json-export)
 * Output: one container + test result files under reports/allure-results
 */
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

type Assertion = { assertion: string; error?: { message?: string } };
interface ExecutionLike {
  item?: { name?: string };
  response?: { code?: number; status?: string };
  assertions?: Assertion[];
  assertion?: Assertion[]; // some shapes may differ
}

async function main() {
  const jsonPath = path.resolve('reports/api/newman-results.json');
  try {
    const raw = await fs.readFile(jsonPath, 'utf-8');
    const data = JSON.parse(raw);
    const collectionName: string = data.collection?.info?.name || 'API Smoke';
    const executions: ExecutionLike[] = data.run?.executions || [];

    const allureDir = path.resolve('reports/allure-results');
    await fs.mkdir(allureDir, { recursive: true });

    // Cleanup legacy lowercase 'postman' artifacts so only capitalized 'Postman' folder shows.
    try {
      const existing = await fs.readdir(allureDir);
      let removed = 0;
      await Promise.all(
        existing
          .filter((f) => f.endsWith('.json'))
          .map(async (f) => {
            const p = path.join(allureDir, f);
            try {
              const content = await fs.readFile(p, 'utf-8');
              // Match exact lowercase marker; avoid removing already corrected 'Postman'.
              if (content.includes('"postman"') && !content.includes('"Postman"')) {
                await fs.unlink(p);
                removed++;
              }
            } catch (_e) {
              /* ignore per-file errors */
            }
          })
      );
      if (removed > 0) {
        console.log(`Removed ${removed} legacy lowercase postman Allure artifact(s).`);
      }
    } catch {
      // ignore directory read errors
    }

    const containerUuid = randomUUID();
    const testUuids: string[] = [];

    for (const exec of executions) {
      const name = exec.item?.name || 'Request';
      const code = exec.response?.code;
      const status = exec.response?.status;
      const testUuid = randomUUID();
      testUuids.push(testUuid);

      // Determine status: failing only if any assertion failed.
      // Newman JSON has assertions inside exec.assertions (Postman v10) or we can re-check in events.
      const assertions: Assertion[] = (exec.assertions || exec.assertion || []) as Assertion[];
      const failed = assertions.some((a) => !!a.error);

      const steps = assertions.map((a) => ({
        name: a.assertion,
        status: a.error ? 'failed' : 'passed',
        stage: 'finished',
        start: Date.now(),
        stop: Date.now(),
      }));

      const result = {
        uuid: testUuid,
        name: name,
        fullName: `API Smoke: ${name}`,
        labels: [
          { name: 'parentSuite', value: 'Postman' },
          { name: 'suite', value: 'API Smoke' },
          { name: 'framework', value: 'newman' },
          { name: 'language', value: 'javascript' },
          { name: 'epic', value: 'Postman' },
          { name: 'feature', value: collectionName },
        ],
        status: failed ? 'failed' : 'passed',
        stage: 'finished',
        steps,
        parameters: [
          { name: 'code', value: String(code) },
          { name: 'status', value: String(status) },
        ],
        start: Date.now(),
        stop: Date.now(),
      };

      await fs.writeFile(
        path.join(allureDir, `${testUuid}-result.json`),
        JSON.stringify(result, null, 2),
        'utf-8'
      );
    }

    const container = {
      uuid: containerUuid,
      name: 'Postman',
      children: testUuids,
      start: Date.now(),
      stop: Date.now(),
    };
    await fs.writeFile(
      path.join(allureDir, `${containerUuid}-container.json`),
      JSON.stringify(container, null, 2),
      'utf-8'
    );

    console.log(`Converted ${testUuids.length} Newman executions into Allure results.`);
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === 'ENOENT') {
      console.warn('Newman JSON results not found; skipping Allure conversion.');
      return;
    }
    console.error('Failed to convert Newman results to Allure:', e.message);
    process.exitCode = 1;
  }
}

main();
