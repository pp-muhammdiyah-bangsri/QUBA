"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, CheckCircle, FileText, User, MapPin, GraduationCap, Send, School, UserCheck, Sparkles, Loader2 } from "lucide-react";
import { submitPSBRegistration } from "../actions";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

export default function PSBFormPage() {
    const [step, setStep] = useState<Step>(1);
    const [formData, setFormData] = useState({
        // Data Santri
        nama: "",
        nisn: "",
        tempatLahir: "",
        tanggalLahir: "",
        jenisKelamin: "L",
        jenjang: "SMP",
        program: "MBS",
        asalSekolah: "",
        alamat: "",
        // Data Wali
        namaAyah: "",
        namaIbu: "",
        pekerjaanAyah: "",
        pekerjaanIbu: "",
        teleponWali: "",
        emailWali: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [registrationId, setRegistrationId] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleProgramChange = (value: string) => {
        setFormData(prev => ({ ...prev, program: value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const result = await submitPSBRegistration(formData);
            if (result.success && result.id) {
                setRegistrationId(result.id);
                setSubmitted(true);
            } else {
                // Show actual error for debugging
                const errorMsg = result.error || "Unknown error";
                alert(`Terjadi kesalahan: ${errorMsg}\n\nPastikan tabel 'pendaftar_psb' sudah dibuat di Supabase.`);
            }
        } catch (error) {
            console.error("Submit error:", error);
            alert("Terjadi kesalahan jaringan. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 4) as Step);
    const prevStep = () => setStep(s => Math.max(s - 1, 1) as Step);

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
                <div className="max-w-md w-full text-center relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-[80px] rounded-full -z-10" />
                    <Card className="shadow-2xl border-border/50 overflow-hidden relative bg-card/60 backdrop-blur-xl">
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                        <CardContent className="pt-12 pb-10">
                            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-background">
                                <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground mb-2">Pendaftaran Berhasil!</h2>
                            <p className="text-muted-foreground mb-8 leading-relaxed px-4">
                                Terima kasih telah mendaftar di program <span className="font-bold text-emerald-600 dark:text-emerald-400">{formData.program}</span>.<br />
                                Tim kami akan segera menghubungi Anda melalui WhatsApp.
                            </p>

                            <div className="bg-muted/50 rounded-xl p-4 mb-8 mx-4 border border-border/50">
                                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Nomor Registrasi</p>
                                <p className="font-mono text-2xl font-bold text-foreground tracking-wider">{registrationId}</p>
                            </div>

                            <Button onClick={() => window.location.href = "/psb"} className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 rounded-full shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 text-white">
                                Kembali ke Halaman Utama
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium mb-2 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50">
                    <Sparkles className="w-3 h-3" />
                    <span>Daftar Sekarang</span>
                </div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                    Formulir Pendaftaran
                </h1>
                <p className="text-lg text-muted-foreground">
                    Isi data diri calon santri dengan lengkap untuk memulai seleksi
                </p>
            </div>

            <Card className="shadow-2xl border-border/50 bg-card/60 backdrop-blur-md overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />

                {/* Progress Steps */}
                <div className="px-4 sm:px-8 py-8 border-b border-border/50 bg-muted/20">
                    <div className="relative flex justify-between items-center max-w-3xl mx-auto">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-border -z-10 rounded-full" />
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-emerald-500 -z-10 rounded-full transition-all duration-500"
                            style={{ width: `${((step - 1) / 3) * 100}%` }}
                        />

                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex flex-col items-center gap-2 relative">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-[3px]",
                                    step >= s
                                        ? "bg-emerald-600 border-background text-white shadow-lg shadow-emerald-500/30 scale-110"
                                        : "bg-muted border-background text-muted-foreground"
                                )}>
                                    {s}
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider absolute -bottom-6 w-32 text-center transition-colors duration-300",
                                    step >= s ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                                )}>
                                    {s === 1 && "Data Santri"}
                                    {s === 2 && "Alamat"}
                                    {s === 3 && "Wali"}
                                    {s === 4 && "Review"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <CardContent className="p-6 sm:p-10 pt-12">
                    {/* Step 1: Data Santri */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">Identitas Calon Santri</h3>
                                    <p className="text-sm text-muted-foreground">Lengkapi data pribadi santri</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <Label className="mb-3 block text-base font-semibold">Pilihan Program *</Label>
                                    <RadioGroup defaultValue={formData.program} onValueChange={handleProgramChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <RadioGroupItem value="MBS" id="mbs" className="peer sr-only" />
                                            <Label
                                                htmlFor="mbs"
                                                className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-card p-6 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all cursor-pointer peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50/50 dark:peer-data-[state=checked]:bg-emerald-900/20 peer-data-[state=checked]:shadow-md"
                                            >
                                                <School className="mb-3 h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                                <span className="font-bold text-lg mb-1">MBS QUBA</span>
                                                <span className="text-sm text-center text-muted-foreground">(Reguler / Berbayar)</span>
                                            </Label>
                                        </div>
                                        <div>
                                            <RadioGroupItem value="LKSA" id="lksa" className="peer sr-only" />
                                            <Label
                                                htmlFor="lksa"
                                                className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-card p-6 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 hover:border-teal-200 dark:hover:border-teal-800 transition-all cursor-pointer peer-data-[state=checked]:border-teal-500 peer-data-[state=checked]:bg-teal-50/50 dark:peer-data-[state=checked]:bg-teal-900/20 peer-data-[state=checked]:shadow-md"
                                            >
                                                <UserCheck className="mb-3 h-8 w-8 text-teal-600 dark:text-teal-400" />
                                                <span className="font-bold text-lg mb-1">LKSA Mustadl'afin</span>
                                                <span className="text-sm text-center text-muted-foreground">(Beasiswa Yatim Dhuafa)</span>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Nama Lengkap *</Label>
                                        <Input className="h-12 bg-background/50" name="nama" value={formData.nama} onChange={handleChange} placeholder="Sesuai Akta Kelahiran" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>NISN</Label>
                                        <Input className="h-12 bg-background/50" name="nisn" value={formData.nisn} onChange={handleChange} placeholder="Nomor Induk Siswa Nasional" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Tempat Lahir *</Label>
                                        <Input className="h-12 bg-background/50" name="tempatLahir" value={formData.tempatLahir} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tanggal Lahir *</Label>
                                        <Input className="h-12 block w-full bg-background/50" name="tanggalLahir" type="date" value={formData.tanggalLahir} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Jenis Kelamin *</Label>
                                        <select
                                            name="jenisKelamin"
                                            value={formData.jenisKelamin}
                                            onChange={handleChange}
                                            className="w-full h-12 px-3 rounded-md border border-input bg-background/50 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="L">Laki-laki</option>
                                            <option value="P">Perempuan</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Jenjang *</Label>
                                        <select
                                            name="jenjang"
                                            value={formData.jenjang}
                                            onChange={handleChange}
                                            className="w-full h-12 px-3 rounded-md border border-input bg-background/50 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="SMP">SMP / MTs</option>
                                            <option value="SMA">SMA / MA</option>
                                            <option value="SMK">SMK</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Asal Sekolah</Label>
                                    <Input className="h-12 bg-background/50" name="asalSekolah" value={formData.asalSekolah} onChange={handleChange} placeholder="Nama sekolah sebelumnya" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Alamat */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">Alamat Domisili</h3>
                                    <p className="text-sm text-muted-foreground">Alamat lengkap calon santri</p>
                                </div>
                            </div>

                            <div>
                                <Label className="mb-2 block">Alamat Lengkap *</Label>
                                <textarea
                                    name="alamat"
                                    value={formData.alamat}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-md border border-input bg-background/50 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Jalan, RT/RW, Dusun, Desa/Kelurahan, Kecamatan, Kab/Kota, Kode Pos"
                                />
                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                    <School className="w-3 h-3" />
                                    Pastikan alamat sesuai dengan Kartu Keluarga (KK)
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Data Wali */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">Data Orang Tua / Wali</h3>
                                    <p className="text-sm text-muted-foreground">Informasi kontak orang tua</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-muted/30 p-6 rounded-xl border border-border/50 space-y-4">
                                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                                        <User className="w-4 h-4" /> Data Ayah
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nama Ayah *</Label>
                                            <Input className="bg-background/50" name="namaAyah" value={formData.namaAyah} onChange={handleChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Pekerjaan</Label>
                                            <Input className="bg-background/50" name="pekerjaanAyah" value={formData.pekerjaanAyah} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-muted/30 p-6 rounded-xl border border-border/50 space-y-4">
                                    <h4 className="font-bold text-teal-800 dark:text-teal-400 flex items-center gap-2">
                                        <User className="w-4 h-4" /> Data Ibu
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nama Ibu *</Label>
                                            <Input className="bg-background/50" name="namaIbu" value={formData.namaIbu} onChange={handleChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Pekerjaan</Label>
                                            <Input className="bg-background/50" name="pekerjaanIbu" value={formData.pekerjaanIbu} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 pt-2">
                                    <div className="space-y-2">
                                        <Label>No. HP / WhatsApp (Aktif) *</Label>
                                        <Input className="h-12 bg-background/50" name="teleponWali" value={formData.teleponWali} onChange={handleChange} placeholder="08..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email (Opsional)</Label>
                                        <Input className="h-12 bg-background/50" name="emailWali" type="email" value={formData.emailWali} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Konfirmasi */}
                    {step === 4 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">Konfirmasi Data</h3>
                                    <p className="text-sm text-muted-foreground">Cek kembali sebelum mengirim</p>
                                </div>
                            </div>

                            <div className="bg-card border border-border/50 rounded-xl overflow-hidden text-sm shadow-sm">
                                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 border-b border-border/50 flex justify-between items-center">
                                    <span className="font-medium text-muted-foreground">Program Dipilih</span>
                                    <span className="font-bold text-emerald-700 dark:text-emerald-400 px-3 py-1 bg-background/80 rounded-lg shadow-sm border border-border/50">
                                        {formData.program === 'MBS' ? 'MBS QUBA (Reguler)' : "LKSA Mustadl'afin"}
                                    </span>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div>
                                        <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                            <User className="w-4 h-4 text-emerald-500" /> Identitas Santri
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-border/50">
                                            <div><span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Nama Lengkap</span><p className="font-medium text-foreground">{formData.nama}</p></div>
                                            <div><span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">NISN</span><p className="font-medium text-foreground">{formData.nisn || "-"}</p></div>
                                            <div><span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">TTL</span><p className="font-medium text-foreground">{formData.tempatLahir}, {formData.tanggalLahir}</p></div>
                                            <div><span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Jenjang</span><p className="font-medium text-foreground">{formData.jenjang}</p></div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4 text-emerald-500" /> Data Wali
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-border/50">
                                            <div><span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Ayah</span><p className="font-medium text-foreground">{formData.namaAyah} <span className="text-muted-foreground text-xs">({formData.pekerjaanAyah})</span></p></div>
                                            <div><span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Ibu</span><p className="font-medium text-foreground">{formData.namaIbu} <span className="text-muted-foreground text-xs">({formData.pekerjaanIbu})</span></p></div>
                                            <div className="md:col-span-2"><span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">WhatsApp</span><p className="font-medium text-emerald-600 dark:text-emerald-400">{formData.teleponWali}</p></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-10">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={step === 1}
                            className="h-12 px-6 border-border/50"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Sebelumnya
                        </Button>
                        {step < 4 ? (
                            <Button onClick={nextStep} className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 rounded-full shadow-lg shadow-emerald-500/20 text-white">
                                Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto h-12 px-8 rounded-full shadow-lg shadow-emerald-500/20 disabled:opacity-50 text-white">
                                {isLoading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengirim...</>
                                ) : (
                                    <><Send className="w-4 h-4 mr-2" /> Kirim Pendaftaran</>
                                )}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
