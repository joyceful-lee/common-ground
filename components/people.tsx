'use client';
import {ArrowUpRight,Plus,UserRoundCog} from 'lucide-react';
import type {Member,Project} from '@/lib/types';
import {Avatar} from './avatar';
export function People({project,members,me,onInvite,onManage,onMessage,onProfile}:{project:Project;members:Member[];me:string;onInvite:()=>void;onManage:(m:Member)=>void;onMessage:(id:string)=>void;onProfile:()=>void}){
 return <section className="people-section"><div className="section-heading"><h2>The people behind the project</h2>{project.role==='lead'&&<button className="primary" onClick={onInvite}><Plus size={16}/>Add people</button>}</div><div className="people-grid">{members.map((m,i)=><article className="person-card" key={m.id}><Avatar person={m} index={i}/><h3>{m.name}{m.id===me?' (you)':''}</h3><p>{m.email}</p><span className="role-badge">{m.id===project.owner_id?'Owner':m.role==='lead'?'Project lead':'Member'}</span><div className="people-actions">{m.id===me&&<button className="text-link" onClick={onProfile}>Edit profile photo</button>}{m.id!==me&&<button className="text-link" onClick={()=>onMessage(m.id)}>Send a message <ArrowUpRight size={15}/></button>}{project.role==='lead'&&<button className="text-link" onClick={()=>onManage(m)}><UserRoundCog size={15}/>Manage person</button>}</div></article>)}</div></section>;
}
