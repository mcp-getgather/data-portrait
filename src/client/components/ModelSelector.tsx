type ModelOption = {
  id: string;
  name: string;
  description: string;
  preview: string;
  gradient: string;
};

type ModelSelectorProps = {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
};

const modelOptions: ModelOption[] = [
  {
    id: 'flux-schnell',
    name: 'FLUX Schnell',
    description: 'Fast, high-quality image generation with artistic flair',
    preview: '⚡',
    gradient: 'from-cyan-100 to-blue-200',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    description: "Google's advanced AI with photorealistic results",
    preview: '💎',
    gradient: 'from-emerald-100 to-teal-200',
  },
];

export function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">AI Model</h2>
      <div className="grid grid-cols-1 gap-2">
        {modelOptions.map((model) => (
          <button
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${
                selectedModel === model.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-start gap-3">
              {/* Preview Circle */}
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${model.gradient} flex items-center justify-center text-lg flex-shrink-0`}
              >
                {model.preview}
              </div>

              {/* Model Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-gray-900 mb-1">
                  {model.name}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {model.description}
                </p>
              </div>
            </div>

            {/* Selected Indicator */}
            {selectedModel === model.id && (
              <div className="absolute top-2 right-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
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

      {/* Model Description - Compact */}
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <span className="font-medium">
            {modelOptions.find((m) => m.id === selectedModel)?.name}:
          </span>{' '}
          {modelOptions.find((m) => m.id === selectedModel)?.description}
        </p>
      </div>
    </div>
  );
}
