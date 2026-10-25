import { auth } from '@/lib/auth';
import Workspace from '@/components/workspace';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function Home({searchParams}:{searchParams:Promise<{invite?:string}>}) {
  const {data:session} = await auth.getSession();
  const {invite}=await searchParams;
  if(!session?.user&&invite)redirect('/login?invite='+encodeURIComponent(invite));
  return <Workspace user={session?.user ? {id:session.user.id,name:session.user.name||session.user.email,email:session.user.email}:null}/>;
}
