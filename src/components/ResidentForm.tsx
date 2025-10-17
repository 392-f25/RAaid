import { useState, useEffect } from 'react';
import type { Resident } from '../types/resident';

type ResidentFormProps = {
  resident: Resident | null;
  onSave: (resident: Resident) => void;
  onCancel: () => void;
};

export const ResidentForm = ({ resident, onSave, onCancel }: ResidentFormProps) => {
  const [formData, setFormData] = useState<Omit<Resident, 'id'>>({
    name: '',
    room: '',
    preferredChannel: 'email',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (resident) {
      setFormData({
        name: resident.name,
        room: resident.room,
        preferredChannel: resident.preferredChannel,
        email: resident.email,
        phone: resident.phone,
      });
    } else {
      setFormData({
        name: '',
        room: '',
        preferredChannel: 'email',
        email: '',
        phone: '',
      });
    }
  }, [resident]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newResident: Resident = {
      id: resident ? resident.id : Date.now().toString(),
      ...formData,
    };
    onSave(newResident);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{resident ? 'Edit Resident' : 'Add Resident'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="room" className="block text-sm font-medium text-gray-700">
              Room
            </label>
            <input
              type="text"
              id="room"
              name="room"
              value={formData.room}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="preferredChannel" className="block text-sm font-medium text-gray-700">
              Preferred Channel
            </label>
            <select
              id="preferredChannel"
              name="preferredChannel"
              value={formData.preferredChannel}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="groupme">GroupMe</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email === null ? "" : formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone === null ? "" : formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
