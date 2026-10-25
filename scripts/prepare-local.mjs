import {readFileSync,writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
const path=new URL('../.env.local',import.meta.url);
const text=readFileSync(path,'utf8');
if(!text.includes('NEON_AUTH_COOKIE_SECRET='))writeFileSync(path,text+'\nNEON_AUTH_COOKIE_SECRET='+randomBytes(48).toString('base64url')+'\n');
console.log('Local environment ready; database and auth keys are present.');
