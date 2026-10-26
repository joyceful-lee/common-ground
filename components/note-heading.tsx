import {Lightbulb,Flag} from 'lucide-react';
export const noteIcons=[['none','No icon'],['urgent','Urgent'],['question','Question'],['idea','Idea'],['milestone','Milestone']] as const;
export function NoteIcon({icon}:{icon?:string}){
 if(!icon||icon==='none')return null;
 const label=noteIcons.find(([value])=>value===icon)?.[1]||'';
 return <span className={`note-icon note-icon-${icon}`} title={label} role="img" aria-label={label}>{icon==='urgent'?'!':icon==='question'?'?':icon==='idea'?<Lightbulb size={19}/>:<Flag size={18}/>}</span>;
}
