"use client";

import React, { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  ImagePlus,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
} from "lucide-react";

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

import ImageUpload from "../components/ImageUpload";

function ImageInsertModal({
  onInsert,
  onCancel,
}: {
  onInsert: (url: string, alt: string) => void;
  onCancel: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");

  return (
    <div className="image-insert-modal" onClick={onCancel}>
      <div
        className="image-insert-modal__content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h3 className="text-base font-semibold text-gray-900">Insert Image</h3>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg text-xs font-medium">
            <button
              type="button"
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === "upload"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("upload")}
            >
              Upload File
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === "url"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("url")}
            >
              Image URL
            </button>
          </div>
        </div>

        {activeTab === "upload" ? (
          <div className="space-y-4">
            <ImageUpload
              onUpload={(media) => {
                setUrl(media.url);
                if (media.alt) setAlt(media.alt);
              }}
              label="Drop image to insert into article"
            />
            {url && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Alt / Caption Text
                </label>
                <input
                  type="text"
                  placeholder="Describe image for SEO"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Image URL
              </label>
              <input
                type="url"
                placeholder="https://res.cloudinary.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Alt Text (for SEO & accessibility)
              </label>
              <input
                type="text"
                placeholder="Describe the image"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
        )}

        <div className="image-insert-modal__actions mt-5 pt-3 border-t">
          <button className="image-insert-modal__cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="image-insert-modal__insert"
            onClick={() => {
              if (url.trim()) onInsert(url.trim(), alt.trim());
            }}
            disabled={!url.trim()}
          >
            Insert Image
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RichTextEditor({
  initialContent = "",
  onChange,
  placeholder = "Start writing your article... नेपाली र English दुवैमा लेख्नुहोस्",
}: RichTextEditorProps) {
  const [showImageModal, setShowImageModal] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Image.configure({
        HTMLAttributes: { class: "article-inline-image" },
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "tiptap-content",
        spellcheck: "true",
        // lang supports both Nepali and English
        lang: "ne,en",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  const insertImage = useCallback(
    (url: string, alt: string) => {
      if (editor) {
        editor.chain().focus().setImage({ src: url, alt }).run();
      }
      setShowImageModal(false);
    },
    [editor]
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="editor-wrapper">
      {/* Toolbar */}
      <div className="editor-toolbar">
        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <span className="editor-toolbar__divider" />

        {/* Headings */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "is-active" : ""
          }
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          className={
            editor.isActive("heading", { level: 4 }) ? "is-active" : ""
          }
          title="Heading 4"
        >
          <Heading4 className="w-4 h-4" />
        </button>

        <span className="editor-toolbar__divider" />

        {/* Inline formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "is-active" : ""}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <span className="editor-toolbar__divider" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <span className="editor-toolbar__divider" />

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>

        {/* Horizontal Rule */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </button>

        <span className="editor-toolbar__divider" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" }) ? "is-active" : ""
          }
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={
            editor.isActive({ textAlign: "right" }) ? "is-active" : ""
          }
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <span className="editor-toolbar__divider" />

        {/* Link */}
        <button
          type="button"
          onClick={setLink}
          className={editor.isActive("link") ? "is-active" : ""}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        {/* Image */}
        <button
          type="button"
          onClick={() => setShowImageModal(true)}
          title="Insert Image"
        >
          <ImagePlus className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Image Insert Modal */}
      {showImageModal && (
        <ImageInsertModal
          onInsert={insertImage}
          onCancel={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
}
