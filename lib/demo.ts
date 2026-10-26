import type {Data,Task} from './types';
export const demoUser={id:'demo-ava',name:'Ava Morgan',email:'ava@example.com'};
export const demoStorageKey='common-ground-demo-v5';

export function createDemoData(referenceDate:Date):Data{
 const base=Date.UTC(referenceDate.getFullYear(),referenceDate.getMonth(),referenceDate.getDate());
 const date=(offset:number)=>new Date(base+offset*86400000).toISOString().slice(0,10);
 const stamp=(offset:number,hour=16)=>`${date(offset)}T${String(hour).padStart(2,'0')}:00:00Z`;
 const people=[demoUser,{id:'demo-jules',name:'Jules Bennett',email:'jules@example.com'},{id:'demo-sam',name:'Sam Rivera',email:'sam@example.com'},{id:'demo-noor',name:'Noor Patel',email:'noor@example.com'}];
 const task=(id:string,project_id:string,title:string,description:string,assignee_id:string,status:string,priority:string,day:number,sprint_id:string,approval:'approved'|'pending'='approved'):Task=>({id,project_id,title,description,assignee_id,status,priority,due_date:date(day),sprint_id,approval,submitted_by:approval==='pending'?assignee_id:'demo-ava'});
 return {
 projects:[
  {id:'p1',name:'The courtyard garden',description:'Turn the quiet corner behind the library into a garden everyone can help grow.',color:'sage',image_template:'nature-garden',due_date:date(20),role:'lead',owner_id:'demo-ava'},
  {id:'p2',name:'Our neighborhood, in print',description:'A student-made journal of the places, people, and small stories around our school.',color:'rust',image_template:'art-watercolor',due_date:date(18),role:'member',owner_id:'demo-jules'},
  {id:'p3',name:'Study Club',description:'Build a simple app that helps classmates find a study partner and plan their week.',color:'blue',image_template:'tech-workspace',due_date:date(23),role:'lead',owner_id:'demo-ava'}
 ],
 members:['p1','p2','p3'].flatMap((project_id,index)=>people.map(person=>({...person,project_id,active:true,role:(person.id===(index===1?'demo-jules':'demo-ava')?'lead':'member') as 'lead'|'member'}))),
 sprints:[
  {id:'s1',project_id:'p1',name:'Make a place to grow',color:'sage',start_date:date(-6),end_date:date(7)},
  {id:'s3',project_id:'p1',name:'Our first planting day',color:'ochre',start_date:date(8),end_date:date(20)},
  {id:'s2',project_id:'p2',name:'Find the stories',color:'rust',start_date:date(-6),end_date:date(5)},
  {id:'s4',project_id:'p2',name:'Bring the pages together',color:'violet',start_date:date(6),end_date:date(18)},
  {id:'s5',project_id:'p3',name:'From sketches to screens',color:'blue',start_date:date(-3),end_date:date(10)},
  {id:'s6',project_id:'p3',name:'Try it with classmates',color:'teal',start_date:date(11),end_date:date(23)}
 ],
 tasks:[
  task('t1','p1','Draw the garden layout','Mark the raised beds, a clear walking path, and a space for everyone to gather. Bring two options to our next meeting.','demo-ava','doing','high',1,'s1'),
  task('t2','p1','Check our planting list','Ask the science teacher which herbs and vegetables will suit the light in the courtyard.','demo-jules','review','high',2,'s1'),
  task('t3','p1','Make a watering rota','Create a weekly schedule that shares the watering fairly and includes a backup person.','demo-sam','todo','medium',3,'s1'),
  task('t4','p1','Measure the courtyard','Record the length and width of the planting area and note where the afternoon sun falls.','demo-noor','done','medium',-3,'s1'),
  task('t5','p1','Ask the school for permission','Share our plan with the office and agree on safe access to the courtyard.','demo-ava','done','high',-2,'s1'),
  task('t11','p1','Compare soil and compost options','Collect prices from two local suppliers and check whether either can donate a few bags.','demo-noor','backlog','low',6,'s1'),
  task('t12','p1','Paint signs for the herb beds','Sketch weatherproof labels that make it easy to tell the mint, basil, and rosemary apart.','demo-sam','todo','low',11,'s3'),
  task('t13','p1','Build a rainwater measuring station','Use a recycled bottle to measure rainfall and keep a simple weekly record beside the garden.','demo-noor','todo','medium',5,'s1','pending'),
  task('t6','p2','Write the opening story','Introduce the journal through a walk from the school gates to the Saturday market. Aim for 400 words.','demo-ava','doing','high',2,'s2'),
  task('t7','p2','Choose photos for the first issue','Pick six images with different perspectives and add a short caption to each.','demo-sam','review','medium',3,'s2'),
  task('t8','p2','Record our first interview','Ask the bookshop owner how the neighborhood has changed. Get permission to use their words and photo.','demo-jules','done','high',-2,'s2'),
  task('t14','p2','Collect ideas from our class','Bring together the places and people classmates would like us to include.','demo-noor','done','medium',-1,'s2'),
  task('t15','p2','Design the cover','Try a hand-painted title and a simple illustration that connects to our opening story.','demo-noor','todo','medium',4,'s2'),
  task('t16','p2','Plan the page order','Lay out the interviews, photos, and short stories so each spread has room to breathe.','demo-jules','backlog','low',9,'s4'),
  task('t17','p2','Add a map of favorite places','Create a small illustrated map that readers can take on their own neighborhood walk.','demo-ava','todo','medium',5,'s2','pending'),
  task('t9','p3','Sketch the study-partner screen','Show how someone chooses a subject, sees available classmates, and starts a study group.','demo-ava','todo','high',4,'s5'),
  task('t10','p3','Ask classmates what they need','Interview five classmates about when and where they prefer to study together.','demo-noor','done','high',-1,'s5'),
  task('t18','p3','Build the weekly planner','Make the first version of a week view with study sessions and room for homework deadlines.','demo-sam','doing','high',6,'s5'),
  task('t19','p3','Review our first wireframes','Check that the main actions are clear and the screens are readable on a small phone.','demo-jules','review','medium',3,'s5'),
  task('t20','p3','Write the welcome message','Explain how Study Club works in a few welcoming sentences.','demo-noor','backlog','low',8,'s5'),
  task('t21','p3','Plan the first classroom trial','Choose a small group to try the app and prepare three questions for their feedback.','demo-ava','todo','medium',15,'s6'),
  task('t22','p3','Add a quiet study preference','Let classmates say whether they prefer a quiet session or a discussion-based study group.','demo-sam','todo','medium',9,'s5','pending')
 ],
 notes:[
  {id:'n1',title:"The seedlings are ready",icon:'milestone',project_id:'p1',author_id:'demo-jules',body:'The garden center can donate the first tray of seedlings. We can pick them up once we have agreed on the bed layout. Ava’s drawings will help us work out how much space we need.',kind:'note',created_at:stamp(0,18)},
  {id:'n2',title:"Thanks for lending a hand",icon:'none',project_id:'p1',author_id:'demo-noor',body:'A thank-you to Sam for staying after school to measure the courtyard with me. We found a sunny spot for the herbs and still have plenty of room for a path.',kind:'shoutout',created_at:stamp(-1,17)},
  {id:'n3',title:"What to bring on planting day",icon:'urgent',project_id:'p1',author_id:'demo-ava',body:'For planting day, bring a water bottle and shoes you do not mind getting muddy. We will share tools, and there will be a job for everyone.',kind:'note',created_at:stamp(-2,16)},
  {id:'n4',title:"Our first garden meeting",icon:'none',project_id:'p1',author_id:'demo-ava',body:'Our first planning meeting is in the library on Thursday. Bring one idea for what we could grow.',kind:'note',created_at:stamp(-6),archived_at:stamp(-3)},
  {id:'n5',title:"A story from the bookshop",icon:'idea',project_id:'p2',author_id:'demo-jules',body:'The bookshop interview is ready to transcribe. There is a lovely story about the shop’s first customer that could open the issue. I have added the recording notes to our shared folder.',kind:'note',created_at:stamp(0,17)},
  {id:'n6',title:"The market, through Sam’s lens",icon:'none',project_id:'p2',author_id:'demo-ava',body:'Sam caught the morning light at the market beautifully. The photos make the neighborhood feel familiar and full of stories.',kind:'shoutout',created_at:stamp(-1)},
  {id:'n7',title:"Should we choose the subject first?",icon:'question',project_id:'p3',author_id:'demo-noor',body:'Most classmates want to find people studying the same subject before choosing a time. Let’s make that the first step on the study-partner screen.',kind:'note',created_at:stamp(0,16)},
  {id:'n8',title:"A clearer view on a small screen",icon:'none',project_id:'p3',author_id:'demo-ava',body:'Thanks to Jules for testing the wireframes on a phone. The larger subject buttons are much easier to use now.',kind:'shoutout',created_at:stamp(-1,18)},
  {id:'n9',title:"Help us name the app",icon:'question',project_id:'p3',author_id:'demo-sam',body:'We are collecting ideas for the app name this week. Add your suggestions before our next meeting.',kind:'note',created_at:stamp(-3),archived_at:stamp(-1)}
 ],
 comments:[
  {id:'c1',note_id:'n1',author_id:'demo-ava',body:'I’ll bring both layouts tomorrow so we can choose before collecting the seedlings.',created_at:stamp(0,19)},
  {id:'c2',note_id:'n1',author_id:'demo-sam',body:'I can help with the pickup after school on Friday.',created_at:stamp(0,20)},
  {id:'c3',note_id:'n2',author_id:'demo-jules',body:'The sunny corner will be perfect for the basil. Thank you both!',created_at:stamp(-1,19)},
  {id:'c4',note_id:'n5',author_id:'demo-noor',body:'I can work on the transcript while Ava finishes the opening story.',created_at:stamp(0,18)},
  {id:'c5',note_id:'n7',author_id:'demo-sam',body:'That fits the planner I’m building. We can show available times after the subject is selected.',created_at:stamp(0,17)},
  {id:'c6',note_id:'n7',author_id:'demo-ava',body:'Agreed. I’ll update the sketch before our review.',created_at:stamp(0,18)}
 ],
 reactions:[
  {note_id:'n1',user_id:'demo-ava',reaction:'celebrate'},{note_id:'n1',user_id:'demo-sam',reaction:'celebrate'},{note_id:'n1',user_id:'demo-noor',reaction:'agree'},
  {note_id:'n2',user_id:'demo-ava',reaction:'appreciate'},{note_id:'n2',user_id:'demo-jules',reaction:'appreciate'},{note_id:'n2',user_id:'demo-sam',reaction:'appreciate'},
  {note_id:'n5',user_id:'demo-noor',reaction:'agree'},{note_id:'n6',user_id:'demo-sam',reaction:'appreciate'},
  {note_id:'n7',user_id:'demo-ava',reaction:'agree'},{note_id:'n7',user_id:'demo-jules',reaction:'agree'},{note_id:'n8',user_id:'demo-jules',reaction:'appreciate'}
 ],
 messages:[
  {id:'m1',sender_id:'demo-jules',recipient_id:'demo-ava',body:'The garden center has confirmed the seedlings. Could you send me your favorite layout before tomorrow’s meeting?',created_at:stamp(-1,17),read_at:stamp(-1,18)},
  {id:'m2',sender_id:'demo-ava',recipient_id:'demo-jules',body:'Yes, I’m finishing the version with the wider path. I’ll put both options on the board so everyone can weigh in.',created_at:stamp(-1,18),read_at:stamp(-1,19)},
  {id:'m3',sender_id:'demo-jules',recipient_id:'demo-ava',body:'That sounds good. I’ve left a note for the group about pickup, too.',created_at:stamp(0,18),read_at:null},
  {id:'m4',sender_id:'demo-sam',recipient_id:'demo-ava',body:'The weekly planner is taking shape. Can we look at how it connects to your study-partner sketch?',created_at:stamp(-1,16),read_at:stamp(-1,17)},
  {id:'m5',sender_id:'demo-ava',recipient_id:'demo-sam',body:'Let’s look together after class. I’ll bring the updated sketch with the subject choices first.',created_at:stamp(-1,17),read_at:stamp(-1,18)},
  {id:'m6',sender_id:'demo-noor',recipient_id:'demo-ava',body:'I’ve added a rainwater station idea for approval. It could be a useful way to connect the garden to our science lessons.',created_at:stamp(0,17),read_at:null}
 ]
 };
}

// The first server and browser render use the same seed; local dates refresh after hydration.
export const demoData=createDemoData(new Date(2026,9,25));
