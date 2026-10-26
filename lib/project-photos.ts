export const projectPhotos = [
 {id:'research-library',category:'Study & research',title:'A library full of ideas',photographer:'Isaac Smith',page:'https://unsplash.com/photos/f7fsz-4U0PA',image:'photo-1579536976002-d19538c18b3c'},
 {id:'research-together',category:'Study & research',title:'Learning together',photographer:'Jaykumar Bherwani',page:'https://unsplash.com/photos/Dg8WzlOE1as',image:'photo-1762512346988-045f4d5ad2b3'},
 {id:'art-watercolor',category:'Art & design',title:'Watercolors and brushes',photographer:'Sixteen Miles Out',page:'https://unsplash.com/photos/DgOKguhLqXM',image:'photo-1723763877789-12dbf4a87d59'},
 {id:'art-palette',category:'Art & design',title:'Color in the making',photographer:'Ashe Walker',page:'https://unsplash.com/photos/9AINkqzWVbE',image:'photo-1770956611423-300ba942fe9f'},
 {id:'nature-seedlings',category:'Science & nature',title:'New growth',photographer:'Rynco Maekawa',page:'https://unsplash.com/photos/FjNrw31KIrA',image:'photo-1783605021867-c2f58de01b8a'},
 {id:'nature-garden',category:'Science & nature',title:'Growing something together',photographer:'Sandie Clarke',page:'https://unsplash.com/photos/q13Zq1Jufks',image:'photo-1611843467160-25afb8df1074'},
 {id:'tech-workspace',category:'Technology',title:'A space to build',photographer:'Bayu Syaits',page:'https://unsplash.com/photos/oYzjGQ7LCVE',image:'photo-1778146476147-5f8d4bd03c79'},
 {id:'tech-code',category:'Technology',title:'Ideas into code',photographer:'Daniil Komov',page:'https://unsplash.com/photos/41cG8-U74lc',image:'photo-1763568258320-c954a19683e3'},
] as const;
export function photoUrl(photo:typeof projectPhotos[number],width=1000){return `https://images.unsplash.com/${photo.image}?auto=format&fit=crop&w=${width}&h=${Math.round(width*.55)}&q=80`;}
export const sprintColors=[['sage','Green'],['rust','Coral'],['blue','Blue'],['ochre','Gold'],['violet','Violet'],['teal','Teal']] as const;
export function sprintColor(color?:string){return sprintColors.some(([value])=>value===color)?color:'sage';}
