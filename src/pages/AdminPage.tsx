/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { ref, onValue, set, remove } from 'firebase/database';
import { db } from '../utilities/firebase';
import residentsData from '../data/residents.json';
import type { Channel, Resident, SendResult } from '../types/resident';
import { Header } from '../components/Header';
import { MessageInput } from '../components/MessageInput';
import { ErrorMessage } from '../components/ErrorMessage';
import { SuccessResults } from '../components/SuccessResults';
import { SendButton } from '../components/SendButton';
import { ResidentsList } from '../components/ResidentsList';
import { saveDraft, loadDraft, clearDraft } from '../utilities/localStorage';
import { sendEmail } from '../utilities/sendEmail';
import { sendGroupMe } from '../utilities/sendGroupMe';
import { sendSMS } from '../utilities/sendSMS';
import { ResidentForm } from '../components/ResidentForm';

// TODO: Add email and groupme features, as well as login tools for personalization

export function AdminPage() {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState<SendResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResidentIds, setSelectedResidentIds] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<'broadcast' | 'residents'>('broadcast');

  // Fetch residents from Firebase
  useEffect(() => {
    const residentsRef = ref(db, 'residents');
    const unsubscribe = onValue(residentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const residentsList: Resident[] = Object.entries(data).map(([id, resident]: [string, any]) => ({
          id,
          name: resident.name,
          room: resident.room,
          preferredChannel: resident.preferredChannel,
          email: resident.email,
          phone: resident.phone,
          groupme: resident.groupme,
        }));
        setResidents(residentsList);
        // Auto-select all residents
        setSelectedResidentIds(new Set(residentsList.map((r) => r.id)));
      } else {
        setResidents([]);
        setSelectedResidentIds(new Set());
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-save draft message to localStorage
  useEffect(() => {
    const savedDraft = loadDraft();
    if (savedDraft) {
      setMessage(savedDraft);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft(message);
    }, 500);

    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!sendResults) return;
    if (!message.trim()) return;
    setSendResults(null);
  }, [message, sendResults]);

  const handleSend = async () => {
    setError(null);
    setSendResults(null);

    // Validation
    if (!message.trim()) {
      setError('Message cannot be blank');
      return;
    }

    if (selectedResidentIds.size === 0) {
      setError('Please select at least one resident');
      return;
    }

    setIsSending(true);

    // Resolve each selected resident's channel: preferred if contact exists; otherwise fallback email > sms > groupme
    const channelToRecipients: Record<Channel, { id: string; name: string; contact: string | null }[]> = {
      email: [],
      sms: [],
      groupme: []
    };

    const selectedResidents = residents.filter((r) => selectedResidentIds.has(r.id));

    for (const resident of selectedResidents) {
      const tryAdd = (channel: Channel) => {
        const contact = channel === 'email' ? resident.email : channel === 'sms' ? resident.phone : resident.groupme;
        if (contact) {
          channelToRecipients[channel].push({ id: resident.id, name: resident.name, contact });
          return true;
        }
        return false;
      };

      // Use preferred if it has contact info
      if (resident.preferredChannel && tryAdd(resident.preferredChannel)) {
        continue;
      }

      // Fallback order: email -> sms -> groupme
      if (tryAdd('email')) continue;
      if (tryAdd('sms')) continue;
      if (tryAdd('groupme')) continue;
      // If no contact at all, skip resident
    }

    const channelParams = (['email', 'sms', 'groupme'] as Channel[])
      .filter((ch) => channelToRecipients[ch].length > 0)
      .map((channel) => ({ channel, message: message.trim(), recipients: channelToRecipients[channel] }));

    // Send messages through appropriate channels
    const results: SendResult[] = await Promise.all(
      channelParams.map(async (params) => {
        let success = false;

        try {
          if (params.channel === 'email') {
            success = await sendEmail({
              message: params.message,
              recipients: params.recipients
            });
          } else if (params.channel === 'groupme') {
            console.log("sendingGroupme");
            success = await sendGroupMe({
              message: params.message,
              recipients: params.recipients
            });
          } else if (params.channel === 'sms') {
            success = await sendSMS({
              message: params.message,
              recipients: params.recipients
            });
          }
        } catch (error) {
          console.error(`Error sending ${params.channel} message:`, error);
          success = false;
        }

        return {
          channel: params.channel,
          success,
          recipientCount: params.recipients.length
        };
      })
    );

    setSendResults(results);
    setIsSending(false);

    // Clear draft and message after send
    setMessage('');
    clearDraft();
  };

  const handleAddResident = () => {
    setEditingResident(null);
    setIsFormOpen(true);
  };

  const handleEditResident = (resident: Resident) => {
    setEditingResident(resident);
    setIsFormOpen(true);
  };

  const handleDeleteResident = async (residentId: string) => {
    try {
      await remove(ref(db, `residents/${residentId}`));
      console.log('Resident deleted from Firebase');
    } catch (error) {
      console.error('Error deleting resident:', error);
      alert('Failed to delete resident. Please try again.');
    }
  };

  const handleSaveResident = async (resident: Resident) => {
    try {
      const residentData = {
        name: resident.name,
        room: resident.room,
        preferredChannel: resident.preferredChannel,
        email: resident.email,
        phone: resident.phone,
        groupme: resident.groupme,
      };

      if (editingResident) {
        // Update existing resident
        await set(ref(db, `residents/${resident.id}`), residentData);
      } else {
        // Add new resident with timestamp ID
        const newId = Date.now().toString();
        await set(ref(db, `residents/${newId}`), residentData);
      }

      setIsFormOpen(false);
      setEditingResident(null);
      console.log('Resident saved to Firebase');
    } catch (error) {
      console.error('Error saving resident:', error);
      alert('Failed to save resident. Please try again.');
    }
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingResident(null);
  };

  const handleToggleResident = (residentId: string) => {
    const newSelected = new Set(selectedResidentIds);
    if (newSelected.has(residentId)) {
      newSelected.delete(residentId);
    } else {
      newSelected.add(residentId);
    }
    setSelectedResidentIds(newSelected);
  };

  const handleToggleAllResidents = () => {
    if (selectedResidentIds.size === residents.length) {
      // Deselect all
      setSelectedResidentIds(new Set());
    } else {
      // Select all
      setSelectedResidentIds(new Set(residents.map((r) => r.id)));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Header raName={residentsData.ra.name} residentCount={residents.length} />

        <div className="mt-6 md:mt-8">
          <div className="md:hidden mb-4 flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveMobileTab('broadcast')}
              aria-pressed={activeMobileTab === 'broadcast'}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold ${
                activeMobileTab === 'broadcast'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600'
              }`}
            >
              Broadcast
            </button>
            <button
              type="button"
              onClick={() => setActiveMobileTab('residents')}
              aria-pressed={activeMobileTab === 'residents'}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold ${
                activeMobileTab === 'residents'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600'
              }`}
            >
              Residents
            </button>
          </div>

          <div className="md:grid md:grid-cols-2 md:gap-6">
            <div
              className={`${
                activeMobileTab === 'broadcast' ? 'block' : 'hidden'
              } md:block`}
            >
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Broadcast Message</h2>

                <MessageInput value={message} onChange={setMessage} disabled={isSending} />

                {/* Channel selection removed: now messages are sent only to each resident's preferred channel with fallback */}

                {error && <ErrorMessage message={error} />}

                {sendResults && <SuccessResults results={sendResults} />}

                <div className="flex space-x-3">
                  <SendButton
                    isSending={isSending}
                    onSend={handleSend}
                  />
                </div>
              </div>
            </div>

            <div
              className={`${
                activeMobileTab === 'residents' ? 'block' : 'hidden'
              } md:block`}
            >
              <ResidentsList
                residents={residents}
                selectedResidentIds={selectedResidentIds}
                onToggleResident={handleToggleResident}
                onToggleAll={handleToggleAllResidents}
                onAdd={handleAddResident}
                onEdit={handleEditResident}
                onDelete={handleDeleteResident}
              />
            </div>
          </div>
        </div>

        {isFormOpen && (
          <ResidentForm
            resident={editingResident}
            onSave={handleSaveResident}
            onCancel={handleCancelForm}
          />
        )}
      </div>
    </div>
  );
}
