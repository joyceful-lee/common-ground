'use client';
import {useState} from 'react';
import {NoteIcon,noteIcons} from './note-heading';
export function NoteFields(){
 const [icon,setIcon]=useState('none');
 return <><label>Note title<input name="title" required maxLength={120} placeholder="Give your note a title"/></label><fieldset className="note-icon-options"><legend>Optional icon</legend><input type="hidden" name="icon" value={icon}/>{noteIcons.map(([value,label])=><button key={value} type="button" aria-label={label} aria-pressed={icon===value} onClick={()=>setIcon(value)}>{value==='none'?<span>No icon</span>:<NoteIcon icon={value}/>}</button>)}</fieldset><label>Your words<textarea name="body" required maxLength={5000} rows={6} placeholder="What would you like the group to know?"/></label></>;
}
