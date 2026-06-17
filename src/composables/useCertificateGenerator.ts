import jsPDF from 'jspdf';
import { Timestamp } from 'firebase/firestore';
import type { TrainingModule } from '../types/TrainingModule';
import type { TrainingEnrollment } from '../types/TrainingEnrollment';

function formatDate(ts: Timestamp | Date): string {
    const date = ts instanceof Date ? ts : ts.toDate();
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
}

async function fetchImageAsBase64(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`No se pudo cargar la imagen de plantilla: ${response.status}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = reject;
        img.src = base64;
    });
}

function hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

export function useCertificateGenerator() {
    async function generateCertificate(
        enrollment: TrainingEnrollment,
        module: TrainingModule,
        graduationDate: Timestamp
    ): Promise<void> {
        const base64 = await fetchImageAsBase64(module.certificateImageUrl);
        const { width, height } = await getImageDimensions(base64);

        const orientation = width >= height ? 'landscape' : 'portrait';
        const doc = new jsPDF({ orientation, unit: 'px', format: [width, height], hotfixes: ['px_scaling'] });

        doc.addImage(base64, 'PNG', 0, 0, width, height);

        const cfg = module.certificateTextConfig;
        const [r, g, b] = hexToRgb(cfg.fontColor);
        doc.setFontSize(cfg.fontSize);
        doc.setTextColor(r, g, b);

        doc.text(enrollment.participantName, cfg.nameX, cfg.nameY, { align: 'center' });
        doc.text(formatDate(graduationDate), cfg.dateX, cfg.dateY, { align: 'center' });

        const safeName = enrollment.participantName.replace(/[^\w\sáéíóúÁÉÍÓÚñÑ]/g, '').trim();
        doc.save(`Certificado_${safeName}_${module.name}.pdf`);
    }

    return { generateCertificate };
}
