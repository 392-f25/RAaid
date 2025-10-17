import React, { useState } from 'react';
import type { PropsWithChildren } from 'react';
import residents from '../utilities/residents.json';

const CHANNELS = ['email', 'sms', 'groupme'] as const;
type Channel = typeof CHANNELS[number];

const sendMessage = async (message: string, selectedChannels: Channel[]): Promise<{ [key: string]: boolean }> => {
  // Simulate sending logic
  const results: { [key: string]: boolean } = {};
  for (const resident of residents) {
    for (const channel of selectedChannels) {
      if (resident[channel]) {
        // Simulate success
        results[`${resident.name}-${channel}`] = true;
      }
    }
  }
  // Simulate network delay
  await new Promise(res => setTimeout(res, 800));
  return results;
};

const MultiChannelSend = (props: PropsWithChildren<{ draft: string }>) => {
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleChannelChange = (channel: Channel) => {
    setSelectedChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const handleSend = async () => {
    if (!props.draft.trim()) {
      setResult('Cannot send a blank message.');
      return;
    }
    if (selectedChannels.length === 0) {
      setResult('Please select at least one channel.');
      return;
    }
    setSending(true);
    const sendResults = await sendMessage(props.draft, selectedChannels);
    const successChannels = Object.keys(sendResults)
      .map(key => key.split('-')[1])
      .filter((v, i, arr) => arr.indexOf(v) === i);
    setResult(`Message sent via: ${successChannels.join(', ')}`);
    setSending(false);
  };

  return (
    <div className='w-full max-w-xl p-6 bg-white rounded shadow mt-6'>
      <label className='block text-lg font-semibold mb-2'>Select Channels</label>
      <div className='flex gap-4 mb-4'>
        {CHANNELS.map(channel => (
          <label key={channel} className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={selectedChannels.includes(channel)}
              onChange={() => handleChannelChange(channel)}
              className='accent-blue-500'
            />
            <span className='capitalize'>{channel}</span>
          </label>
        ))}
      </div>
      <button
        className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50'
        onClick={handleSend}
        disabled={sending}
      >
        {sending ? 'Sending...' : 'Send Message'}
      </button>
      {result && (
        <div className='mt-4 p-2 bg-green-100 text-green-700 rounded'>{result}</div>
      )}
    </div>
  );
};

export { MultiChannelSend };
