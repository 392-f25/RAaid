import { useState, useEffect } from 'react';
import residentsData from './data/residents.json';
import type { Channel, Resident, SendResult } from './types/resident';
import { Header } from './components/Header';
import { MessageInput } from './components/MessageInput';
import { ErrorMessage } from './components/ErrorMessage';
import { SuccessResults } from './components/SuccessResults';
import { SendButton } from './components/SendButton';
import { ResidentsList } from './components/ResidentsList';
import { saveDraft, loadDraft, clearDraft } from './utilities/localStorage';
import { sendEmail } from './utilities/sendEmail';
import { sendGroupMe } from './utilities/sendGroupMe';
import { sendSMS } from './utilities/sendSMS';
import { ResidentForm } from './components/ResidentForm';
import TestWrite from './utilities/testWrite';

// TODO: Add email and groupme features, as well as login tools for personalization

function App() {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState<SendResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [residents, setResidents] = useState<Resident[]>(residentsData.residents as Resident[]);
  const [selectedResidentIds, setSelectedResidentIds] = useState<Set<string>>(
    new Set(residentsData.residents.map((r) => r.id))
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);

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

  const handleNewMessage = () => {
    setMessage('');
    setSendResults(null);
    setError(null);
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

  const handleDeleteResident = (residentId: string) => {
    setResidents(residents.filter((r) => r.id !== residentId));
  };

  const handleSaveResident = (resident: Resident) => {
    if (editingResident) {
      setResidents(residents.map((r) => (r.id === resident.id ? resident : r)));
    } else {
      const newResident = { ...resident, id: Date.now().toString() };
      setResidents([...residents, newResident]);
      // Auto-select newly added resident
      setSelectedResidentIds(new Set([...selectedResidentIds, newResident.id]));
    }
    setIsFormOpen(false);
    setEditingResident(null);
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Header raName={residentsData.ra.name} residentCount={residents.length} />

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Broadcast Message</h2>

          <MessageInput value={message} onChange={setMessage} disabled={isSending} />

          {/* Channel selection removed: now messages are sent only to each resident's preferred channel with fallback */}

          {error && <ErrorMessage message={error} />}

          {sendResults && <SuccessResults results={sendResults} />}

          <div className="flex space-x-3">
            <SendButton
              isSending={isSending}
              showNewMessage={!!sendResults}
              onSend={handleSend}
              onNewMessage={handleNewMessage}
            />
            <TestWrite />
          </div>
        </div>

        <ResidentsList
          residents={residents}
          selectedResidentIds={selectedResidentIds}
          onToggleResident={handleToggleResident}
          onToggleAll={handleToggleAllResidents}
          onAdd={handleAddResident}
          onEdit={handleEditResident}
          onDelete={handleDeleteResident}
        />

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

export default App;