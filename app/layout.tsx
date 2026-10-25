import type { Metadata } from 'next';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/fraunces/400.css';
import '@fontsource/fraunces/500.css';
import './globals.css';
export const metadata: Metadata={title:'Common Ground — Your shared workspace',description:'A considered workspace for the projects you share.'};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>;}
