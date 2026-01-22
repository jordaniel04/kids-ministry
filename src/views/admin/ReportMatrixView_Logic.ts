
// Variables para exportación
const exportDialog = ref(false);
const selectedPeriodIds = ref<string[]>([]);
const exporting = ref(false);

const openExportDialog = () => {
    // Por defecto seleccionar todos si no hay selección
    if (selectedPeriodIds.value.length === 0) {
        selectedPeriodIds.value = periods.value.map(p => p.id);
    }
    exportDialog.value = true;
};

const generatePDF = () => {
    exporting.value = true;
    try {
        const doc = new jsPDF();
        
        // Obtener la fecha actual para el reporte
        const currentDate = new Date().toLocaleDateString();
        
        // Filtrar periodos seleccionados
        const periodsToExport = periods.value.filter(p => selectedPeriodIds.value.includes(p.id));
        
        // Definir columnas
        const bodyColumns = [
            { header: 'Distrito', dataKey: 'location' },
            ...periodsToExport.map(p => ({ header: p.name, dataKey: p.id }))
        ];
        
        // Preparar datos de filas
        const rows = matrixData.value.map(district => {
            const row: any = { location: district.location };
            periodsToExport.forEach(p => {
                row[p.id] = district.reports[p.id] ? 'SI' : 'NO';
            });
            return row;
        });

        // Generar título
        doc.setFontSize(18);
        doc.text("Matriz de Reportes por Distrito", 14, 15);
        doc.setFontSize(10);
        doc.text(`Fecha de generación: ${currentDate}`, 14, 22);
        
        // Generar tabla
        autoTable(doc, {
            head: [bodyColumns.map(c => c.header)],
            body: rows.map(r => bodyColumns.map(c => r[c.dataKey])),
            startY: 28,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [63, 81, 181] }, // Indigo (Primary de Vuetify por defecto)
            alternateRowStyles: { fillColor: [245, 245, 245] },
            didParseCell: function(data) {
                // Colorear Celdas de SI/NO
                 if (data.section === 'body' && data.column.index > 0) {
                    const cellValue = data.cell.raw;
                    if (cellValue === 'SI') {
                        data.cell.styles.textColor = [0, 150, 0]; // Verde oscuro
                        data.cell.styles.fontStyle = 'bold';
                    } else {
                        data.cell.styles.textColor = [200, 0, 0]; // Rojo
                    }
                }
            }
        });
        
        doc.save('matriz_reportes.pdf');
        exportDialog.value = false;
    } catch (error) {
        console.error("Error generando PDF:", error);
        alert("Ocurrió un error al generar el PDF.");
    } finally {
        exporting.value = false;
    }
};
