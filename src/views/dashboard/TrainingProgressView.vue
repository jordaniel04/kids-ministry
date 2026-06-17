<template>
    <div class="d-flex flex-column" style="min-height: 100vh;">
        <NavigationBar class="z-10" />
        <VContainer class="flex-grow-1">
            <h1 class="mb-1">Ruta de Formación</h1>
            <p class="text-body-2 text-medium-emphasis mb-4">{{ districtStore.districtName }}</p>

            <VProgressLinear v-if="loading" indeterminate color="primary" class="mb-4" />

            <VAlert v-if="!loading && !districtStore.districtId" type="warning" variant="tonal">
                No se encontró un distrito asociado a tu cuenta.
            </VAlert>

            <VAlert v-if="!loading && modules.length === 0 && districtStore.districtId" type="info" variant="tonal">
                Aún no hay módulos de formación configurados.
            </VAlert>

            <!-- Resumen general -->
            <VCard v-if="!loading && modules.length > 0" class="mb-4">
                <VCardText>
                    <VRow>
                        <VCol cols="6" sm="3" v-for="stat in progressStats" :key="stat.label">
                            <div class="text-center">
                                <div class="text-h5 font-weight-bold" :class="`text-${stat.color}`">{{ stat.value }}</div>
                                <div class="text-caption text-medium-emphasis">{{ stat.label }}</div>
                            </div>
                        </VCol>
                    </VRow>
                </VCardText>
            </VCard>

            <!-- Módulos con sus graduaciones -->
            <VExpansionPanels v-if="!loading && modules.length > 0" variant="accordion">
                <VExpansionPanel v-for="module in modules" :key="module.id">
                    <VExpansionPanelTitle>
                        <div class="d-flex align-center gap-2 w-100">
                            <VChip color="primary" size="small" variant="tonal">{{ module.order }}</VChip>
                            <span class="font-weight-medium">{{ module.name }}</span>
                            <VSpacer />
                            <VChip
                                v-if="myEnrollmentsByModule(module.id).length > 0"
                                :color="allPassedInModule(module.id) ? 'success' : 'warning'"
                                size="x-small"
                                variant="tonal"
                                class="me-2"
                            >
                                {{ passedCountInModule(module.id) }}/{{ myEnrollmentsByModule(module.id).length }} aprobados
                            </VChip>
                        </div>
                    </VExpansionPanelTitle>
                    <VExpansionPanelText>
                        <div v-if="graduationsByModule(module.id).length === 0" class="text-medium-emphasis text-body-2 pa-2">
                            Sin graduaciones registradas para este módulo.
                        </div>

                        <div v-for="grad in graduationsByModule(module.id)" :key="grad.id" class="mb-4">
                            <p class="text-subtitle-2 mb-2">
                                <VIcon size="14" class="me-1">mdi-calendar</VIcon>
                                Graduación: {{ formatDate(grad.graduationDate) }}
                                <span v-if="grad.description" class="text-caption text-medium-emphasis ms-2">
                                    — {{ grad.description }}
                                </span>
                            </p>

                            <div v-if="enrollmentsByGraduation(grad.id).length === 0" class="text-caption text-medium-emphasis mb-2">
                                Sin participantes de tu distrito en esta graduación.
                            </div>

                            <VTable v-else density="compact" class="mb-2">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Rol</th>
                                        <th class="text-center">Nota</th>
                                        <th class="text-center">Estado</th>
                                        <th class="text-center">Certificado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="enrollment in enrollmentsByGraduation(grad.id)"
                                        :key="enrollment.id"
                                        :class="{ 'text-medium-emphasis': !enrollment.passed }"
                                    >
                                        <td>{{ enrollment.participantName }}</td>
                                        <td>{{ enrollment.participantRole }}</td>
                                        <td class="text-center">
                                            <span :class="enrollment.passed ? 'text-success font-weight-bold' : 'text-error'">
                                                {{ enrollment.grade }}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <VChip
                                                :color="enrollment.passed ? 'success' : 'error'"
                                                size="x-small"
                                                variant="tonal"
                                            >
                                                {{ enrollment.passed ? 'Aprobado' : 'Reprobado' }}
                                            </VChip>
                                        </td>
                                        <td class="text-center">
                                            <VBtn
                                                v-if="enrollment.passed"
                                                icon
                                                color="success"
                                                size="x-small"
                                                variant="tonal"
                                                :loading="generatingCert === enrollment.id"
                                                @click="downloadCertificate(enrollment, module, grad.graduationDate)"
                                            >
                                                <VIcon>mdi-certificate-outline</VIcon>
                                                <VTooltip activator="parent" location="top">Descargar certificado</VTooltip>
                                            </VBtn>
                                            <span v-else class="text-caption text-disabled">—</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </VTable>
                        </div>
                    </VExpansionPanelText>
                </VExpansionPanel>
            </VExpansionPanels>
        </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import type { TrainingModule } from '../../types/TrainingModule';
import type { TrainingGraduation } from '../../types/TrainingGraduation';
import type { TrainingEnrollment } from '../../types/TrainingEnrollment';
import { useDistrictStore } from '../../stores/district';
import { useCertificateGenerator } from '../../composables/useCertificateGenerator';
import NavigationBar from '../../components/NavigationBar.vue';

const districtStore = useDistrictStore();
const { generateCertificate } = useCertificateGenerator();

const loading = ref(true);
const modules = ref<TrainingModule[]>([]);
const graduations = ref<TrainingGraduation[]>([]);
const enrollments = ref<TrainingEnrollment[]>([]);
const generatingCert = ref<string | null>(null);

function enrollmentsByGraduation(gradId: string): TrainingEnrollment[] {
    return enrollments.value.filter(e => e.graduationId === gradId);
}

function graduationsByModule(moduleId: string): TrainingGraduation[] {
    return graduations.value.filter(g => g.moduleId === moduleId);
}

function myEnrollmentsByModule(moduleId: string): TrainingEnrollment[] {
    return enrollments.value.filter(e => e.moduleId === moduleId);
}

function passedCountInModule(moduleId: string): number {
    return myEnrollmentsByModule(moduleId).filter(e => e.passed).length;
}

function allPassedInModule(moduleId: string): boolean {
    const list = myEnrollmentsByModule(moduleId);
    return list.length > 0 && list.every(e => e.passed);
}

function formatDate(ts: Timestamp | null | undefined): string {
    if (!ts) return '';
    return ts.toDate().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const progressStats = computed(() => {
    const total = enrollments.value.length;
    const passed = enrollments.value.filter(e => e.passed).length;
    const avg = total > 0
        ? (enrollments.value.reduce((s, e) => s + e.grade, 0) / total).toFixed(1)
        : '0';
    return [
        { label: 'Participantes', value: total, color: 'primary' },
        { label: 'Aprobados', value: passed, color: 'success' },
        { label: 'Reprobados', value: total - passed, color: 'error' },
        { label: 'Promedio', value: avg, color: 'info' },
    ];
});

async function loadData() {
    loading.value = true;
    try {
        await districtStore.loadDistrictData();
        if (!districtStore.districtId) return;

        const [modSnap, gradSnap, enrSnap] = await Promise.all([
            getDocs(query(collection(db, 'training_modules'), orderBy('order'))),
            getDocs(query(collection(db, 'training_graduations'), orderBy('graduationDate'))),
            getDocs(query(
                collection(db, 'training_enrollments'),
                where('districtId', '==', districtStore.districtId)
            )),
        ]);

        modules.value = modSnap.docs.map(d => ({ id: d.id, ...d.data() } as TrainingModule));
        graduations.value = gradSnap.docs.map(d => ({ id: d.id, ...d.data() } as TrainingGraduation));
        enrollments.value = enrSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as TrainingEnrollment))
            .sort((a, b) => a.participantName.localeCompare(b.participantName));
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
}

async function downloadCertificate(enrollment: TrainingEnrollment, module: TrainingModule, graduationDate: Timestamp) {
    if (!module.certificateImageUrl) {
        alert('Este módulo no tiene plantilla de certificado configurada.');
        return;
    }
    generatingCert.value = enrollment.id;
    try {
        await generateCertificate(enrollment, module, graduationDate);
    } catch (e) {
        console.error(e);
        alert('Error al generar el certificado.');
    } finally {
        generatingCert.value = null;
    }
}

onMounted(loadData);
</script>
