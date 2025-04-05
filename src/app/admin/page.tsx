import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Dashboard() {
  const { userId } = await auth();
  
  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect('/sign-in');
  }
  
  const user = await currentUser();

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <Link href="/" className="text-blue-500 hover:underline">
            Back to Home
          </Link>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{user?.emailAddresses[0]?.emailAddress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Your Search History</h2>
          <p className="text-gray-500 italic">No search history yet.</p>
        </div>
      </div>
    </main>
  );
} 