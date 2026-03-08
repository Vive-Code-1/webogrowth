import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, Save } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Profile() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (data) setFullName(data.full_name || "");
      return data;
    },
    enabled: !!user?.id,
  });

  const initials = profile?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const avatarUrl = profile?.avatar_url
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`
    : null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: filePath })
      .eq("id", user.id);

    setUploading(false);

    if (updateError) {
      toast({ title: "Update failed", description: updateError.message, variant: "destructive" });
    } else {
      toast({ title: "Avatar updated!" });
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);
    setSaving(false);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">Manage your account settings</p>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <Avatar className="h-24 w-24 border-2 border-border">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-heading">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-foreground" />
            ) : (
              <Camera className="h-5 w-5 text-foreground" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
        {role && (
          <span className="text-xs font-body text-muted-foreground capitalize bg-secondary px-3 py-1 rounded-full">
            {role}
          </span>
        )}
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="font-body text-sm">Full Name</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            className="font-body"
          />
        </div>
        <div className="space-y-2">
          <Label className="font-body text-sm">Email</Label>
          <Input
            value={profile?.email || user?.email || ""}
            disabled
            className="font-body opacity-60"
          />
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full font-body">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
