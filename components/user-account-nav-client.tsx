"use client";

import { useState, useTransition } from "react";
import { UserSession } from "@/lib/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/icons";
import { signOut } from "@/app/auth-action";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function UserAccountNavClient({ user }: { user: UserSession }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Prevent dropdown from closing during sign out
  function handleOpenChange(open: boolean) {
    if (isPending) return;
    setIsOpen(open);
    if (!open) {
      setError(null);
    }
  }

  // Handle the sign out process
  function handleSignOut() {
    startTransition(async () => {
      setError(null);
      const result = await signOut();

      if (result && result._tag === "Error") {
        setError("Sign out error. Try again.");
      }
    });
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center space-x-1 rounded-full px-4 py-2 rounded-full"
        )}
      >
        <span className="text-sm font-medium text-gray-600">My Account</span>
        <Icons.chevronDown className="inline-block size-4 text-gray-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user?.email && (
              <>
                <p className="text-xs text-gray-500">signed in as</p>
                <p className="w-[200px] truncate text-sm text-gray-600 font-medium">
                  {user.email}
                </p>
              </>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-1">
          <div className="flex w-full flex-col items-center">
            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              onClick={handleSignOut}
              className={cn("w-full rounded-full", {
                "mt-2": error,
              })}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Icons.loader className="mr-2 size-3 animate-spin" />
                  <p className="text-sm">Signing out...</p>
                </>
              ) : (
                <>
                  <Icons.logOut className="mr-2 size-3" />
                  <p className="text-sm">Sign out</p>
                </>
              )}
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
