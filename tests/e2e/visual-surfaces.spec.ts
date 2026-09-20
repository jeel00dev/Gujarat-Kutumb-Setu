import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdir} from 'node:fs/promises';

const password='DemoPass@123!';

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('kutumb-locale','en'));
  await mkdir('docs/test-results/screenshots',{recursive:true});
});

async function assertSurface(page:Page,name:string,project:string,a11y=true){
  await expect(page.getByRole('heading',{level:1}).first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1),`${name} has horizontal overflow`).toBe(false);
  await page.screenshot({path:`docs/test-results/screenshots/${name}-${project}.png`,fullPage:true});
  if(a11y){
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  }
}

async function syntheticLogin(page:Page,email:string){
  const response=await page.request.post('/api/v1/auth/login',{data:{email,password}});
  expect(response.status(),await response.text()).toBe(200);
}

test('public service, catalogue and sign-in surfaces are conventional and accessible',async({page},info)=>{
  for(const [path,name] of [['/services','services'],['/schemes','schemes'],['/sign-in','sign-in']] as const){
    await page.goto(path);
    await assertSurface(page,name,info.project.name);
  }
});

test('government accessibility preferences persist without storing service data',async({page},info)=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Increase text size'}).click();
  await page.getByRole('button',{name:'Contrast'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-font-scale','large');
  await expect(page.locator('html')).toHaveClass(/high-contrast/);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-font-scale','large');
  await expect(page.locator('html')).toHaveClass(/high-contrast/);
  const keys=await page.evaluate(()=>Object.keys(localStorage).sort());
  expect(keys).toEqual(['kutumb-contrast','kutumb-font-scale','kutumb-locale']);
  await assertSurface(page,'home-high-contrast-large-text',info.project.name);
});

test('resident workspace surfaces remain usable after the visual redesign',async({page},info)=>{
  await syntheticLogin(page,'resident@demo.local');
  for(const [path,name] of [['/my','resident-dashboard'],['/my/family','resident-family'],['/my/applications','resident-applications'],['/my/payments','resident-payments']] as const){
    await page.goto(path);
    await assertSurface(page,name,info.project.name,path==='/my');
  }
});

test('verifier and administrator workspaces retain dense, readable controls',async({browser,baseURL},info)=>{
  for(const [email,path,name] of [
    ['verifier@demo.local','/staff','verifier-queue'],
    ['admin@demo.local','/admin','admin-dashboard'],
  ] as const){
    const context=await browser.newContext({baseURL,viewport:info.project.name.startsWith('mobile')?{width:412,height:915}:{width:1440,height:1000}});
    await context.addInitScript(()=>localStorage.setItem('kutumb-locale','en'));
    const page=await context.newPage();
    await syntheticLogin(page,email);
    await page.goto(path);
    await assertSurface(page,name,info.project.name);
    await context.close();
  }
});
