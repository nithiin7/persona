"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { deleteUserAccount } from "@/app/auth/login/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction
      type="submit"
      className="bg-red-600 text-white hover:bg-red-700 transition-colors duration-150"
      disabled={pending}
    >
      {pending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
      Delete Account
    </AlertDialogAction>
  );
}

export function DangerZone() {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900">Delete Account</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Permanently delete your account and all associated data. This cannot
          be undone.
        </p>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 h-8 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors duration-150 text-sm"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete Account
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <form action={deleteUserAccount}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your account and remove all your
                data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Type{" "}
                <span className="font-mono font-semibold text-gray-700">
                  DELETE
                </span>{" "}
                to confirm
              </label>
              <Input
                id="confirm"
                name="confirm"
                placeholder="DELETE"
                className="h-9 border-gray-200 bg-white placeholder:text-gray-400 text-sm focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                required
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-9 text-sm">
                Cancel
              </AlertDialogCancel>
              <SubmitButton />
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
