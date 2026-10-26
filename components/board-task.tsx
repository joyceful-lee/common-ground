'use client';
import {useState} from 'react';
import {ArrowUp,ArrowDown,ChevronDown,ChevronUp,Flag,Pencil,Trash2} from 'lucide-react';
import {Avatar} from './avatar';
import {sprintColor} from '@/lib/project-photos';
import type {Task,User,Sprint} from '@/lib/types';
const stages=[['backlog','Backlog'],['todo','To do'],['doing','In progress'],['review','In review'],['done','Done']];
export function BoardTask({task,assignee,sprint,canEdit,canStatus,first,last,onMove,onEdit,onRemove,onStatus}:{task:Task;assignee:User;sprint?:Sprint;canEdit:boolean;canStatus:boolean;first:boolean;last:boolean;onMove:(direction:'up'|'down')=>Promise<boolean>;onEdit:()=>void;onRemove:()=>void;onStatus:(status:string)=>void}){
 const [expanded,setExpanded]=useState(false),[moving,setMoving]=useState(false);
 const minimal=task.status==='done'&&!expanded;
 async function move(direction:'up'|'down'){setMoving(true);try{await onMove(direction);}finally{setMoving(false);}}
 const actions=canEdit?<div className="task-inline-actions"><button aria-label={`Move ${task.title} up`} title="Move up" disabled={first||moving} onClick={()=>void move('up')}><ArrowUp size={12}/></button><button aria-label={`Move ${task.title} down`} title="Move down" disabled={last||moving} onClick={()=>void move('down')}><ArrowDown size={12}/></button><button aria-label={`Edit ${task.title}`} title="Edit" onClick={onEdit}><Pencil size={12}/></button><button aria-label={`Remove ${task.title}`} title="Remove" onClick={onRemove}><Trash2 size={12}/></button></div>:null;
 return <article className={`kanban-task streamlined-task ${minimal?'completed-compact':''}`}>
  {!minimal&&<div className="task-card-heading"><span className={`priority priority-${task.priority}`}>{task.priority}</span>{actions}</div>}
  <div className="task-title-line"><h4 title={task.title}>{task.title}</h4>{minimal&&actions}<button className="task-disclosure" aria-label={`${expanded?'Collapse':'Expand'} ${task.title}`} aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?<ChevronUp size={14}/>:<ChevronDown size={14}/>}</button></div>
  {!minimal&&<div className="task-meta-line"><div className="task-assignee" title={assignee.name}><Avatar person={assignee}/><span>{assignee.name}</span></div>{sprint&&<span className={`task-sprint sprint-${sprintColor(sprint.color)}`} title={sprint.name}><Flag size={11}/><span>{sprint.name}</span></span>}</div>}
  {expanded&&<div className="task-expanded">{task.description&&<p>{task.description}</p>}<div className="kanban-footer"><span>{task.kind==='event'?'Event · ':''}{task.due_date?new Date(task.due_date.slice(0,10)+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}):'No due date'}</span></div><select aria-label={`Status for ${task.title}`} value={task.status} disabled={!canStatus} onChange={e=>onStatus(e.target.value)}>{stages.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></div>}
 </article>;
}
