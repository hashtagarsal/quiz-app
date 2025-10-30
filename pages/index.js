import Layout from '../components/Layout';
import Link from 'next/link';
import { List } from 'lucide-react';

export default function Home() {
  return (
    <Layout title="Quiz App - Home">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Quiz Application</h1>
          <p className="text-gray-600">Create interactive quizzes and share them instantly</p>
        </div>
        
        <div className="max-w-md mx-auto space-y-3">
          <Link
            href="/create"
            className="block p-8 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition space-y-2 text-center"
          >
            <div className="text-2xl font-bold">Create Quiz</div>
            <div className="text-sm opacity-90">Build a new quiz from JSON</div>
          </Link>
          
          <Link
            href="/my-quizzes"
            className="block p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <List className="w-5 h-5" />
              <span className="font-semibold">My Quizzes</span>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}