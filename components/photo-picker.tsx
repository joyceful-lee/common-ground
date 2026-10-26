'use client';
import {useState} from 'react';
import {Check} from 'lucide-react';
import {photoUrl,projectPhotos} from '@/lib/project-photos';
export function PhotoPicker({selected,onSelect}:{selected:string|null;onSelect:(id:string)=>void}){
 const [category,setCategory]=useState<string>(projectPhotos.find(p=>p.id===selected)?.category||'Study & research');
 return <section className="photo-picker"><div className="section-heading"><h3>Choose a photo</h3><label><span className="sr-only">Photo category</span><select aria-label="Photo category" value={category} onChange={e=>setCategory(e.target.value)}>{[...new Set(projectPhotos.map(p=>p.category))].map(c=><option key={c}>{c}</option>)}</select></label></div><div className="photo-options">{projectPhotos.filter(p=>p.category===category).map(p=><div key={p.id}><button type="button" className={`photo-choice ${selected===p.id?'selected':''}`} aria-label={`Choose ${p.title}`} aria-pressed={selected===p.id} onClick={()=>onSelect(p.id)}><img src={photoUrl(p,400)} alt={p.title} loading="lazy"/>{selected===p.id&&<span><Check size={16}/></span>}</button><a href={p.page+'?utm_source=common_ground&utm_medium=referral'} target="_blank" rel="noreferrer">{p.photographer} / Unsplash</a></div>)}</div></section>;
}
