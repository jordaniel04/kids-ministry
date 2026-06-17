<template>
    <div>
        <NavigationBar />
        <VContainer>
            <h1>Matrices de Reporte</h1>

            <div v-if="loading" class="d-flex justify-center my-4">
                <VProgressCircular indeterminate color="primary"></VProgressCircular>
            </div>

            <VCard v-else>
                <VTabs v-model="activeTab" color="primary">
                    <VTab value="reportes">
                        <VIcon start>mdi-table-check</VIcon>
                        Reportes por Distrito
                    </VTab>
                    <VTab value="formacion">
                        <VIcon start>mdi-school</VIcon>
                        Formación de Líderes
                    </VTab>
                </VTabs>

                <VDivider />

                <!-- TAB: REPORTES -->
                <VTabsWindow v-model="activeTab">
                    <VTabsWindowItem value="reportes">
                        <VCardTitle class="d-flex justify-space-between align-center">
                            <span>Matriz de Reportes</span>
                            <div class="d-flex gap-2">
                                <VBtn
                                    color="success"
                                    prepend-icon="mdi-file-pdf-box"
                                    class="mr-2"
                                    @click="openExportDialog"
                                    :disabled="loading"
                                >
                                    Exportar PDF
                                </VBtn>
                                <VBtn
                                    icon
                                    variant="text"
                                    color="primary"
                                    @click="refreshData"
                                    :disabled="loading"
                                >
                                    <VIcon>mdi-refresh</VIcon>
                                </VBtn>
                            </div>
                        </VCardTitle>
                        <VCardText>
                            <div class="matrix-table-container">
                                <table class="matrix-table">
                                    <thead>
                                        <tr>
                                            <th class="fixed-column">Distrito</th>
                                            <th v-for="period in periods" :key="period.id">
                                                {{ period.name }}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="district in matrixData" :key="district.id">
                                            <td class="fixed-column">{{ district.location }}</td>
                                            <td v-for="period in periods" :key="period.id"
                                                :class="{ 'reported': district.reports[period.id] }">
                                                <VIcon :color="district.reports[period.id] ? 'success' : 'error'">
                                                    {{ district.reports[period.id] ? 'mdi-check-circle' : 'mdi-close-circle' }}
                                                </VIcon>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </VCardText>
                    </VTabsWindowItem>

                    <!-- TAB: FORMACIÓN -->
                    <VTabsWindowItem value="formacion">
                        <VCardTitle class="d-flex justify-space-between align-center">
                            <span>Formación de Líderes Distritales</span>
                            <div class="d-flex gap-2">
                                <VBtn
                                    color="success"
                                    prepend-icon="mdi-file-pdf-box"
                                    @click="exportFormacionPdf"
                                    :disabled="loadingFormacion"
                                >
                                    Exportar PDF
                                </VBtn>
                                <VBtn
                                    icon
                                    variant="text"
                                    color="primary"
                                    @click="refreshFormacion"
                                    :disabled="loadingFormacion"
                                >
                                    <VIcon>mdi-refresh</VIcon>
                                </VBtn>
                            </div>
                        </VCardTitle>
                        <VCardText>
                            <VProgressLinear v-if="loadingFormacion" indeterminate color="primary" class="mb-4" />
                            <div v-else class="matrix-table-container">
                                <table class="matrix-table">
                                    <thead>
                                        <tr>
                                            <th class="fixed-column">Distrito</th>
                                            <th class="fixed-column-2">Líder</th>
                                            <th v-for="mod in trainingModules" :key="mod.id" style="min-width:120px">
                                                {{ mod.name }}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <template v-for="district in formacionData" :key="district.id">
                                            <tr v-for="(leader, idx) in district.leaders" :key="leader.name">
                                                <td v-if="idx === 0" :rowspan="district.leaders.length" class="fixed-column font-weight-medium">
                                                    {{ district.location }}
                                                </td>
                                                <td class="fixed-column-2">{{ leader.name }}</td>
                                                <td v-for="mod in trainingModules" :key="mod.id"
                                                    :class="{ 'reported': leader.modules[mod.id] }">
                                                    <VIcon :color="leader.modules[mod.id] ? 'success' : ''">
                                                        {{ leader.modules[mod.id] ? 'mdi-check-circle' : '' }}
                                                    </VIcon>
                                                </td>
                                            </tr>
                                        </template>
                                        <tr v-if="formacionData.length === 0">
                                            <td :colspan="2 + trainingModules.length" class="text-center text-medium-emphasis pa-4">
                                                No hay datos de formación registrados.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </VCardText>
                    </VTabsWindowItem>
                </VTabsWindow>
            </VCard>

            <!-- Diálogo de Exportación (Reportes) -->
            <VDialog v-model="exportDialog" max-width="500px">
                <VCard>
                    <VCardTitle>Exportar Matriz a PDF</VCardTitle>
                    <VCardText>
                        <p class="mb-4">Seleccione los periodos que desea incluir en el reporte PDF:</p>
                        <VSelect
                            v-model="selectedPeriodIds"
                            :items="periods"
                            item-title="name"
                            item-value="id"
                            label="Periodos"
                            multiple
                            chips
                            closable-chips
                            :return-object="false"
                        ></VSelect>
                    </VCardText>
                    <VCardActions>
                        <VSpacer></VSpacer>
                        <VBtn color="grey-darken-1" variant="text" @click="exportDialog = false">Cancelar</VBtn>
                        <VBtn
                            color="success"
                            variant="flat"
                            @click="generatePDF"
                            :loading="exporting"
                            :disabled="selectedPeriodIds.length === 0"
                        >
                            Generar PDF
                        </VBtn>
                    </VCardActions>
                </VCard>
            </VDialog>
        </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import NavigationBar from '../../components/NavigationBar.vue';
import { useFirestoreListeners } from '../../composables/useFirestoreListeners';
import type { TrainingModule } from '../../types/TrainingModule';

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface MatrixDistrict {
    id: string;
    location: string;
    reports: Record<string, boolean>;
}

interface LeaderRow {
    name: string;
    modules: Record<string, boolean>; // moduleId → aprobado
}

interface FormacionDistrict {
    id: string;
    location: string;
    leaders: LeaderRow[];
}

// ─── Estado compartido ─────────────────────────────────────────────────────────

const loading = ref(true);
const activeTab = ref('reportes');
const componentId = 'ReportMatrixView';
const { clearListeners } = useFirestoreListeners(componentId);

// ─── Tab Reportes ──────────────────────────────────────────────────────────────

const periods = ref<any[]>([]);
const matrixData = ref<MatrixDistrict[]>([]);
const dataLoaded = ref(false);

const CACHE_KEYS = {
    PERIODS: 'report-matrix-periods',
    DISTRICTS: 'report-matrix-districts',
    CONFIRMATIONS: 'report-matrix-confirmations',
    TIMESTAMP: 'report-matrix-timestamp'
};
const CACHE_EXPIRY = 30 * 60 * 1000;

const getFromCache = (key: string) => {
    try {
        const cachedData = localStorage.getItem(key);
        if (!cachedData) return null;
        const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
        if (!timestamp) return null;
        if (Date.now() - Number(timestamp) > CACHE_EXPIRY) return null;
        return JSON.parse(cachedData);
    } catch {
        return null;
    }
};

const setInCache = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
    } catch { /* ignorar errores de cuota */ }
};

const loadMatrixData = async () => {
    loading.value = true;

    const cachedPeriods = getFromCache(CACHE_KEYS.PERIODS);
    const cachedDistricts = getFromCache(CACHE_KEYS.DISTRICTS);
    const cachedConfirmations = getFromCache(CACHE_KEYS.CONFIRMATIONS);

    if (cachedPeriods && cachedDistricts && cachedConfirmations) {
        periods.value = cachedPeriods;
        matrixData.value = cachedDistricts;
        matrixData.value.forEach(district => {
            district.reports = cachedConfirmations[district.id] || {};
        });
        loading.value = false;
        return;
    }

    try {
        await Promise.all([loadPeriods(), loadDistricts()]);
        await loadConfirmations();
    } catch (error) {
        console.error('Error al cargar la matriz de reportes:', error);
    } finally {
        loading.value = false;
    }
};

const loadPeriods = async () => {
    const snap = await getDocs(query(collection(db, 'report_periods'), limit(20)));
    const data = snap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
    periods.value = data;
    setInCache(CACHE_KEYS.PERIODS, data);
};

const loadDistricts = async () => {
    const snap = await getDocs(query(collection(db, 'districts'), limit(100)));
    const data = snap.docs
        .map(doc => ({
            id: doc.id,
            location: doc.data().location,
            areaNumber: doc.data().areaNumber,
            districtNumber: doc.data().districtNumber,
            reports: {} as Record<string, boolean>
        }))
        .sort((a, b) => a.location.localeCompare(b.location));
    matrixData.value = data;
    setInCache(CACHE_KEYS.DISTRICTS, data);
};

const loadConfirmations = async () => {
    if (!periods.value.length || !matrixData.value.length) return;
    const snap = await getDocs(query(collection(db, 'district_confirmations'), limit(500)));
    const map: Record<string, Record<string, boolean>> = {};
    snap.docs.forEach(doc => {
        const d = doc.data();
        if (!map[d.districtId]) map[d.districtId] = {};
        map[d.districtId][d.periodId] = true;
    });
    matrixData.value.forEach(district => {
        district.reports = map[district.id] || {};
    });
    setInCache(CACHE_KEYS.CONFIRMATIONS, map);
};

const refreshData = async () => {
    Object.values(CACHE_KEYS).forEach(k => localStorage.removeItem(k));
    dataLoaded.value = false;
    await loadMatrixData();
    dataLoaded.value = true;
};

// ─── Tab Formación ─────────────────────────────────────────────────────────────

const loadingFormacion = ref(false);
const formacionLoaded = ref(false);
const trainingModules = ref<TrainingModule[]>([]);
const formacionData = ref<FormacionDistrict[]>([]);

const loadFormacionData = async () => {
    if (formacionLoaded.value) return;
    loadingFormacion.value = true;
    try {
        const [modulesSnap, enrollmentsSnap, districtsSnap] = await Promise.all([
            getDocs(query(collection(db, 'training_modules'), limit(50))),
            getDocs(query(collection(db, 'training_enrollments'), limit(2000))),
            getDocs(query(collection(db, 'districts'), limit(100)))
        ]);

        // Módulos ordenados
        trainingModules.value = modulesSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as TrainingModule))
            .filter(m => m.isActive)
            .sort((a, b) => a.order - b.order);

        // Mapa de distritos
        const districtMap: Record<string, string> = {};
        districtsSnap.docs.forEach(doc => {
            districtMap[doc.id] = doc.data().location;
        });

        // Agrupar enrollments: districtId → leaderName → moduleId → aprobado
        const grouped: Record<string, Record<string, Record<string, boolean>>> = {};

        enrollmentsSnap.docs.forEach(doc => {
            const e = doc.data();
            // Solo líderes distritales y pastores
            if (e.participantRole !== 'Líder Distrital' && e.participantRole !== 'Pastor') return;

            const dId = e.districtId;
            const name = e.participantName;
            if (!dId || !name) return;

            if (!grouped[dId]) grouped[dId] = {};
            if (!grouped[dId][name]) grouped[dId][name] = {};

            if (e.passed) {
                grouped[dId][name][e.moduleId] = true;
            } else if (!grouped[dId][name][e.moduleId]) {
                grouped[dId][name][e.moduleId] = false;
            }
        });

        // Construir filas agrupadas por distrito
        const result: FormacionDistrict[] = Object.entries(grouped)
            .map(([districtId, leaders]) => ({
                id: districtId,
                location: districtMap[districtId] ?? districtId,
                leaders: Object.entries(leaders).map(([name, modules]) => ({ name, modules }))
            }))
            .sort((a, b) => a.location.localeCompare(b.location));

        formacionData.value = result;
        formacionLoaded.value = true;
    } catch (error) {
        console.error('Error al cargar datos de formación:', error);
    } finally {
        loadingFormacion.value = false;
    }
};

const refreshFormacion = () => {
    formacionLoaded.value = false;
    loadFormacionData();
};

// Cargar formación cuando se activa ese tab por primera vez
watch(activeTab, (tab) => {
    if (tab === 'formacion') loadFormacionData();
});

// ─── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(() => {
    if (!dataLoaded.value) {
        loadMatrixData();
        dataLoaded.value = true;
    }
});

onUnmounted(() => {
    clearListeners();
});

// ─── Export PDF — Reportes ─────────────────────────────────────────────────────

const exportDialog = ref(false);
const selectedPeriodIds = ref<string[]>([]);
const exporting = ref(false);

const openExportDialog = () => {
    if (selectedPeriodIds.value.length === 0) {
        selectedPeriodIds.value = periods.value.map(p => p.id);
    }
    exportDialog.value = true;
};

const generatePDF = async () => {
    exporting.value = true;
    try {
        const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
            import('jspdf'),
            import('jspdf-autotable')
        ]);
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString();
        const periodsToExport = periods.value.filter(p => selectedPeriodIds.value.includes(p.id));

        const bodyColumns = [
            { header: 'Distrito', dataKey: 'location' },
            ...periodsToExport.map(p => ({ header: p.name, dataKey: p.id }))
        ];

        const rows = matrixData.value.map(district => {
            const row: any = { location: district.location };
            periodsToExport.forEach(p => { row[p.id] = district.reports[p.id] ? 'SI' : 'NO'; });
            return row;
        });

        doc.setFontSize(18);
        doc.text('Matriz de Reportes por Distrito', 14, 15);
        doc.setFontSize(10);
        doc.text(`Fecha de generación: ${currentDate}`, 14, 22);

        autoTable(doc, {
            head: [bodyColumns.map(c => c.header)],
            body: rows.map(r => bodyColumns.map(c => r[c.dataKey])),
            startY: 28,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [63, 81, 181] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            didParseCell: function (data: any) {
                if (data.section === 'body' && data.column.index > 0) {
                    if (data.cell.raw === 'SI') {
                        data.cell.styles.textColor = [0, 150, 0];
                        data.cell.styles.fontStyle = 'bold';
                    } else {
                        data.cell.styles.textColor = [200, 0, 0];
                    }
                }
            }
        });

        doc.save('matriz_reportes.pdf');
        exportDialog.value = false;
    } catch (error) {
        console.error('Error generando PDF:', error);
        alert('Ocurrió un error al generar el PDF.');
    } finally {
        exporting.value = false;
    }
};

// ─── Export PDF — Formación ────────────────────────────────────────────────────

const exportFormacionPdf = async () => {
    try {
        const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
            import('jspdf'),
            import('jspdf-autotable')
        ]);
        const doc = new jsPDF({ orientation: 'landscape' });
        const currentDate = new Date().toLocaleDateString();

        const headers = [
            'Distrito',
            'Líder',
            ...trainingModules.value.map(m => m.name)
        ];

        const rows: string[][] = [];
        formacionData.value.forEach(district => {
            district.leaders.forEach((leader, idx) => {
                rows.push([
                    idx === 0 ? district.location : '',
                    leader.name,
                    ...trainingModules.value.map(m => leader.modules[m.id] ? 'SI' : '')
                ]);
            });
        });

        doc.setFontSize(16);
        doc.text('Formación de Líderes Distritales', 14, 15);
        doc.setFontSize(10);
        doc.text(`Fecha de generación: ${currentDate}`, 14, 22);

        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: 28,
            styles: { fontSize: 7, cellPadding: 2 },
            headStyles: { fillColor: [63, 81, 181] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            didParseCell: function (data: any) {
                if (data.section === 'body' && data.column.index >= 2) {
                    if (data.cell.raw === 'SI') {
                        data.cell.styles.textColor = [0, 150, 0];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            }
        });

        doc.save('formacion_lideres.pdf');
    } catch (error) {
        console.error('Error generando PDF de formación:', error);
        alert('Ocurrió un error al generar el PDF.');
    }
};
</script>

<style scoped>
.matrix-table-container {
    overflow-x: auto;
    max-width: 100%;
}

.matrix-table {
    border-collapse: collapse;
    width: 100%;
}

.matrix-table th,
.matrix-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
}

.matrix-table th {
    background-color: #f2f2f2;
    position: sticky;
    top: 0;
    z-index: 1;
}

.fixed-column {
    position: sticky;
    left: 0;
    background-color: white;
    z-index: 2;
    text-align: left;
}

.fixed-column-2 {
    position: sticky;
    left: 120px;
    background-color: white;
    z-index: 2;
    text-align: left;
    min-width: 160px;
}

th.fixed-column,
th.fixed-column-2 {
    background-color: #f2f2f2;
    z-index: 3;
}

.reported {
    background-color: rgba(76, 175, 80, 0.1);
}
</style>
