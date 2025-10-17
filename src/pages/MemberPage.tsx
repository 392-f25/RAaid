import { Link } from 'react-router-dom';
import { MemberInfoForm } from '../components/MemberInfoForm';

export function MemberPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-end mb-4">
          <Link
            to="/admin"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors"
          >
            Admin Portal
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Member Portal</h1>
          <p className="text-gray-600">Please submit your contact information to stay connected</p>
        </div>

        <MemberInfoForm />
      </div>
    </div>
  );
}
