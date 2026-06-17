<template>
    <div class="d-flex flex-column" style="min-height: 100vh;">
        <NavigationBar class="z-10" />
        <VContainer class="flex-grow-1">
            <div class="d-flex justify-space-between align-center mb-4">
                <div>
                    <h1>Graduaciones</h1>
                    <p class="text-body-2 text-medium-emphasis">
                        Cada graduación asocia un módulo a una fecha y registra los participantes con sus notas.
                    </p>
                </div>
                <VBtn color="primary" prepend-icon="mdi-plus" @click="openCreateGradDialog">
                    Nueva Graduación
                </VBtn>
            </div>

            <!-- Lista de graduaciones -->
            <VRow v-if="!selectedGraduation">
                <VCol cols="12" v-if="loading">
                    <VProgressLinear indeterminate color="primary" />
                </VCol>

                <VCol cols="12" v-if="!loading && graduations.length === 0">
                    <VCard class="text-center pa-8">
                        <VIcon size="64" color="grey-lighten-2">mdi-school-outline</VIcon>
                        <p class="text-h6 text-grey mt-3">No hay graduaciones registradas</p>
                        <p class="text-body-2 text-grey-darken-1">Crea una nueva para registrar participantes</p>
                    </VCard>
                </VCol>

                <VCol cols="12" sm="6" md="4" v-for="grad in graduations" :key="grad.id">
                    <VCard hover @click="selectGraduation(grad)">
                        <VCardTitle class="text-body-1 font-weight-bold">{{ grad.moduleName }}</VCardTitle>
                        <VCardSubtitle>
                            <VIcon size="14" class="me-1">mdi-calendar</VIcon>
                            {{ formatDate(grad.graduationDate) }}
                        </VCardSubtitle>
                        <VCardText v-if="grad.description" class="text-caption text-medium-emphasis pt-0">
                            {{ grad.description }}
                        </VCardText>
                        <VCardActions>
                            <VChip size="small" color="primary" variant="tonal">
                                {{ enrollmentCounts[grad.id] ?? '...' }} participantes
                            </VChip>
                            <VSpacer />
                            <VBtn icon size="small" variant="text" color="primary" @click.stop="openEditGradDialog(grad)">
                                <VIcon>mdi-pencil</VIcon>
                            </VBtn>
                            <VBtn icon size="small" variant="text" color="error" @click.stop="confirmDeleteGrad(grad)">
                                <VIcon>mdi-delete</VIcon>
                            </VBtn>
                        </VCardActions>
                    </VCard>
                </VCol>
            </VRow>

            <!-- Vista de detalle de graduación -->
            <template v-if="selectedGraduation">
                <div class="d-flex align-center gap-2 mb-4">
                    <VBtn variant="text" prepend-icon="mdi-arrow-left" @click="selectedGraduation = null">
                        Volver
                    </VBtn>
                    <VDivider vertical class="mx-1" />
                    <div>
                        <h2 class="text-h6">{{ selectedGraduation.moduleName }}</h2>
                        <p class="text-caption text-medium-emphasis">
                            Graduación: {{ formatDate(selectedGraduation.graduationDate) }}
                        </p>
                    </div>
                    <VSpacer />
                    <VBtn color="primary" prepend-icon="mdi-plus" size="small" @click="openCreateEnrollDialog">
                        Agregar Participante
                    </VBtn>
                    <VBtn color="error" prepend-icon="mdi-file-pdf-box" size="small" variant="tonal" @click="exportPdf">
                        Exportar PDF
                    </VBtn>
                </div>

                <!-- Resumen rápido -->
                <VRow class="mb-4">
                    <VCol cols="6" sm="3" v-for="stat in generalStats" :key="stat.label">
                        <VCard variant="tonal" :color="stat.color">
                            <VCardText class="text-center pa-3">
                                <VIcon :icon="stat.icon" size="24" class="mb-1" />
                                <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
                                <div class="text-caption">{{ stat.label }}</div>
                            </VCardText>
                        </VCard>
                    </VCol>
                </VRow>

                <!-- Buscador y tabla -->
                <VCard>
                    <VCardText>
                        <VTabs v-model="activeTab" class="mb-4">
                            <VTab value="lista">
                                <VIcon start>mdi-format-list-bulleted</VIcon>
                                Participantes
                            </VTab>
                            <VTab value="estadisticas">
                                <VIcon start>mdi-chart-bar</VIcon>
                                Por Distrito
                            </VTab>
                        </VTabs>

                        <VWindow v-model="activeTab">
                            <VWindowItem value="lista">
                                <VTextField
                                    v-model="searchEnrollments"
                                    prepend-inner-icon="mdi-magnify"
                                    label="Buscar participante"
                                    single-line
                                    hide-details
                                    density="compact"
                                    class="mb-3"
                                    style="max-width: 300px;"
                                />
                                <VDataTable
                                    :headers="enrollmentHeaders"
                                    :items="enrollments"
                                    :loading="loadingEnrollments"
                                    :search="searchEnrollments"
                                >
                                    <template #[`item.grade`]="{ item }">
                                        <span :class="item.passed ? 'text-success font-weight-bold' : 'text-error'">
                                            {{ item.grade }}
                                        </span>
                                    </template>
                                    <template #[`item.passed`]="{ item }">
                                        <VChip :color="item.passed ? 'success' : 'error'" size="small" variant="tonal">
                                            {{ item.passed ? 'Aprobado' : 'Reprobado' }}
                                        </VChip>
                                    </template>
                                    <template #[`item.actions`]="{ item }">
                                        <div class="d-flex gap-1">
                                            <VBtn icon color="primary" size="x-small" variant="tonal" @click="openEditEnrollDialog(item)">
                                                <VIcon>mdi-pencil</VIcon>
                                            </VBtn>
                                            <VBtn
                                                icon
                                                :color="item.passed ? 'success' : 'grey'"
                                                size="x-small"
                                                variant="tonal"
                                                :disabled="!item.passed || generatingCert === item.id"
                                                :loading="generatingCert === item.id"
                                                @click="downloadCertificate(item)"
                                            >
                                                <VIcon>mdi-certificate</VIcon>
                                                <VTooltip activator="parent" location="top">
                                                    {{ item.passed ? 'Descargar certificado' : 'Solo aprobados' }}
                                                </VTooltip>
                                            </VBtn>
                                            <VBtn icon color="error" size="x-small" variant="tonal" @click="confirmDeleteEnroll(item)">
                                                <VIcon>mdi-delete</VIcon>
                                            </VBtn>
                                        </div>
                                    </template>
                                </VDataTable>
                            </VWindowItem>

                            <VWindowItem value="estadisticas">
                                <VDataTable
                                    :headers="districtStatsHeaders"
                                    :items="districtStats"
                                    density="compact"
                                    hide-default-footer
                                    :items-per-page="-1"
                                >
                                    <template #[`item.passRate`]="{ item }">
                                        <VProgressLinear
                                            :model-value="item.passRate"
                                            color="success"
                                            bg-color="error-lighten-4"
                                            height="16"
                                            rounded
                                        >
                                            <template #default="{ value }">
                                                <span class="text-caption font-weight-bold">{{ Math.round(value) }}%</span>
                                            </template>
                                        </VProgressLinear>
                                    </template>
                                </VDataTable>
                            </VWindowItem>
                        </VWindow>
                    </VCardText>
                </VCard>
            </template>

            <!-- Dialog crear/editar Graduación -->
            <VDialog v-model="gradDialog" max-width="500px" persistent>
                <VCard>
                    <VCardTitle>{{ gradDialogTitle }}</VCardTitle>
                    <VCardText>
                        <VContainer>
                            <VRow>
                                <VCol cols="12">
                                    <VSelect
                                        v-model="editedGrad.moduleId"
                                        :items="moduleOptions"
                                        item-title="label"
                                        item-value="value"
                                        label="Módulo"
                                        required
                                        @update:model-value="onModuleSelect"
                                    />
                                </VCol>
                                <VCol cols="12">
                                    <VTextField
                                        v-model="editedGrad.graduationDate"
                                        label="Fecha de Graduación"
                                        type="date"
                                        required
                                    />
                                </VCol>
                                <VCol cols="12">
                                    <VTextField
                                        v-model="editedGrad.description"
                                        label="Descripción (opcional)"
                                        placeholder="Ej: Primera promoción distrital"
                                    />
                                </VCol>
                            </VRow>
                        </VContainer>
                    </VCardText>
                    <VCardActions>
                        <VSpacer />
                        <VBtn color="error" variant="text" @click="gradDialog = false">Cancelar</VBtn>
                        <VBtn
                            color="success"
                            variant="text"
                            @click="saveGraduation"
                            :disabled="!editedGrad.moduleId || !editedGrad.graduationDate"
                        >
                            Guardar
                        </VBtn>
                    </VCardActions>
                </VCard>
            </VDialog>

            <!-- Dialog crear/editar Participante -->
            <VDialog v-model="enrollDialog" max-width="600px" persistent>
                <VCard>
                    <VCardTitle>{{ enrollDialogTitle }}</VCardTitle>
                    <VCardText>
                        <VContainer>
                            <VRow>
                                <VCol cols="12">
                                    <VTextField
                                        v-model="editedEnroll.participantName"
                                        label="Nombre Completo"
                                        :rules="[v => !!v || 'Requerido']"
                                        required
                                    />
                                </VCol>
                                <VCol cols="12" sm="6">
                                    <VSelect
                                        v-model="editedEnroll.participantRole"
                                        :items="roleOptions"
                                        label="Rol"
                                        required
                                    />
                                </VCol>
                                <VCol cols="12" sm="6">
                                    <VSelect
                                        v-model="editedEnroll.level"
                                        :items="levelOptions"
                                        label="Nivel"
                                        required
                                    />
                                </VCol>
                                <VCol cols="12" sm="6">
                                    <VSelect
                                        v-model="editedEnroll.districtId"
                                        :items="districtOptions"
                                        item-title="label"
                                        item-value="value"
                                        label="Distrito"
                                        required
                                        @update:model-value="onDistrictChange"
                                    />
                                </VCol>
                                <VCol cols="12" sm="6" v-if="editedEnroll.level === 'local'">
                                    <VTextField
                                        v-model="editedEnroll.churchName"
                                        label="Iglesia"
                                        placeholder="Nombre de la iglesia"
                                    />
                                </VCol>
                                <VCol cols="12" sm="4">
                                    <VTextField
                                        v-model.number="editedEnroll.grade"
                                        label="Nota (0–20)"
                                        type="number"
                                        :rules="[v => (v >= 0 && v <= 20) || 'Debe ser 0–20']"
                                        required
                                    />
                                </VCol>
                                <VCol cols="12" sm="4" class="d-flex align-center">
                                    <VChip
                                        :color="editedEnroll.grade >= 14 ? 'success' : 'error'"
                                        variant="tonal"
                                    >
                                        {{ editedEnroll.grade >= 14 ? 'Aprobado' : 'Reprobado' }}
                                    </VChip>
                                </VCol>
                            </VRow>
                        </VContainer>
                    </VCardText>
                    <VCardActions>
                        <VSpacer />
                        <VBtn color="error" variant="text" @click="enrollDialog = false">Cancelar</VBtn>
                        <VBtn color="success" variant="text" @click="saveEnrollment">Guardar</VBtn>
                    </VCardActions>
                </VCard>
            </VDialog>

            <!-- Dialog eliminar graduación -->
            <VDialog v-model="deleteGradDialog" max-width="400px">
                <VCard>
                    <VCardTitle>Confirmar eliminación</VCardTitle>
                    <VCardText>
                        ¿Eliminar la graduación <strong>{{ gradToDelete?.moduleName }}</strong>
                        del {{ formatDate(gradToDelete?.graduationDate) }}?
                        Se eliminarán también todos los participantes registrados.
                    </VCardText>
                    <VCardActions>
                        <VSpacer />
                        <VBtn color="grey" variant="text" @click="deleteGradDialog = false">Cancelar</VBtn>
                        <VBtn color="error" variant="text" @click="deleteGraduation">Eliminar</VBtn>
                    </VCardActions>
                </VCard>
            </VDialog>

            <!-- Dialog eliminar participante -->
            <VDialog v-model="deleteEnrollDialog" max-width="400px">
                <VCard>
                    <VCardTitle>Confirmar eliminación</VCardTitle>
                    <VCardText>¿Eliminar a <strong>{{ enrollToDelete?.participantName }}</strong>?</VCardText>
                    <VCardActions>
                        <VSpacer />
                        <VBtn color="grey" variant="text" @click="deleteEnrollDialog = false">Cancelar</VBtn>
                        <VBtn color="error" variant="text" @click="deleteEnrollment">Eliminar</VBtn>
                    </VCardActions>
                </VCard>
            </VDialog>
        </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
    collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
    Timestamp, query, where, orderBy, writeBatch
} from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '../../firebase/config';
import type { TrainingModule } from '../../types/TrainingModule';
import type { TrainingGraduation } from '../../types/TrainingGraduation';
import type { TrainingEnrollment, ParticipantRole, ParticipantLevel } from '../../types/TrainingEnrollment';
import type { District } from '../../types/District';
import { useCertificateGenerator } from '../../composables/useCertificateGenerator';
import NavigationBar from '../../components/NavigationBar.vue';

const { generateCertificate } = useCertificateGenerator();

// State
const modules = ref<TrainingModule[]>([]);
const graduations = ref<TrainingGraduation[]>([]);
const enrollments = ref<TrainingEnrollment[]>([]);
const districts = ref<District[]>([]);
const selectedGraduation = ref<TrainingGraduation | null>(null);
const enrollmentCounts = ref<Record<string, number>>({});

const loading = ref(true);
const loadingEnrollments = ref(false);
const activeTab = ref('lista');
const searchEnrollments = ref('');
const generatingCert = ref<string | null>(null);

// Graduation dialog
const gradDialog = ref(false);
const deleteGradDialog = ref(false);
const editingGradId = ref<string | null>(null);
const gradToDelete = ref<TrainingGraduation | null>(null);

interface EditedGrad {
    moduleId: string;
    moduleName: string;
    graduationDate: string;
    description: string;
}
const editedGrad = ref<EditedGrad>({ moduleId: '', moduleName: '', graduationDate: '', description: '' });

// Enrollment dialog
const enrollDialog = ref(false);
const deleteEnrollDialog = ref(false);
const editingEnrollId = ref<string | null>(null);
const enrollToDelete = ref<TrainingEnrollment | null>(null);

interface EditedEnroll {
    participantName: string;
    participantRole: ParticipantRole;
    level: ParticipantLevel;
    districtId: string;
    districtName: string;
    churchName: string;
    grade: number;
}
const defaultEnroll: EditedEnroll = {
    participantName: '', participantRole: 'Líder Distrital', level: 'distrital',
    districtId: '', districtName: '', churchName: '', grade: 0,
};
const editedEnroll = ref<EditedEnroll>({ ...defaultEnroll });

// Computed
const moduleOptions = computed(() =>
    modules.value.map(m => ({ label: `#${m.order} – ${m.name}`, value: m.id }))
);

const districtOptions = computed(() =>
    districts.value.map(d => ({
        label: `Distrito ${d.districtNumber} – ${d.location}`,
        value: d.id,
    }))
);

const roleOptions: ParticipantRole[] = ['Líder Distrital', 'Equipo Distrital', 'Líder Local', 'Equipo Local'];
const levelOptions = [
    { title: 'Distrital', value: 'distrital' },
    { title: 'Local', value: 'local' },
];

const gradDialogTitle = computed(() => editingGradId.value ? 'Editar Graduación' : 'Nueva Graduación');
const enrollDialogTitle = computed(() => editingEnrollId.value ? 'Editar Participante' : 'Agregar Participante');

const generalStats = computed(() => {
    const total = enrollments.value.length;
    const passed = enrollments.value.filter(e => e.passed).length;
    const avg = total > 0
        ? (enrollments.value.reduce((s, e) => s + e.grade, 0) / total).toFixed(1)
        : '0';
    return [
        { label: 'Total', value: total, color: 'primary', icon: 'mdi-account-group' },
        { label: 'Aprobados', value: passed, color: 'success', icon: 'mdi-check-circle' },
        { label: 'Reprobados', value: total - passed, color: 'error', icon: 'mdi-close-circle' },
        { label: 'Promedio', value: avg, color: 'info', icon: 'mdi-calculator' },
    ];
});

const districtStats = computed(() => {
    const map = new Map<string, { name: string; total: number; passed: number; grades: number[] }>();
    for (const e of enrollments.value) {
        if (!map.has(e.districtId)) map.set(e.districtId, { name: e.districtName, total: 0, passed: 0, grades: [] });
        const d = map.get(e.districtId)!;
        d.total++;
        if (e.passed) d.passed++;
        d.grades.push(e.grade);
    }
    return [...map.entries()].map(([, v]) => ({
        districtName: v.name,
        total: v.total,
        passed: v.passed,
        failed: v.total - v.passed,
        average: v.grades.length > 0 ? (v.grades.reduce((a, b) => a + b, 0) / v.grades.length).toFixed(1) : '0',
        passRate: v.total > 0 ? (v.passed / v.total) * 100 : 0,
    })).sort((a, b) => a.districtName.localeCompare(b.districtName));
});

// Headers
const enrollmentHeaders = [
    { title: 'Nombre', key: 'participantName', align: 'start' as const },
    { title: 'Rol', key: 'participantRole', align: 'start' as const },
    { title: 'Nivel', key: 'level', align: 'center' as const },
    { title: 'Distrito', key: 'districtName', align: 'start' as const },
    { title: 'Iglesia', key: 'churchName', align: 'start' as const },
    { title: 'Nota', key: 'grade', align: 'center' as const },
    { title: 'Estado', key: 'passed', align: 'center' as const },
    { title: 'Acciones', key: 'actions', align: 'center' as const, sortable: false },
];

const districtStatsHeaders = [
    { title: 'Distrito', key: 'districtName', align: 'start' as const },
    { title: 'Total', key: 'total', align: 'center' as const },
    { title: 'Aprobados', key: 'passed', align: 'center' as const },
    { title: 'Reprobados', key: 'failed', align: 'center' as const },
    { title: 'Promedio', key: 'average', align: 'center' as const },
    { title: '% Aprobación', key: 'passRate', align: 'center' as const, width: '180px' },
];

// Functions
function formatDate(ts: Timestamp | null | undefined): string {
    if (!ts) return '';
    return ts.toDate().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

async function loadData() {
    loading.value = true;
    try {
        const [modSnap, gradSnap, distSnap] = await Promise.all([
            getDocs(query(collection(db, 'training_modules'), orderBy('order'))),
            getDocs(query(collection(db, 'training_graduations'), orderBy('graduationDate', 'desc'))),
            getDocs(query(collection(db, 'districts'), orderBy('districtNumber'))),
        ]);
        modules.value = modSnap.docs.map(d => ({ id: d.id, ...d.data() } as TrainingModule));
        graduations.value = gradSnap.docs.map(d => ({ id: d.id, ...d.data() } as TrainingGraduation));
        districts.value = distSnap.docs.map(d => ({ id: d.id, ...d.data() } as District));

        // Cargar conteos de participantes
        await loadEnrollmentCounts();
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
}

async function loadEnrollmentCounts() {
    const counts: Record<string, number> = {};
    for (const grad of graduations.value) {
        const snap = await getDocs(query(
            collection(db, 'training_enrollments'),
            where('graduationId', '==', grad.id)
        ));
        counts[grad.id] = snap.size;
    }
    enrollmentCounts.value = counts;
}

async function selectGraduation(grad: TrainingGraduation) {
    selectedGraduation.value = grad;
    activeTab.value = 'lista';
    searchEnrollments.value = '';
    await loadEnrollments(grad.id);
}

async function loadEnrollments(gradId: string) {
    loadingEnrollments.value = true;
    try {
        const q = query(
            collection(db, 'training_enrollments'),
            where('graduationId', '==', gradId)
        );
        const snap = await getDocs(q);
        enrollments.value = snap.docs
            .map(d => ({ id: d.id, ...d.data() } as TrainingEnrollment))
            .sort((a, b) => a.districtName.localeCompare(b.districtName) || a.participantName.localeCompare(b.participantName));
    } catch (e) {
        console.error(e);
        alert('Error al cargar participantes');
    } finally {
        loadingEnrollments.value = false;
    }
}

// Graduation CRUD
function openCreateGradDialog() {
    editingGradId.value = null;
    editedGrad.value = { moduleId: '', moduleName: '', graduationDate: '', description: '' };
    gradDialog.value = true;
}

function openEditGradDialog(grad: TrainingGraduation) {
    editingGradId.value = grad.id;
    editedGrad.value = {
        moduleId: grad.moduleId,
        moduleName: grad.moduleName,
        graduationDate: grad.graduationDate.toDate().toISOString().split('T')[0],
        description: grad.description || '',
    };
    gradDialog.value = true;
}

function onModuleSelect(moduleId: string) {
    const mod = modules.value.find(m => m.id === moduleId);
    editedGrad.value.moduleName = mod?.name ?? '';
}

async function saveGraduation() {
    try {
        const data = {
            moduleId: editedGrad.value.moduleId,
            moduleName: editedGrad.value.moduleName,
            graduationDate: Timestamp.fromDate(new Date(editedGrad.value.graduationDate)),
            description: editedGrad.value.description || null,
        };
        if (editingGradId.value) {
            await updateDoc(doc(db, 'training_graduations', editingGradId.value), data);
        } else {
            await addDoc(collection(db, 'training_graduations'), { ...data, createdAt: Timestamp.now() });
        }
        gradDialog.value = false;
        await loadData();
    } catch (e) {
        console.error(e);
        alert('Error al guardar la graduación');
    }
}

function confirmDeleteGrad(grad: TrainingGraduation) {
    gradToDelete.value = grad;
    deleteGradDialog.value = true;
}

async function deleteGraduation() {
    if (!gradToDelete.value) return;
    try {
        // Eliminar participantes en batch
        const enrollSnap = await getDocs(query(
            collection(db, 'training_enrollments'),
            where('graduationId', '==', gradToDelete.value.id)
        ));
        const batch = writeBatch(db);
        enrollSnap.docs.forEach(d => batch.delete(d.ref));
        batch.delete(doc(db, 'training_graduations', gradToDelete.value.id));
        await batch.commit();
        await loadData();
    } catch (e) {
        console.error(e);
        alert('Error al eliminar la graduación');
    } finally {
        deleteGradDialog.value = false;
        gradToDelete.value = null;
    }
}

// Enrollment CRUD
function openCreateEnrollDialog() {
    editingEnrollId.value = null;
    editedEnroll.value = { ...defaultEnroll };
    enrollDialog.value = true;
}

function openEditEnrollDialog(item: TrainingEnrollment) {
    editingEnrollId.value = item.id;
    editedEnroll.value = {
        participantName: item.participantName,
        participantRole: item.participantRole,
        level: item.level,
        districtId: item.districtId,
        districtName: item.districtName,
        churchName: item.churchName || '',
        grade: item.grade,
    };
    enrollDialog.value = true;
}

function onDistrictChange(id: string) {
    const d = districts.value.find(d => d.id === id);
    editedEnroll.value.districtName = d ? `Distrito ${d.districtNumber} – ${d.location}` : '';
}

async function saveEnrollment() {
    if (!selectedGraduation.value || !editedEnroll.value.participantName || !editedEnroll.value.districtId) {
        alert('Complete los campos requeridos');
        return;
    }
    try {
        const grade = Number(editedEnroll.value.grade);
        const data = {
            graduationId: selectedGraduation.value.id,
            moduleId: selectedGraduation.value.moduleId,
            participantName: editedEnroll.value.participantName,
            participantRole: editedEnroll.value.participantRole,
            level: editedEnroll.value.level,
            districtId: editedEnroll.value.districtId,
            districtName: editedEnroll.value.districtName,
            churchName: editedEnroll.value.churchName || null,
            grade,
            passed: grade >= 14,
            updatedAt: Timestamp.now(),
        };
        if (editingEnrollId.value) {
            await updateDoc(doc(db, 'training_enrollments', editingEnrollId.value), data);
        } else {
            await addDoc(collection(db, 'training_enrollments'), { ...data, enrolledAt: Timestamp.now() });
        }
        enrollDialog.value = false;
        await loadEnrollments(selectedGraduation.value.id);
        enrollmentCounts.value[selectedGraduation.value.id] = enrollments.value.length;
    } catch (e) {
        console.error(e);
        alert('Error al guardar');
    }
}

function confirmDeleteEnroll(item: TrainingEnrollment) {
    enrollToDelete.value = item;
    deleteEnrollDialog.value = true;
}

async function deleteEnrollment() {
    if (!enrollToDelete.value || !selectedGraduation.value) return;
    try {
        await deleteDoc(doc(db, 'training_enrollments', enrollToDelete.value.id));
        await loadEnrollments(selectedGraduation.value.id);
    } catch (e) {
        console.error(e);
        alert('Error al eliminar');
    } finally {
        deleteEnrollDialog.value = false;
        enrollToDelete.value = null;
    }
}

// Certificate
async function downloadCertificate(enrollment: TrainingEnrollment) {
    if (!selectedGraduation.value) return;
    const module = modules.value.find(m => m.id === selectedGraduation.value!.moduleId);
    if (!module?.certificateImageUrl) {
        alert('Este módulo no tiene plantilla de certificado configurada. Configúrala en Módulos de Formación.');
        return;
    }
    generatingCert.value = enrollment.id;
    try {
        await generateCertificate(enrollment, module, selectedGraduation.value.graduationDate);
    } catch (e) {
        console.error(e);
        alert('Error al generar el certificado. Verifica que la URL de la plantilla sea accesible.');
    } finally {
        generatingCert.value = null;
    }
}

// Export PDF
function exportPdf() {
    if (!selectedGraduation.value) return;
    const docPdf = new jsPDF({ orientation: 'landscape' });
    docPdf.setFontSize(14);
    docPdf.text(`Graduación: ${selectedGraduation.value.moduleName}`, 14, 15);
    docPdf.setFontSize(10);
    docPdf.text(`Fecha: ${formatDate(selectedGraduation.value.graduationDate)}`, 14, 22);

    const total = enrollments.value.length;
    const passed = enrollments.value.filter(e => e.passed).length;
    docPdf.text(`Total: ${total}  |  Aprobados: ${passed}  |  Reprobados: ${total - passed}`, 14, 29);

    autoTable(docPdf, {
        startY: 35,
        head: [['Nombre', 'Rol', 'Nivel', 'Distrito', 'Iglesia', 'Nota', 'Estado']],
        body: enrollments.value.map(e => [
            e.participantName,
            e.participantRole,
            e.level === 'distrital' ? 'Distrital' : 'Local',
            e.districtName,
            e.churchName || '–',
            e.grade,
            e.passed ? 'Aprobado' : 'Reprobado',
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [63, 81, 181] },
        didParseCell: (data) => {
            if (data.column.index === 6 && data.section === 'body') {
                data.cell.styles.textColor = data.cell.raw === 'Aprobado' ? [0, 128, 0] : [200, 0, 0];
            }
        },
    });

    docPdf.save(`Graduacion_${selectedGraduation.value.moduleName}_${selectedGraduation.value.graduationDate.toDate().toISOString().split('T')[0]}.pdf`);
}

onMounted(loadData);
</script>
