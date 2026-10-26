import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import {projectPhotos} from '@/lib/project-photos';

export const dynamic='force-dynamic';
const uuid=z.string().uuid();
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v,'Invalid date').nullable().optional();
const text=z.string().trim().min(1).max(5000);
const actions=z.discriminatedUnion('action',[
 z.object({action:z.literal('profile-photo'),avatar_data:z.string().max(250000).regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/).nullable()}),
 z.object({action:z.literal('project-image'),project_id:uuid,image_data:z.string().max(700000).regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/).nullable(),image_template:z.string().refine(id=>projectPhotos.some(p=>p.id===id),'Choose a photo from the gallery.').nullable().optional()}),
 z.object({action:z.literal('member'),project_id:uuid,user_id:z.string().min(1),operation:z.enum(['role','remove','transfer']),role:z.enum(['lead','member']).default('member')}),
 z.object({action:z.literal('archive-note'),project_id:uuid,id:uuid,archived:z.boolean()}),
 z.object({action:z.literal('remove-task'),project_id:uuid,id:uuid}),
 z.object({action:z.literal('restore-task'),project_id:uuid,id:uuid}),
 z.object({action:z.literal('approve-task'),project_id:uuid,id:uuid,approval:z.enum(['approved','declined'])}),
 z.object({action:z.literal('comment'),project_id:uuid,note_id:uuid,body:text}),
 z.object({action:z.literal('reaction'),project_id:uuid,note_id:uuid,reaction:z.enum(['appreciate','celebrate','agree'])}),
 z.object({action:z.literal('project'),name:text.pipe(z.string().max(100)),description:z.string().max(2000),color:z.enum(['rust','sage','blue','ochre']),due_date:date}),
 z.object({action:z.literal('task'),project_id:uuid,id:uuid.optional(),title:text.pipe(z.string().max(200)),description:z.string().max(5000),assignee_id:z.string().nullable(),status:z.enum(['backlog','todo','doing','review','done']),priority:z.enum(['low','medium','high']),due_date:date,sprint_id:uuid.nullable()}),
 z.object({action:z.literal('status'),id:uuid,status:z.enum(['backlog','todo','doing','review','done'])}),
 z.object({action:z.literal('note'),project_id:uuid,title:z.string().trim().min(1).max(120).default('Project update'),icon:z.enum(['none','urgent','question','idea','milestone']).default('none'),body:text,kind:z.enum(['note','shoutout']).default('note')}),
 z.object({action:z.literal('sprint'),project_id:uuid,id:uuid.optional(),name:text.pipe(z.string().max(100)),start_date:date,end_date:date,color:z.enum(['sage','rust','blue','ochre','violet','teal']).default('sage')}),
 z.object({action:z.literal('invite'),project_id:uuid,email:z.string().trim().email().max(254),role:z.enum(['lead','member'])}),
 z.object({action:z.literal('join'),token:uuid}),
 z.object({action:z.literal('message'),recipient_id:z.string().min(1),body:text}),
 z.object({action:z.literal('read'),sender_id:z.string().min(1)})
]);
class ApiError extends Error { constructor(message:string,public status=400){super(message);} }
async function user() {
 const {data:session}=await auth.getSession();
 const user=session?.user;
 if(!user) throw new ApiError('Sign in to open your workspace.',401);
 await db()`INSERT INTO app_users(id,name,email) VALUES(${user.id},${user.name||user.email},${user.email.toLowerCase()}) ON CONFLICT(id) DO UPDATE SET name=excluded.name,email=excluded.email,updated_at=now()`;
 return user;
}
async function member(project:string,id:string,lead=false){
 const rows=await db()`SELECT role FROM memberships WHERE project_id=${project} AND user_id=${id} AND active`;
 if(!rows.length||lead&&rows[0].role!=='lead') throw new ApiError(lead?'Only a project lead can change planning details.':'You do not have access to this project.',403);
}
function failure(error:unknown) {
 if(error instanceof z.ZodError) return Response.json({error:error.errors[0]?.message||'Check the form fields.'},{status:400});
 if(error instanceof ApiError) return Response.json({error:error.message},{status:error.status});
 console.error('Workspace operation failed',error instanceof Error?error.message:'Unknown error');
 return Response.json({error:'We could not save this change. Please try again.'},{status:500});
}
export async function GET(){try{
 const u=await user(),sql=db();
 const [projects,members,tasks,sprints,notes,messages,comments,reactions,profiles]=await Promise.all([
 sql`SELECT p.*,coalesce(p.owner_id,p.created_by) AS owner_id,m.role FROM projects p JOIN memberships m ON m.project_id=p.id WHERE m.user_id=${u.id} AND m.active ORDER BY p.created_at`,
 sql`SELECT u.id,u.name,u.email,u.avatar_data,m.project_id,m.role,m.active FROM app_users u JOIN memberships m ON m.user_id=u.id WHERE m.project_id IN (SELECT project_id FROM memberships WHERE user_id=${u.id} AND active)`,
 sql`SELECT * FROM tasks WHERE removed_at IS NULL AND project_id IN (SELECT project_id FROM memberships WHERE user_id=${u.id} AND active) ORDER BY created_at`,
 sql`SELECT * FROM sprints WHERE project_id IN (SELECT project_id FROM memberships WHERE user_id=${u.id} AND active) ORDER BY start_date`,
 sql`SELECT * FROM notes WHERE project_id IN (SELECT project_id FROM memberships WHERE user_id=${u.id} AND active) ORDER BY created_at DESC`,
 sql`SELECT * FROM messages WHERE sender_id=${u.id} OR recipient_id=${u.id} ORDER BY created_at`,
 sql`SELECT c.* FROM note_comments c JOIN notes n ON n.id=c.note_id WHERE n.project_id IN (SELECT project_id FROM memberships WHERE user_id=${u.id} AND active) ORDER BY c.created_at`,
 sql`SELECT r.note_id,r.user_id,r.reaction FROM note_reactions r JOIN notes n ON n.id=r.note_id WHERE r.active AND n.project_id IN (SELECT project_id FROM memberships WHERE user_id=${u.id} AND active)`,
 sql`SELECT id,name,email,avatar_data FROM app_users WHERE id=${u.id}`
 ]);
 return Response.json({projects,members,tasks,sprints,notes,messages,comments,reactions,profile:profiles[0]},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){return failure(e);}}
export async function POST(req:NextRequest){try{
 const origin=req.headers.get('origin');
 if(origin&&origin!==req.nextUrl.origin&&new URL(origin).host!==req.headers.get('host')) throw new ApiError('Request origin is not allowed.',403);
 const u=await user(),a=actions.parse(await req.json()),sql=db();
 if(a.action==='profile-photo'){
  await sql`UPDATE app_users SET avatar_data=${a.avatar_data},updated_at=now() WHERE id=${u.id}`;
  return Response.json({ok:true});
 }
 if(a.action==='project'){
  const rows=await sql`WITH p AS (INSERT INTO projects(name,description,color,due_date,created_by,owner_id) VALUES(${a.name},${a.description},${a.color},${a.due_date||null},${u.id},${u.id}) RETURNING *) INSERT INTO memberships(project_id,user_id,role) SELECT id,${u.id},'lead' FROM p RETURNING project_id`;
  return Response.json({id:rows[0].project_id});
 }
 if(a.action==='join'){
  const joined=await sql`WITH i AS (SELECT * FROM invitations WHERE token=${a.token} AND lower(email)=${u.email.toLowerCase()} AND expires_at>now()), added AS (INSERT INTO memberships(project_id,user_id,role) SELECT project_id,${u.id},role FROM i ON CONFLICT(project_id,user_id) DO UPDATE SET active=true,role=CASE WHEN memberships.active THEN memberships.role ELSE excluded.role END RETURNING project_id) DELETE FROM invitations WHERE token=${a.token} AND EXISTS(SELECT 1 FROM i) RETURNING project_id`;
  if(!joined.length)throw new ApiError('This invitation has expired or was sent to a different email address.');
  return Response.json({id:joined[0].project_id});
 }
 if(a.action==='message'){
  if(a.recipient_id===u.id)throw new ApiError('Choose another member.');
  const peers=await sql`SELECT 1 FROM memberships a JOIN memberships b ON a.project_id=b.project_id WHERE a.user_id=${u.id} AND b.user_id=${a.recipient_id} AND a.active AND b.active LIMIT 1`;
  if(!peers.length)throw new ApiError('You can message people who share a project with you.',403);
  await sql`INSERT INTO messages(sender_id,recipient_id,body) VALUES(${u.id},${a.recipient_id},${a.body})`;
 }else if(a.action==='read'){
  await sql`UPDATE messages SET read_at=now() WHERE recipient_id=${u.id} AND sender_id=${a.sender_id} AND read_at IS NULL`;
 }else if(a.action==='status'){
  const tasks=await sql`SELECT project_id,assignee_id,approval FROM tasks WHERE id=${a.id} AND removed_at IS NULL`;
  if(!tasks.length)throw new ApiError('Task could not be found.',404);
  await member(tasks[0].project_id,u.id);
  if(tasks[0].approval!=='approved')throw new ApiError('This task needs leader approval before work can begin.',403);
  const roles=await sql`SELECT role FROM memberships WHERE project_id=${tasks[0].project_id} AND user_id=${u.id} AND active`;
  if(roles[0].role!=='lead'&&tasks[0].assignee_id!==u.id)throw new ApiError('Only the assignee or a project lead can update this task.',403);
  await sql`UPDATE tasks SET status=${a.status} WHERE id=${a.id}`;
 }else{
  await member(a.project_id,u.id,['sprint','invite','project-image','approve-task','remove-task','restore-task','member'].includes(a.action));
  if(a.action==='task'){
   const roles=await sql`SELECT role FROM memberships WHERE project_id=${a.project_id} AND user_id=${u.id} AND active`;
   const isLead=roles[0].role==='lead';
   if(a.id&&!isLead)throw new ApiError('Only a project lead can edit task details.',403);
   if(a.assignee_id)await member(a.project_id,a.assignee_id);
   if(a.sprint_id){const s=await sql`SELECT start_date::text,end_date::text FROM sprints WHERE id=${a.sprint_id} AND project_id=${a.project_id}`;if(!s.length)throw new ApiError('Choose a sprint in this project.');if(a.due_date&&(a.due_date<s[0].start_date||a.due_date>s[0].end_date))throw new ApiError(`The due date must fall within the sprint (${s[0].start_date} to ${s[0].end_date}).`);}
   if(a.id){const changed=await sql`UPDATE tasks SET title=${a.title},description=${a.description},assignee_id=${a.assignee_id},status=${a.status},priority=${a.priority},due_date=${a.due_date||null},sprint_id=${a.sprint_id} WHERE id=${a.id} AND project_id=${a.project_id} AND removed_at IS NULL RETURNING id`;if(!changed.length)throw new ApiError('Task could not be found.',404);}
   else {const rows=await sql`INSERT INTO tasks(project_id,title,description,assignee_id,status,priority,due_date,sprint_id,approval,submitted_by) VALUES(${a.project_id},${a.title},${a.description},${a.assignee_id},${isLead?a.status:'todo'},${a.priority},${a.due_date||null},${a.sprint_id},${isLead?'approved':'pending'},${u.id}) RETURNING id`;return Response.json({id:rows[0].id});}
  }else if(a.action==='project-image'){
   await sql`UPDATE projects SET image_data=${a.image_template?null:a.image_data},image_template=${a.image_template||null} WHERE id=${a.project_id}`;
  }else if(a.action==='member'){
   const result=await sql`SELECT manage_project_member(${a.project_id}::uuid,${u.id},${a.user_id},${a.operation},${a.role}) AS outcome`;
   const outcome=result[0].outcome;
   if(outcome==='forbidden')throw new ApiError('Only the project owner can transfer ownership. Project leads manage memberships.',403);
   if(outcome==='owner-protected')throw new ApiError('Transfer ownership before changing the owner’s role or removing them.');
   if(outcome==='not-found')throw new ApiError('Project member could not be found.',404);
   if(outcome!=='ok')throw new ApiError('Choose a different active member.');
  }else if(a.action==='archive-note'){
   const rows=await sql`SELECT author_id FROM notes WHERE id=${a.id} AND project_id=${a.project_id}`;
   if(!rows.length)throw new ApiError('Note could not be found.',404);
   if(rows[0].author_id!==u.id)await member(a.project_id,u.id,true);
   await sql`UPDATE notes SET archived_at=${a.archived?new Date().toISOString():null} WHERE id=${a.id}`;
  }else if(a.action==='remove-task'||a.action==='restore-task'){
   const rows=await sql`UPDATE tasks SET removed_at=${a.action==='remove-task'?new Date().toISOString():null} WHERE id=${a.id} AND project_id=${a.project_id} RETURNING id`;
   if(!rows.length)throw new ApiError('Task could not be found.',404);
  }else if(a.action==='approve-task'){
   const rows=await sql`UPDATE tasks SET approval=${a.approval},status='todo' WHERE id=${a.id} AND project_id=${a.project_id} AND approval='pending' AND removed_at IS NULL RETURNING id`;
   if(!rows.length)throw new ApiError('This submission has already been reviewed.',409);
  }else if(a.action==='comment'||a.action==='reaction'){
   const notes=await sql`SELECT archived_at FROM notes WHERE id=${a.note_id} AND project_id=${a.project_id}`;
   if(!notes.length)throw new ApiError('Note could not be found.',404);
   if(notes[0].archived_at)throw new ApiError('Restore this note before adding comments or reactions.');
   if(a.action==='comment')await sql`INSERT INTO note_comments(note_id,author_id,body) VALUES(${a.note_id},${u.id},${a.body})`;
   else await sql`INSERT INTO note_reactions(note_id,user_id,reaction) VALUES(${a.note_id},${u.id},${a.reaction}) ON CONFLICT(note_id,user_id,reaction) DO UPDATE SET active=NOT note_reactions.active`;
  }else if(a.action==='sprint'){
   if(!a.start_date||!a.end_date||a.end_date<a.start_date)throw new ApiError('The sprint end must be on or after its start.');
   if(a.id){const conflicts=await sql`SELECT 1 FROM tasks WHERE sprint_id=${a.id} AND project_id=${a.project_id} AND removed_at IS NULL AND approval<>'declined' AND (due_date<${a.start_date}::date OR due_date>${a.end_date}::date) LIMIT 1`;if(conflicts.length)throw new ApiError('These sprint dates would put an assigned task outside the sprint. Adjust the task first.');const rows=await sql`UPDATE sprints SET name=${a.name},start_date=${a.start_date},end_date=${a.end_date},color=${a.color} WHERE id=${a.id} AND project_id=${a.project_id} RETURNING id`;if(!rows.length)throw new ApiError('Sprint could not be found.',404);}
   else await sql`INSERT INTO sprints(project_id,name,start_date,end_date,color) VALUES(${a.project_id},${a.name},${a.start_date},${a.end_date},${a.color})`;
  }else if(a.action==='note'){
   await sql`INSERT INTO notes(project_id,author_id,title,icon,body,kind) VALUES(${a.project_id},${u.id},${a.title},${a.icon},${a.body},'note')`;
  }else if(a.action==='invite'){
   const rows=await sql`INSERT INTO invitations(project_id,email,role) VALUES(${a.project_id},${a.email.toLowerCase()},${a.role}) ON CONFLICT(project_id,email) DO UPDATE SET token=gen_random_uuid(),role=excluded.role,expires_at=now()+interval '7 days' RETURNING token`;
   return Response.json({token:rows[0].token});
  }
 }
 return Response.json({ok:true});
 }catch(e){return failure(e);}}
