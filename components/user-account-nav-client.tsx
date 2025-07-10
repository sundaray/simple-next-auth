"use client";

import { useState } from "react";
import { UserSession } from "@/lib/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/icons";
import { signOut } from "@/app/auth-action";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function UserAccountNavClient({ user }: { user: UserSession }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Prevent dropdown from closing during sign out
  function handleOpenChange(open: boolean) {
    if (isSigningOut) return;
    setIsOpen(open);
  }

  // Handle the sign out process
  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      console.error("Unable to sign out:", error);
    } finally {
      setIsSigningOut(false);
      setIsOpen(false);
    }
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
        <DropdownMenuItem className="cursor-pointer">
          <Button onClick={handleSignOut} className="w-full rounded-full">
            {isSigningOut ? (
              <>
                <Icons.loader className="mr-2 size-3 animate-spin text-gray-400 strokeWidth={3}" />
                <p className="text-sm">Sign out</p>
              </>
            ) : (
              <>
                <Icons.logOut
                  className="mr-2 size-3 text-gray-400"
                  strokeWidth={3}
                />
                <p className="text-sm">Sign out</p>
              </>
            )}
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
