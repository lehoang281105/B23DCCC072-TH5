// components/TinyEditor.tsx
import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Form } from 'antd';

interface TinyEditorProps {
  value?: string;
  onChange?: (content: string) => void;
}

const TinyEditor: React.FC<TinyEditorProps> = ({ value, onChange }) => {
  return (
    <Editor
      apiKey="uutsknojf7kd97a4c45yhta4j0pgf5j7lcdd4ul38poxuzxa" // optional, or use your TinyMCE API key
      value={value}
      onEditorChange={(content) => onChange?.(content)}
      init={{
        height: 200,
        menubar: false,
        plugins: [
          'advlist autolink lists link image charmap preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount'
        ],
        toolbar:
          'undo redo | formatselect | bold italic backcolor | \
          alignleft aligncenter alignright alignjustify | \
          bullist numlist outdent indent | removeformat | help'
      }}
    />
  );
};

export default TinyEditor;
