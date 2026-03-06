"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function GuestFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Mohon berikan rating bintang");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, rating, comment }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Gagal mengirim feedback");
      }

      setIsSuccess(true);
      localStorage.removeItem("silvana_active_guest_ticket");
      toast.success("Terima kasih atas penilaian Anda!");
      setTimeout(() => router.push("/queue"), 4000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Terima Kasih!</h1>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            Penilaian Anda sangat berharga bagi kami untuk meningkatkan kualitas layanan PST BPS Kaltara.
          </p>
          <button 
            onClick={() => router.push("/queue")}
            className="w-full py-4 bg-[#0046c0] text-white font-black rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            KEMBALI KE BERANDA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-[#0046c0] to-[#0072bc] p-10 text-center text-white">
            <h1 className="text-2xl font-black tracking-tight mb-2">Penilaian Layanan</h1>
            <p className="text-white/70 font-medium text-sm">Berikan masukan untuk layanan kami</p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            {/* Rating Stars */}
            <div className="space-y-4 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rating Pelayanan</p>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform active:scale-90 duration-200"
                  >
                    <Star
                      size={40}
                      className={`transition-colors duration-200 ${
                        (hoverRating || rating) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-100 text-slate-100"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm font-bold text-amber-500 min-h-[1.25rem]">
                {rating === 1 && "Sangat Buruk"}
                {rating === 2 && "Buruk"}
                {rating === 3 && "Cukup Baik"}
                {rating === 4 && "Baik"}
                {rating === 5 && "Sangat Baik!"}
              </p>
            </div>

            {/* Comment Area */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <MessageSquare size={14} className="text-slate-300" />
                Saran & Masukan (Opsional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Tuliskan pengalaman Anda..."
                className="w-full p-5 rounded-3xl bg-slate-50 border-2 border-slate-50 focus:border-[#0046c0] focus:bg-white focus:outline-none transition-all font-medium text-slate-800 placeholder:text-slate-300 shadow-inner"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || rating === 0}
                className="w-full flex items-center justify-center gap-2 py-5 bg-[#0046c0] text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    KIRIM PENILAIAN
                    <Send size={20} className="ml-1" />
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest pt-4">
              PST &bull; BPS PROV KALTARA
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
