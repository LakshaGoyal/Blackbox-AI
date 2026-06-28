import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const text = String(formData.get("text") ?? "").trim();
    const file = formData.get("file");

    if (text) {
      return NextResponse.json({
        title: "Custom incident",
        context: text,
        source: "text"
      });
    }

    if (file instanceof File) {
      if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = await pdfParse(buffer);
      const context = parsed.text.replace(/\s+/g, " ").trim();

      if (!context) {
        return NextResponse.json({ error: "No readable text was found in the PDF." }, { status: 422 });
      }

      return NextResponse.json({
        title: file.name.replace(/\.pdf$/i, ""),
        context,
        source: "pdf"
      });
    }

    return NextResponse.json({ error: "Provide incident text or a PDF file." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not extract the incident context.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
