import { MessageCircleIcon } from "lucide-react";

type NoChatHistoryPlaceholderProps = {
  name: string;
};

const NoChatHistoryPlaceholder = ({ name }: NoChatHistoryPlaceholderProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mb-5">
        <MessageCircleIcon className="size-8 text-primary" />
      </div>
      <h3 className="text-lg font-medium text-base-content mb-3">
        Start your conversation with {name}
      </h3>
      <div className="flex flex-col space-y-3 max-w-md mb-5">
        <p className="text-base-content/60 text-sm">
          This is the beginning of your conversation. Send a message to start chatting!
        </p>
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto"></div>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <button type="button" className="btn btn-xs btn-primary btn-outline rounded-full">
          👋 Say Hello
        </button>
        <button type="button" className="btn btn-xs btn-primary btn-outline rounded-full">
          🤝 How are you?
        </button>
        <button type="button" className="btn btn-xs btn-primary btn-outline rounded-full">
          📅 Meet up soon?
        </button>
      </div>
    </div>
  );
};

export default NoChatHistoryPlaceholder;