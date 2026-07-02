export default function AIComment({ comment }) {
  if (!comment) return null;

  return (
    <div className="bg-gray-900/95 border-b border-gray-700 px-6 py-3 flex items-center gap-3">
      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap">
        Chroniqueur royal
      </span>
      <span className="text-gray-200 text-sm italic">"{comment}"</span>
    </div>
  );
}