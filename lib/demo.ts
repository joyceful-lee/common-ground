import type {Data} from './types';
export const demoUser={id:'demo-ava',name:'Ava Morgan',email:'ava@example.com'};
export const demoData:Data={
projects:[
{id:'p1',name:'The neighborhood table',description:'Bringing our community together, one shared meal at a time.',color:'rust',due_date:'2026-11-14',role:'lead'},
{id:'p2',name:'A field guide to somewhere',description:'An independent journal for the places just beyond our doorstep.',color:'sage',due_date:'2026-11-28',role:'member'},
{id:'p3',name:'Studio, reimagined',description:'Making a little more room for our next big ideas.',color:'blue',due_date:'2026-12-04',role:'lead'}],
members:[...['p1','p2','p3'].flatMap((p,i)=>[
{...demoUser,project_id:p,role:(i===1?'member':'lead') as 'lead'|'member'},
{id:'demo-jules',name:'Jules Bennett',email:'jules@example.com',project_id:p,role:(i===1?'lead':'member') as 'lead'|'member'},
{id:'demo-sam',name:'Sam Rivera',email:'sam@example.com',project_id:p,role:'member' as const},
{id:'demo-noor',name:'Noor Patel',email:'noor@example.com',project_id:p,role:'member' as const}])],
sprints:[{id:'s1',project_id:'p1',name:'Setting the table',start_date:'2026-10-19',end_date:'2026-11-01'},{id:'s2',project_id:'p2',name:'Stories taking shape',start_date:'2026-10-19',end_date:'2026-11-01'}],
tasks:[
{id:'t1',project_id:'p1',title:'Bring the visual direction together',description:'Gather the references and put together a first look at the event identity.',assignee_id:'demo-ava',status:'doing',priority:'high',due_date:'2026-10-26',sprint_id:'s1'},
{id:'t2',project_id:'p1',title:'Confirm the community kitchen',description:'Check capacity, accessibility, and the equipment we can use.',assignee_id:'demo-jules',status:'review',priority:'high',due_date:'2026-10-27',sprint_id:'s1'},
{id:'t3',project_id:'p1',title:'Draft the invitation',description:'A warm welcome for everyone in the neighborhood.',assignee_id:'demo-sam',status:'todo',priority:'medium',due_date:'2026-10-28',sprint_id:'s1'},
{id:'t4',project_id:'p1',title:'Meet our local growers',description:'',assignee_id:'demo-noor',status:'done',priority:'medium',due_date:'2026-10-23',sprint_id:'s1'},
{id:'t5',project_id:'p1',title:'Map out the evening',description:'',assignee_id:'demo-ava',status:'done',priority:'low',due_date:'2026-10-24',sprint_id:'s1'},
{id:'t6',project_id:'p2',title:'Edit the opening essay',description:'',assignee_id:'demo-ava',status:'review',priority:'medium',due_date:'2026-10-29',sprint_id:'s2'},
{id:'t7',project_id:'p2',title:'Collect the first photo selects',description:'',assignee_id:'demo-sam',status:'doing',priority:'medium',due_date:'2026-10-30',sprint_id:'s2'},
{id:'t8',project_id:'p2',title:'Choose the paper stock',description:'',assignee_id:'demo-jules',status:'done',priority:'low',due_date:'2026-10-22',sprint_id:'s2'},
{id:'t9',project_id:'p3',title:'Sketch the shared work area',description:'',assignee_id:'demo-ava',status:'todo',priority:'medium',due_date:'2026-10-30',sprint_id:null},
{id:'t10',project_id:'p3',title:'Measure the space',description:'',assignee_id:'demo-noor',status:'done',priority:'low',due_date:'2026-10-21',sprint_id:null}
],
notes:[{id:'n1',project_id:'p1',author_id:'demo-jules',body:'The kitchen is ours for the evening. There’s a lovely long table by the windows that will fit everyone.',kind:'note',created_at:'2026-10-25T08:00:00Z'},{id:'n2',project_id:'p2',author_id:'demo-noor',body:'A little appreciation for Sam, who spent Saturday finding the light for our opening photo story. The images are beautiful.',kind:'shoutout',created_at:'2026-10-24T18:30:00Z'}],
messages:[{id:'m1',sender_id:'demo-jules',recipient_id:'demo-ava',body:'I’ve added the kitchen details to our board. Can we look at the table layout together tomorrow?',created_at:'2026-10-25T08:15:00Z',read_at:null}]
};
