import React, { useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface TinyEditorProps {
  value?: string;
  onChange?: (content: string) => void;
}

const TinyEditor: React.FC<TinyEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <Editor
      apiKey="your-api-key" // Replace with your TinyMCE API key if you have one
      onInit={(evt, editor) => (editorRef.current = editor)}
      initialValue={value || ''}
      init={{
        height: 300,
        menubar: false,
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount'
        ],
        toolbar:
          'undo redo | formatselect | bold italic backcolor | \
          alignleft aligncenter alignright alignjustify | \
          bullist numlist outdent indent | removeformat | help',
      }}
      onEditorChange={(content) => {
        if (onChange) {
          onChange(content);
        }
      }}
    />
  );
};

export default TinyEditor;
