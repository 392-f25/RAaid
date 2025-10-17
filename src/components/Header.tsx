import { Link } from 'react-router-dom';

interface HeaderProps {
  raName: string;
  residentCount: number;
}

export const Header = ({ raName, residentCount }: HeaderProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-indigo-900">RAid</h1>
        <Link
          to="/member"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors"
        >
          Add New Member
        </Link>
      </div>
      <p className="text-gray-600 mt-1">Residential Assistant Communication Hub</p>
      <div className="mt-3 text-sm text-gray-500">
        <span className="font-medium">RA:</span> {raName} •
        <span className="ml-2">
          <span className="font-medium">Residents:</span> {residentCount}
        </span>
      </div>
    </div>
  );
};
