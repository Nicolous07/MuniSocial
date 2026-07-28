import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Render formatted chunks
  const parseLine = (input: string): React.ReactNode[] => {
    // We regex match tokens:
    // 1. ```code blocks``` or `inline code`
    // 2. *_~text~_* / combinations
    // 3. *bold*, _italic_, ~strikethrough~
    const tokenRegex = /(```[\s\S]*?```|`[^`]+`|\*_~[^~_*]+~_\*|\*~_[^~_*]+_~\*|\*_[^*_]+_\*|\*~[^*~]+~\*|~_[^~_]+_~|\*[^*]+\*|_[^_]+_|~[^~]+~)/g;

    const parts = input.split(tokenRegex);

    return parts.map((part, idx) => {
      if (!part) return null;

      // Triple backtick code block
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeContent = part.slice(3, -3).replace(/^[a-z]+\n/, ''); // trim language identifier if present
        return (
          <pre key={idx} className="bg-slate-900 border border-slate-800 text-indigo-300 p-2.5 rounded-xl font-mono text-xs my-1.5 overflow-x-auto">
            <code>{codeContent}</code>
          </pre>
        );
      }

      // Single backtick inline code
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={idx} className="bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-[11px] border border-indigo-500/20">
            {part.slice(1, -1)}
          </code>
        );
      }

      // Bold + Italic + Strikethrough: *_~text~_*
      if (
        (part.startsWith('*_~') && part.endsWith('~_*')) ||
        (part.startsWith('*~_') && part.endsWith('_~*'))
      ) {
        return (
          <strong key={idx} className="font-bold italic line-through">
            {part.slice(3, -3)}
          </strong>
        );
      }

      // Bold + Italic: *_text_*
      if (part.startsWith('*_') && part.endsWith('_*')) {
        return (
          <strong key={idx} className="font-bold italic">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Bold + Strikethrough: *~text~*
      if (part.startsWith('*~') && part.endsWith('~*')) {
        return (
          <strong key={idx} className="font-bold line-through">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic + Strikethrough: ~_text_~
      if (part.startsWith('~_') && part.endsWith('_~')) {
        return (
          <em key={idx} className="italic line-through">
            {part.slice(2, -2)}
          </em>
        );
      }

      // Bold: *text*
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <strong key={idx} className="font-bold text-white">
            {part.slice(1, -1)}
          </strong>
        );
      }

      // Italic: _text_
      if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
        return (
          <em key={idx} className="italic text-slate-200">
            {part.slice(1, -1)}
          </em>
        );
      }

      // Strikethrough: ~text~
      if (part.startsWith('~') && part.endsWith('~') && part.length > 2) {
        return (
          <del key={idx} className="line-through opacity-70">
            {part.slice(1, -1)}
          </del>
        );
      }

      return <span key={idx}>{part}</span>;
    });
  };

  const lines = text.split('\n');

  return (
    <div className={`whitespace-pre-wrap leading-relaxed ${className}`}>
      {lines.map((line, lIdx) => (
        <React.Fragment key={lIdx}>
          {parseLine(line)}
          {lIdx < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
};
