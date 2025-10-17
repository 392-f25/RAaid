import { useState } from 'react';
import { ref, set, push } from 'firebase/database';
import { db } from '../utilities/firebase';
// import type { Channel } from '../types/resident';

interface MemberFormData {
  name: string;
  room: string;
  preferredChannel: 'email' | 'groupme';
  email: string;
  groupme: string;
}

export const MemberInfoForm = () => {
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    room: '',
    preferredChannel: 'email',
    email: '',
    groupme: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create a new member entry in Firebase
      const newMemberRef = push(ref(db, 'residents'));
      await set(newMemberRef, {
        name: formData.name,
        room: formData.room,
        preferredChannel: formData.preferredChannel,
        email: formData.email || null,
        phone: null, // Not collected in member form
        groupme: formData.groupme || null,
      });

      console.log('Member info saved to Firebase successfully!');
      setSubmitted(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          room: '',
          preferredChannel: 'email',
          email: '',
          groupme: '',
        });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving member info to Firebase:', error);
      alert('Failed to submit information. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit Your Information</h2>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <p className="text-green-800 font-medium">
            Thank you! Your information has been submitted successfully.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">
              Room Number
            </label>
            <input
              type="text"
              id="room"
              name="room"
              value={formData.room}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="preferredChannel" className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Contact Method
            </label>
            <select
              id="preferredChannel"
              name="preferredChannel"
              value={formData.preferredChannel}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="email">Email</option>
              <option value="groupme">GroupMe</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required={formData.preferredChannel === 'email'}
            />
            {formData.preferredChannel === 'email' && (
              <p className="text-xs text-gray-500 mt-1">Required for email notifications</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors font-medium"
          >
            Submit Information
          </button>
        </form>
      )}
    </div>
  );
};
