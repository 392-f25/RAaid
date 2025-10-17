import type { Resident } from '../types/resident';

type ResidentsListProps = {
  residents: Resident[];
  selectedResidentIds: Set<string>;
  onToggleResident: (residentId: string) => void;
  onToggleAll: () => void;
  onAdd: () => void;
  onEdit: (resident: Resident) => void;
  onDelete: (residentId: string) => void;
};

export const ResidentsList = ({
  residents,
  selectedResidentIds,
  onToggleResident,
  onToggleAll,
  onAdd,
  onEdit,
  onDelete
}: ResidentsListProps) => {
  const allSelected = residents.length > 0 && selectedResidentIds.size === residents.length;
  return (
    <div className="mt-8 md:mt-0 bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Residents</h2>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Resident
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {residents.map((resident) => (
              <tr key={resident.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedResidentIds.has(resident.id)}
                    onChange={() => onToggleResident(resident.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {resident.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {resident.room}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {(() => {
                    // Determine effective channel: prefer preferredChannel if it has data; otherwise fallback in order email, sms, groupme
                    const hasEmail = Boolean(resident.email);
                    const hasSms = Boolean(resident.phone);
                    const hasGroupme = Boolean(resident.groupme);

                    const preferred = resident.preferredChannel;

                    const preferredHasData =
                      (preferred === 'email' && hasEmail) ||
                      (preferred === 'sms' && hasSms) ||
                      (preferred === 'groupme' && hasGroupme);

                    const effectiveChannel = preferredHasData
                      ? preferred
                      : hasEmail
                        ? 'email'
                        : hasSms
                          ? 'sms'
                          : hasGroupme
                            ? 'groupme'
                            : null;

                    if (!effectiveChannel) return null;

                    const label =
                      effectiveChannel === 'email'
                        ? 'Email'
                        : effectiveChannel === 'sms'
                          ? 'SMS'
                          : 'GroupMe';

                    const value =
                      effectiveChannel === 'email'
                        ? resident.email
                        : effectiveChannel === 'sms'
                          ? resident.phone
                          : resident.groupme;

                    return (
                      <span>
                        {label}: {value}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => onEdit(resident)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(resident.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
