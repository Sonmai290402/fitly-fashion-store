"use client";

import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";

import { Button } from "@/components/ui/button";

import { TextAlignButton } from "../tiptap-ui/text-align-button";

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const TipTapEditor = ({ value, onChange, placeholder }: TipTapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: "text-justify",
          },
        },
      }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    editable: true,

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[150px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
        placeholder: placeholder ?? "",
      },
    },
  });

  if (!editor) {
    return (
      <div className="h-[150px] border rounded-md animate-pulse bg-muted/50" />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1 p-1 border rounded-md bg-muted/20">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-muted" : ""}
        >
          <span className="font-bold">B</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-muted" : ""}
        >
          <span className="italic">I</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "bg-muted" : ""}
        >
          <span className="underline">U</span>
        </Button>

        <div className="flex gap-2">
          <TextAlignButton editor={editor} align="left" />
          <TextAlignButton editor={editor} align="center" />
          <TextAlignButton editor={editor} align="right" />
          <TextAlignButton editor={editor} align="justify" />
        </div>

        <div className="flex items-center gap-1">
          {["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFA500"].map(
            (color) => (
              <button
                key={color}
                type="button"
                onClick={() => editor.chain().focus().setColor(color).run()}
                className="w-6 h-6 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
                title={`Set text color to ${color}`}
              />
            )
          )}
        </div>
      </div>

      <EditorContent editor={editor} className="prose max-w-none" />
    </div>
  );
};

export default TipTapEditor;
