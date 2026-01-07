import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, FileText, UserCheck, Wallet, ArrowRight, Megaphone } from "lucide-react";

export default function PSBAlurPage() {
    const steps = [
        {
            icon: FileText,
            color: "emerald",
            title: "1. Pendaftaran Online",
            desc: "Calon santri mengisi formulir pendaftaran melalui website ini dengan data yang lengkap dan benar.",
            waktu: "Setiap Saat",
            action: "Mulai Daftar"
        },
        {
            icon: Wallet,
            color: "teal",
            title: "2. Pembayaran",
            desc: "Membayar biaya pendaftaran sebesar Rp 50.000 ke rekening yang ditentukan setelah mengisi formulir.",
            waktu: "1x24 Jam"
        },
        {
            icon: UserCheck,
            color: "emerald",
            title: "3. Tes Seleksi / Observasi",
            desc: "Mengikuti tes seleksi (membaca Al-Qur'an & wawancara) secara online atau offline sesuai jadwal.",
            waktu: "Jadwal Admin"
        },
        {
            icon: Megaphone,
            color: "teal",
            title: "4. Pengumuman",
            desc: "Menunggu hasil kelulusan yang akan diumumkan melalui website atau pesan WhatsApp.",
            waktu: "Sesuai Jadwal"
        },
        {
            icon: CheckCircle,
            color: "emerald",
            title: "5. Daftar Ulang",
            desc: "Melakukan daftar ulang bagi santri yang dinyatakan lolos seleksi dengan melengkapi administrasi.",
            waktu: "Sesuai Gelombang"
        }
    ];

    return (
        <div className="space-y-12 pb-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium mb-2 backdrop-blur-sm">
                    <Clock className="w-3 h-3" />
                    <span>Proses Mudah & Cepat</span>
                </div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    Alur Pendaftaran
                </h1>
                <p className="text-lg text-muted-foreground">
                    Tahapan penerimaan santri baru MBS QUBA & LKSA Mustadl'afin
                </p>
            </div>

            <div className="relative max-w-4xl mx-auto px-4">
                {/* Center Line for Desktop */}
                <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-emerald-200 via-teal-200 to-emerald-200 dark:from-emerald-900 dark:via-teal-900 dark:to-emerald-900 -translate-x-1/2 hidden md:block rounded-full opacity-50"></div>

                {/* Steps */}
                <div className="space-y-12 relative">
                    {steps.map((step, index) => (
                        <div key={index} className={`relative flex flex-col md:flex-row gap-8 items-center group ${index % 2 === 0 ? "md:flex-row-reverse" : ""
                            }`}>

                            {/* Icon Bubble */}
                            <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-background border-4 border-emerald-50 dark:border-zinc-800 flex items-center justify-center z-10 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:border-emerald-200 dark:group-hover:border-emerald-700">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.color === 'emerald' ? 'bg-emerald-600 dark:bg-emerald-600' : 'bg-teal-600 dark:bg-teal-600'
                                    } text-white shadow-inner`}>
                                    <step.icon className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Content Card */}
                            <div className="w-full md:w-1/2 pl-20 md:pl-0 md:px-12">
                                <Card className={`
                                    border-border/50 shadow-md hover:shadow-xl transition-all duration-300 bg-card/60 backdrop-blur-md overflow-hidden relative
                                    ${index % 2 === 0 ? "md:text-right" : "md:text-left"}
                                `}>
                                    <div className={`h-1.5 w-full bg-gradient-to-r ${step.color === 'emerald' ? 'from-emerald-400 to-emerald-600' : 'from-teal-400 to-teal-600'}`} />
                                    <CardContent className="p-6">
                                        <h3 className={`text-xl font-bold text-foreground mb-2 group-hover:text-${step.color}-600 dark:group-hover:text-${step.color}-400 transition-colors`}>
                                            {step.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                            {step.desc}
                                        </p>
                                        <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-muted rounded-full text-muted-foreground ${index % 2 === 0 ? "md:flex-row-reverse" : ""
                                            }`}>
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Estimasi: {step.waktu}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Spacer */}
                            <div className="hidden md:block w-1/2" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center pt-8">
                <div className="inline-flex flex-col items-center gap-2 animate-bounce text-emerald-600 dark:text-emerald-400 opacity-70">
                    <span className="text-xs font-medium uppercase tracking-widest">Mulai Sekarang</span>
                </div>
            </div>
        </div>
    );
}
