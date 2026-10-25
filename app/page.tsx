import { auth } from '@/lib/auth';
import Workspace from '@/components/workspace';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const session = await auth.getSession();
  return <Workspace user={session.user ? {id:session.user.id,name:session.user.name,email:session.user.email}:null}/>;
}
