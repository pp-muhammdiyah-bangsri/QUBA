import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { LaporanPDFDocument } from "@/lib/pdf/laporan-template";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Security/Validation check if needed
        if (!data || !data.santri) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        // Inject Base64 Logos to ensure they render on server
        // TEMPORARY DEBUG: Disable images to isolate corruption source
        /*
        const fs = await import("fs");
        const path = await import("path");
        
        let logos = { kiri: "", kanan: "" };
        try {
            const logoKiriPath = path.join(process.cwd(), "public", "logo_kiri.jpg");
            const logoKananPath = path.join(process.cwd(), "public", "logo_kanan.jpg");
            
            if (fs.existsSync(logoKiriPath)) {
                const kiriBase64 = fs.readFileSync(logoKiriPath, { encoding: "base64" });
                logos.kiri = `data:image/jpeg;base64,${kiriBase64}`;
            }
            
            if (fs.existsSync(logoKananPath)) {
                const kananBase64 = fs.readFileSync(logoKananPath, { encoding: "base64" });
                logos.kanan = `data:image/jpeg;base64,${kananBase64}`;
            }
        } catch(e) {
            console.warn("Failed to load local logos", e);
        }
        */
        const logos = { kiri: "", kanan: "" };

        // Force disable photo for debug
        const pdfData = { ...data, logos, processedPhoto: null, santri: { ...data.santri, foto_url: null } };

        // Render PDF to buffer (Safer than stream for preventing corrupt chunks)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buffer = await renderToBuffer(createElement(LaporanPDFDocument, { data: pdfData }) as any);

        return new Response(new Uint8Array(buffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="Laporan_${data.santri.nama.replace(/\s+/g, "_")}.pdf"`,
            },
        });
    } catch (error) {
        console.error("PDF API Error:", error);
        return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
    }
}
