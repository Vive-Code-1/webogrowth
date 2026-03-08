import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, Trash2 } from "lucide-react";

export function LogoUpload() {
  const { role } = useAuth();
  const { logoUrl, rawLogoPath, invalidate } = useAppSettings();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (role !== "admin") return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("branding")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "আপলোড ব্যর্থ", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("app_settings" as any)
      .update({ value: filePath, updated_at: new Date().toISOString() } as any)
      .eq("key", "logo_url");

    setUploading(false);

    if (updateError) {
      toast({ title: "সেটিংস আপডেট ব্যর্থ", description: updateError.message, variant: "destructive" });
    } else {
      toast({ title: "লোগো আপলোড সফল! ✅" });
      invalidate();
    }
  };

  const handleRemove = async () => {
    setUploading(true);

    if (rawLogoPath) {
      await supabase.storage.from("branding").remove([rawLogoPath]);
    }

    await supabase
      .from("app_settings" as any)
      .update({ value: null, updated_at: new Date().toISOString() } as any)
      .eq("key", "logo_url");

    setUploading(false);
    toast({ title: "লোগো সরানো হয়েছে" });
    invalidate();
  };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h2 className="font-heading text-base font-semibold text-foreground">Company Logo</h2>
      <p className="text-xs text-muted-foreground font-body">
        এই লোগো সাইডবার ও হেডারে দেখাবে। সবচেয়ে ভালো হয় স্বচ্ছ ব্যাকগ্রাউন্ডের PNG ব্যবহার করলে।
      </p>

      <div className="flex items-center gap-4">
        {logoUrl ? (
          <div className="h-16 w-16 rounded-lg border bg-secondary flex items-center justify-center overflow-hidden">
            <img src={logoUrl} alt="Company Logo" className="h-full w-full object-contain p-1" />
          </div>
        ) : (
          <div className="h-16 w-16 rounded-lg border bg-secondary flex items-center justify-center">
            <span className="text-2xl font-heading font-bold text-muted-foreground">W</span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="font-body"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
            {logoUrl ? "লোগো পরিবর্তন" : "লোগো আপলোড"}
          </Button>
          {logoUrl && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRemove}
              disabled={uploading}
              className="font-body text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              লোগো সরান
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}
