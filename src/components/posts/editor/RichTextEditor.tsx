"use client";

import { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlock from "@tiptap/extension-code-block";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaLink,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaList,
  FaListOl,
  FaChevronDown,
} from "react-icons/fa";
import "./editor.css";
import { Code } from "lucide-react";

const extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
    codeBlock: false, // Disable the default code block to use our custom one
  }),
  TextStyle,
  Underline,
  TextAlign.configure({
    types: ["heading", "paragraph"],
    alignments: ["left", "center", "right"],
  }),
  Link.configure({
    openOnClick: true,
    HTMLAttributes: {
      class: "text-blue-500 underline hover:text-blue-600",
    },
  }),
  Image.configure({
    HTMLAttributes: {
      class: "rounded-lg max-w-full h-auto",
    },
  }),
  CodeBlock.configure({
    HTMLAttributes: {
      class: "rounded-md bg-gray-100 p-4 font-mono text-sm dark:bg-gray-800",
    },
  }),
];

const RichTextEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState("0");
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState([]);

  const editor = useEditor({
    extensions,
    content: value,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      onChange(content);

      // Update word count and reading time
      const text = editor.getText();
      const words = text.trim().split(/\s+/).length;
      setWordCount(words);
      setReadingTime(Math.ceil(words / 200).toString());
    },
  });

  const handleFileUpload = async (file: File) => {
    console.log("Document upload started:", file.name);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Document upload failed");
      }

      const data = await response.json();
      console.log("Document upload response:", data);

      // Create a unique ID for the document
      const documentId = Date.now();

      // Create the new document item
      const newDocumentItem = {
        id: documentId,
        type: "document",
        name: file.name,
        url: data.url,
        thumbnail: data.thumbnail || data.url,
      };

      console.log("Adding new document item:", newDocumentItem);

      // Add the document to the uploadedMedia state immediately
      setUploadedMedia((prevMedia) => {
        console.log("Previous media:", prevMedia);
        const updatedMedia = [...prevMedia, newDocumentItem];
        console.log("Updated media:", updatedMedia);
        return updatedMedia;
      });

      // Insert the document into the editor
      const documentHtml = `
        <div class="document-embed">
          <a 
            href="${data.url}" 
            class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400"
            target="_blank" 
            rel="noopener noreferrer"
          >
            <span class="text-lg">📄</span>
            ${file.name}
          </a>
        </div>
      `;
      editor?.chain().focus().insertContent(documentHtml).run();

      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };

  const handleLinkSubmit = () => {
    if (linkUrl) {
      // Insert a simple underlined clickable link on a single line
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; color: #2563eb;">${linkUrl}</a><br/>`;
      editor?.chain().focus().insertContent(linkHtml).run();
      setLinkUrl("");
      setShowLinkMenu(false);
    }
  };

  const removeMedia = (id: number) => {
    const newMedia = uploadedMedia.filter((media) => media.id !== id);
    setUploadedMedia(newMedia);
  };

  // Add a useEffect to log the uploadedMedia state when it changes
  useEffect(() => {
    console.log("uploadedMedia state updated:", uploadedMedia);
  }, [uploadedMedia]);

  if (!editor) {
    return null;
  }

  return (
    <div className="editor-container">
      <div className="editor-header"></div>

      <div className="editor-toolbar">
        <div className="format-dropdown">
          <button className="format-dropdown-button">
            Paragraph
            <FaChevronDown className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`toolbar-button ${editor.isActive("bold") ? "active" : ""}`}
        >
          <FaBold className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`toolbar-button ${editor.isActive("italic") ? "active" : ""}`}
        >
          <FaItalic className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`toolbar-button ${editor.isActive("underline") ? "active" : ""}`}
        >
          <FaUnderline className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`toolbar-button ${editor.isActive("strike") ? "active" : ""}`}
        >
          <FaStrikethrough className="h-[18px] w-[18px]" />
        </button>

        <div className="toolbar-divider" />

        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`toolbar-button ${editor.isActive({ textAlign: "left" }) ? "active" : ""}`}
        >
          <FaAlignLeft className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`toolbar-button ${editor.isActive({ textAlign: "center" }) ? "active" : ""}`}
        >
          <FaAlignCenter className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`toolbar-button ${editor.isActive({ textAlign: "right" }) ? "active" : ""}`}
        >
          <FaAlignRight className="h-[18px] w-[18px]" />
        </button>

        <div className="toolbar-divider" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`toolbar-button ${editor.isActive("bulletList") ? "active" : ""}`}
        >
          <FaList className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`toolbar-button ${editor.isActive("orderedList") ? "active" : ""}`}
        >
          <FaListOl className="h-[18px] w-[18px]" />
        </button>

        <div className="toolbar-divider" />

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`toolbar-button ${editor.isActive("codeBlock") ? "active" : ""}`}
        >
          <Code className="h-[18px] w-[18px]" />
        </button>

        <div className="toolbar-divider" />

        <button
          className={`toolbar-button ${showLinkMenu ? "active" : ""}`}
          onClick={() => setShowLinkMenu(!showLinkMenu)}
        >
          <FaLink className="h-[18px] w-[18px]" />
        </button>
      </div>

      {showLinkMenu && (
        <div className="link-editor">
          <input
            type="text"
            placeholder="Enter URL..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="link-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLinkSubmit();
              }
            }}
          />
          <button
            onClick={handleLinkSubmit}
            className="rounded-md bg-green-500 px-3 py-1 text-white hover:bg-green-600"
          >
            Add
          </button>
        </div>
      )}

      <div className="editor-content">
        <EditorContent editor={editor} />
      </div>

      {/* Word Count and Reading Time */}
      <div className="editor-footer">
        <div className="word-count">
          <span>{wordCount} words</span>
          <span>{readingTime} min read</span>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
