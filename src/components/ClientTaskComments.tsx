import { useState } from "react";
import { useComments, useAddComment } from "@/hooks/useComments";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ClientTaskComments({ taskId }: { taskId: string }) {
  const { user } = useAuth();
  const { data: comments, isLoading } = useComments(taskId);
  const { mutate: addComment, isPending } = useAddComment();
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    addComment({ task_id: taskId, content: text.trim() }, { onSuccess: () => setText("") });
  };

  const initials = (name: string | null | undefined) =>
    (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="mt-2 rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
        <MessageCircle className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-body font-medium text-foreground">
          Feedback & Comments
        </span>
        {comments && comments.length > 0 && (
          <span className="text-[10px] text-muted-foreground">({comments.length})</span>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="max-h-60">
        <div className="p-3 space-y-3">
          {isLoading ? (
            <p className="text-xs text-muted-foreground font-body text-center py-4">Loading…</p>
          ) : !comments || comments.length === 0 ? (
            <p className="text-xs text-muted-foreground font-body text-center py-4">
              No comments yet — be the first to leave feedback.
            </p>
          ) : (
            comments.map((c) => {
              const isMe = c.user_id === user?.id;
              return (
                <div key={c.id} className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={c.user?.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {initials(c.user?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`max-w-[75%] space-y-0.5 ${isMe ? "items-end text-right" : ""}`}>
                    <div
                      className={`rounded-xl px-3 py-2 text-xs font-body leading-relaxed ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-secondary text-foreground rounded-tl-sm"
                      }`}
                    >
                      {c.content}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-body px-1">
                      {c.user?.full_name || "Unknown"} · {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex items-end gap-2 p-3 border-t border-border bg-muted/20">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your feedback…"
          className="min-h-[36px] max-h-24 resize-none text-xs font-body bg-background"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          size="icon"
          className="h-9 w-9 shrink-0"
          disabled={!text.trim() || isPending}
          onClick={handleSend}
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
