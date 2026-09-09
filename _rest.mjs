import{spawnSync}from'node:child_process';
import{writeFileSync,rmSync,existsSync}from'node:fs';
const r=spawnSync('git',['show','HEAD:vite.config.ts'],{encoding:'utf8'});
if(r.status===0){writeFileSync('vite.config.ts',r.stdout);console.log('restored vite.config.ts len',r.stdout.length);}
else{console.error(r.stderr);process.exit(1)}
for(const p of['.output','.vercel']) try{if(existsSync(p))rmSync(p,{recursive:true,force:true})}catch{}
const s=spawnSync('git',['status','--short'],{encoding:'utf8'});
console.log(s.stdout||s.stderr);
