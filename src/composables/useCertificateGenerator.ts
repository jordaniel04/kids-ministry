import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { Timestamp } from 'firebase/firestore';
import type { TrainingModule } from '../types/TrainingModule';
import type { TrainingEnrollment } from '../types/TrainingEnrollment';

function formatDate(ts: Timestamp | Date): string {
    const date = ts instanceof Date ? ts : ts.toDate();
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
}

function safeFileName(name: string): string {
    return name.replace(/[^\w\sáéíóúÁÉÍÓÚñÑ]/g, '').trim();
}

function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function fillCertificate(templateBytes: ArrayBuffer, participantName: string, graduationDate: Timestamp): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    form.getTextField('nombre').setText(participantName);
    form.getTextField('fecha').setText(formatDate(graduationDate));
    form.flatten();
    return pdfDoc.save();
}

export function useCertificateGenerator() {
    async function generateCertificate(
        enrollment: TrainingEnrollment,
        module: TrainingModule,
        graduationDate: Timestamp
    ): Promise<void> {
        const response = await fetch(module.certificateTemplateUrl);
        if (!response.ok) throw new Error(`No se pudo cargar la plantilla: ${response.status}`);
        const templateBytes = await response.arrayBuffer();

        const pdfBytes = await fillCertificate(templateBytes, enrollment.participantName, graduationDate);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        const safeName = safeFileName(enrollment.participantName);
        downloadBlob(blob, `Certificado_${safeName}_${module.name}.pdf`);
    }

    async function generateCertificatesZip(
        enrollments: TrainingEnrollment[],
        module: TrainingModule,
        groupLabel: string
    ): Promise<void> {
        const response = await fetch(module.certificateTemplateUrl);
        if (!response.ok) throw new Error(`No se pudo cargar la plantilla: ${response.status}`);
        const templateBytes = await response.arrayBuffer();

        const zip = new JSZip();
        for (const enrollment of enrollments) {
            const pdfBytes = await fillCertificate(templateBytes, enrollment.participantName, enrollment.graduationDate);
            const safeName = safeFileName(enrollment.participantName);
            zip.file(`Certificado_${safeName}_${module.name}.pdf`, pdfBytes);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const safeGroupLabel = safeFileName(groupLabel);
        downloadBlob(zipBlob, `Certificados_${safeGroupLabel}.zip`);
    }

    return { generateCertificate, generateCertificatesZip };
}
