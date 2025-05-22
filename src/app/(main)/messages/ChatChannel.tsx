import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import {
  Channel,
  ChannelHeader,
  ChannelHeaderProps,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";

interface ChatChannelProps {
  open: boolean;
  openSidebar: () => void;
}

export default function ChatChannel({ open, openSidebar }: ChatChannelProps) {
  return (
    <div className={cn("h-full w-full md:block", !open && "hidden")}>
      <Channel>
        <Window>
          <CustomChannelHeader openSidebar={openSidebar} />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </div>
  );
}

function CustomChannelHeader({ openSidebar }: { openSidebar: () => void }) {
  return (
    <ChannelHeader>
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant="ghost"
          className="md:hidden"
          onClick={openSidebar}
        >
          <Menu className="size-5" />
        </Button>
      </div>
    </ChannelHeader>
  );
}
