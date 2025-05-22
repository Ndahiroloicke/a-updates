import kyInstance from "@/lib/ky";
import { useEffect, useState, useRef } from "react";
import { StreamChat } from "stream-chat";
import { useSession } from "../SessionProvider";

export default function useInitializeChatClient() {
  const { user } = useSession();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const isConnecting = useRef(false);

  useEffect(() => {
    let client: StreamChat | null = null;

    const initializeClient = async () => {
      if (isConnecting.current) return;
      
      try {
        isConnecting.current = true;
        
        // Disconnect existing client if any
        if (chatClient) {
          await chatClient.disconnectUser();
          setChatClient(null);
        }

        client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);
        
        // Get token first
        const { token } = await kyInstance
          .get("/api/stream-token")
          .json<{ token: string }>();

        // Then connect user with token
        await client.connectUser(
          {
            id: user.id,
            username: user.username,
            name: user.displayName,
            image: user.avatarUrl,
          },
          token
        );

        setChatClient(client);
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        setChatClient(null);
      } finally {
        isConnecting.current = false;
      }
    };

    initializeClient();

    return () => {
      isConnecting.current = false;
      if (client) {
        client
          .disconnectUser()
          .catch((error) => console.error("Failed to disconnect user:", error))
          .then(() => {
            console.log("Connection closed");
            setChatClient(null);
          });
      }
    };
  }, [user.id]); // Only re-run if user ID changes

  return chatClient;
}
