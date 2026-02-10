"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";

const professionOptions = [
  { value: "GOVERNMENT_OFFICIAL", label: "ASN / Pegawai Pemerintah" },
  { value: "PRIVATE_EMPLOYEE", label: "Pegawai Swasta" },
  { value: "ENTREPRENEUR", label: "Wirausaha" },
  { value: "RESEARCHER", label: "Peneliti / Akademisi" },
  { value: "STUDENT", label: "Mahasiswa / Pelajar" },
  { value: "OTHERS", label: "Lainnya" },
];

const roleOptions = [
  { value: "VISITOR", label: "Pengunjung" },
  { value: "OPERATOR", label: "Operator" },
  { value: "ADMIN", label: "Administrator" },
];

interface User {
  id: string;
  name: string;
  email: string;
  professionType: string;
  role: string;
  isActive: boolean;
}

interface UpdateUserDialogProps {
  user: User;
}

export function UpdateUserDialog({ user }: UpdateUserDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    password: "",
    professionType: user.professionType,
    role: user.role,
    isActive: user.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.professionType) {
      toast.error("Mohon lengkapi semua data");
      return;
    }

    setIsLoading(true);

    try {
      const updateData: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        professionType: formData.professionType,
        role: formData.role,
        isActive: formData.isActive,
      };

      // Only include password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengupdate pengguna");
      }

      toast.success("Pengguna berhasil diupdate");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengupdate pengguna");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Pengguna</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password Baru (opsional)</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Kosongkan jika tidak ingin mengubah"
              minLength={6}
            />
            <p className="text-xs text-[#64748b]">
              Minimal 6 karakter. Kosongkan jika tidak ingin mengubah password.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profession">Pekerjaan</Label>
            <Select
              value={formData.professionType}
              onValueChange={(value) => setFormData({ ...formData, professionType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {professionOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="isActive">Status</Label>
            <Select
              value={formData.isActive.toString()}
              onValueChange={(value) => setFormData({ ...formData, isActive: value === "true" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Aktif</SelectItem>
                <SelectItem value="false">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" className="bg-[#d4744a] hover:bg-[#b85d38]" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
