import {NextRequest} from 'next/server';
import {z} from 'zod';
import {auth} from '@/lib/auth';
import {db} from '@/lib/db';
export const dynamic='force-dynamic';
const action=z.discriminatedUnion('action',[
 z.object({action:z.literal('send'),body:z.string().trim().min(1).max(2000)}),
 z.object({action:z.literal('mute'),user_id:z.string().min(1),muted:z.boolean()}),
 z.object({action:z.literal('kick'),user_id:z.string().min(1)})
]);
type Context={params:Promise<{project:string}>};
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'private, no-store'}});
async function access(context:Context){
 const {data:session}=await auth.getSession();
 if(!session?.user)return {error:json({error:'Sign in to join the conversation.'},401)} as const;
 const {project}=await context.params;
 if(!z.string().uuid().safeParse(project).success)return {error:json({error:'Room not found.'},404)} as const;
 const rows=await db()`SELECT m.role,m.chat_muted,coalesce(p.owner_id,p.created_by) AS owner_id FROM memberships m JOIN projects p ON p.id=m.project_id WHERE m.project_id=${project} AND m.user_id=${session.user.id} AND m.active`;
 if(!rows.length)return {error:json({error:'You no longer have access to this room.'},403)} as const;
 return {project,user:session.user,membership:rows[0]} as const;
}
export async function GET(_req:NextRequest,context:Context){try{
 const a=await access(context);if(a.error)return a.error;
 const sql=db();
 const [messages,members]=await Promise.all([
  sql`SELECT recent.*,u.name AS sender_name FROM (SELECT * FROM room_messages WHERE project_id=${a.project} ORDER BY created_at DESC,id DESC LIMIT 100) recent JOIN app_users u ON u.id=recent.sender_id ORDER BY recent.created_at,recent.id`,
  sql`SELECT u.id,u.name,m.role,m.chat_muted FROM memberships m JOIN app_users u ON u.id=m.user_id WHERE m.project_id=${a.project} AND m.active ORDER BY u.name,u.id`
 ]);
 return json({messages,members,owner_id:a.membership.owner_id});
 }catch(error){console.error('Room read failed',error instanceof Error?error.message:'Unknown error');return json({error:'The conversation could not be loaded. Reconnecting…'},500);}}
export async function POST(req:NextRequest,context:Context){try{
 const origin=req.headers.get('origin');if(origin&&origin!==req.nextUrl.origin&&new URL(origin).host!==req.headers.get('host'))return json({error:'Request origin is not allowed.'},403);
 const a=await access(context);if(a.error)return a.error;
 const input=action.parse(await req.json());
 const result=await db()`SELECT room_chat_action(${a.project}::uuid,${a.user.id},${input.action},${input.action==='send'?null:input.user_id},${input.action==='send'?input.body:null},${input.action==='mute'?input.muted:false}) AS outcome`;
 const outcome=result[0].outcome;
 if(outcome.error){const errors:Record<string,[string,number]>={muted:['A project lead has muted you in this room. You can still read messages.',403],forbidden:['Only a project lead can manage this room.',403],protected:['You cannot mute or remove yourself or the project owner.',400],'not-found':['This member or room is no longer available.',404]};const [message,status]=errors[outcome.error]||['This change could not be saved.',400];return json({error:message},status);}
 return json(outcome);
 }catch(error){if(error instanceof z.ZodError)return json({error:'Write a message of 1–2,000 characters, or check the room action.'},400);console.error('Room action failed',error instanceof Error?error.message:'Unknown error');return json({error:'The message or room change could not be saved. Try again.'},500);}}
