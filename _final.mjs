import{execSync}from'node:child_process';
import{readFileSync,writeFileSync,existsSync,rmSync,readdirSync}from'node:fs';
function sh(cmd){ try{ const o=execSync(cmd,{encoding:'utf8',stdio:['pipe','pipe','pipe']}); console.log('$',cmd,'\n'+o.trim()); return o; }catch(e){ console.log('$',cmd,'FAILED\n'+(e.stdout||'')+'\n'+(e.stderr||e.message)); return e.stdout||'' } }
for(const p of['.output','.vercel','.wrangler']) try{if(existsSync(p))rmSync(p,{recursive:true,force:true})}catch{}
for(const f of readdirSync('.').filter(x=>x.endsWith('.mjs')&&x!=='_final.mjs')) try{rmSync(f,{force:true})}catch{}
if(existsSync('_do.mjs')) try{rmSync('_do.mjs',{force:true})}catch{}
if(existsSync('_rest.mjs')) try{rmSync('_rest.mjs',{force:true})}catch{}
if(existsSync('tests/playwright-debug.test.ts')) { try{rmSync('tests/playwright-debug.test.ts',{force:true}); console.log('removed debug test');}catch{} }
// Restore vite.config exactly as git expects (CRLF on working copy)
try{
  const head=execSync('git show HEAD:vite.config.ts',{encoding:'utf8'});
  // git stores LF, working copy on Windows should be CRLF due to autocrlf=true
  let content=head;
  if(!content.includes('\r\n')) content=content.replace(/\n/g,'\r\n');
  if(!content.endsWith('\r\n')) content+='\r\n';
  // Only write if different to avoid extra diff
  const cur=existsSync('vite.config.ts')?readFileSync('vite.config.ts','utf8'):'';
  if(cur!==content){ writeFileSync('vite.config.ts',content); console.log('vite.config restored CRLF len',content.length); }
  else console.log('vite.config already correct');
}catch(e){ console.error('vite restore failed',e.message)}
sh('git status --short');
sh('git diff --stat');
sh('git ls-files tests/playwright-debug.test.ts');
sh('git rm --cached tests/playwright-debug.test.ts 2>&1 || echo not-tracked-or-unstaged');
sh('git checkout -- vite.config.ts 2>&1 || echo checkout-fallback');
sh('git status --short');
sh('git add tests/site.spec.ts');
sh('git status --short');
sh('git diff --cached --stat');
sh('git commit --amend --no-edit');
sh('git log --oneline -3');
sh('git push');
console.log('DONE');
try{rmSync('_final.mjs',{force:true})}catch{}
try{rmSync('_do.mjs',{force:true})}catch{}
try{rmSync('_rest.mjs',{force:true})}catch{}
