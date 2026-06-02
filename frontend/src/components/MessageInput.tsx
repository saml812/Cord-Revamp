import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { PlusIcon, SendIcon, XIcon } from "lucide-react";

import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../stores/useChatStore";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { sendMessage, isSoundEnabled } = useChatStore();

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const nextHeight = Math.min(Math.max(el.scrollHeight, 40), 160);
    el.style.height = `${nextHeight}px`;
  }, [text]);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !selectedFile) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    await sendMessage({ text: text.trim(), file: selectedFile });
    setText("");
    setSelectedFile(null);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    textareaRef.current?.focus();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);

    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    if (file.type.startsWith("image/")) {
      setFilePreviewUrl(URL.createObjectURL(file));
    } else {
      setFilePreviewUrl(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-3 sm:p-4 border-t border-base-500/50 bg-base-100 shrink-0">
      {selectedFile && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center">
          <div className="relative">
            {filePreviewUrl ? (
              <img
                src={filePreviewUrl}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-base-300"
              />
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-200 px-3 py-2 max-w-[320px]">
                <span className="truncate text-sm text-base-content">{selectedFile.name}</span>
                <span className="text-xs text-base-content/60">
                  {(selectedFile.size / 1024).toFixed(0)} KB
                </span>
              </div>
            )}
            <button
              onClick={removeFile}
              className="absolute -top-2 -right-2 btn btn-xs btn-circle btn-neutral"
              type="button"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
        <div className="flex items-start gap-2 rounded-xl border border-base-300 bg-base-200 px-2 py-2 focus-within:ring-2 focus-within:ring-primary/40">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-ghost h-10 w-10 rounded-lg shrink-0 mt-0.5 p-0"
            aria-label="Add attachment"
            title="Add attachment"
          >
            <PlusIcon size={32} strokeWidth={2.25} />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            rows={1}
            onChange={(e) => {
              setText(e.target.value);
              if (isSoundEnabled) playRandomKeyStrokeSound();
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              if (e.shiftKey) return;
              if (e.nativeEvent.isComposing) return;
              e.preventDefault();
              formRef.current?.requestSubmit();
            }}
            className="min-h-10 max-h-40 flex-1 resize-none bg-transparent outline-none text-base-content placeholder:text-base-content/50 leading-5 py-2 px-2 mt-0.5 overflow-y-auto"
            placeholder="Message..."
          />

          <button
            type="submit"
            disabled={!text.trim() && !selectedFile}
            className="btn btn-ghost h-10 w-10 rounded-lg shrink-0 mt-0.5 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
            title="Send message"
          >
            <SendIcon size={32} strokeWidth={2.25} />
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

      </form>
    </div>
  );
}
export default MessageInput;