"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function FeedbackForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Mohon berikan rating");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, rating, comment }),
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = data.error || "Gagal mengirim feedback";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      toast.success("Terima kasih atas penilaian Anda!");
      router.refresh();
    } catch {
      const errorMsg = "Terjadi kesalahan, silakan coba lagi";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  const ratingLabels = ["", "Sangat Buruk", "Buruk", "Cukup", "Baik", "Sangat Baik"];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Star Rating */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-125"
            >
              <svg
                className={`w-10 h-10 transition-colors ${
                  star <= (hoveredRating || rating) ? "text-[#f59e0b]" : "text-slate-300"
                }`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          ))}
        </div>
        {(hoveredRating || rating) > 0 && (
          <p className="text-sm font-medium text-[#0a1628]">
            {ratingLabels[hoveredRating || rating]}
          </p>
        )}
      </div>

      {/* Comment */}
      <textarea
        placeholder="Tuliskan komentar atau saran Anda (opsional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#d4744a] focus:border-transparent transition-all placeholder:text-slate-400 resize-none"
      />

      <button
        type="submit"
        disabled={isLoading || rating === 0}
        className="w-full px-6 py-3 bg-gradient-to-r from-[#d4744a] to-[#b85d38] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Mengirim..." : "Kirim Penilaian"}
      </button>
    </form>
  );
}
