"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, X, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface PhotoUploadProps {
    currentUrl?: string | null;
    onUpload: (url: string | null) => void;
    folder?: string; // e.g., "santri" or "asatidz"
}

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export function PhotoUpload({ currentUrl, onUpload, folder = "photos" }: PhotoUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentUrl || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("File harus berupa gambar");
            return;
        }

        // Validate file size (1MB max)
        if (file.size > MAX_FILE_SIZE) {
            setError("Ukuran file maksimal 1MB");
            return;
        }

        // Show local preview immediately
        const localPreview = URL.createObjectURL(file);
        setPreview(localPreview);

        // Upload to Supabase Storage
        setUploading(true);
        try {
            const supabase = createClient();
            const fileName = `${folder}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

            const { data, error: uploadError } = await supabase.storage
                .from("photos")
                .upload(fileName, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from("photos")
                .getPublicUrl(data.path);

            onUpload(urlData.publicUrl);
            setPreview(urlData.publicUrl);
        } catch (err) {
            console.error("Upload error:", err);
            setError("Gagal upload foto. Pastikan bucket 'photos' sudah dibuat.");
            setPreview(currentUrl || null);
        } finally {
            setUploading(false);
            // Clean up local preview
            URL.revokeObjectURL(localPreview);
        }
    }, [folder, onUpload, currentUrl]);

    const handleRemove = useCallback(() => {
        setPreview(null);
        onUpload(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [onUpload]);

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Preview Circle */}
            <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                    {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User className="w-12 h-12 text-gray-400" />
                    )}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                    )}
                </div>

                {/* Remove Button */}
                {preview && !uploading && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Upload Button */}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={triggerFileInput}
                disabled={uploading}
                className="text-xs"
            >
                <Camera className="w-4 h-4 mr-1" />
                {preview ? "Ganti Foto" : "Upload Foto"}
            </Button>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Error Message */}
            {error && (
                <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            {/* Size Hint */}
            <p className="text-xs text-gray-400">Maks. 1MB</p>
        </div>
    );
}
