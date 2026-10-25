export type User={id:string;name:string;email:string};
export type Project={id:string;name:string;description:string;color:string;due_date:string|null;role:'lead'|'member'};
export type Member=User & {project_id:string;role:'lead'|'member'};
export type Task={id:string;project_id:string;title:string;description:string;assignee_id:string|null;status:string;priority:string;due_date:string|null;sprint_id:string|null};
export type Sprint={id:string;project_id:string;name:string;start_date:string;end_date:string};
export type Note={id:string;project_id:string;author_id:string;body:string;kind:string;created_at:string};
export type Message={id:string;sender_id:string;recipient_id:string;body:string;created_at:string;read_at:string|null};
export type Data={projects:Project[];members:Member[];tasks:Task[];sprints:Sprint[];notes:Note[];messages:Message[]};
