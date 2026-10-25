import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
const base=process.env.TEST_BASE_URL||'http://localhost:3100';
const stamp=Date.now();
const password=randomBytes(24).toString('base64url');
const clients=[];
async function client(name){
 let cookie='';
 async function request(path,body){
  const response=await fetch(base+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Origin:base,...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const cookies=response.headers.getSetCookie();
  if(cookies.length)cookie=[...new Map([...cookie.split('; ').filter(Boolean),...cookies.map(s=>s.split(';')[0])].map(s=>[s.split('=')[0],s])).values()].join('; ');
  const raw=await response.text();let data;try{data=JSON.parse(raw);}catch{throw new Error(`${path}: ${response.status}, expected JSON`);}
  return {status:response.status,data};
 }
 const email=`cg-verification-${name}-${stamp}@example.com`;
 const signup=await request('/api/auth/sign-up/email',{name:`Verification ${name}`,email,password});
 assert.equal(signup.status,200,`Sign-up failed: ${signup.data.error?.message||signup.data.message||signup.status}`);
 const workspace=await request('/api/workspace');assert.equal(workspace.status,200,'Session must authenticate workspace');
 const auth=await request('/api/auth/get-session');const u=auth.data.user||auth.data.data?.user;assert.ok(u?.id,'Session must contain user');
 const c={request,email,id:u.id};clients.push(c);return c;
}
const anonymous=await fetch(base+'/api/workspace');assert.equal(anonymous.status,401);console.log('PASS anonymous access rejected');
const lead=await client('lead'),member=await client('member'),outsider=await client('outsider');
console.log('PASS three Neon Auth accounts and sessions');
const create=await lead.request('/api/workspace',{action:'project',name:`Verification workspace ${stamp}`,description:'Private integration fixture.',color:'sage',due_date:'2026-11-30'});assert.equal(create.status,200);const pid=create.data.id;
const second=await member.request('/api/workspace',{action:'project',name:`Verification independent project ${stamp}`,description:'Role isolation fixture.',color:'blue'});assert.equal(second.status,200);
const invite=await lead.request('/api/workspace',{action:'invite',project_id:pid,email:member.email,role:'member'});assert.equal(invite.status,200);
assert.equal((await outsider.request('/api/workspace',{action:'join',token:invite.data.token})).status,400);
assert.equal((await member.request('/api/workspace',{action:'join',token:invite.data.token})).status,200);
const state=(await member.request('/api/workspace')).data;assert.equal(state.projects.find(p=>p.id===pid).role,'member');assert.equal(state.projects.find(p=>p.id===second.data.id).role,'lead');
console.log('PASS email-bound invitation and independent per-project roles');
const sprint=await lead.request('/api/workspace',{action:'sprint',project_id:pid,name:'Verification sprint',start_date:'2026-11-01',end_date:'2026-11-14'});assert.equal(sprint.status,200);
const sprintId=(await lead.request('/api/workspace')).data.sprints.find(s=>s.project_id===pid).id;
const task={action:'task',project_id:pid,title:'Verification assigned task',description:'Checks persistence and permissions.',assignee_id:member.id,status:'todo',priority:'high',due_date:'2026-11-03',sprint_id:sprintId};
assert.equal((await member.request('/api/workspace',task)).status,403);assert.equal((await lead.request('/api/workspace',task)).status,200);
const saved=(await member.request('/api/workspace')).data.tasks.find(t=>t.project_id===pid);assert.equal(saved.assignee_id,member.id);assert.equal(saved.due_date.slice(0,10),'2026-11-03');
assert.equal((await member.request('/api/workspace',{action:'status',id:saved.id,status:'doing'})).status,200);
assert.equal((await outsider.request('/api/workspace',{action:'status',id:saved.id,status:'done'})).status,403);
assert.equal((await lead.request('/api/workspace',{...task,due_date:'2026-02-30'})).status,400);
console.log('PASS sprint, task assignment, due date validation, and status permissions');
assert.equal((await member.request('/api/workspace',{action:'note',project_id:pid,kind:'shoutout',body:'Verification appreciation visible to the whole group.'})).status,200);
assert.ok((await lead.request('/api/workspace')).data.notes.some(n=>n.project_id===pid));
assert.equal((await outsider.request('/api/workspace',{action:'note',project_id:pid,kind:'note',body:'Not a member'})).status,403);
assert.equal((await lead.request('/api/workspace',{action:'message',recipient_id:member.id,body:'Verification private conversation.'})).status,200);
assert.equal((await outsider.request('/api/workspace',{action:'message',recipient_id:member.id,body:'Not a peer'})).status,403);
const inbox=(await member.request('/api/workspace')).data.messages;assert.ok(inbox.some(m=>m.sender_id===lead.id));
const outside=(await outsider.request('/api/workspace')).data;assert.equal(outside.projects.length,0);assert.equal(outside.tasks.length,0);assert.equal(outside.notes.length,0);assert.equal(outside.messages.length,0);
assert.equal((await member.request('/api/workspace',{action:'read',sender_id:lead.id})).status,200);assert.ok((await lead.request('/api/workspace')).data.messages.find(m=>m.recipient_id===member.id).read_at);
console.log('PASS shared notes, private messages, read state, and cross-project isolation');
console.log('All integration checks passed. Test records belong only to private verification accounts.');
