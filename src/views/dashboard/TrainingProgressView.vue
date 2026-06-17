<template>
    <div class="d-flex flex-column" style="min-height: 100vh;">
        <NavigationBar class="z-10" />
        <VContainer class="flex-grow-1 pb-8">
            <h1 class="mb-1">Ruta de Formación</h1>
            <p class="text-body-2 text-medium-emphasis mb-4">{{ districtStore.districtName }}</p>

            <VProgressLinear v-if="loading" indeterminate color="primary" class="mb-4" />

            <VAlert v-if="!loading && !districtStore.districtId" type="warning" variant="tonal">
                No se encontró un distrito asociado a tu cuenta.
            </VAlert>

            <template v-if="!loading && districtStore.districtId">

                <!-- ══════════════════════════════════════════════════
                     SECCIÓN 1: MI PROGRESO EN LA RUTA
                ══════════════════════════════════════════════════ -->
                <VCard class="mb-6" elevation="2">
                    <VCardTitle class="text-h6 pa-4 pb-2 d-flex align-center gap-2">
                        <VIcon color="primary">mdi-map-marker-path</VIcon>
                        Mi Progreso en la Ruta de Formación
                    </VCardTitle>
                    <VCardText class="pa-4 pt-2">

                        <div v-if="rutaModules.length === 0" class="text-medium-emphasis text-body-2 py-4">
                            Aún no hay módulos de ruta de formación configurados.
                        </div>

                        <div v-else-if="myLeaderProfiles.length === 0" class="text-medium-emphasis text-body-2 py-4">
                            No se encontró información del líder. Asegúrate de completar tus datos personales.
                        </div>

                        <!-- Un stepper por cada líder activo del distrito (1 solo o pareja) -->
                        <div v-else>
                            <div
                                v-for="(profile, pIdx) in myLeaderProfiles"
                                :key="profile.displayName"
                                :class="{ 'mt-6': pIdx > 0 }"
                            >
                                <!-- Nombre del líder (visible si hay más de 1) -->
                                <div v-if="myLeaderProfiles.length > 1" class="d-flex align-center gap-2 mb-3">
                                    <VIcon size="18" color="primary">mdi-account</VIcon>
                                    <span class="text-subtitle-2 font-weight-bold">{{ profile.displayName }}</span>
                                </div>

                                <div class="ruta-stepper">
                                    <div
                                        v-for="(mod, idx) in rutaModules"
                                        :key="mod.id"
                                        class="ruta-step"
                                        :class="{
                                            'step-aprobado': statusInModule(profile, mod.id) === 'aprobado',
                                            'step-observado': statusInModule(profile, mod.id) === 'observado',
                                            'step-pendiente': !statusInModule(profile, mod.id),
                                        }"
                                    >
                                        <!-- Conector izquierdo -->
                                        <div v-if="idx > 0" class="step-connector">
                                            <div class="connector-line" :class="statusInModule(profile, mod.id) ? 'line-active' : 'line-pending'" />
                                        </div>

                                        <!-- Círculo del paso -->
                                        <div class="step-circle-wrap">
                                            <div class="step-circle" :class="circleClass(statusInModule(profile, mod.id))">
                                                <VIcon v-if="statusInModule(profile, mod.id) === 'aprobado'" size="22" color="white">mdi-check-bold</VIcon>
                                                <VIcon v-else-if="statusInModule(profile, mod.id) === 'observado'" size="22" color="white">mdi-eye</VIcon>
                                                <span v-else class="step-number">{{ mod.order }}</span>
                                            </div>

                                            <!-- Badge de nota -->
                                            <div v-if="enrollmentInModule(profile, mod.id)" class="step-grade-badge" :class="badgeClass(statusInModule(profile, mod.id))">
                                                {{ enrollmentInModule(profile, mod.id)!.grade }}
                                            </div>
                                        </div>

                                        <!-- Etiqueta -->
                                        <div class="step-label">
                                            <div class="step-name">{{ mod.name }}</div>
                                            <VChip
                                                v-if="statusInModule(profile, mod.id)"
                                                :color="statusColor(statusInModule(profile, mod.id))"
                                                size="x-small"
                                                variant="tonal"
                                                class="mt-1"
                                            >
                                                {{ statusLabel(statusInModule(profile, mod.id)) }}
                                            </VChip>
                                            <div v-else class="text-caption text-disabled mt-1">Pendiente</div>

                                            <!-- Botón certificado -->
                                            <VBtn
                                                v-if="statusInModule(profile, mod.id) === 'aprobado'"
                                                size="x-small"
                                                color="success"
                                                variant="tonal"
                                                prepend-icon="mdi-certificate-outline"
                                                class="mt-2"
                                                :loading="generatingCert === enrollmentInModule(profile, mod.id)?.id"
                                                @click="downloadCertForMod(enrollmentInModule(profile, mod.id)!, mod)"
                                            >
                                                Certificado
                                            </VBtn>
                                        </div>
                                    </div>
                                </div>

                                <!-- Resumen ruta por líder -->
                                <div class="d-flex gap-4 mt-3 flex-wrap">
                                    <VChip color="success" variant="tonal" prepend-icon="mdi-check-circle">
                                        {{ profileAprobados(profile) }} / {{ rutaModules.length }} completados
                                    </VChip>
                                    <VChip v-if="profileObservados(profile) > 0" color="warning" variant="tonal" prepend-icon="mdi-eye-circle">
                                        {{ profileObservados(profile) }} observados
                                    </VChip>
                                    <VChip color="primary" variant="tonal" prepend-icon="mdi-percent">
                                        {{ profileAvg(profile) > 0 ? profileAvg(profile).toFixed(1) : '—' }} promedio
                                    </VChip>
                                </div>

                                <VDivider v-if="pIdx < myLeaderProfiles.length - 1" class="mt-5" />
                            </div>
                        </div>
                    </VCardText>
                </VCard>

                <!-- Certificaciones sueltas del líder -->
                <VCard v-if="certModulesWithMyEnroll.length > 0" class="mb-6" elevation="2">
                    <VCardTitle class="text-h6 pa-4 pb-2 d-flex align-center gap-2">
                        <VIcon color="deep-orange">mdi-certificate</VIcon>
                        Mis Certificaciones
                    </VCardTitle>
                    <VCardText class="pa-4 pt-0">
                        <VTable density="compact">
                            <thead>
                                <tr>
                                    <th>Capacitación</th>
                                    <th class="text-center">Nota</th>
                                    <th class="text-center">Estado</th>
                                    <th class="text-center">Certificado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="{ mod, enrollment } in certModulesWithMyEnroll" :key="mod.id">
                                    <td>{{ mod.name }}</td>
                                    <td class="text-center">
                                        <span :class="gradeClass(enrollment.gradeStatus)">{{ enrollment.grade }}</span>
                                    </td>
                                    <td class="text-center">
                                        <VChip :color="statusColor(enrollment.gradeStatus)" size="x-small" variant="tonal">
                                            {{ statusLabel(enrollment.gradeStatus) }}
                                        </VChip>
                                    </td>
                                    <td class="text-center">
                                        <VBtn
                                            v-if="enrollment.passed"
                                            icon size="x-small" color="success" variant="tonal"
                                            :loading="generatingCert === enrollment.id"
                                            @click="downloadCertForMod(enrollment, mod)"
                                        >
                                            <VIcon>mdi-certificate-outline</VIcon>
                                            <VTooltip activator="parent" location="top">Descargar certificado</VTooltip>
                                        </VBtn>
                                        <span v-else class="text-disabled text-caption">—</span>
                                    </td>
                                </tr>
                            </tbody>
                        </VTable>
                    </VCardText>
                </VCard>

                <!-- ══════════════════════════════════════════════════
                     SECCIÓN 2: PARTICIPANTES DE MI DISTRITO
                ══════════════════════════════════════════════════ -->
                <VCard elevation="2">
                    <VCardTitle class="text-h6 pa-4 pb-2 d-flex align-center gap-2">
                        <VIcon color="teal">mdi-account-group</VIcon>
                        Participantes de Mi Distrito
                    </VCardTitle>
                    <VCardText class="pa-4 pt-0">

                        <div v-if="districtEnrollments.length === 0 && !loading" class="text-medium-emphasis text-body-2 py-4">
                            Aún no hay participantes de tu distrito registrados.
                        </div>

                        <VExpansionPanels v-else variant="accordion" class="mt-2">
                            <VExpansionPanel
                                v-for="mod in modulesWithDistrictEnrollments"
                                :key="mod.id"
                            >
                                <VExpansionPanelTitle>
                                    <div class="d-flex align-center gap-2 w-100">
                                        <VChip
                                            :color="(mod.moduleType ?? 'ruta') === 'ruta' ? 'indigo' : 'deep-orange'"
                                            size="x-small" variant="tonal"
                                        >
                                            {{ (mod.moduleType ?? 'ruta') === 'ruta' ? 'Ruta' : 'Certif.' }}
                                        </VChip>
                                        <span class="font-weight-medium">{{ mod.name }}</span>
                                        <VSpacer />
                                        <VChip
                                            :color="allPassedInDistrictModule(mod.id) ? 'success' : 'warning'"
                                            size="x-small" variant="tonal" class="me-2"
                                        >
                                            {{ passedCountInDistrictModule(mod.id) }}/{{ districtEnrollmentsByModule(mod.id).length }} aprobados
                                        </VChip>
                                    </div>
                                </VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <!-- Grupos por fecha dentro del módulo -->
                                    <div
                                        v-for="group in groupsByModule(mod.id)"
                                        :key="group.key"
                                        class="mb-5"
                                    >
                                        <div class="d-flex align-center gap-2 mb-2">
                                            <VIcon size="14" color="primary">mdi-calendar-check</VIcon>
                                            <span class="text-subtitle-2 font-weight-bold">{{ group.groupName }}</span>
                                            <span class="text-caption text-medium-emphasis">— {{ formatDate(group.graduationDate) }}</span>
                                            <VChip
                                                :color="group.level === 'nacional' ? 'purple' : 'teal'"
                                                size="x-small" variant="tonal"
                                            >
                                                {{ group.level === 'nacional' ? 'Nacional' : 'Distrital' }}
                                            </VChip>
                                            <VSpacer />
                                            <VChip color="success" size="x-small" variant="tonal">
                                                {{ group.enrollments.filter(e => e.passed).length }} aprob.
                                            </VChip>
                                            <VChip color="error" size="x-small" variant="tonal">
                                                {{ group.enrollments.filter(e => !e.passed).length }} no aprob.
                                            </VChip>
                                        </div>

                                        <VTable density="compact">
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
                                                    v-for="enrollment in group.enrollments"
                                                    :key="enrollment.id"
                                                >
                                                    <td>{{ enrollment.participantName }}</td>
                                                    <td>{{ enrollment.participantRole }}</td>
                                                    <td class="text-center">
                                                        <span :class="gradeClass(enrollment.gradeStatus)">{{ enrollment.grade }}</span>
                                                    </td>
                                                    <td class="text-center">
                                                        <VChip :color="statusColor(enrollment.gradeStatus)" size="x-small" variant="tonal">
                                                            {{ statusLabel(enrollment.gradeStatus) }}
                                                        </VChip>
                                                    </td>
                                                    <td class="text-center">
                                                        <VBtn
                                                            v-if="enrollment.passed"
                                                            icon size="x-small" color="success" variant="tonal"
                                                            :loading="generatingCert === enrollment.id"
                                                            @click="downloadCertForMod(enrollment, moduleById(enrollment.moduleId))"
                                                        >
                                                            <VIcon>mdi-certificate-outline</VIcon>
                                                            <VTooltip activator="parent" location="top">Descargar certificado</VTooltip>
                                                        </VBtn>
                                                        <span v-else class="text-disabled text-caption">—</span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </VTable>
                                    </div>
                                </VExpansionPanelText>
                            </VExpansionPanel>
                        </VExpansionPanels>
                    </VCardText>
                </VCard>

            </template>
        </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import type { TrainingModule } from '../../types/TrainingModule';
import type { TrainingEnrollment, GradeStatus } from '../../types/TrainingEnrollment';
import { getGradeStatus } from '../../types/TrainingEnrollment';
import type { GroupLevel } from '../../types/TrainingGroup';
import { useDistrictStore } from '../../stores/district';
import { useAuthStore } from '../../stores/auth';
import { useCertificateGenerator } from '../../composables/useCertificateGenerator';
import NavigationBar from '../../components/NavigationBar.vue';

const districtStore = useDistrictStore();
const authStore = useAuthStore();
const { generateCertificate } = useCertificateGenerator();

const loading = ref(true);
const modules = ref<TrainingModule[]>([]);
const myEnrollments = ref<TrainingEnrollment[]>([]);        // enrollments de todos los líderes del distrito
const districtEnrollments = ref<TrainingEnrollment[]>([]);  // todos los de su distrito
const districtGroupLevels = ref<Map<string, GroupLevel>>(new Map()); // key -> level from training_groups
const generatingCert = ref<string | null>(null);
interface LeaderName { normalized: string; display: string; }
const myLeaderNames = ref<LeaderName[]>([]);  // líderes activos del distrito (principal + pareja)

// ── Módulos por tipo ────────────────────────────────────────────────────────
const rutaModules = computed(() =>
    modules.value.filter(m => (m.moduleType ?? 'ruta') === 'ruta')
);

function moduleById(id: string): TrainingModule | undefined {
    return modules.value.find(m => m.id === id);
}

// ── Mi progreso (parametrizado por perfil de líder) ──────────────────────────
function enrollmentInModule(profile: LeaderProfile, moduleId: string): TrainingEnrollment | undefined {
    return profile.enrollments.find(e => e.moduleId === moduleId);
}

function statusInModule(profile: LeaderProfile, moduleId: string): GradeStatus | undefined {
    return enrollmentInModule(profile, moduleId)?.gradeStatus;
}

function circleClass(status: GradeStatus | undefined): string {
    if (status === 'aprobado') return 'circle-aprobado';
    if (status === 'observado') return 'circle-observado';
    return 'circle-pendiente';
}

function badgeClass(status: GradeStatus | undefined): string {
    if (status === 'aprobado') return 'badge-aprobado';
    if (status === 'observado') return 'badge-observado';
    return 'badge-pendiente';
}

function profileAprobados(profile: LeaderProfile): number {
    return rutaModules.value.filter(m => statusInModule(profile, m.id) === 'aprobado').length;
}
function profileObservados(profile: LeaderProfile): number {
    return rutaModules.value.filter(m => statusInModule(profile, m.id) === 'observado').length;
}
function profileAvg(profile: LeaderProfile): number {
    const grades = profile.enrollments
        .filter(e => (moduleById(e.moduleId)?.moduleType ?? 'ruta') === 'ruta')
        .map(e => e.grade);
    return grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
}

// Compat helpers usados en certModulesWithMyEnroll y downloadMyCert (usan myEnrollments global)
function myEnrollmentInModule(moduleId: string): TrainingEnrollment | undefined {
    return myEnrollments.value.find(e => e.moduleId === moduleId);
}

// Perfiles de cada líder con sus enrollments — soporta 1 o 2 líderes (pareja)
interface LeaderProfile {
    displayName: string;
    enrollments: TrainingEnrollment[];
}
const myLeaderProfiles = computed((): LeaderProfile[] => {
    return myLeaderNames.value.map(({ normalized, display }) => {
        const fromEnrollment = myEnrollments.value.find(
            e => e.participantName.trim().toLowerCase() === normalized
        )?.participantName;
        return {
            displayName: fromEnrollment ?? display,
            enrollments: myEnrollments.value.filter(
                e => e.participantName.trim().toLowerCase() === normalized
            ),
        };
    });
});

// Certificaciones sueltas donde yo participo
const certModulesWithMyEnroll = computed(() => {
    return modules.value
        .filter(m => (m.moduleType ?? 'ruta') === 'certificacion')
        .flatMap(mod => {
            const e = myEnrollmentInModule(mod.id);
            return e ? [{ mod, enrollment: e }] : [];
        });
});

// ── Distrito ─────────────────────────────────────────────────────────────────
function districtEnrollmentsByModule(moduleId: string): TrainingEnrollment[] {
    return districtEnrollments.value.filter(e => e.moduleId === moduleId);
}
function passedCountInDistrictModule(moduleId: string): number {
    return districtEnrollmentsByModule(moduleId).filter(e => e.passed).length;
}
function allPassedInDistrictModule(moduleId: string): boolean {
    const list = districtEnrollmentsByModule(moduleId);
    return list.length > 0 && list.every(e => e.passed);
}

const modulesWithDistrictEnrollments = computed(() =>
    modules.value.filter(m => districtEnrollmentsByModule(m.id).length > 0)
);

interface GroupRow {
    key: string;
    groupName: string;
    graduationDate: Timestamp;
    level: GroupLevel;
    enrollments: TrainingEnrollment[];
}

function groupsByModule(moduleId: string): GroupRow[] {
    const list = districtEnrollmentsByModule(moduleId);
    const map = new Map<string, GroupRow>();
    for (const e of list) {
        const key = `${e.groupName}__${e.graduationDate?.toMillis?.() ?? 0}`;
        if (!map.has(key)) {
            const level = districtGroupLevels.value.get(key) ?? 'distrital';
            map.set(key, { key, groupName: e.groupName, graduationDate: e.graduationDate, level, enrollments: [] });
        }
        map.get(key)!.enrollments.push(e);
    }
    return [...map.values()].sort((a, b) => (b.graduationDate?.toMillis?.() ?? 0) - (a.graduationDate?.toMillis?.() ?? 0));
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function statusColor(status: GradeStatus | undefined): string {
    if (status === 'aprobado') return 'success';
    if (status === 'observado') return 'warning';
    return 'error';
}
function statusLabel(status: GradeStatus | undefined): string {
    if (status === 'aprobado') return 'Aprobado';
    if (status === 'observado') return 'Observado';
    return 'Reprobado';
}
function gradeClass(status: GradeStatus | undefined): string {
    if (status === 'aprobado') return 'text-success font-weight-bold';
    if (status === 'observado') return 'text-warning font-weight-bold';
    return 'text-error';
}
function formatDate(ts: Timestamp | null | undefined): string {
    if (!ts) return '';
    return ts.toDate().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Certificados ──────────────────────────────────────────────────────────────
async function downloadMyCert(mod: TrainingModule) {
    const enrollment = myEnrollmentInModule(mod.id);
    if (!enrollment) return;
    await downloadCertForMod(enrollment, mod);
}

async function downloadCertForMod(enrollment: TrainingEnrollment, mod: TrainingModule | undefined) {
    if (!mod?.certificateImageUrl) {
        alert('Este módulo no tiene plantilla de certificado configurada.');
        return;
    }
    generatingCert.value = enrollment.id;
    try {
        await generateCertificate(enrollment, mod, enrollment.graduationDate);
    } catch (e) {
        console.error(e);
        alert('Error al generar el certificado.');
    } finally {
        generatingCert.value = null;
    }
}

// ── Carga de datos ───────────────────────────────────────────────────────────
async function loadData() {
    loading.value = true;
    try {
        await districtStore.loadDistrictData();
        if (!districtStore.districtId) return;

        const userId = auth.currentUser?.uid ?? authStore.user?.id;

        const [modSnap, districtEnrSnap, groupsSnap] = await Promise.all([
            getDocs(query(collection(db, 'training_modules'), orderBy('order'))),
            getDocs(query(
                collection(db, 'training_enrollments'),
                where('districtId', '==', districtStore.districtId)
            )),
            getDocs(query(
                collection(db, 'training_groups'),
                where('moduleId', '!=', '')   // traer todos — filtraremos client-side
            )),
        ]);

        modules.value = modSnap.docs.map(d => ({ id: d.id, ...d.data() } as TrainingModule));

        const allDistrictEnr = districtEnrSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as TrainingEnrollment))
            .map(e => ({ ...e, gradeStatus: e.gradeStatus ?? getGradeStatus(e.grade) }));

        districtEnrollments.value = allDistrictEnr.sort((a, b) =>
            a.participantName.localeCompare(b.participantName)
        );

        // Identificar líderes activos del distrito (principal + pareja si existe)
        {
            const { getDoc, doc: fsDoc, getDocs: fsGetDocs, query: fsQuery, collection: fsCollection, where: fsWhere } = await import('firebase/firestore');

            // Intentar obtener userIds desde district_leaders
            const dlSnap = await fsGetDocs(fsQuery(
                fsCollection(db, 'district_leaders'),
                fsWhere('districtId', '==', districtStore.districtId),
                fsWhere('isActive', '==', true),
            ));

            // Si no hay registros activos, usar el usuario actual como fallback
            const rawIds = dlSnap.docs.length > 0
                ? dlSnap.docs.map(d => d.data().userId as string | undefined)
                : (userId ? [userId] : []);
            const userIds: string[] = rawIds.filter((id): id is string => !!id);

            const names: LeaderName[] = [];
            await Promise.all(userIds.map(async (lUserId) => {
                const leaderDoc = await getDoc(fsDoc(db, 'leaders', lUserId));
                if (leaderDoc.exists()) {
                    const data = leaderDoc.data();
                    // Líder principal
                    const pd = data.personalData ?? {};
                    const display = [pd.firstName, pd.lastName].filter(Boolean).join(' ').trim();
                    if (display) names.push({ normalized: display.toLowerCase(), display });
                    // Segundo líder (pareja) si existe
                    const sl = data.secondLeader;
                    if (sl) {
                        const spd = sl.personalData ?? {};
                        const sdisplay = [spd.firstName, spd.lastName].filter(Boolean).join(' ').trim();
                        if (sdisplay) names.push({ normalized: sdisplay.toLowerCase(), display: sdisplay });
                    }
                }
            }));

            // Fallback: si aún no hay nombres, intentar con el uid actual
            const currentUid = auth.currentUser?.uid ?? userId;
            if (names.length === 0 && currentUid) {
                const fallbackDoc = await getDoc(fsDoc(db, 'leaders', currentUid));
                const fallbackDisplay = fallbackDoc.exists()
                    ? [fallbackDoc.data().personalData?.firstName, fallbackDoc.data().personalData?.lastName].filter(Boolean).join(' ').trim()
                    : (authStore.user?.email ?? 'Líder');
                if (fallbackDisplay) names.push({ normalized: fallbackDisplay.toLowerCase(), display: fallbackDisplay });
            }

            myLeaderNames.value = names;
            const normalizedSet = new Set(names.map(n => n.normalized));
            myEnrollments.value = allDistrictEnr.filter(e =>
                normalizedSet.has(e.participantName.trim().toLowerCase())
            );
        }

        // Cargar niveles de grupos (para mostrar Nacional/Distrital en la sección 2)
        const levelMap = new Map<string, GroupLevel>();
        groupsSnap.docs.forEach(d => {
            const g = d.data();
            const key = `${g.groupName}__${(g.graduationDate as Timestamp)?.toMillis?.() ?? 0}`;
            levelMap.set(key, g.level ?? 'distrital');
        });
        districtGroupLevels.value = levelMap;

    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
}

onMounted(loadData);
</script>

<style scoped>
/* ── Stepper de ruta ─────────────────────────────────────────── */
.ruta-stepper {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 0;
    align-items: flex-start;
    padding: 8px 0;
}

.ruta-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex: 1;
    min-width: 90px;
    max-width: 160px;
}

.step-connector {
    position: absolute;
    top: 24px;
    left: -50%;
    width: 100%;
    z-index: 0;
}

.connector-line {
    height: 3px;
    width: 100%;
}

.line-active {
    background: linear-gradient(90deg, #43a047, #66bb6a);
}

.line-pending {
    background: #e0e0e0;
}

.step-circle-wrap {
    position: relative;
    z-index: 1;
    margin-bottom: 8px;
}

.step-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.circle-aprobado {
    background: linear-gradient(135deg, #43a047, #66bb6a);
    color: white;
}

.circle-observado {
    background: linear-gradient(135deg, #f57c00, #ffb74d);
    color: white;
}

.circle-pendiente {
    background: #e0e0e0;
    color: #9e9e9e;
}

.step-grade-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
}

.badge-aprobado { background: #2e7d32; color: white; }
.badge-observado { background: #e65100; color: white; }
.badge-pendiente { background: #9e9e9e; color: white; }

.step-number { color: #757575; font-size: 16px; font-weight: 700; }

.step-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 4px;
}

.step-name {
    font-size: 11px;
    font-weight: 600;
    color: #424242;
    line-height: 1.3;
    max-width: 100px;
}

/* Responsive: en móviles, stepper vertical */
@media (max-width: 480px) {
    .ruta-stepper {
        flex-direction: column;
        align-items: flex-start;
        gap: 0;
    }

    .ruta-step {
        flex-direction: row;
        align-items: flex-start;
        max-width: 100%;
        width: 100%;
        min-width: unset;
        padding: 8px 0;
    }

    .step-connector {
        top: -50%;
        left: 24px;
        width: 3px;
        height: 100%;
    }

    .connector-line {
        width: 3px;
        height: 100%;
    }

    .step-circle-wrap {
        margin-bottom: 0;
        margin-right: 16px;
        flex-shrink: 0;
    }

    .step-label {
        align-items: flex-start;
        text-align: left;
    }

    .step-name {
        max-width: none;
    }
}
</style>
