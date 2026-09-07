import{test,expect}from'@playwright/test';

const SUPABASE_CONFIGURED=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const ADMIN_USER=process.env.ADMIN_USERNAME||'luencantosodoya';
const ADMIN_PASSWORD=process.env.ADMIN_TEST_PASSWORD||'';

test('catálogo combina busca, categoria e disponibilidade e permite limpar',async({page})=>{
 await page.goto('/produtos');await expect(page.locator('html[data-hydrated="true"]')).toBeAttached();await expect(page.locator('.product-card').first()).toBeVisible();
 const initialCount=await page.locator('.product-card').count();
 expect(initialCount).toBeGreaterThanOrEqual(1);
 // busca por código conhecido
 await page.getByLabel('Encontre uma peça').fill('LU-006');await expect(page.locator('.product-card')).toHaveCount(1);await expect(page.locator('.product-card')).toContainText('Colar Azul com Cristais');
 await page.getByRole('button',{name:'Limpar filtros',exact:true}).click();await expect(page.locator('.product-card')).toHaveCount(initialCount);
 // categoria Colares - verifica que filtra para subconjunto contendo produto conhecido
 await page.getByRole('combobox',{name:'Categoria',exact:true}).click();await page.getByRole('option',{name:'Colares',exact:true}).click();
 const colaresCount=await page.locator('.product-card').count();
 expect(colaresCount).toBeGreaterThanOrEqual(1);expect(colaresCount).toBeLessThanOrEqual(initialCount);
 await expect(page.locator('.product-card').filter({hasText:'Colar Vermelho e Preto com Flor'})).toBeVisible();
 await expect(page.locator('.product-card').filter({hasText:'Colar Azul com Cristais'})).toBeVisible();
 // combina categoria + disponibilidade Esgotado
 await page.getByRole('combobox',{name:'Disponibilidade',exact:true}).click();await page.getByRole('option',{name:'Esgotado',exact:true}).click();
 await expect(page.locator('.product-card').filter({hasText:'Colar Azul com Cristais'})).toBeVisible();
 expect(await page.locator('.product-card').count()).toBeGreaterThanOrEqual(1);
 // busca inexistente
 await page.getByLabel('Encontre uma peça').fill('inexistente-xyz-999');await expect(page.getByText('Ainda não encontramos')).toBeVisible();await expect(page.locator('.product-card')).toHaveCount(0);
 await page.getByRole('button',{name:'Limpar filtros',exact:true}).click();await expect(page.locator('.product-card')).toHaveCount(initialCount);await expect(page.getByLabel('Encontre uma peça')).toHaveValue('');
});

test('pedido identifica o produto certo e peça esgotada oferece semelhante',async({page})=>{
 await page.goto('/produtos/colar-vermelho-e-preto-com-flor');const link=page.getByRole('link',{name:'Pedir pelo WhatsApp',exact:true});await expect(link).toBeVisible();const href=await link.getAttribute('href');const url=new URL(href!);expect(url.hostname).toBe('wa.me');expect(url.pathname).toBe('/5548991893262');expect(url.searchParams.get('text')).toContain('LU-001 — Colar Vermelho e Preto com Flor');
 await page.goto('/produtos/colar-azul-com-cristais');const similar=page.getByRole('link',{name:'Quero uma peça semelhante',exact:true});await expect(similar).toBeVisible();expect(new URL((await similar.getAttribute('href'))!).searchParams.get('text')).toContain('peça semelhante ao produto LU-006');
});

test('encomenda personalizada monta texto acentuado sem enviar mensagem',async({page})=>{
 await page.goto('/encomendas');await expect(page.locator('html[data-hydrated="true"]')).toBeAttached();await page.getByRole('combobox',{name:'Que tipo de peça você imagina?'}).click();await page.getByRole('option',{name:'Pulseira',exact:true}).click();await page.getByLabel('Quais cores você ama?').fill('Azul e branco');await page.getByLabel('Materiais que tem em mente').fill('Miçangas');await page.getByLabel('Tem algum detalhe especial?').fill('Presente para minha mãe & irmã');
 await page.route('https://wa.me/**',route=>route.fulfill({status:200,body:'Pedido não enviado: teste local.'}));
 const popup=page.waitForEvent('popup');await page.getByRole('button',{name:'Conversar sobre minha encomenda'}).click();const opened=await popup;await opened.close();const href=await page.getByRole('link',{name:'Abrir no WhatsApp'}).getAttribute('href');const text=new URL(href!).searchParams.get('text');expect(text).toContain('Tipo de peça: Pulseira');expect(text).toContain('Cores: Azul e branco');expect(text).toContain('Materiais: Miçangas');expect(text).toContain('Presente para minha mãe & irmã');
});

test('admin exige login real e mostra usuário/senha',async({page})=>{
 test.skip(!SUPABASE_CONFIGURED,'Supabase não configurado no ambiente de teste.');
 await page.goto('/admin');await expect(page.getByLabel('Usuário')).toBeVisible();await expect(page.getByLabel('Senha')).toBeVisible();
 await page.getByLabel('Usuário').fill(ADMIN_USER);await page.getByLabel('Senha').fill('senha-errada-de-teste');
 await page.getByRole('button',{name:'Entrar'}).click();await expect(page.getByRole('alert')).toContainText('Usuário ou senha inválidos');
});

test('admin persiste CRUD com reload e reflete no catálogo',async({page})=>{
 test.skip(!SUPABASE_CONFIGURED||!ADMIN_PASSWORD,'Defina ADMIN_TEST_PASSWORD para o teste de persistência.');
 let nome='';let code='';
 try{
 await page.goto('/admin');await page.getByLabel('Usuário').fill(ADMIN_USER);await page.getByLabel('Senha').fill(ADMIN_PASSWORD);
 await page.getByRole('button',{name:'Entrar'}).click();await expect(page.getByRole('tab',{name:'Produtos'})).toBeVisible({timeout:20000});
 const stamp=Date.now().toString().slice(-6);nome=`Colar persistente ${stamp}`;
 await page.getByRole('tab',{name:'Produtos'}).click();await page.getByRole('button',{name:'Nova peça'}).click();await page.getByLabel('Nome da peça',{exact:true}).fill(nome);
 await page.getByLabel(/Preço/).fill('45.50');await page.getByRole('button',{name:'Salvar e publicar'}).click();
 await expect(page.locator('.admin-product').filter({hasText:nome})).toBeVisible({timeout:20000});
 await page.reload();await expect(page.getByRole('tab',{name:'Produtos'})).toBeVisible({timeout:20000});
 await page.getByRole('tab',{name:'Produtos'}).click();
 await expect(page.locator('.admin-product').filter({hasText:nome})).toBeVisible({timeout:20000});
 await page.goto('/produtos');await expect(page.locator('.product-card').filter({hasText:nome})).toBeVisible({timeout:20000});
 await page.goto('/admin');await expect(page.getByRole('tab',{name:'Produtos'})).toBeVisible({timeout:20000});
 await page.getByRole('tab',{name:'Produtos'}).click();
 const card=page.locator('.admin-product').filter({hasText:nome});code=(await card.first().locator('.small-copy').first().textContent()||'').split('·')[0].trim();
 await page.getByRole('button',{name:`Editar ${code}`,exact:true}).click();await page.getByLabel('Nome da peça',{exact:true}).fill(`${nome} revisado`);
 await page.getByRole('button',{name:'Salvar e publicar'}).click();await expect(page.locator('.admin-product').filter({hasText:`${nome} revisado`})).toBeVisible({timeout:20000});
 nome=`${nome} revisado`;
 await page.getByRole('button',{name:`Excluir ${code}`,exact:true}).click();await page.getByRole('button',{name:'Excluir peça',exact:true}).click();
 await expect(page.locator('.admin-product').filter({hasText:code})).toHaveCount(0,{timeout:20000});
 nome='';code='';
 }finally{
  if(nome||code){
   try{
    await page.goto('/admin');
    await expect(page.getByRole('tab',{name:'Produtos'})).toBeVisible({timeout:15000}).catch(()=>{});
    await page.getByRole('tab',{name:'Produtos'}).click().catch(()=>{});
    const target=nome||code;
    const card=page.locator('.admin-product').filter({hasText:target}).first();
    if(await card.isVisible().catch(()=>false)){
     const c=(await card.locator('.small-copy').first().textContent().catch(()=>'')||'').split('·')[0].trim()||code||target;
     await page.getByRole('button',{name:`Excluir ${c}`,exact:true}).click().catch(()=>{});
     await page.getByRole('button',{name:'Excluir peça',exact:true}).click().catch(()=>{});
     await page.waitForTimeout(1500);
    }else if(code){
     const card2=page.locator('.admin-product').filter({hasText:code}).first();
     if(await card2.isVisible().catch(()=>false)){
      await page.getByRole('button',{name:`Excluir ${code}`,exact:true}).click().catch(()=>{});
      await page.getByRole('button',{name:'Excluir peça',exact:true}).click().catch(()=>{});
     }
    }
   }catch{}
  }
 }
});

test('admin valida código duplicado e atualiza o WhatsApp global',async({page})=>{
 test.skip(!SUPABASE_CONFIGURED||!ADMIN_PASSWORD,'Defina ADMIN_TEST_PASSWORD para o teste de persistência.');
 await page.goto('/admin');await page.getByLabel('Usuário').fill(ADMIN_USER);await page.getByLabel('Senha').fill(ADMIN_PASSWORD);
 await page.getByRole('button',{name:'Entrar'}).click();await expect(page.getByRole('tab',{name:'Produtos'})).toBeVisible({timeout:20000});
 await page.getByRole('tab',{name:'Produtos'}).click();await page.getByRole('button',{name:'Nova peça'}).click();await page.getByLabel('Nome da peça',{exact:true}).fill('Outro colar');
 await page.getByLabel('Código',{exact:true}).fill('LU-001');await page.getByRole('button',{name:'Salvar e publicar'}).click();
 await expect(page.getByRole('alert')).toContainText('Já existe');
 await page.getByRole('button',{name:'Voltar à lista'}).click();await page.getByRole('tab',{name:'Configurações'}).click();
 await page.getByLabel('WhatsApp com país e DDD').fill('5548991893262');await page.getByRole('button',{name:'Salvar contatos'}).click();
 await expect(page.getByRole('link',{name:'Conversar com a Lu pelo WhatsApp'})).toHaveAttribute('href',/wa.me\/5548991893262/);
});

test('admin nova peca permite selecionar fotos e mostra previa antes de salvar',async({page})=>{
 test.skip(!SUPABASE_CONFIGURED||!ADMIN_PASSWORD,'Defina ADMIN_TEST_PASSWORD para o teste de upload/preview.');
 await page.goto('/admin');await page.getByLabel('Usuário').fill(ADMIN_USER);await page.getByLabel('Senha').fill(ADMIN_PASSWORD);
 await page.getByRole('button',{name:'Entrar'}).click();await expect(page.getByRole('tab',{name:'Produtos'})).toBeVisible({timeout:20000});
 await page.getByRole('tab',{name:'Produtos'}).click();await page.getByRole('button',{name:'Nova peça'}).click();
 const input=page.getByTestId('product-image-input');
 await expect(input).toBeVisible({timeout:10000});
 await expect(input).toBeEnabled();
 await expect(input).toHaveAttribute('accept',/image\/png/);
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=','base64');
 await input.setInputFiles([{name:'a.png',mimeType:'image/png',buffer:png},{name:'b.webp',mimeType:'image/webp',buffer:png}]);
 await expect(page.getByAltText('Prévia 1 da peça')).toBeVisible({timeout:10000});
 await expect(page.getByAltText('Prévia 2 da peça')).toBeVisible();
 await expect(page.getByText(/foto\(s\) pendente/)).toBeVisible();
 await page.getByRole('button',{name:'Remover prévia 1'}).click();
 await expect(page.getByAltText('Prévia 2 da peça')).toHaveCount(0);
 await expect(page.getByAltText('Prévia 1 da peça')).toBeVisible();
 const many=Array.from({length:6},(_,i)=>({name:`x${i}.png`,mimeType:'image/png',buffer:png}));
 await input.setInputFiles(many);
 await expect(page.getByRole('alert')).toContainText('6 fotos');
});

for(const width of [375,390,430,768,1024,1280,1440])test(`sem overflow e imagens carregadas em ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});for(const route of ['/','/produtos','/produtos/colar-vermelho-e-preto-com-flor','/encomendas','/sobre','/contato','/admin']){await page.goto(route);await expect(page.locator('h1')).toBeVisible();const dimensions=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,broken:Array.from(document.images).filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src)}));expect(dimensions.scroll,`${route} width=${width}`).toBeLessThanOrEqual(dimensions.width+1);expect(dimensions.broken).toEqual([]);}
 if(width===390){await page.goto('/');await page.getByRole('button',{name:'Abrir menu'}).click();await page.getByRole('navigation',{name:'Navegação principal'}).getByRole('link',{name:'Produtos',exact:true}).click();await expect(page).toHaveURL(/\/produtos$/);await expect(page.getByRole('button',{name:'Abrir menu'})).toBeVisible();}
});
