// components/QuestionCard.js

export default function QuestionCard({ 
  // ... props
}) {
  return (
    <div className="bg-white border-2 rounded-lg p-8 space-y-6">
      <h2 className="text-2xl font-bold">{question}</h2>
      <div className="space-y-3">
        {options.map((option, idx) => {
          const isSelected = selectedOption === option;
          return (
            <button
              key={idx}
              // ❌ OLD LOGIC: onClick={() => !isLocked && onSelect(option)}
              // ✅ NEW LOGIC: Check isLocked BEFORE onSelect is called
              onClick={() => onSelect(option)} // ⬅️ Remove the !isLocked check here.
              disabled={isLocked || isSelected} // ⬅️ CRUCIAL FIX: Ensure buttons are disabled once selected or locked.
              className={`w-full p-4 rounded-lg text-left transition ${
                isSelected
                  ? 'bg-blue-500 text-white'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}