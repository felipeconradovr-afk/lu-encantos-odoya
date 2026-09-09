import { test, expect } from '@playwright/test';

test('catálogo real permite buscar por código e limpar filtros', async ({page}) => {
  await page.goto('/produtos');
  await expect(page.locator('.product-card').first()).toBeVisible();
  const count = await page.locator('.product-card').count();
  const code = await page.locator('.product-meta').first().locator('span').last().innerText();
  await page.getByLabel('Encontre uma peça').fill(code);
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.locator('.product-card')).toContainText(code);
  await page.getByRole('button',{name:'Limpar filtros',exact:true}).click();
  await expect(page.locator('.product-card')).toHaveCount(count);
  await page.getByLabel('Encontre uma peça').fill('nao-existe-xyz');
  await expect(page.locator('.product-card')).toHaveCount(0);
  await expect(page.getByText('Ainda não encontramos')).toBeVisible();
});

test('todos os produtos e URLs de fotos do Supabase aparecem no catálogo', async ({page}) => {
  const responsePromise = page.waitForResponse(r => r.url().includes('/rest/v1/products?') && r.status()===200);
  await page.goto('/produtos');
  const rows = await (await responsePromise).json();
  await expect(page.locator('.product-card')).toHaveCount(rows.length);
  for (const row of rows) {
    const card = page.locator('.product-card').filter({has:page.locator('a[href="/produtos/'+row.slug+'"]')});
    await expect(card).toContainText(row.code);
    await expect(card).toContainText(row.name);
    const images = row.images.sort((a:{position:number},b:{position:number})=>a.position-b.position);
    if (images.length) await expect(card.locator('img')).toHaveAttribute('src',new RegExp(images[0].storage_path.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$'));
  }
});

test('produto real mantém dados, fotos e mensagem do WhatsApp', async ({page}) => {
  await page.goto('/produtos');
  await expect(page.locator('.product-card').first()).toBeVisible();
  const card = page.locator('.product-card').first();
  const code = await card.locator('.product-meta span').last().innerText();
  const name = await card.locator('h3').innerText();
  const src = await card.locator('img').getAttribute('src');
  await card.locator('h3 a').click();
  await expect(page.locator('h1')).toHaveText(name);
  await expect(page.locator('.detail-gallery > img')).toHaveAttribute('src',src!);
  const link=page.getByRole('link',{name:'Pedir pelo WhatsApp'});
  await expect(link).toBeVisible();
  expect(new URL((await link.getAttribute('href'))!).searchParams.get('text')).toContain(code);
  await page.reload();
  await expect(page.locator('h1')).toHaveText(name);
  await expect(page.locator('.detail-gallery > img')).toHaveAttribute('src',src!);
});

test('falha do Supabase não mostra produtos demonstrativos', async ({page}) => {
  await page.route('**/rest/v1/products?**',r=>r.fulfill({status:503,contentType:'application/json',body:'{"message":"offline"}'}));
  await page.goto('/produtos');
  await expect(page.locator('output')).toContainText('Não foi possível',{timeout:25000});
  await expect(page.locator('.product-card')).toHaveCount(0);
});

test('home comunica Umbanda e mantém CTAs e imagem institucional', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('heading',{level:1})).toHaveAccessibleName('Fé, axé e identidade em cada detalhe.');
  await expect(page.locator('.identity-copy')).toContainText('Umbanda e ao Candomblé');
  await expect(page.getByRole('link',{name:'Conhecer as peças'})).toHaveAttribute('href','/produtos');
  await expect(page.locator('.hero img')).toHaveJSProperty('naturalWidth',1086);
  await page.screenshot({path:'test-results/home-desktop.png',fullPage:true});
});

test('animações terminam, menu fecha com Escape e redução de movimento funciona', async ({page}) => {
  await page.emulateMedia({reducedMotion:'no-preference'});
  const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('.hero .actions')).toBeVisible();
  await expect(page.locator('.hero .actions a').first()).toHaveCSS('opacity','1',{timeout:15000});
  await page.locator('.identity-section').scrollIntoViewIfNeeded();
  await expect(page.locator('.identity-copy')).toHaveCSS('opacity','1');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.title-line > span').first()).toHaveCSS('transform','none');
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.locator('html[data-hydrated="true"]')).toBeAttached();
  await page.getByRole('button',{name:'Abrir menu'}).click();
  await expect(page.getByRole('navigation',{name:'Navegação principal'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Abrir menu'})).toBeFocused();
  await page.screenshot({path:'test-results/home-mobile.png',fullPage:true});
  expect(errors).toEqual([]);
});

test('cada página de produto real carrega todas as fotos originais',async({page})=>{
  test.setTimeout(90000);
  const responsePromise=page.waitForResponse(r=>r.url().includes('/rest/v1/products?')&&r.status()===200);
  await page.goto('/produtos');
  const rows=await(await responsePromise).json();
  for(const row of rows){
    await page.goto('/produtos/'+row.slug);
    await expect(page.locator('h1')).toHaveText(row.name);
    await expect(page.locator('.detail-copy')).toContainText(row.code);
    const images=row.images.sort((a:{position:number},b:{position:number})=>a.position-b.position);
    for(let i=0;i<images.length;i++){
      if(images.length>1)await page.getByRole('button',{name:'Ver foto '+(i+1),exact:true}).click();
      const img=page.locator('.detail-gallery > img');
      await expect(img).toHaveAttribute('src',new RegExp(images[i].storage_path.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$'));
      await img.scrollIntoViewIfNeeded();
      await expect.poll(()=>img.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
  }
});
