import React from 'react';
import Editor from '@monaco-editor/react';

function CodeEditor({ code, setCode, language = "javascript" }) {
  const handleEditorChange = (value) => {
    setCode(value);
  };

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-[#1e1e1e]">
      <div className="bg-[#2d2d2d] text-gray-300 px-4 py-2 text-sm flex justify-between items-center border-b border-gray-700">
        <span className="font-mono">{language.toUpperCase()}</span>
        <span className="text-xs text-gray-500">Auto-evaluates on submit</span>
      </div>
      <Editor
        height="100%"
        width="100%"
        theme="vs-dark"
        language={language}
        value={code}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          padding: { top: 16 }
        }}
      />
    </div>
  );
}

export default CodeEditor;
