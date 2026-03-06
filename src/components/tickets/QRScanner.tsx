"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScan: (ticketNumber: string) => void;
}

export function QRScanner({ onScan }: QRScannerProps) {
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        // Success callback
        try {
          // Parse QR data (expecting JSON with ticketNumber)
          const data = JSON.parse(decodedText);
          if (data.ticketNumber) {
            onScan(data.ticketNumber);
            scanner.clear();
          } else {
            setError("QR Code tidak valid");
          }
        } catch {
          // If not JSON, treat as ticket number directly
          onScan(decodedText);
          scanner.clear();
        }
      },
      (errorMessage) => {
        // Error callback - don't show errors for every frame
        // Only log critical errors
        if (errorMessage.includes("NotAllowedError")) {
          setError("Akses kamera ditolak. Silakan izinkan akses kamera.");
        }
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {
          // Ignore errors during cleanup
        });
      }
    };
  }, [onScan]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Scanner Area */}
      <div className="glass rounded-xl p-6 shadow-card">
        <h3 className="text-lg font-bold text-[#0a1628] mb-4">Scan QR Code Tiket</h3>
        <div id="qr-reader" className="rounded-lg overflow-hidden" />
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Manual Input */}
      <div className="glass rounded-xl p-6 shadow-card">
        <h3 className="text-lg font-bold text-[#0a1628] mb-4">Atau Masukkan Nomor Tiket</h3>
        <form onSubmit={handleManualSubmit} className="flex gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Contoh: KS-20260210-001"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="font-mono"
            />
          </div>
          <Button type="submit" className="bg-[#d4744a] hover:bg-[#b85d38]">
            Cari
          </Button>
        </form>
      </div>
    </div>
  );
}
