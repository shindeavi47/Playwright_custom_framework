import { chromium as playwrightChromium } from 'playwright';
import { standaloneTrace } from '../playwright.config.js';
import { mkdirSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const scriptName = process.argv[1]
  ? basename(process.argv[1], extname(process.argv[1]))
  : 'standalone';

async function launchTrackedBrowser(browserType, options) {
  const browser = await browserType.launch(options);

  if (standaloneTrace.mode !== 'on') {
    return browser;
  }

  const traceDirectory = join(projectRoot, 'test-results', 'traces');
  mkdirSync(traceDirectory, { recursive: true });

  const contexts = new Set();
  const originalNewContext = browser.newContext.bind(browser);
  const originalClose = browser.close.bind(browser);

  browser.newContext = async (contextOptions) => {
    const context = await originalNewContext(contextOptions);
    contexts.add(context);

    await context.tracing.start({
      screenshots: standaloneTrace.screenshots,
      snapshots: standaloneTrace.snapshots,
      sources: standaloneTrace.sources,
    });

    return context;
  };

  browser.newPage = async (contextOptions) => {
    const context = await browser.newContext(contextOptions);
    return context.newPage();
  };

  browser.close = async (options) => {
    for (const context of contexts) {
      await context.tracing.stop({
        path: join(traceDirectory, `${scriptName}.trace.zip`),
      });
    }
    contexts.clear();
    await originalClose(options);
  };

  return browser;
}

export const chromium = {
  ...playwrightChromium,
  launch: (options) => launchTrackedBrowser(playwrightChromium, options),
};
