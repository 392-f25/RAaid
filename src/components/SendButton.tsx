interface SendButtonProps {
  isSending: boolean;
  onSend: () => void;
}

export const SendButton = ({ isSending, onSend }: SendButtonProps) => (
  <button
    onClick={onSend}
    disabled={isSending}
    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
      isSending
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
    } text-white`}
  >
    {isSending ? 'Sending...' : 'Send Message'}
  </button>
);
