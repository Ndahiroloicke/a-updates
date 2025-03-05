"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { type Editor, useCurrentEditor, EditorProvider } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaCode,
  FaRegTimesCircle,
  FaListUl,
  FaListOl,
  FaQuoteRight,
  FaRegDotCircle,
  FaUndo,
  FaRedo,
} from "react-icons/fa"

const extensions = [StarterKit]

const MenuBar: React.FC = () => {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-4">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 sm:p-2 rounded-full transition-colors ${editor.isActive("bold") ? "bg-blue-500 text-white" : "bg-card hover:scale-95"}`}
      >
        <FaBold size={16} className="sm:size-18" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 sm:p-2 rounded-full transition-colors ${editor.isActive("italic") ? "bg-blue-500 text-white" : "bg-card hover:scale-95"}`}
      >
        <FaItalic size={16} className="sm:size-18" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-1.5 sm:p-2 rounded-full transition-colors ${editor.isActive("strike") ? "bg-blue-500 text-white" : "bg-card hover:scale-95"}`}
      >
        <FaStrikethrough size={16} className="sm:size-18" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`p-1.5 sm:p-2 rounded-full transition-colors ${editor.isActive("code") ? "bg-blue-500 text-white" : "bg-card hover:scale-95"}`}
      >
        <FaCode size={16} className="sm:size-18" />
      </button>
      <button
        onClick={() => editor.chain().focus().clearNodes().run()}
        className="p-1.5 sm:p-2 bg-red-500 text-white rounded-full transition-colors hover:bg-red-600"
      >
        <FaRegTimesCircle size={16} className="sm:size-18" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 sm:p-2 rounded-full transition-colors ${editor.isActive("bulletList") ? "bg-blue-500 text-white" : "bg-card hover:scale-95"}`}
      >
        <FaListUl size={16} className="sm:size-18" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 sm:p-2 rounded-full transition-colors ${editor.isActive("orderedList") ? "bg-blue-500 text-white" : "bg-card hover:scale-95"}`}
      >
        <FaListOl size={16} className="sm:size-18" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 sm:p-2 rounded-full transition-colors ${editor.isActive("blockquote") ? "bg-blue-500 text-white" : "bg-card hover:scale-95"}`}
      >
        <FaQuoteRight size={16} className="sm:size-18" />
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-1.5 sm:p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300"
      >
        <FaRegDotCircle size={16} className="sm:size-18" />
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1.5 sm:p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300"
      >
        <FaUndo size={16} className="sm:size-18" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1.5 sm:p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300"
      >
        <FaRedo size={16} className="sm:size-18" />
      </button>
    </div>
  )
}

const RichTextEditor = ({ value, onChange }: { value: any; onChange: (value: any) => void }) => {
  const [editorContent, setEditorContent] = useState(value)

  useEffect(() => {
    if (value !== editorContent) {
      setEditorContent(value)
    }
  }, [value, editorContent]) // Added editorContent to the dependency array

  const handleEditorChange = (editor: Editor) => {
    const content = editor.getHTML()
    setEditorContent(content)
    onChange(content) // Call the onChange prop to update the parent state
  }

  return (
    <div className="p-2 sm:p-4 bg-background border rounded-lg shadow-lg overflow-x-hidden">
      <EditorProvider
        extensions={extensions}
        content={editorContent}
        onUpdate={({ editor }) => handleEditorChange(editor)}
        slotBefore={<MenuBar />}
      />
    </div>
  )
}

export default RichTextEditor

