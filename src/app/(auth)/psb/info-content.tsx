import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Calendar, GraduationCap, Heart, Info, ScrollText, Star, Users } from "lucide-react";

const SimpleTable = ({ headers, rows }: { headers: string[]; rows: (string | number | React.ReactNode)[][] }) => (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
        <table className="w-full text-sm">
            <thead className="bg-emerald-50/50 dark:bg-emerald-950/20">
                <tr>
                    {headers.map((h, i) => (
                        <th key={i} className="px-4 py-3 text-left font-semibold text-emerald-900 dark:text-emerald-100 uppercase tracking-wider text-xs border-b border-border/50">
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
                {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors">
                        {row.map((cell, j) => (
                            <td key={j} className="px-4 py-3 text-muted-foreground align-top">
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export function InfoContent() {
    return (
        <div className="space-y-12 pb-12">
            {/* Header / Hero */}
            <div className="text-center space-y-6 relative">
                <div className="space-y-4 max-w-4xl mx-auto mt-10">
                    <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent tracking-tight pb-2">
                        Pondok Pesantren Muhammadiyah Bangsri
                    </h1>
                    <h2 className="text-xl md:text-2xl font-medium text-foreground/80">
                        MBS QUBA & LKSA Mustadl'afin
                    </h2>
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-full shadow-sm backdrop-blur-md">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <p className="text-lg font-medium text-emerald-900 dark:text-emerald-100 italic">
                            “Pinter Ngaji, Akhlaq Terpuji, Berprestasi”
                        </p>
                    </div>
                </div>
            </div>

            {/* Visi Misi */}
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-t-4 border-t-emerald-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/60 backdrop-blur-md border-x-0 border-b-0">
                    <CardHeader className="pb-2">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-4">
                            <Info className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-foreground">VISI</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground leading-relaxed">
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span>Menjadi institusi pendidikan dan perkaderan yang amanah, mandiri, dan berpengaruh pada terbangunnya peradaban dunia yang Islami.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span>Membentuk kader umat, kader persyarikatan Muhammadiyah, dan kader bangsa yang kuat, berilmu, dan kokoh berpegang pada Al-Qur’an dan Sunnah.</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
                <Card className="border-t-4 border-t-teal-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/60 backdrop-blur-md border-x-0 border-b-0">
                    <CardHeader className="pb-2">
                        <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mb-4">
                            <ScrollText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-foreground">MISI</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground leading-relaxed">
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                                <span>Menyelenggarakan pendidikan yang unggul dan berkualitas.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                                <span>Membangun jaringan kerjasama sinergis untuk membangun peradaban masyarakat yang Islami.</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Kurikulum Tabs */}
            <div className="space-y-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-4">Kurikulum & Program Unggulan</h2>
                    <p className="text-muted-foreground max-w-4xl mx-auto leading-relaxed text-justify md:text-center">
                        Kurikulum Pembelajaran Pondok Pesantren Muhammadiyah Bangsri merupakan hasil perpaduan antara kurikulum pelajaran yang ada di sekolah dengan tambahan pelajaran ilmu Agama yang tidak diajarkan di sekolah. Dirumuskan dengan semangat untuk menjadikan santri-santri Pondok Pesantren Muhammadiyah Bangsri generasi yang mencintai al-Qur’an, unggul dalam bidang Ilmu Agama dan berakhlak mulia, serta berprestasi di lingkungan sekolah.
                    </p>
                </div>

                <Tabs defaultValue="tahfiz" className="w-full">
                    <TabsList className="w-full h-auto p-1.5 bg-emerald-50/50 dark:bg-zinc-900/50 border border-emerald-100 dark:border-emerald-500/10 rounded-2xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8 gap-2">
                        {[
                            { id: "tahfiz", label: "Tahfiz", icon: Star },
                            { id: "arab", label: "Bhs. Arab", icon: BookOpen },
                            { id: "akidah", label: "Akidah", icon: Heart },
                            { id: "akhlak", label: "Akhlak", icon: Users },
                            { id: "fikih", label: "Fikih", icon: ScrollText },
                            { id: "kegiatan", label: "Kegiatan", icon: Calendar },
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-md py-3 rounded-xl transition-all"
                            >
                                <div className="flex flex-col items-center gap-1.5">
                                    <tab.icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </div>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="min-h-[400px]">
                        {/* Tahfiz Content */}
                        <TabsContent value="tahfiz">
                            <div className="space-y-6">
                                <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                            <Star className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">Target Hafalan (6 Juz Mutqin)</h3>
                                    </div>
                                    <SimpleTable
                                        headers={["Waktu", "Kelas", "Target Hafalan"]}
                                        rows={[
                                            ["Tahun 1", "VII (1 SMP)", "Juz 30"],
                                            ["Tahun 2", "VIII (2 SMP)", "Juz 1"],
                                            ["Tahun 3", "IX (3 SMP)", "Juz 2"],
                                            ["Tahun 4", "X (1 SMA)", "Juz 3"],
                                            ["Tahun 5", "XI (2 SMA)", "Juz 29"],
                                            ["Tahun 6", "XII (3 SMA)", "Juz 28"],
                                        ]}
                                    />
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-4 font-medium flex items-center gap-2">
                                        <Info className="w-4 h-4" />
                                        *Target khusus hingga 30 Juz tersedia bagi santri yang mampu & berprestasi.
                                    </p>
                                </div>

                                <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50">
                                    <h3 className="text-lg font-bold text-foreground mb-4">Metode Pembagian Halaqoh</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                                            <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2">Halaqoh Reguler</h4>
                                            <p className="text-sm text-muted-foreground">Tingkat Ula, Wustha, dan Ulya. Masing-masing dibagi menjadi 2 level kemampuan untuk pembelajaran yang optimal.</p>
                                        </div>
                                        <div className="p-4 bg-teal-50/50 dark:bg-teal-900/10 rounded-xl border border-teal-100 dark:border-teal-500/20">
                                            <h4 className="font-bold text-teal-800 dark:text-teal-300 mb-2">Halaqoh Sighar (Pemula)</h4>
                                            <p className="text-sm text-muted-foreground">Kelas khusus fokus perbaikan bacaan (Tahsin/Iqra) dengan target hafalan yang disesuaikan (1/2 juz per 3 tahun) untuk menjamin kualitas bacaan.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Bahasa Arab Content */}
                        <TabsContent value="arab">
                            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-foreground mb-2">Kurikulum Bahasa Arab</h3>
                                    <p className="text-muted-foreground">Target: Menghafal 2000 mufrodat, dapat melakukan percakapan aktif, dan memiliki kemampuan untuk membaca kitab kuning.</p>
                                </div>
                                <SimpleTable
                                    headers={["Kelas", "Materi Pokok"]}
                                    rows={[
                                        ["VII", "Memperbanyak Mufrodat dan bacaan tentang Perkenalan, Keluarga, Lingkungan Rumah, Profesi, dan Belajar Sorof"],
                                        ["VIII", "Memperbanyak Mufrodat dan bacaan tentang Lingkungan Sekolah, Hobi, Lingkungan Sekitar Masjid, dan Belajar Sorof"],
                                        ["IX", "Memperbanyak Mufrodat dan bacaan tentang Aktivitas Harian, Makanan, Wisata, dan Belajar Nahwu Sorof (Kitab Jurumiyah)"],
                                        ["X", "Memperbanyak Mufrodat dan bacaan tentang Kegiatan di Masjid, Pasar, Perpustakaan, Stasiun, dan Belajar Nahwu Sorof (Kitab Jurumiyah)"],
                                        ["XI", "Memperbanyak Mufrodat dan bacaan tentang Pengalaman di Rumah Sakit, Pelabuhan, Wisata di Yogyakarta, Hotel, dan Belajar Nahwu Sorof (Kitab Jurumiyah)"],
                                        ["XII", "Memperbanyak Mufrodat dan bacaan tentang Studi lanjut di Universitas Al-Azhar, Pekerjaan di Kedutaan, Bandara, Haji/Umroh, dan Belajar Nahwu Sorof (Kitab Jurumiyah)"],
                                    ]}
                                />
                            </div>
                        </TabsContent>

                        {/* Akidah Content */}
                        <TabsContent value="akidah">
                            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-foreground mb-2">Kurikulum Akidah</h3>
                                    <p className="text-muted-foreground">Penanaman tauhid yang lurus dan pemahaman keimanan yang kokoh.</p>
                                </div>
                                <SimpleTable
                                    headers={["Kelas", "Fokus Pembelajaran"]}
                                    rows={[
                                        ["VII", "Iman kepad Allah, Tauhid (Rububiyah, Uluhiyah, Mulkiyah), Iman Kepada Malaikat"],
                                        ["VIII", "Iman kepada kitab-kitab Allah, Para Rasul, Sifat-Sifat Rasul, Ketaatan Ulul Amri"],
                                        ["IX", "Iman Kepada Hari Akhir, Qadha & Qadar"],
                                        ["X", "Syuabul Iman (Cabang Iman), Ciri-ciri orang beriman"],
                                        ["XI", "Mendalami secara detail mengenai Janji, Syukur, Menjaga Lisan, Ikhlas, Zuhud, Malu"],
                                        ["XII", "Berdakwah dengan Tolong-menolong, Amar Ma'ruf Nahi Munkar, Memahami konsep Moderasi Beragama"],
                                    ]}
                                />
                            </div>
                        </TabsContent>

                        {/* Akhlak Content */}
                        <TabsContent value="akhlak">
                            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-foreground mb-2">Pendidikan Akhlak</h3>
                                    <p className="text-muted-foreground">Pembentukan karakter islami dan adab sehari-hari.</p>
                                </div>
                                <SimpleTable
                                    headers={["Kelas", "Materi Akhlak & Adab"]}
                                    rows={[
                                        ["VII", "Ikhlas, Syukur, Adab kepada Orang Tua & Guru"],
                                        ["VIII", "Cinta Rasul, Khusnudzan, Adab Bergaul"],
                                        ["IX", "Kasih Sayang (Manusia, Hewan, Alam), Pelestarian Lingkungan"],
                                        ["X", "Menghindari Israf, Riya, Sum'ah, Ghibah, Hasad, Takabur"],
                                        ["XI", "Menjauhi Penyakit Sosial (Bullying, Judi, Miras, Narkoba), Dakwah"],
                                        ["XII", "Adab Silaturahim, Bertetangga, Etika Digital & Media Sosial"],
                                    ]}
                                />
                            </div>
                        </TabsContent>

                        {/* Fikih Content */}
                        <TabsContent value="fikih">
                            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-foreground mb-2">Fikih Ibadah & Muamalah</h3>
                                    <p className="text-muted-foreground">Pemahaman tata cara ibadah yang benar sesuai tuntunan Islam dalam pandangan Tarjih Muhammadiyah.</p>
                                </div>
                                <SimpleTable
                                    headers={["Kelas", "Pokok Bahasan"]}
                                    rows={[
                                        ["VII", "Thaharah, Shalat Fardu, Sujud"],
                                        ["VIII", "Penyelenggaraan Jenazah, Haji, Umroh"],
                                        ["IX", "Kurban, Aqiqah, Rukhsah (Keringanan Ibadah)"],
                                        ["X", "Sumber Hukum Islam, Kulliyatul Khamsah"],
                                        ["XI", "Muamalah, Ekonomi Islam, Masalah Sosial"],
                                        ["XII", "Munakahat (Pernikahan), Mawaris (Hukum Waris)"],
                                    ]}
                                />
                            </div>
                        </TabsContent>

                        {/* Kegiatan Content */}
                        <TabsContent value="kegiatan">
                            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-foreground mb-2">Kalender Kegiatan Tahunan</h3>
                                    <p className="text-muted-foreground">Gambaran umum aktivitas santri sepanjang tahun ajaran.</p>
                                </div>
                                <SimpleTable
                                    headers={["Semester", "Bulan", "Agenda Utama"]}
                                    rows={[
                                        ["Ganjil", "Juli", "Khutbah Ta'aruf, MPLS, Dauroh Santri Baru"],
                                        ["Ganjil", "Agustus", "Peringatan HUT RI, Lomba Kemerdekaan"],
                                        ["Ganjil", "September", "Peringatan G30S PKI, Nonton Bareng"],
                                        ["Ganjil", "Oktober", "Bulan Bahasa / Kegiatan Tengah Semester"],
                                        ["Ganjil", "November", "Parade Tasmi', Peringatan Hari Santri"],
                                        ["Ganjil", "Desember", "Ujian Pondok, Penerimaan Raport, Libur Semester"],
                                        ["Genap", "Januari", "Dauroh Awal Semester, Pembukaan PSB"],
                                        ["Genap", "Februari", "Kegiatan Mandiri / Ekstrakurikuler"],
                                        ["Genap", "Maret", "Ujian Tengah Semester"],
                                        ["Genap", "April", "Festival Ramadhan, Buka Puasa Bersama"],
                                        ["Genap", "Mei", "Ujian Kenaikan Kelas, Tasmi' Akbar, Wisuda, Rihlah"],
                                        ["Genap", "Juni", "Kegiatan Dzulhijjah / Qurban"],
                                    ]}
                                />
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
