"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CancelTicketButtonProps {
  ticketId: string;
  ticketNumber: string;
  variant?: "icon" | "button";
}

export function CancelTicketButton({
  ticketId,
  ticketNumber,
  variant = "button",
}: CancelTicketButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticketId}/cancel`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membatalkan tiket");
      }

      toast.success("Tiket berhasil dibatalkan");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membatalkan tiket");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {variant === "icon" ? (
          <button
            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            title="Batalkan Tiket"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <Button variant="destructive" size="sm">
            <X className="w-4 h-4 mr-2" />
            Batalkan Tiket
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Batalkan Tiket</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin membatalkan tiket <strong>{ticketNumber}</strong>? Tindakan ini
            tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Membatalkan..." : "Batalkan Tiket"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
