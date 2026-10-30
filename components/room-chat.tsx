'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {Hash,Send,VolumeX,Volume2,UserMinus} from 'lucide-react';
import {Avatar} from './avatar';
import type {Member,Project,RoomMessage,User} from '@/lib/types';
type RoomMember=Pick<Member,'id'|'name'|'role'|'chat_muted'>;
type RoomState={messages:RoomMessage[];members:RoomMember[];owner_id?:string|null};
export function RoomChat({project,me,people,demoState,onDemoAction,onExit}:{project:Project;me:User;people:Member[];demoState?:RoomState;onDemoAction:(action:Record<string,unknown>)=>Promise<void>;onExit:()=>void}){
 const [room,setRoom]=useState<RoomState>(demoState||{messages:[],members:[]}),[loading,setLoading]=useState(!demoState),[connected,setConnected]=useState(true),[error,setError]=useState(''),[draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[kick,setKick]=useState<RoomMember|null>(null);
 const history=useRef<HTMLDivElement>(null),nearBottom=useRef(true),exit=useRef(onExit);
 useEffect(()=>{exit.current=onExit;},[onExit]);
 useEffect(()=>{if(demoState)setRoom(demoState);},[demoState]);
 const isDemo=!!demoState;
 useEffect(()=>{
  if(isDemo)return;
  let stopped=false,timer:ReturnType<typeof setTimeout>;const controller=new AbortController();
  async function poll(){try{
   const response=await fetch(`/api/rooms/${project.id}`,{cache:'no-store',signal:controller.signal});
   if(response.status===401||response.status===403||response.status===404){if(!stopped){stopped=true;exit.current();}return;}
   if(!response.ok)throw Error('Could not load room');const next=await response.json();if(!stopped){setRoom(next);setConnected(true);setLoading(false);}
  }catch{if(!stopped){setConnected(false);setLoading(false);}}finally{if(!stopped)timer=setTimeout(()=>void poll(),2000);}}
  void poll();return()=>{stopped=true;clearTimeout(timer);controller.abort();};
 },[project.id,isDemo]);
 const lastMessage=room.messages.at(-1)?.id;
 useEffect(()=>{if(nearBottom.current&&history.current)history.current.scrollTop=history.current.scrollHeight;},[lastMessage]);
 const self=room.members.find(m=>m.id===me.id),canManage=self?.role==='lead',muted=!!self?.chat_muted;
 const person=(id:string,name:string)=>people.find(p=>p.id===id)||{id,name,email:''};
 async function action(payload:Record<string,unknown>){
  if(isDemo){await onDemoAction(payload);return;}
  const response=await fetch(`/api/rooms/${project.id}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const result=await response.json();
  if(!response.ok){if(payload.action==='send'&&response.status===403){const check=await fetch(`/api/rooms/${project.id}`,{cache:'no-store'});if(check.ok)setRoom(await check.json());else if(check.status===403)exit.current();}throw Error(result.error||'Could not save this change.');}
  const next=await fetch(`/api/rooms/${project.id}`,{cache:'no-store'});if(next.ok){setRoom(await next.json());setConnected(true);}
 }
 async function send(e:FormEvent){e.preventDefault();if(!draft.trim()||busy||muted)return;setBusy(true);setError('');try{nearBottom.current=true;await action({action:'send',body:draft.trim()});setDraft('');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 async function moderate(payload:Record<string,unknown>){setBusy(true);setError('');try{await action(payload);setKick(null);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <section className="room-chat" aria-label={`${project.name} room chat`}>
  <div className="room-conversation"><header className="room-heading"><div><Hash size={19}/><h2>Project room</h2></div><span className={connected?'room-live':'room-reconnecting'} role="status">{connected?'Updates automatically':'Reconnecting…'}</span></header>
   <div className="room-history" ref={history} onScroll={()=>{const h=history.current;if(h)nearBottom.current=h.scrollHeight-h.scrollTop-h.clientHeight<80;}} role="log" aria-label="Room messages" aria-live="polite" aria-relevant="additions" aria-busy={loading}>
    {loading?<p className="room-empty">Opening the conversation…</p>:!room.messages.length?<div className="room-welcome"><Hash size={28} strokeWidth={1}/><h3>A place to work things out.</h3><p>Ask a question, share an idea, or check in with your group. Everyone in this project can read this conversation.</p></div>:room.messages.map(message=><article className="room-message" key={message.id}><Avatar person={person(message.sender_id,message.sender_name)}/><div><div className="room-message-byline"><strong>{message.sender_name}</strong>{message.sender_id===me.id&&<span>You</span>}<time dateTime={message.created_at}>{new Date(message.created_at).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</time></div><p>{message.body}</p></div></article>)}
   </div>
   {error&&<p className="error room-error" role="alert">{error}</p>}
   <form className="room-compose" onSubmit={send}><label className="sr-only" htmlFor={`room-message-${project.id}`}>Message the project room</label>{muted&&<p className="room-muted"><VolumeX size={15}/>A project lead has muted you. You can still read this room.</p>}<div><textarea id={`room-message-${project.id}`} value={draft} onChange={e=>setDraft(e.target.value)} disabled={muted||loading} maxLength={2000} placeholder={muted?'You are muted in this room':'Message your group…'} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();e.currentTarget.form?.requestSubmit();}}}/><button className="primary" aria-label="Send room message" disabled={busy||muted||loading||!draft.trim()}><Send size={17}/></button></div><small>Enter to send · Shift + Enter for a new line</small></form>
  </div>
  <aside className="room-members"><h3>In this room <span>{room.members.length}</span></h3><p>Everyone in this project can join the conversation.</p>{room.members.map(member=><div className="room-member" key={member.id}><Avatar person={person(member.id,member.name)}/><div><strong>{member.name}</strong><small>{member.id===room.owner_id?'Owner':member.role==='lead'?'Project lead':'Member'}{member.chat_muted?' · Muted':''}</small></div>{canManage&&member.id!==me.id&&member.id!==room.owner_id&&<div className="room-member-actions"><button className="icon-button" title={member.chat_muted?'Unmute':'Mute'} aria-label={`${member.chat_muted?'Unmute':'Mute'} ${member.name}`} disabled={busy} onClick={()=>void moderate({action:'mute',user_id:member.id,muted:!member.chat_muted})}>{member.chat_muted?<Volume2 size={15}/>:<VolumeX size={15}/>}</button><button className="icon-button" title="Remove from room" aria-label={`Kick ${member.name} from room`} disabled={busy} onClick={()=>setKick(member)}><UserMinus size={15}/></button></div>}</div>)}{kick&&<div className="room-kick-confirm" role="alert"><strong>Remove {kick.name}?</strong><p>They will leave this project and its room. Their messages stay, and they will need a new invitation to return.</p><div><button className="secondary" onClick={()=>setKick(null)} disabled={busy}>Cancel</button><button className="primary" disabled={busy} onClick={()=>void moderate({action:'kick',user_id:kick.id})}>Remove member</button></div></div>}</aside>
 </section>;
}
