export type Role = 'admin' | 'ustadz' | 'ortu';
export type Jenjang = 'SMP' | 'SMA';
export type JenisKelamin = 'L' | 'P';
export type StatusPresensi = 'hadir' | 'izin' | 'sakit' | 'alpa';
export type StatusPerizinan = 'pending' | 'approved' | 'rejected';
export type JenisKegiatan = 'pembelajaran' | 'kajian' | 'event_umum';
export type PredikatTasmi = 'mumtaz' | 'jayyid' | 'maqbul';
export type KategoriMapel = 'diniyah' | 'umum';

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: Role;
    linked_santri_id: string | null;
    created_at: string;
}

export interface Santri {
    id: string;
    nis: string;
    nama: string;
    jenis_kelamin: JenisKelamin;
    alamat: string | null;
    nama_wali: string | null;
    kontak_wali: string | null;
    jenjang: Jenjang;
    status: string;
    created_at: string;
}

export interface Asatidz {
    id: string;
    nama: string;
    alamat: string | null;
    kontak: string | null;
    user_id: string | null;
    biografi: string | null;
    pendidikan: string | null;
    keahlian: string | null;
    foto_url: string | null;
    created_at: string;
}

export interface HafalanSelesai {
    id: string;
    santri_id: string;
    juz: number;
    nilai: string | null;
    penguji_id: string | null;
    tanggal: string;
    catatan: string | null;
}

export interface HafalanLembar {
    id: string;
    santri_id: string;
    juz: number;
    lembar: string;
    penguji_id: string | null;
    tanggal: string;
    catatan: string | null;
}

export interface HafalanTasmi {
    id: string;
    santri_id: string;
    juz: number;
    tanggal: string;
    penguji_id: string | null;
    predikat: PredikatTasmi;
    nilai: number | null;
    catatan: string | null;
}

export interface Kegiatan {
    id: string;
    nama: string;
    jenis: JenisKegiatan;
    tanggal_mulai: string;
    tanggal_selesai: string | null;
    lokasi: string | null;
    deskripsi: string | null;
    created_by: string | null;
}

export interface Presensi {
    id: string;
    kegiatan_id: string;
    santri_id: string;
    status: StatusPresensi;
    catatan: string | null;
    created_at: string;
}

export interface Pelanggaran {
    id: string;
    santri_id: string;
    deskripsi: string;
    poin: number | null;
    tanggal: string;
    penyelesaian: string | null;
}

export interface Perizinan {
    id: string;
    santri_id: string;
    alasan: string;
    status: StatusPerizinan;
    tgl_mulai: string;
    tgl_selesai: string;
}

export interface Mapel {
    id: string;
    nama: string;
    kategori: KategoriMapel;
    kkm: number;
}

export interface Nilai {
    id: string;
    santri_id: string;
    mapel_id: string;
    semester: string;
    nilai_uh: number | null;
    nilai_uts: number | null;
    nilai_uas: number | null;
    nilai_akhir: number | null;
    catatan: string | null;
}

// Full Database type for Supabase
export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Partial<Profile> & { email: string; full_name: string; role: Role };
                Update: Partial<Profile>;
            };
            santri: {
                Row: Santri;
                Insert: Omit<Santri, 'id' | 'created_at'>;
                Update: Partial<Omit<Santri, 'id' | 'created_at'>>;
            };
            asatidz: {
                Row: Asatidz;
                Insert: Omit<Asatidz, 'id' | 'created_at'>;
                Update: Partial<Omit<Asatidz, 'id' | 'created_at'>>;
            };
            hafalan_selesai: {
                Row: HafalanSelesai;
                Insert: Omit<HafalanSelesai, 'id'>;
                Update: Partial<Omit<HafalanSelesai, 'id'>>;
            };
            hafalan_lembar: {
                Row: HafalanLembar;
                Insert: Omit<HafalanLembar, 'id'>;
                Update: Partial<Omit<HafalanLembar, 'id'>>;
            };
            hafalan_tasmi: {
                Row: HafalanTasmi;
                Insert: Omit<HafalanTasmi, 'id'>;
                Update: Partial<Omit<HafalanTasmi, 'id'>>;
            };
            kegiatan: {
                Row: Kegiatan;
                Insert: Omit<Kegiatan, 'id'>;
                Update: Partial<Omit<Kegiatan, 'id'>>;
            };
            presensi: {
                Row: Presensi;
                Insert: Omit<Presensi, 'id' | 'created_at'>;
                Update: Partial<Omit<Presensi, 'id' | 'created_at'>>;
            };
            pelanggaran: {
                Row: Pelanggaran;
                Insert: Omit<Pelanggaran, 'id'>;
                Update: Partial<Omit<Pelanggaran, 'id'>>;
            };
            perizinan: {
                Row: Perizinan;
                Insert: Omit<Perizinan, 'id'>;
                Update: Partial<Omit<Perizinan, 'id'>>;
            };
            mapel: {
                Row: Mapel;
                Insert: Omit<Mapel, 'id'>;
                Update: Partial<Omit<Mapel, 'id'>>;
            };
            nilai: {
                Row: Nilai;
                Insert: Omit<Nilai, 'id'>;
                Update: Partial<Omit<Nilai, 'id'>>;
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: {
            role: Role;
            jenjang: Jenjang;
            jenis_kelamin: JenisKelamin;
            status_presensi: StatusPresensi;
            status_perizinan: StatusPerizinan;
            jenis_kegiatan: JenisKegiatan;
            predikat_tasmi: PredikatTasmi;
            kategori_mapel: KategoriMapel;
        };
    };
};
