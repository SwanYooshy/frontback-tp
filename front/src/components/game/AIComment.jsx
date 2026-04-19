import { useEffect, useState } from 'react';

export default function AIComment({ comment }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (comment) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [comment]);

  if (!visible || !comment) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-gray-900/95 border border-gray-700 rounded-xl px-5 py-4 z-10">
      <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">
        Chroniqueur royal
      </p>
      <p className="text-gray-200 text-sm italic">"{comment}"</p>
    </div>
  );
}