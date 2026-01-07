import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllAsatidz, getChildTeacherIds } from "../actions";
import { User, GraduationCap, BookOpen, Star } from "lucide-react";

interface Asatidz {
    id: string;
    nama: string;
    jenis_kelamin: "L" | "P" | null;
    biografi: string | null;
    pendidikan: string | null;
    keahlian: string | null;
    foto_url: string | null;
}

export default async function PengajarPage() {
    const [asatidzList, childTeachers] = await Promise.all([
        getAllAsatidz(),
        getChildTeacherIds()
    ]);

    const { waliKelasId, musyrifId } = childTeachers;

    const getLabel = (teacher: Asatidz) => {
        const isWaliKelas = waliKelasId === teacher.id;
        const isMusyrif = musyrifId === teacher.id;

        if (isWaliKelas && isMusyrif) {
            const musyrifLabel = teacher.jenis_kelamin === "P" ? "Musyrifah" : "Musyrif";
            return `Wali Kelas dan ${musyrifLabel} Anak Anda`;
        } else if (isWaliKelas) {
            return "Wali Kelas Anak Anda";
        } else if (isMusyrif) {
            const musyrifLabel = teacher.jenis_kelamin === "P" ? "Musyrifah" : "Musyrif";
            return `${musyrifLabel} Halaqoh Anak Anda`;
        }
        return null;
    };

    // Sort: child's teachers first
    const sortedAsatidz = [...asatidzList].sort((a, b) => {
        const aIsChild = a.id === waliKelasId || a.id === musyrifId;
        const bIsChild = b.id === waliKelasId || b.id === musyrifId;
        if (aIsChild && !bIsChild) return -1;
        if (!aIsChild && bIsChild) return 1;
        return 0;
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Profil Asatidz</h1>
                <p className="text-gray-500">Daftar seluruh Ustadz & Ustadzah di Pondok Pesantren.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(sortedAsatidz as Asatidz[]).map((teacher) => {
                    const label = getLabel(teacher);
                    return (
                        <Card key={teacher.id} className={label ? "ring-2 ring-emerald-500 ring-offset-2" : ""}>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        {teacher.foto_url ? (
                                            <img src={teacher.foto_url} alt={teacher.nama} className="w-16 h-16 rounded-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 text-emerald-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg truncate">
                                            {teacher.jenis_kelamin === "P" ? "Ustadzah" : "Ustadz"} {teacher.nama}
                                        </CardTitle>
                                        {label && (
                                            <Badge className="bg-emerald-500 text-white mt-1 flex items-center gap-1 w-fit">
                                                <Star className="w-3 h-3" />
                                                {label}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {teacher.biografi && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <User className="w-4 h-4" /> Biografi
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{teacher.biografi}</p>
                                    </div>
                                )}
                                {teacher.pendidikan && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4" /> Pendidikan
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{teacher.pendidikan}</p>
                                    </div>
                                )}
                                {teacher.keahlian && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" /> Keahlian
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{teacher.keahlian}</p>
                                    </div>
                                )}
                                {!teacher.biografi && !teacher.pendidikan && !teacher.keahlian && (
                                    <p className="text-sm text-gray-400 italic">
                                        Profil belum dilengkapi.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
                {asatidzList.length === 0 && (
                    <Card className="md:col-span-2 lg:col-span-3 bg-gray-50">
                        <CardContent className="py-8 text-center text-gray-500">
                            Belum ada data Asatidz.
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
