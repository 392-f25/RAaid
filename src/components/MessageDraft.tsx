import React, { useState, useEffect } from 'react';
import type { PropsWithChildren } from 'react';

const DRAFT_KEY = 'raid-message-draft';

const MessageDraft = (props: PropsWithChildren<{}>) => {
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) setMessage(draft);
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, message);
    setSaved(true);
    const timer = setTimeout(() => setSaved(false), 1200);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className='w-full max-w-xl p-6 bg-white rounded shadow'>
      <label htmlFor='message' className='block text-lg font-semibold mb-2'>Draft Message</label>
      <textarea
        id='message'
        className='w-full h-32 p-2 border rounded focus:outline-none focus:ring'
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder='Type your message here...'
      />
      <div className='flex items-center mt-2'>
        {saved && <span className='text-green-500 text-sm'>Draft saved</span>}
      </div>
    </div>
  );
};

export { MessageDraft };
