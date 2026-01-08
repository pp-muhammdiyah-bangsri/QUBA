import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, GraduationCap, BookOpen, Quote, Sparkles } from "lucide-react";
import { getPublicTeachers } from "../actions";

export default async function PSBProfilPage() {
    const teachers = await getPublicTeachers();

    return (
        <div className="space-y-8 pb-12">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium mb-2 backdrop-blur-sm">
                    <Sparkles className="w-3 h-3" />
                    <span>Tim Pengajar Berdedikasi</span>
                </div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    Profil Asatidz
                </h1>
                <p className="text-lg text-muted-foreground">
                    Mengenal lebih dekat para pendidik dan pembimbing yang akan membersamai putra-putri Anda.
                </p>
            </div>

            {teachers.length === 0 ? (
                <div className="text-center py-16 bg-card/50 backdrop-blur-md rounded-2xl shadow-sm border border-dashed border-border">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">Data Belum Tersedia</h3>
                    <p className="text-muted-foreground">Profil asatidz akan segera ditampilkan.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teachers.map((teacher: any) => (
                        <Card key={teacher.id} className="group relative overflow-hidden border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 bg-card/60 backdrop-blur-md hover:-translate-y-1">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80 group-hover:h-1.5 transition-all" />

                            <CardHeader className="text-center pb-0 pt-8 relative z-10">
                                <div className="absolute top-4 right-4 text-emerald-100 dark:text-zinc-800 group-hover:text-emerald-50 dark:group-hover:text-zinc-700/50 transition-colors">
                                    <Quote className="w-12 h-12 rotate-180 opacity-50" />
                                </div>

                                <div className="relative w-28 h-28 mx-auto mb-4">
                                    <div className="absolute inset-0 bg-emerald-200 dark:bg-emerald-900 rounded-full blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />
                                    <div className="relative w-full h-full bg-muted rounded-full flex items-center justify-center overflow-hidden border-4 border-background shadow-sm group-hover:shadow-md transition-all">
                                        {teacher.foto_url ? (
                                            <img src={teacher.foto_url} alt={teacher.nama} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-12 h-12 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>
                                <CardTitle className="text-xl font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {teacher.nama}
                                </CardTitle>
                                <CardDescription className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    {teacher.jenis_kelamin === "P" ? "Ustadzah" : "Ustadz"} & Pembimbing
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-5 pt-6 relative z-10">
                                {teacher.biografi && (
                                    <p className="text-sm text-muted-foreground italic text-center line-clamp-3 px-2">
                                        "{teacher.biografi}"
                                    </p>
                                )}

                                <div className="space-y-3 pt-4 border-t border-border/50">
                                    {teacher.pendidikan && (
                                        <div className="flex items-start gap-3 text-sm text-muted-foreground">
                                            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-md shrink-0">
                                                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <span className="mt-0.5">{teacher.pendidikan}</span>
                                        </div>
                                    )}
                                    {teacher.keahlian && (
                                        <div className="flex items-start gap-3 text-sm text-muted-foreground">
                                            <div className="p-1.5 bg-teal-50 dark:bg-teal-900/30 rounded-md shrink-0">
                                                <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                            </div>
                                            <span className="mt-0.5">{teacher.keahlian}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
