import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { setApiKey, clearApiKey } from '@/lib/storage';
import { KeyRound, X } from 'lucide-react';

interface ApiKeyBannerProps {
  hasKey: boolean;
  onKeyChange: () => void;
}

const ApiKeyBanner: React.FC<ApiKeyBannerProps> = ({ hasKey, onKeyChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [visible, setVisible] = useState(true);

  if (!visible || hasKey) return null;

  const handleSave = () => {
    if (!inputValue.trim()) return;
    setApiKey(inputValue.trim());
    setInputValue('');
    onKeyChange();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave();
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm">
      <KeyRound className="h-4 w-4 text-amber-600 shrink-0" />
      <span className="text-amber-800 shrink-0">Add your API key for live move coaching:</span>
      <Input
        type="password"
        placeholder="sk-ant-..."
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-7 text-xs flex-1 min-w-0"
      />
      <Button size="sm" className="h-7 px-2 text-xs shrink-0" onClick={handleSave}>
        Save
      </Button>
      <button
        onClick={() => setVisible(false)}
        className="text-amber-500 hover:text-amber-700 shrink-0"
        title="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Small management row shown when key is already set
export const ApiKeyStatus: React.FC<{ onKeyChange: () => void }> = ({ onKeyChange }) => {
  const handleClear = () => {
    clearApiKey();
    onKeyChange();
  };
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <KeyRound className="h-3 w-3" />
      <span>AI coaching active</span>
      <button onClick={handleClear} className="underline hover:no-underline">
        remove key
      </button>
    </div>
  );
};

export default ApiKeyBanner;
