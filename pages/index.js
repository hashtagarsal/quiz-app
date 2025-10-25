import Layout from '../components/Layout';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout title="Quiz App - Home">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Quiz Application</h1>
          <p className="text-gray-600">Create interactive quizzes and share them instantly</p>
        </div>
        
        <div className="max-w-md mx-auto">
          <Link
            href="/create"
            className="block p-8 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition space-y-2 text-center"
          >
            <div className="text-2xl font-bold">Create Quiz</div>
            <div className="text-sm opacity-90">Build a new quiz from JSON</div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}