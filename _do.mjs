import{execSync}from'node:child_process';
import{writeFileSync,existsSync,rmSync}from'node:fs';


// 1. Limpa artefatos
for(const p of['.output','.vercel','.wrangler','_fix.mjs','_fix2.mjs','_rest.mjs','_a.mjs','_run.mjs','_do.mjs','_cleanup.mjs','b.mjs','run-build-vercel.mjs']){
  try{if(existsSync(p))rmSync(p,{recursive:true,force:true});}catch{}
}
console.log('cleanup done, mjs temp will self-remove after');

// 2. Restaura vite.config.ts exatamente do HEAD (evita diff CRLF espúrio)
try{
  const head=execSync('git show HEAD:vite.config.ts',{encoding:'utf8'});
  writeFileSync('vite.config.ts',head);
  console.log('vite.config restored from HEAD, len',head.length);
}catch(e){console.error('restore failed',e.message)}

// 3. Garante que playwright-debug.test.ts foi removido (era untracked)
try{if(existsSync('tests/playwright-debug.test.ts'))rmSync('tests/playwright-debug.test.ts',{force:true});console.log('debug test removed:',!existsSync('tests/playwright-debug.test.ts'));}catch{}

// 4. Status
try{console.log('--- git status ---\n'+execSync('git status --short',{encoding:'utf8'}))}catch(e){console.log(e.stdout||e.message)}
try{console.log('--- git diff --stat --staged vs unstaged ---\n'+execSync('git diff --stat',{encoding:'utf8'}))}catch(e){console.log(e.stdout||'')}

// 5. Self-remove this script after 1s (so git status won't show it on next run, but keep for now)
// not removing yet — will be removed before commit
