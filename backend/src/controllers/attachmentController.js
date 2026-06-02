import Message from "../models/message.js";

function makeContentDispositionFilename(filename = "download") {
  return filename.replace(/[\r\n"]/g, "_");
}

function isObjectIdEqual(a, b) {
  return String(a) === String(b);
}

async function streamToResponse(upstream, res) {
  if (!upstream.body) return false;
  const reader = upstream.body.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
  return true;
}

export const downloadAttachment = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found." });

    const isAllowed =
      isObjectIdEqual(message.senderId, myId) || isObjectIdEqual(message.receiverId, myId);

    if (!isAllowed) return res.status(403).json({ message: "Forbidden." });

    const att = message.attachment;
    if (!att?.url) return res.status(404).json({ message: "No attachment found." });

    const upstream = await fetch(att.url);
    if (!upstream.ok) {
      return res.status(502).json({ message: "Failed to fetch attachment." });
    }

    const filename = makeContentDispositionFilename(att.name || "download");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    const contentType = upstream.headers.get("content-type") || att.type;
    if (contentType) res.setHeader("Content-Type", contentType);

    const contentLength = upstream.headers.get("content-length");
    if (contentLength) res.setHeader("Content-Length", contentLength);

    const ok = await streamToResponse(upstream, res);
    if (!ok) return res.status(502).json({ message: "No upstream body." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log("Error in downloadAttachment controller: ", message);
    res.status(500).json({ message: "Internal server error" });
  }
};

