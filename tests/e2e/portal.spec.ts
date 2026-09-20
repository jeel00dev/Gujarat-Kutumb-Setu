import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdir} from 'node:fs/promises';

test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('kutumb-locale','en'));});

test('public homepage, mobile layout, same-origin assets and accessible navigation',async({page},info)=>{
 const errors:string[]=[];const external:string[]=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(!request.url().startsWith(info.project.use.baseURL as string||'http://127.0.0.1:8095')&&!request.url().startsWith('data:'))external.push(request.url());});
 await page.goto('/');await expect(page.getByRole('heading',{level:1})).toBeVisible();
 await expect(page.getByRole('link',{name:/Apply for Family ID/}).first()).toBeVisible();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);expect(overflow).toBe(false);
 await mkdir('docs/test-results/screenshots',{recursive:true});
 await page.screenshot({path:`docs/test-results/screenshots/home-${info.project.name}.png`,fullPage:true});
 expect(errors).toEqual([]);expect(external).toEqual([]);
 const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 expect(audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
});

test('Gujarati and English preserve the task and expose meaningful guidance',async({page})=>{
 await page.goto('/services');await expect(page.getByRole('heading',{name:'Family services',level:1,exact:true})).toBeVisible();
 await page.getByRole('button',{name:/ગુજરાતી/}).click();await expect(page.locator('html')).toHaveAttribute('lang','gu');
 await expect(page.getByRole('heading',{name:'પરિવાર સેવાઓ',level:1,exact:true})).toBeVisible();
 await page.getByRole('button',{name:/English/}).click();await expect(page.locator('html')).toHaveAttribute('lang','en');
 await page.goto('/schemes');await expect(page.getByRole('heading',{level:1})).toBeVisible();
 await expect(page.locator('.scheme-card').first()).toBeVisible();
});

test('resident OTP login, family record, benefit history and logout',async({page},info)=>{
 const accounts=await page.request.get('/api/v1/auth/demo-accounts');const fixtures=await accounts.json();const resident=fixtures.items.find((x:{email:string})=>x.email==='resident@demo.local');
 await page.goto('/sign-in');
 await page.getByLabel(/Family ID|registered mobile/i).first().fill(info.project.name.startsWith('mobile')?resident.family_id:resident.mobile);
 await page.getByRole('button',{name:/Get verification code/i}).click();
 await page.getByLabel(/One.time code/i).first().fill('123456');
 await page.getByRole('button',{name:/Verify.*continue|Verify.*sign|Verify OTP/i}).first().click();
 await expect(page).toHaveURL(/\/my/);await expect(page.getByRole('heading',{level:1})).toBeVisible();
 await page.goto('/my/family');await expect(page.getByText(/GKS-/).first()).toBeVisible();
 await page.screenshot({path:`docs/test-results/screenshots/family-${info.project.name}.png`,fullPage:true});
 await page.goto('/my/benefits');await expect(page.getByRole('heading',{level:1})).toBeVisible();
 await page.getByRole('button',{name:/Sign out/i}).click();
 await expect(page).toHaveURL(/sign-in/);await page.goto('/my/family');await expect(page).toHaveURL(/sign-in/);
});

test('resident signup and saved enrollment draft through the actual form',async({page},info)=>{
 const phone='9'+String(Date.now()).slice(-9);await page.goto('/sign-in');
 const register=page.getByRole('button',{name:/Create an account/i});
 if(await register.count())await register.first().click();
 else await page.getByRole('link',{name:/New registration|Create account|Register/i}).first().click();
 await page.getByLabel(/Full name|Your name|Name/i).first().fill('Browser Test Resident');
 await page.getByLabel(/mobile/i).first().fill(phone);await page.getByRole('button',{name:/Get verification code/i}).click();
 await page.getByLabel(/One.time code/i).first().fill('123456');await page.getByRole('button',{name:/Verify.*continue/i}).click();
 await page.goto('/apply/start');await page.getByRole('radio',{name:/No ration card/i}).check();
 const start=page.getByRole('button',{name:/Start application|Continue|Start registration/i});if(await start.count())await start.first().click();
 await expect(page).toHaveURL(/apply\//);await page.screenshot({path:`docs/test-results/screenshots/enrollment-${info.project.name}.png`,fullPage:true});
 await expect(page.getByRole('heading',{level:1})).toBeVisible();
 await page.getByLabel('Contact mobile',{exact:false}).fill(phone);
 await page.getByRole('button',{name:'Save and continue',exact:true}).click();
 await page.getByLabel('Address line',{exact:false}).fill('42 Synthetic Browser Test Lane');
 await page.getByLabel('Village / ward / locality',{exact:false}).fill('Synthetic Ward');
 await page.getByLabel('Taluka / urban body',{exact:false}).fill('Ahmedabad City');
 await page.getByLabel('District',{exact:false}).selectOption('Ahmedabad');
 await page.getByLabel('PIN code',{exact:false}).fill('380009');
 await page.getByRole('button',{name:'Save and continue',exact:true}).click();
 await page.getByLabel('Date of birth',{exact:false}).fill('1994-07-15');
 await page.getByRole('button',{name:'Save and continue',exact:true}).click();
 await page.reload();
 await expect(page.getByRole('heading',{name:/Supporting|Evidence|Documents/i}).first()).toBeVisible();
 const saved=await page.request.get('/api/v1/applications/'+page.url().split('/').pop());
 expect(saved.ok()).toBe(true);expect((await saved.json()).payload.address.address_line).toBe('42 Synthetic Browser Test Lane');
 await page.getByRole('button',{name:'Save and continue',exact:true}).click();
 await page.getByRole('checkbox').nth(0).check();await page.getByRole('checkbox').nth(1).check();
 await page.getByRole('button',{name:'Submit application',exact:true}).click();
 await expect(page).toHaveURL(/\/receipt$/);
 await expect(page.getByRole('heading',{name:'Application acknowledgement',exact:true})).toBeVisible();
 await page.screenshot({path:`docs/test-results/screenshots/receipt-${info.project.name}.png`,fullPage:true});
});

test('keyboard skip link, public policy and unknown routes remain usable',async({page})=>{
 await page.goto('/');await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to main content'})).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.locator('#main')).toBeFocused();
 await page.goto('/accessibility');await expect(page.getByRole('heading',{level:1})).toBeVisible();
 await page.goto('/policies/privacy');await expect(page.getByRole('heading',{level:1})).toBeVisible();
 await page.goto('/this-page-does-not-exist');await expect(page.getByRole('heading',{level:1})).toBeVisible();
});
