import type { Message } from "../types/user";
import { getAttachmentDownloadUrl, isImageAttachment } from "../lib/messages";

type Tone = "outgoing" | "incoming";

type Props = {
  message: Message;
  tone: Tone;
  className?: string;
};

export default function MessageAttachment({ message, tone, className = "" }: Props) {
  const attachment = message.attachment;
  if (!attachment?.url) return null;

  if (isImageAttachment(attachment)) {
    return (
      <img
        src={attachment.url}
        alt={attachment.name ?? "Shared image"}
        className={`rounded-lg h-48 object-cover ${className}`}
      />
    );
  }

  const fileLinkClass =
    tone === "outgoing"
      ? "border-primary-content/30 bg-primary/20"
      : "border-base-400/50 bg-base-200";

  return (
    <a
      href={getAttachmentDownloadUrl(message._id)}
      download={attachment.name}
      target="_blank"
      rel="noreferrer"
      className={`mt-2 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${fileLinkClass} ${className}`}
    >
      <span className="truncate max-w-[220px]">{attachment.name || "Download file"}</span>
      <span className="opacity-70">↗</span>
    </a>
  );
}
