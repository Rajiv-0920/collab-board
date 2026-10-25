import { useState } from 'react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

/*
 * The little "type something, press Enter" box used for adding cards and lists.
 *  - Enter submits, Shift+Enter makes a new line, Escape cancels
 *  - stays open after a successful add so you can add several in a row
 */
const InlineComposer = ({
  placeholder,
  submitLabel = 'Add',
  multiline = true,
  onSubmit,
  onCancel,
}) => {
  const [value, setValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const submit = async () => {
    const text = value.trim();
    if (!text || isSaving) return;

    setIsSaving(true);
    try {
      await onSubmit(text);
      setValue('');
    } catch {
      // The caller shows the error toast; keep the text so nothing is lost.
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const Field = multiline ? Textarea : Input;

  return (
    <div className="space-y-2">
      <Field
        autoFocus
        value={value}
        disabled={isSaving}
        placeholder={placeholder}
        aria-label={placeholder}
        className={multiline ? 'resize-none bg-card' : 'bg-card'}
        rows={multiline ? 2 : undefined}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          disabled={!value.trim() || isSaving}
          onClick={submit}
        >
          {submitLabel}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8"
          aria-label="Cancel"
          onClick={onCancel}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default InlineComposer;
