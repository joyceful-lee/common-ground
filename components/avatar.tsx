'use client';
import {useState} from 'react';
import type {User} from '@/lib/types';
export function Avatar({person,index=0}:{person:User;index?:number}){
 const [failed,setFailed]=useState<string|null>(null);
 return <span className={`avatar avatar-${index%4}`} title={person.name}>{person.avatar_data&&failed!==person.avatar_data?<img src={person.avatar_data} alt={person.name} onError={()=>setFailed(person.avatar_data||null)}/>:person.name.split(' ').map(v=>v[0]).slice(0,2).join('')}</span>;
}
