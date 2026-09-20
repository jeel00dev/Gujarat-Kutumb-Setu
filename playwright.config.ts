import {defineConfig,devices} from '@playwright/test';
import {existsSync} from 'node:fs';
import {homedir} from 'node:os';
const cached=homedir()+'/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
export default defineConfig({
 testDir:'./tests/e2e',fullyParallel:false,workers:1,retries:0,timeout:45000,
 expect:{timeout:10000},
 reporter:[['list'],['html',{open:'never'}],['json',{outputFile:'docs/test-results/browser-results.json'}]],
 use:{baseURL:process.env.BASE_URL||'http://127.0.0.1:8095',trace:'retain-on-failure',screenshot:'only-on-failure',launchOptions:{executablePath:process.env.CHROMIUM_PATH||(existsSync(cached)?cached:undefined)}},
 projects:[{name:'desktop-chromium',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:1000}}},{name:'mobile-chromium',use:{...devices['Pixel 7'],defaultBrowserType:'chromium'}}]
});
