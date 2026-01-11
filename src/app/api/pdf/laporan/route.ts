import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
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
        const fs = await import("fs");
        const path = await import("path");
        const logoKiriPath = path.join(process.cwd(), "public", "logo_kiri.jpg");
        const logoKananPath = path.join(process.cwd(), "public", "logo_kanan.jpg");

        let logos = {};
        try {
            const kiriBase64 = fs.readFileSync(logoKiriPath, { encoding: "base64" });
            const kananBase64 = fs.readFileSync(logoKananPath, { encoding: "base64" });
            logos = {
                kiri: `data:image/jpeg;base64,${kiriBase64}`,
                kanan: `data:image/jpeg;base64,${kananBase64}`
            };
        } catch (e) {
            console.warn("Failed to load local logos", e);
        }

        const pdfData = { ...data, logos };

        // Render PDF to stream
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stream = await renderToStream(createElement(LaporanPDFDocument, { data: pdfData }) as any);

        // Convert Node.js stream to Web ReadableStream
        // Next.js App Router return type expects a Web Response
        const responseCallback = new Response(stream as any, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="Laporan_${data.santri.nama.replace(/\s+/g, "_")}.pdf"`,
            },
        });

        return responseCallback;
    } catch (error) {
        console.error("PDF API Error:", error);
        return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
    }
}
