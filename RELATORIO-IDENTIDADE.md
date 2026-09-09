# Lu Encantos Odoyá — atualização de identidade
Data: 09/09/2026.

A identidade visual foi implementada localmente, com foco na Umbanda e referência respeitosa ao Candomblé. A validação completa do admin permanece pendente por ausência de credenciais de teste. Nenhum commit, push ou deploy foi realizado.

## Identidade e animações
- Home com “Fé, axé e identidade em cada detalhe”, CTAs para catálogo e encomendas.
- Seção editorial sobre Umbanda, Candomblé, ancestralidade, Orixás e respeito à expressão individual da fé, sem atribuições espirituais a produtos.
- Nova imagem exclusivamente institucional: água, areia, tecido, concha, contas e linha. WebP, 1086 × 1448, 288.788 bytes.
- Creme/areia, lilás e plum, com azul oceânico discreto. Tipografias existentes preservadas.
- Sobre e encomendas atualizados; conteúdo “Sobre” vindo do banco mantido.
- GSAP Timeline, line reveal e word stagger curto no hero, máscara na imagem, CTAs por último.
- ScrollTrigger com reveal vertical e entrada escalonada de cards, sem repetir ao filtrar a mesma peça.
- Parallax institucional de apenas 16px de percurso, restrito ao desktop.
- Menu mobile com morph, transição suave, fechamento por Escape e retorno do foco.
- Redução de movimento respeitada; conteúdo continua visível se o módulo de animação não carregar.

## Integração e preservação
Produtos continuam vindo de public.products, associados a categories e product_images; fotos continuam no bucket product-images. Consultas de auditoria foram somente SELECT. Nenhuma escrita no Supabase, migração, seed, mudança de RLS, autenticação, usuário, tabela ou bucket foi executada.

Correção técnica no cliente: os produtos demonstrativos locais deixaram de aparecer durante carregamento, falha ou catálogo vazio. Um erro de conexão agora mostra uma mensagem em vez de exibir dados ilustrativos. Campos, ordenação e URLs dos produtos reais foram preservados. Foram removidos avisos institucionais antigos de “demonstração”.

Comparação antes/depois dos 15 produtos originais:
| Conjunto | Quantidade | Impressão MD5 dos registros completos, antes e depois |
|---|---:|---|
| products | 15 | c88d36173f385354d3ed8f2105333b27 |
| product_images | 15 | f4b7a498218b83e1bcb33f13c875312f |
| storage.objects correspondentes | 15 | 7b989803390db1474a25171feb43a54c |

As impressões são idênticas. A comparação abrange os registros de produtos, fotos e metadados do Storage; não é um hash dos bytes das imagens. Os URLs originais e o carregamento das imagens foram também conferidos no navegador. Nenhuma imagem de produto foi substituída.

Durante o trabalho apareceu externamente LU-024 (Bicos decorados), elevando o catálogo a 16 produtos. Este registro não foi criado pelo agente e também foi incluído nos testes de leitura. Os 15 registros originais permaneceram idênticos.

## Resultados exatos
- npm run lint: exit 0, sem erros ou avisos.
- npm run build: exit 0. Build final gerado em .output com Nitro node-server, conforme configuração local preexistente. Avisos não fatais do Vinext/Nitro sobre imports e rastreamento de dependências.
- node --env-file=.env.local node_modules/@playwright/test/cli.js test --reporter=list: exit 0; 16 passed (35.6s), 3 skipped, 0 failed.
- Larguras testadas: 375, 390, 430, 768, 1024, 1280 e 1440px.
- Rotas: home, catálogo, produto individual, encomendas, sobre, contato e admin.
- Cada um dos 16 produtos reais foi aberto individualmente, com conferência de nome, código, URLs e carregamento de todas as fotos.
- Verificados busca, limpeza, vazio, falha de conexão sem dados falsos, reload do produto, WhatsApp e mensagem de encomenda sem envio, navegação, menu/Escape, animação e reduced-motion.
- Login administrativo: formulário e rejeição de senha inválida passaram. Login bem-sucedido não foi validado.

## Pendências que impedem declarar o trabalho totalmente validado
Os 3 testes administrativos dependem de ADMIN_TEST_PASSWORD e de ambiente autorizado para escrita. Não foram realizados criação, edição, exclusão, upload persistente, preview autenticado, persistência após criação nem atualização do catálogo após edição. Nenhum produto real foi usado para testes de escrita. O painel e suas funções de dados não foram alterados.

Há uma proteção explícita nos testes de escrita (ALLOW_ADMIN_TEST_WRITES=true), para evitar alterações acidentais na produção. Não ativar contra produção sem preparar um fluxo de teste seguro e limitado.

## Arquivos de implementação alterados ou adicionados
- [app/page.tsx](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/app/page.tsx)
- [app/globals.css](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/app/globals.css)
- [app/layout.tsx](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/app/layout.tsx)
- [app/produtos/page.tsx](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/app/produtos/page.tsx)
- [app/encomendas/page.tsx](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/app/encomendas/page.tsx)
- [components/HomeSections.tsx](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/components/HomeSections.tsx)
- [components/AboutContent.tsx](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/components/AboutContent.tsx)
- [components/SiteChrome.tsx](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/components/SiteChrome.tsx)
- [components/Reveal.tsx](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/components/Reveal.tsx)
- [components/SiteMotion.tsx](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/components/SiteMotion.tsx)
- [components/ProductDetail.tsx](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/components/ProductDetail.tsx)
- [components/Catalog.tsx](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/components/Catalog.tsx)
- [components/CatalogProvider.tsx](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/components/CatalogProvider.tsx)
- [lib/catalog/queries.ts](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/lib/catalog/queries.ts)
- [package.json](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/package.json)
- [package-lock.json](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/package-lock.json)
- [public/images/mare-institucional.webp](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/public/images/mare-institucional.webp)
- [tests/site.spec.ts](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/tests/site.spec.ts)
- [tests/identity.spec.ts](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/tests/identity.spec.ts)
- [_do.mjs](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/_do.mjs)
- [_run2.mjs](C:/Users/SnyX/Desktop/volt.sys/clientes/lu-encantos-odoya/_run2.mjs)

_do.mjs e _run2.mjs: apenas remoção de quatro imports não utilizados para passar lint; esses scripts não foram executados.

vite.config.ts já estava modificado antes desta tarefa e foi preservado. Não houve alteração em AdminPanel, AdminLogin, APIs administrativas, lib/admin, lib/auth, lib/supabase, schema ou seed. Arquivos gerados: identity-build.log, .output e capturas em test-results.
