type GenderOption = {
  id: string;
  name: string;
  description: string;
  preview: string;
  gradient: string;
};

type GenderSelectorProps = {
  selectedGender: string;
  onGenderChange: (genderId: string) => void;
};

const genderOptions: GenderOption[] = [
  {
    id: 'Female',
    name: 'Female',
    description: 'Female representation',
    preview: '👩',
    gradient: 'from-pink-100 to-rose-200',
  },
  {
    id: 'Male',
    name: 'Male',
    description: 'Male representation',
    preview: '👨',
    gradient: 'from-blue-100 to-indigo-200',
  },
  {
    id: 'Other',
    name: 'Other',
    description: 'Non-binary representation',
    preview: '🧑',
    gradient: 'from-purple-100 to-violet-200',
  },
];

export function GenderSelector({
  selectedGender,
  onGenderChange,
}: GenderSelectorProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Gender</h2>
      <div className="grid grid-cols-3 gap-2">
        {genderOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onGenderChange(option.id)}
            className={`
              relative p-3 rounded-lg border-2 transition-all duration-200 text-left
              ${
                selectedGender === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {/* Preview Circle */}
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${option.gradient} flex items-center justify-center mb-2 text-sm`}
            >
              {option.preview}
            </div>

            {/* Style Info */}
            <div>
              <h3 className="font-medium text-xs text-gray-900 mb-1">
                {option.name}
              </h3>
            </div>

            {/* Selected Indicator */}
            {selectedGender === option.id && (
              <div className="absolute top-1 right-1">
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
