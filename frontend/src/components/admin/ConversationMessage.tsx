import type { Message, User } from "../../types/user";
import MessageAttachment from "../MessageAttachment";
import { sameId } from "./messageUtils";
import { formatName } from "./utils";

type Props = {
  message: Message;
  subjectUser: User;
  partner: User;
};

export default function ConversationMessage({ message, subjectUser, partner }: Props) {
  const fromSubject = sameId(message.senderId, subjectUser._id);
  const sender = fromSubject ? subjectUser : partner;
  const recipient = fromSubject ? partner : subjectUser;

  return (
    <div className={`flex ${fromSubject ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[min(100%,28rem)] rounded-xl px-3 py-2 text-sm border ${
          fromSubject ? "bg-primary/15 border-primary/30" : "bg-base-200 border-base-300"
        }`}
      >
        <div className="text-xs opacity-80 mb-1 space-y-0.5">
          <div className="min-w-0">
            <span className="font-medium">From:</span> {formatName(sender)}
            <span className="opacity-70 hidden sm:inline"> ({sender.email})</span>
          </div>
          <div className="min-w-0 hidden sm:block">
            <span className="font-medium">To:</span> {formatName(recipient)}{" "}
            <span className="opacity-70">({recipient.email})</span>
          </div>
          <div className="opacity-60">{new Date(message.createdAt).toLocaleString()}</div>
        </div>
        <MessageAttachment message={message} tone={fromSubject ? "outgoing" : "incoming"} />
        {message.text && (
          <div className={`whitespace-pre-wrap break-words ${message.attachment?.url ? "mt-2" : ""}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
