"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { updateProfileAction } from "@/actions/auth-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function ProfileForm({ initialName }: { initialName: string | null }) {
  const { update } = useSession();
  const [name, setName] = useState(initialName || "");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!name.trim() || name.trim().length < 2) {
      setStatusMessage({ type: "error", text: "Name must be at least 2 characters." });
      return;
    }

    setIsLoading(true);

    try {
      const res = await updateProfileAction({ name });

      if (!res.success) {
        setStatusMessage({ type: "error", text: res.message || "Failed to update profile." });
        setIsLoading(false);
        return;
      }

      // Update client-side session token
      await update({ name: res.data?.name });

      setStatusMessage({ type: "success", text: "Profile details updated successfully." });
      setIsLoading(false);
    } catch {
      setStatusMessage({ type: "error", text: "An error occurred while updating profile." });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/20 text-rose-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <Input
        label="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        disabled={isLoading}
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isLoading}
        disabled={isLoading || name === initialName}
        className="bg-indigo-600 hover:bg-indigo-500 text-white"
      >
        Save Changes
      </Button>
    </form>
  );
}
