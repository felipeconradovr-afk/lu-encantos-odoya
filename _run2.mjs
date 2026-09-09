import{execSync}from'node:child_process';
import{writeFileSync,existsSync,rmSync,readdirSync}from'node:fs';
function sh(cmd){ try{const o=execSync(cmd,{encoding:'utf8'}); console.log('$',cmd,'\n'+o.trim().slice(0,1200)); return o;}catch(e){ console.log('$',cmd,' ERR\n'+(e.stdout||'').slice(0,800)+'\n'+(e.stderr||e.message).slice(0,800)); return '' } }
// restore vite.config exactly from HEAD with CRLF (working copy expectation with autocrlf=true)
try{
  const head=execSync('git show HEAD:vite.config.ts',{encoding:'utf8'});
  // git stores LF; working copy should be CRLF on Windows with autocrlf=true
  let content=head;
  content=content.replace(/\r\n/g,'\n').replace(/\n/g,'\r\n');
  if(!content.endsWith('\r\n')) content+='\r\n';
  writeFileSync('vite.config.ts',content);
  console.log('vite.config restored CRLF');
}catch(e){ console.error('restore vite failed',e.message)}
for(const p of['.output','.vercel','.wrangler']) try{if(existsSync(p))rmSync(p,{recursive:true,force:true})}catch{}
for(const f of readdirSync('.').filter(x=>x.endsWith('.mjs')&&!x.startsWith('node_modules'))){ if(f==='_run2.mjs') continue; try{rmSync(f,{force:true}); console.log('rm',f)}catch{}}
if(existsSync('tests/playwright-debug.test.ts')){ try{rmSync('tests/playwright-debug.test.ts',{force:true}); console.log('removed debug test')}catch{}}
sh('git status --short');
sh('git diff --stat');
sh('git add tests/site.spec.ts');
sh('git diff --stat');
sh('git diff --cached --stat');
sh('git status --short');
sh('git commit --amend --no-edit');
sh('git log --oneline -3');
sh('git push');
sh('git status --short');
console.log('DONE');
try{rmSync('_run2.mjs',{force:true})}catch{}
