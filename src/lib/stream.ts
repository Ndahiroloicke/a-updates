import { StreamChat } from "stream-chat";

if (!process.env.NEXT_PUBLIC_STREAM_KEY) {
  throw new Error("NEXT_PUBLIC_STREAM_KEY is not set");
}

if (!process.env.STREAM_SECRET) {
  throw new Error("STREAM_SECRET is not set");
}

const streamServerClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_KEY,
  process.env.STREAM_SECRET
);

export default streamServerClient;
