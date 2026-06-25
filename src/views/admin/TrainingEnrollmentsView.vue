<template>
    <div class="d-flex flex-column" style="min-height: 100vh;">
        <NavigationBar class="z-10" />
        <VContainer class="flex-grow-1">

            <!-- Vista: lista de módulos -->
            <template v-if="!selectedModule">
                <div class="d-flex justify-space-between align-center mb-4">
                    <div>
                        <h1>Inscripciones y Certificados</h1>
                        <p class="text-body-2 text-medium-emphasis">Selecciona un módulo para gestionar sus grupos y participantes.</p>
                    </div>
                    <VBtn
                        color="warning" variant="tonal" size="small"
                        prepend-icon="mdi-format-letter-case-upper"
                        :loading="migrating"
                        @click="migrateNamesToUppercase"
                    >
                        Normalizar nombres
                    </VBtn>
                </div>
                <VAlert v-if="migrateResult" :type="migrateResult.type" variant="tonal" density="compact" class="mb-4" closable @click:close="migrateResult = null">
                    {{ migrateResult.message }}
                </VAlert>
                <VProgressLinear v-if="loading" indeterminate color="primary" class="mb-4" />
                <VAlert v-if="!loading && modules.length === 0" type="info" variant="tonal">
                    No hay módulos de formación creados aún.
                </VAlert>
                <VRow>
                    <VCol cols="12" sm="6" md="4" v-for="mod in modules" :key="mod.id">
                        <VCard hover @click="selectModule(mod)">
                            <VCardText>
                                <div class="d-flex align-center gap-2 mb-2">
                                    <VChip color="primary" size="small" variant="tonal">{{ mod.order }}</VChip>
                                    <span class="text-h6 font-weight-bold">{{ mod.name }}</span>
                                </div>
                                <div class="text-caption text-medium-emphasis">
                                    <VIcon size="13" class="me-1">mdi-account-group</VIcon>
                                    {{ enrollmentCountsByModule[mod.id] ?? 0 }} participantes registrados
                                </div>
                            </VCardText>
                            <VCardActions class="pt-0">
                                <VBtn variant="tonal" color="primary" size="small" append-icon="mdi-arrow-right">
                                    Ver participantes
                                </VBtn>
                            </VCardActions>
                        </VCard>
                    </VCol>
                </VRow>
            </template>

            <!-- Vista: detalle del módulo -->
            <template v-if="selectedModule">
                <div class="d-flex align-center gap-2 mb-4">
                    <VBtn variant="text" icon @click="selectedModule = null; groupsMeta = []; expandedGroups = new Set()">
                        <VIcon>mdi-arrow-left</VIcon>
                        <VTooltip activator="parent">Volver a módulos</VTooltip>
                    </VBtn>
                    <VDivider vertical class="mx-1" />
                    <div>
                        <h2 class="text-h6">{{ selectedModule.name }}</h2>
                        <p class="text-caption text-medium-emphasis">Módulo {{ selectedModule.order }}</p>
                    </div>
                    <VSpacer />
                    <VBtn color="primary" prepend-icon="mdi-plus" size="small" @click="openGroupDialog()">
                        Nuevo Grupo
                    </VBtn>
                    <VBtn color="secondary" prepend-icon="mdi-file-pdf-box" size="small" variant="tonal" @click="exportPdf">
                        Exportar PDF
                    </VBtn>
                </div>

                <!-- Resumen rápido -->
                <VRow class="mb-4">
                    <VCol cols="6" sm="auto" v-for="stat in generalStats" :key="stat.label">
                        <VCard variant="tonal" :color="stat.color">
                            <VCardText class="text-center pa-3">
                                <VIcon :icon="stat.icon" size="24" class="mb-1" />
                                <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
                                <div class="text-caption">{{ stat.label }}</div>
                            </VCardText>
                        </VCard>
                    </VCol>
                </VRow>

                <!-- Tabs -->
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
                            <VTab value="replicas">
                                <VIcon start>mdi-map-marker-multiple</VIcon>
                                Réplicas Distritales
                            </VTab>
                            <VTab value="bajas" v-if="inactiveEnrollments.length > 0">
                                <VIcon start>mdi-account-off</VIcon>
                                Dados de Baja
                                <VChip size="x-small" color="error" variant="tonal" class="ms-1">{{ inactiveEnrollments.length }}</VChip>
                            </VTab>
                        </VTabs>

                        <VWindow v-model="activeTab">
                            <VWindowItem value="lista">
                                <VTextField
                                    v-model="searchEnrollments"
                                    prepend-inner-icon="mdi-magnify"
                                    label="Buscar participante"
                                    single-line hide-details density="compact"
                                    class="mb-4" style="max-width: 300px;"
                                />

                                <div v-if="loadingEnrollments" class="text-center py-8">
                                    <VProgressCircular indeterminate color="primary" />
                                </div>

                                <div v-else-if="groups.length === 0" class="text-center text-medium-emphasis py-8">
                                    No hay grupos registrados en este módulo. Crea un nuevo grupo.
                                </div>

                                <!-- Grupos -->
                                <div v-for="group in groups" :key="group.key" class="mb-2">
                                    <div
                                        class="d-flex align-center gap-2 pa-2 rounded cursor-pointer"
                                        style="background: rgba(var(--v-theme-primary), 0.05);"
                                        @click="toggleGroup(group.key)"
                                    >
                                        <VIcon size="18" :icon="expandedGroups.has(group.key) ? 'mdi-chevron-down' : 'mdi-chevron-right'" color="primary" />
                                        <VIcon size="16" color="primary">mdi-calendar-check</VIcon>
                                        <span class="text-subtitle-1 font-weight-bold">{{ group.groupName }}</span>
                                        <span class="text-caption text-medium-emphasis">— {{ formatDate(group.graduationDate) }}</span>
                                        <VChip :color="group.level === 'nacional' ? 'purple' : 'teal'" size="x-small" variant="tonal">
                                            {{ group.level === 'nacional' ? 'Nacional' : 'Distrital' }}
                                        </VChip>
                                        <VSpacer />
                                        <VChip size="x-small" color="primary" variant="tonal">{{ group.enrollments.length }} personas</VChip>
                                        <VBtn size="x-small" color="primary" variant="tonal" prepend-icon="mdi-account-plus"
                                            @click.stop="openEnrollDialog(group)">
                                            Agregar
                                        </VBtn>
                                        <VBtn icon size="x-small" color="primary" variant="text" @click.stop="openGroupDialog(group)">
                                            <VIcon size="16">mdi-pencil</VIcon>
                                            <VTooltip activator="parent">Editar grupo</VTooltip>
                                        </VBtn>
                                        <VBtn icon size="x-small" color="error" variant="text" @click.stop="confirmDeleteGroup(group)">
                                            <VIcon size="16">mdi-delete</VIcon>
                                            <VTooltip activator="parent">Eliminar grupo y participantes</VTooltip>
                                        </VBtn>
                                    </div>

                                    <div v-if="expandedGroups.has(group.key)" class="mb-4">
                                    <div v-if="group.enrollments.length === 0" class="text-caption text-medium-emphasis ms-6 mt-2 mb-2">
                                        Sin participantes en este grupo aún.
                                    </div>

                                    <VTable v-else density="compact">
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Rol</th>
                                                <th>Distrito</th>
                                                <th class="text-center">Nota</th>
                                                <th class="text-center">Estado</th>
                                                <th class="text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="item in group.enrollments" :key="item.id">
                                                <td>
                                                    {{ item.participantName }}
                                                    <VChip
                                                        v-if="item.prerequisitePending"
                                                        color="warning"
                                                        size="x-small"
                                                        variant="tonal"
                                                        prepend-icon="mdi-alert-circle-outline"
                                                        class="ms-1"
                                                    >
                                                        Módulo previo pendiente
                                                        <VTooltip activator="parent" location="top">
                                                            No tenía aprobado el módulo anterior al ser registrado aquí.
                                                        </VTooltip>
                                                    </VChip>
                                                </td>
                                                <td>{{ item.participantRole }}</td>
                                                <td>{{ item.districtName }}</td>
                                                <td class="text-center">
                                                    <span :class="gradeClass(item.gradeStatus)">{{ item.grade }}</span>
                                                    <VBtn
                                                        v-if="item.attempts?.length"
                                                        icon
                                                        size="x-small"
                                                        variant="text"
                                                        color="grey"
                                                        class="ms-1"
                                                    >
                                                        <VIcon size="14">mdi-history</VIcon>
                                                        <VTooltip activator="parent" location="top" max-width="280">
                                                            <div class="text-caption font-weight-bold mb-1">Intentos anteriores</div>
                                                            <div
                                                                v-for="(a, i) in item.attempts"
                                                                :key="i"
                                                                class="text-caption"
                                                            >
                                                                {{ a.groupName }} — {{ formatDate(a.graduationDate) }}: <strong>{{ a.grade }}</strong> ({{ statusLabel(a.gradeStatus) }})
                                                            </div>
                                                        </VTooltip>
                                                    </VBtn>
                                                </td>
                                                <td class="text-center">
                                                    <VChip :color="statusColor(item.gradeStatus)" size="x-small" variant="tonal">
                                                        {{ statusLabel(item.gradeStatus) }}
                                                    </VChip>
                                                </td>
                                                <td class="text-center">
                                                    <div class="d-flex gap-1 justify-center">
                                                        <VBtn icon color="primary" size="x-small" variant="tonal"
                                                            @click="openEditEnrollDialog(item, group)">
                                                            <VIcon>mdi-pencil</VIcon>
                                                        </VBtn>
                                                        <VBtn icon :color="item.passed ? 'success' : 'grey'" size="x-small"
                                                            variant="tonal" :disabled="!item.passed || generatingCert === item.id"
                                                            :loading="generatingCert === item.id"
                                                            @click="downloadCertificate(item)">
                                                            <VIcon>mdi-certificate</VIcon>
                                                            <VTooltip activator="parent" location="top">
                                                                {{ item.passed ? 'Descargar certificado' : 'Solo aprobados' }}
                                                            </VTooltip>
                                                        </VBtn>
                                                        <VBtn icon color="orange" size="x-small" variant="tonal"
                                                            @click="openMoveDialog(item, group)">
                                                            <VIcon>mdi-swap-horizontal</VIcon>
                                                            <VTooltip activator="parent" location="top">Mover a otro grupo</VTooltip>
                                                        </VBtn>
                                                        <VBtn icon color="error" size="x-small" variant="tonal"
                                                            @click="confirmDeleteEnroll(item)">
                                                            <VIcon>mdi-delete</VIcon>
                                                        </VBtn>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </VTable>
                                    </div><!-- /expandedGroups -->
                                </div>
                            </VWindowItem>

                            <VWindowItem value="estadisticas">
                                <VDataTable :headers="districtStatsHeaders" :items="districtStats"
                                    density="compact" hide-default-footer :items-per-page="-1">
                                    <template #[`item.passRate`]="{ item }">
                                        <VProgressLinear :model-value="item.passRate" color="success"
                                            bg-color="error-lighten-4" height="16" rounded>
                                            <template #default="{ value }">
                                                <span class="text-caption font-weight-bold">{{ Math.round(value) }}%</span>
                                            </template>
                                        </VProgressLinear>
                                    </template>
                                </VDataTable>
                            </VWindowItem>

                            <VWindowItem value="replicas">
                                <div v-if="loadingLeaders" class="text-center py-8">
                                    <VProgressCircular indeterminate color="primary" />
                                </div>
                                <div v-else-if="replicasByDistrict.length === 0" class="text-center text-medium-emphasis py-8">
                                    No hay grupos distritales registrados en este módulo.
                                </div>
                                <VTable v-else density="comfortable">
                                    <thead>
                                        <tr>
                                            <th style="width:30%">Distrito</th>
                                            <th>Líderes Distritales</th>
                                            <th>Réplicas realizadas</th>
                                            <th class="text-center">Total participantes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="row in replicasByDistrict" :key="row.districtId">
                                            <td class="font-weight-medium">{{ row.districtName }}</td>
                                            <td>
                                                <div v-if="districtLeadersMap[row.districtId]?.length">
                                                    <div v-for="leader in districtLeadersMap[row.districtId]" :key="leader" class="text-body-2">
                                                        {{ leader }}
                                                    </div>
                                                </div>
                                                <span v-else class="text-caption text-medium-emphasis">—</span>
                                            </td>
                                            <td>
                                                <div v-for="g in row.groups" :key="g.key" class="d-flex align-center gap-2 py-1">
                                                    <VChip size="x-small" color="teal" variant="tonal">{{ formatDate(g.graduationDate) }}</VChip>
                                                    <span class="text-caption text-medium-emphasis">{{ g.groupName }}</span>
                                                    <span class="text-caption text-medium-emphasis">({{ g.enrollments.length }} pers.)</span>
                                                </div>
                                            </td>
                                            <td class="text-center">
                                                <VChip size="small" color="primary" variant="tonal">
                                                    {{ row.totalParticipants }}
                                                </VChip>
                                            </td>
                                        </tr>
                                    </tbody>
                                </VTable>
                            </VWindowItem>

                            <VWindowItem value="bajas">
                                <div class="text-body-2 text-medium-emphasis mb-3">
                                    Participantes dados de baja por su líder distrital. No se incluyen en estadísticas.
                                </div>
                                <VTable density="compact">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Rol</th>
                                            <th>Distrito</th>
                                            <th>Grupo</th>
                                            <th class="text-center">Nota</th>
                                            <th class="text-center">Fecha de Baja</th>
                                            <th class="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="item in inactiveEnrollments" :key="item.id">
                                            <td>{{ item.participantName }}</td>
                                            <td>{{ item.participantRole }}</td>
                                            <td>{{ item.districtName }}</td>
                                            <td>{{ item.groupName }}</td>
                                            <td class="text-center">
                                                <span :class="gradeClass(item.gradeStatus)">{{ item.grade }}</span>
                                            </td>
                                            <td class="text-center text-caption">
                                                {{ item.deactivatedAt ? formatDate(item.deactivatedAt) : '—' }}
                                            </td>
                                            <td class="text-center">
                                                <VBtn size="x-small" color="success" variant="tonal"
                                                    prepend-icon="mdi-account-check"
                                                    @click="reactivateEnrollment(item)">
                                                    Reactivar
                                                    <VTooltip activator="parent" location="top">Devolver al listado activo</VTooltip>
                                                </VBtn>
                                            </td>
                                        </tr>
                                    </tbody>
                                </VTable>
                            </VWindowItem>
                        </VWindow>
                    </VCardText>
                </VCard>
            </template>

            <!-- Dialog crear/editar Grupo -->
            <VDialog v-model="groupDialog" max-width="480px" persistent>
                <VCard>
                    <VCardTitle>{{ editingGroup ? 'Editar Grupo' : 'Nuevo Grupo' }}</VCardTitle>
                    <VCardText>
                        <VContainer>
                            <VRow>
                                <VCol cols="12">
                                    <VTextField v-model="editedGroup.groupName" label="Nombre del grupo"
                                        placeholder="Ej: Primera Promoción Lima" required />
                                </VCol>
                                <VCol cols="12" sm="6">
                                    <VTextField v-model="editedGroup.graduationDateStr" label="Fecha de graduación"
                                        type="date" required />
                                </VCol>
                                <VCol cols="12" sm="6">
                                    <VSelect v-model="editedGroup.level" :items="levelOptions"
                                        item-title="title" item-value="value"
                                        label="Nivel de capacitación" required />
                                </VCol>
                                <VCol v-if="editedGroup.level === 'distrital'" cols="12">
                                    <VAutocomplete
                                        v-model="editedGroup.districtId"
                                        :items="districtOptions"
                                        item-title="label"
                                        item-value="value"
                                        label="Distrito"
                                        placeholder="Buscar distrito..."
                                        clearable
                                        required
                                        @update:model-value="onGroupDistrictChange"
                                    />
                                </VCol>
                            </VRow>
                        </VContainer>
                    </VCardText>
                    <VCardActions>
                        <VSpacer />
                        <VBtn color="error" variant="text" :disabled="saving" @click="groupDialog = false">Cancelar</VBtn>
                        <VBtn color="success" variant="text" @click="saveGroup"
                            :loading="saving"
                            :disabled="!isGroupValid">
                            Guardar
                        </VBtn>
                    </VCardActions>
                </VCard>
            </VDialog>

            <!-- Dialog agregar/editar Participante -->
            <VDialog v-model="enrollDialog" max-width="580px" persistent>
                <VCard>
                    <VCardTitle>{{ editingEnrollId ? 'Editar Participante' : 'Agregar Participante' }}</VCardTitle>
                    <VCardSubtitle v-if="currentGroup" class="pb-0">
                        <VIcon size="14" class="me-1">mdi-calendar-check</VIcon>
                        {{ currentGroup.groupName }} — {{ formatDate(currentGroup.graduationDate) }}
                    </VCardSubtitle>
                    <VCardText>
                        <VContainer>
                            <VRow>
                                <VCol cols="12">
                                    <VTextField
                                        v-model="editedEnroll.participantName"
                                        label="Nombre Completo"
                                        :loading="loadingLeaderName"
                                        :error-messages="nameHasInvalidChars ? ['Solo se permiten letras, tildes y espacios'] : []"
                                        :hint="!nameHasInvalidChars && loadingLeaderName ? 'Buscando líder distrital...' : (!nameHasInvalidChars && editedEnroll.participantRole === 'Líder Distrital' && editedEnroll.districtId ? 'Autocompletado desde el registro del líder' : '')"
                                        persistent-hint
                                        required
                                    />
                                </VCol>
                                <VCol cols="12" sm="6">
                                    <VSelect v-model="editedEnroll.participantRole" :items="roleOptions" label="Rol" required />
                                </VCol>
                                <VCol cols="12">
                                    <VSelect v-model="editedEnroll.districtId" :items="districtOptions"
                                        item-title="label" item-value="value" label="Distrito" required
                                        @update:model-value="onDistrictChange" />
                                </VCol>
                                <VCol cols="12" sm="6">
                                    <VTextField v-model.number="editedEnroll.grade" label="Nota (0–20)"
                                        type="number" required />
                                </VCol>
                                <VCol cols="12" sm="6" class="d-flex align-center">
                                    <VChip :color="statusColor(previewStatus)" variant="tonal">
                                        {{ statusLabel(previewStatus) }}
                                    </VChip>
                                </VCol>
                            </VRow>
                        </VContainer>
                    </VCardText>
                    <VCardText v-if="enrollError" class="pt-0">
                        <VAlert type="error" variant="tonal" density="compact">{{ enrollError }}</VAlert>
                    </VCardText>
                    <VCardText v-if="prereqWarning" class="pt-0">
                        <VAlert type="warning" variant="tonal">
                            <div>{{ prereqWarning.message }}</div>
                            <div class="d-flex gap-2 mt-3">
                                <VBtn size="small" color="warning" variant="tonal" :loading="saving" @click="saveEnrollment">
                                    Agregar de todas formas
                                </VBtn>
                                <VBtn size="small" variant="text" @click="prereqWarning = null">
                                    Cancelar
                                </VBtn>
                            </div>
                        </VAlert>
                    </VCardText>
                    <VCardActions>
                        <VSpacer />
                        <VBtn color="error" variant="text" @click="enrollDialog = false; prereqWarning = null">Cancelar</VBtn>
                        <VBtn color="success" variant="text" @click="saveEnrollment"
                            :loading="saving" :disabled="!isEnrollValid || saving || !!prereqWarning">
                            Guardar
                        </VBtn>
                    </VCardActions>
                </VCard>
            </VDialog>

            <!-- Dialog eliminar grupo -->
            <VDialog v-model="deleteGroupDialog" max-width="420px">
                <VCard>
                    <VCardTitle>Confirmar eliminación</VCardTitle>
                    <VCardText>
                        ¿Eliminar el grupo <strong>{{ groupToDelete?.groupName }}</strong>?
                        Se eliminarán también todos sus participantes.
                    </VCardText>
                    <VCardActions>
                        <VSpacer />
                        <VBtn color="grey" variant="text" @click="deleteGroupDialog = false">Cancelar</VBtn>
                        <VBtn color="error" variant="text" @click="deleteGroup" :loading="saving">Eliminar</VBtn>
                    </VCardActions>
                </VCard>
            </VDialog>

            <!-- Dialog mover participante -->
            <VDialog v-model="moveDialog" max-width="420px" persistent>
                <VCard>
                    <VCardTitle>Mover participante</VCardTitle>
                    <VCardSubtitle class="pb-0">{{ enrollToMove?.participantName }}</VCardSubtitle>
                    <VCardText>
                        <p class="text-body-2 text-medium-emphasis mb-4">
                            Grupo actual: <strong>{{ groupOfEnrollToMove?.groupName }}</strong>
                        </p>
                        <VSelect
                            v-model="moveTargetGroupKey"
                            :items="moveGroupOptions"
                            item-title="label"
                            item-value="key"
                            label="Mover a grupo"
                            required
                        />
                    </VCardText>
                    <VCardActions>
                        <VSpacer />
                        <VBtn color="grey" variant="text" :disabled="saving" @click="moveDialog = false">Cancelar</VBtn>
                        <VBtn color="primary" variant="text" :loading="saving" :disabled="!moveTargetGroupKey" @click="moveEnrollment">
                            Mover
                        </VBtn>
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
import { ref, computed, watch, onMounted } from 'vue';
import {
    collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
    Timestamp, query, where, orderBy, writeBatch
} from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '../../firebase/config';
import type { TrainingModule } from '../../types/TrainingModule';
import type { TrainingEnrollment, ParticipantRole, GradeStatus, EnrollmentAttempt } from '../../types/TrainingEnrollment';
import { getGradeStatus } from '../../types/TrainingEnrollment';
import type { TrainingGroup, GroupLevel } from '../../types/TrainingGroup';
import type { District } from '../../types/District';
import { useCertificateGenerator } from '../../composables/useCertificateGenerator';
import NavigationBar from '../../components/NavigationBar.vue';

const { generateCertificate } = useCertificateGenerator();

// ── State ──────────────────────────────────────────────────────────────────
const modules = ref<TrainingModule[]>([]);
const enrollments = ref<TrainingEnrollment[]>([]);
const districts = ref<District[]>([]);
const selectedModule = ref<TrainingModule | null>(null);
const enrollmentCountsByModule = ref<Record<string, number>>({});

const loading = ref(true);
const loadingEnrollments = ref(false);
const saving = ref(false);
const migrating = ref(false);
const migrateResult = ref<{ type: 'success' | 'error'; message: string } | null>(null);
const expandedGroups = ref(new Set<string>());

function toggleGroup(key: string) {
    if (expandedGroups.value.has(key)) {
        expandedGroups.value.delete(key);
    } else {
        expandedGroups.value.add(key);
    }
    expandedGroups.value = new Set(expandedGroups.value);
}
const activeTab = ref('lista');
const searchEnrollments = ref('');
const generatingCert = ref<string | null>(null);

// Group dialog
const groupDialog = ref(false);
const editingGroup = ref<GroupRow | null>(null);
interface EditedGroup { groupName: string; graduationDateStr: string; level: GroupLevel; districtId: string; districtName: string }
const editedGroup = ref<EditedGroup>({ groupName: '', graduationDateStr: '', level: 'distrital', districtId: '', districtName: '' });

const isGroupValid = computed(() => {
    if (!editedGroup.value.groupName || !editedGroup.value.graduationDateStr) return false;
    if (editedGroup.value.level === 'distrital' && !editedGroup.value.districtId) return false;
    return true;
});

function onGroupDistrictChange(id: string | null) {
    const d = districts.value.find(d => d.id === id);
    editedGroup.value.districtName = d
        ? `Área ${d.areaNumber} · Distrito ${d.districtNumber} – ${d.location}`
        : '';
}

// Enrollment dialog
const enrollDialog = ref(false);
const enrollError = ref('');
const editingEnrollId = ref<string | null>(null);
const currentGroup = ref<GroupRow | null>(null);

interface EditedEnroll {
    participantName: string;
    participantRole: ParticipantRole;
    districtId: string;
    districtName: string;
    grade: number;
}
const defaultEnroll: EditedEnroll = {
    participantName: '', participantRole: 'Líder Distrital',
    districtId: '', districtName: '', grade: 0,
};
const editedEnroll = ref<EditedEnroll>({ ...defaultEnroll });

// Autofill state
const loadingLeaderName = ref(false);

// Prerequisite warning
type PrereqResult = 'ok' | 'missing' | { status: GradeStatus; grade: number };
const prereqWarning = ref<{ message: string; pendingSubmit: boolean } | null>(null);

// Delete dialogs
const deleteGroupDialog = ref(false);
const groupToDelete = ref<GroupRow | null>(null);
const deleteEnrollDialog = ref(false);
const enrollToDelete = ref<TrainingEnrollment | null>(null);

// Move dialog
const moveDialog = ref(false);
const enrollToMove = ref<TrainingEnrollment | null>(null);
const groupOfEnrollToMove = ref<GroupRow | null>(null);
const moveTargetGroupKey = ref<string>('');

const moveGroupOptions = computed(() =>
    groups.value
        .filter(g => g.key !== groupOfEnrollToMove.value?.key)
        .map(g => ({ key: g.key, label: `${g.groupName} — ${formatDate(g.graduationDate)}` }))
);

// Inactive (dados de baja)
const inactiveEnrollments = ref<TrainingEnrollment[]>([]);

// Réplicas distritales — líderes por districtId
const districtLeadersMap = ref<Record<string, string[]>>({});
const loadingLeaders = ref(false);

// ── Types ──────────────────────────────────────────────────────────────────
interface GroupRow {
    key: string;
    groupName: string;
    graduationDate: Timestamp;
    level: GroupLevel;
    districtId?: string;
    districtName?: string;
    firestoreId?: string;
    enrollments: TrainingEnrollment[];
}

// ── Options ────────────────────────────────────────────────────────────────
const roleOptions: ParticipantRole[] = ['Pastor', 'Líder Distrital', 'Equipo Distrital', 'Líder Local', 'Equipo Local'];
const levelOptions = [
    { title: 'Nacional', value: 'nacional' as GroupLevel },
    { title: 'Distrital', value: 'distrital' as GroupLevel },
];

const districtOptions = computed(() =>
    districts.value.map(d => ({
        label: `Área ${d.areaNumber} · Distrito ${d.districtNumber} – ${d.location}`,
        value: d.id,
    }))
);

// ── Computed ───────────────────────────────────────────────────────────────
const previewStatus = computed(() => getGradeStatus(editedEnroll.value.grade));

const nameHasInvalidChars = computed(() =>
    /[^a-záéíóúüàèìòùäëïöüâêîôûñA-ZÁÉÍÓÚÜÀÈÌÒÙÄËÏÖÜÂÊÎÔÛÑ\s'-]/i.test(editedEnroll.value.participantName)
);

const isEnrollValid = computed(() =>
    !!editedEnroll.value.participantName &&
    !nameHasInvalidChars.value &&
    !!editedEnroll.value.districtId
);

const filteredEnrollments = computed(() => {
    if (!searchEnrollments.value) return enrollments.value;
    const q = searchEnrollments.value.toLowerCase();
    return enrollments.value.filter(e =>
        e.participantName.toLowerCase().includes(q) ||
        e.districtName.toLowerCase().includes(q) ||
        e.groupName.toLowerCase().includes(q)
    );
});

const groups = computed((): GroupRow[] => {
    // Construir grupos desde los enrollments (fuente de verdad para participantes)
    // El nivel se toma de groupsMeta buscando por nombre de grupo (no por fecha exacta)
    const map = new Map<string, GroupRow>();
    for (const e of filteredEnrollments.value) {
        const key = `${e.groupName}__${e.graduationDate?.toMillis?.() ?? 0}`;
        if (!map.has(key)) {
            // Buscar nivel en groupsMeta por nombre de grupo (match exacto de nombre)
            const meta = groupsMeta.value.find(g => g.groupName === e.groupName);
            map.set(key, {
                key,
                groupName: e.groupName,
                graduationDate: e.graduationDate,
                level: meta?.level ?? 'distrital',
                firestoreId: meta?.firestoreId,
                enrollments: [],
            });
        }
        map.get(key)!.enrollments.push(e);
    }
    // Incluir grupos vacíos que existen en Firestore pero sin enrollments visibles (tras búsqueda)
    for (const g of groupsMeta.value) {
        if (!map.has(g.key)) {
            map.set(g.key, { ...g, enrollments: [] });
        }
    }
    return [...map.values()].sort((a, b) =>
        (b.graduationDate?.toMillis?.() ?? 0) - (a.graduationDate?.toMillis?.() ?? 0)
    );
});

// Groups persisted in Firestore
const groupsMeta = ref<GroupRow[]>([]);

const generalStats = computed(() => {
    const total = enrollments.value.length;
    const passed = enrollments.value.filter(e => e.passed).length;
    const observed = enrollments.value.filter(e => e.gradeStatus === 'observado').length;
    const nationalGroupKeys = new Set(groupsMeta.value.filter(g => g.level === 'nacional').map(g => g.key));
    const nacional = enrollments.value.filter(e => nationalGroupKeys.has(`${e.groupName}__${e.graduationDate?.toMillis?.() ?? 0}`)).length;
    const distrital = total - nacional;
    const uniqueDistricts = new Set(
        groupsMeta.value.filter(g => g.level === 'distrital' && g.districtId).map(g => g.districtId)
    ).size;
    const avg = total > 0
        ? (enrollments.value.reduce((s, e) => s + e.grade, 0) / total).toFixed(1)
        : '0';
    return [
        { label: 'Total', value: total, color: 'primary', icon: 'mdi-account-group' },
        { label: 'Aprobados', value: passed, color: 'success', icon: 'mdi-check-circle' },
        { label: 'Observados', value: observed, color: 'warning', icon: 'mdi-eye-circle' },
        { label: 'Nacional', value: nacional, color: 'purple', icon: 'mdi-earth' },
        { label: 'Distrital', value: distrital, color: 'teal', icon: 'mdi-map-marker' },
        { label: 'Réplicas', value: uniqueDistricts, color: 'deep-orange', icon: 'mdi-home-group' },
        { label: 'Promedio', value: avg, color: 'info', icon: 'mdi-calculator' },
    ];
});

const replicasByDistrict = computed(() => {
    const map = new Map<string, { districtId: string; districtName: string; groups: (GroupRow & { enrollments: TrainingEnrollment[] })[]; totalParticipants: number }>();
    for (const g of groupsMeta.value) {
        if (g.level !== 'distrital' || !g.districtId) continue;
        const enrollments = groups.value.find(gr => gr.key === g.key)?.enrollments ?? [];
        if (!map.has(g.districtId)) {
            map.set(g.districtId, { districtId: g.districtId, districtName: g.districtName ?? g.groupName, groups: [], totalParticipants: 0 });
        }
        const entry = map.get(g.districtId)!;
        entry.groups.push({ ...g, enrollments });
        entry.totalParticipants += enrollments.length;
    }
    // ordenar grupos de cada distrito por fecha desc
    for (const entry of map.values()) {
        entry.groups.sort((a, b) => (b.graduationDate?.toMillis() ?? 0) - (a.graduationDate?.toMillis() ?? 0));
    }
    return [...map.values()].sort((a, b) => a.districtName.localeCompare(b.districtName));
});

const districtStats = computed(() => {
    const map = new Map<string, { name: string; total: number; passed: number; observed: number; grades: number[] }>();
    for (const e of enrollments.value) {
        if (!map.has(e.districtId)) map.set(e.districtId, { name: e.districtName, total: 0, passed: 0, observed: 0, grades: [] });
        const d = map.get(e.districtId)!;
        d.total++;
        if (e.passed) d.passed++;
        if (e.gradeStatus === 'observado') d.observed++;
        d.grades.push(e.grade);
    }
    return [...map.entries()].map(([, v]) => ({
        districtName: v.name,
        total: v.total,
        passed: v.passed,
        observed: v.observed,
        failed: v.total - v.passed - v.observed,
        average: v.grades.length > 0 ? (v.grades.reduce((a, b) => a + b, 0) / v.grades.length).toFixed(1) : '0',
        passRate: v.total > 0 ? (v.passed / v.total) * 100 : 0,
    })).sort((a, b) => a.districtName.localeCompare(b.districtName));
});

const districtStatsHeaders = [
    { title: 'Distrito', key: 'districtName', align: 'start' as const },
    { title: 'Total', key: 'total', align: 'center' as const },
    { title: 'Aprobados', key: 'passed', align: 'center' as const },
    { title: 'Observados', key: 'observed', align: 'center' as const },
    { title: 'Reprobados', key: 'failed', align: 'center' as const },
    { title: 'Promedio', key: 'average', align: 'center' as const },
    { title: '% Aprobación', key: 'passRate', align: 'center' as const, width: '180px' },
];

// ── Helpers ────────────────────────────────────────────────────────────────
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

// ── Data loading ───────────────────────────────────────────────────────────
async function loadData() {
    loading.value = true;
    try {
        const [modSnap, distSnap] = await Promise.all([
            getDocs(query(collection(db, 'training_modules'), orderBy('order'))),
            getDocs(collection(db, 'districts')),
        ]);
        modules.value = modSnap.docs.map(d => ({ id: d.id, ...d.data() } as TrainingModule));
        districts.value = distSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as District))
            .sort((a, b) => a.areaNumber - b.areaNumber || a.districtNumber - b.districtNumber);
        await loadEnrollmentCounts();
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
}

async function loadEnrollmentCounts() {
    const counts: Record<string, number> = {};
    for (const mod of modules.value) {
        const snap = await getDocs(query(collection(db, 'training_enrollments'), where('moduleId', '==', mod.id)));
        counts[mod.id] = snap.size;
    }
    enrollmentCountsByModule.value = counts;
}

async function selectModule(mod: TrainingModule) {
    selectedModule.value = mod;
    activeTab.value = 'lista';
    searchEnrollments.value = '';
    groupsMeta.value = [];
    districtLeadersMap.value = {};
    await Promise.all([loadGroups(mod.id), loadEnrollments(mod.id)]);
}

async function loadGroups(moduleId: string) {
    const snap = await getDocs(query(
        collection(db, 'training_groups'),
        where('moduleId', '==', moduleId)
    ));
    const fsGroups = snap.docs.map(d => ({ id: d.id, ...d.data() } as TrainingGroup));
    groupsMeta.value = fsGroups.map(g => ({
        key: `${g.groupName}__${g.graduationDate?.toMillis?.() ?? 0}`,
        groupName: g.groupName,
        graduationDate: g.graduationDate,
        level: g.level ?? 'distrital',
        districtId: g.districtId ?? '',
        districtName: g.districtName ?? '',
        firestoreId: g.id,
        enrollments: [],
    } as GroupRow));
}

async function loadEnrollments(moduleId: string) {
    loadingEnrollments.value = true;
    try {
        const snap = await getDocs(query(collection(db, 'training_enrollments'), where('moduleId', '==', moduleId)));
        const loaded = snap.docs
            .map(d => ({ id: d.id, ...d.data() } as TrainingEnrollment))
            .map(e => ({ ...e, gradeStatus: e.gradeStatus ?? getGradeStatus(e.grade) }));

        const repairs: Promise<void>[] = [];
        const toRemoveIds = new Set<string>();

        // Paso 1: consolidar documentos duplicados pre-upsert (misma persona + distrito, sin attempts)
        // Solo consolida docs que NO tienen attempts — son los creados antes del sistema upsert.
        // Docs con attempts ya fueron procesados correctamente y no deben tocarse.
        const byPerson = new Map<string, TrainingEnrollment[]>();
        for (const e of loaded) {
            // Solo considerar docs sin attempts (pre-upsert legacy)
            if (e.attempts && e.attempts.length > 0) continue;
            const key = `${e.participantName.trim().toLowerCase()}__${e.districtId}`;
            if (!byPerson.has(key)) byPerson.set(key, []);
            byPerson.get(key)!.push(e);
        }
        for (const group of byPerson.values()) {
            if (group.length < 2) continue;
            // Ordenar por fecha de graduación: el más reciente es el principal
            group.sort((a, b) => (b.graduationDate?.toMillis() ?? 0) - (a.graduationDate?.toMillis() ?? 0));
            const [primary, ...duplicates] = group;
            // Construir historial completo con los duplicados como attempts
            const mergedAttempts: EnrollmentAttempt[] = duplicates.map(dup => ({
                groupName: dup.groupName,
                graduationDate: dup.graduationDate,
                grade: dup.grade,
                gradeStatus: dup.gradeStatus,
            })).sort((a, b) => (a.graduationDate?.toMillis() ?? 0) - (b.graduationDate?.toMillis() ?? 0));
            primary.attempts = mergedAttempts;
            repairs.push(updateDoc(doc(db, 'training_enrollments', primary.id), {
                attempts: mergedAttempts, updatedAt: Timestamp.now(),
            }));
            for (const dup of duplicates) {
                repairs.push(deleteDoc(doc(db, 'training_enrollments', dup.id)));
                toRemoveIds.add(dup.id);
            }
        }

        // Paso 2: reparar attempts invertidos (attempt más reciente que el principal)
        const surviving = loaded.filter(e => !toRemoveIds.has(e.id));
        for (const e of surviving) {
            if (!e.attempts?.length) continue;
            const latestAttempt = e.attempts.reduce((best, a) =>
                (a.graduationDate?.toMillis() ?? 0) > (best.graduationDate?.toMillis() ?? 0) ? a : best
            );
            if ((latestAttempt.graduationDate?.toMillis() ?? 0) > (e.graduationDate?.toMillis() ?? 0)) {
                const currentAsAttempt: EnrollmentAttempt = {
                    groupName: e.groupName,
                    graduationDate: e.graduationDate,
                    grade: e.grade,
                    gradeStatus: e.gradeStatus,
                };
                const remainingAttempts = e.attempts
                    .filter(a => a !== latestAttempt)
                    .concat(currentAsAttempt)
                    .sort((a, b) => (a.graduationDate?.toMillis() ?? 0) - (b.graduationDate?.toMillis() ?? 0));
                const fixedData = {
                    groupName: latestAttempt.groupName,
                    graduationDate: latestAttempt.graduationDate,
                    grade: latestAttempt.grade,
                    passed: latestAttempt.gradeStatus === 'aprobado',
                    gradeStatus: latestAttempt.gradeStatus,
                    attempts: remainingAttempts,
                    updatedAt: Timestamp.now(),
                };
                Object.assign(e, fixedData);
                repairs.push(updateDoc(doc(db, 'training_enrollments', e.id), fixedData));
            }
        }

        if (repairs.length > 0) await Promise.all(repairs);

        const allSurviving = surviving.sort((a, b) => a.participantName.localeCompare(b.participantName));
        enrollments.value = allSurviving.filter(e => e.isActive !== false);
        inactiveEnrollments.value = allSurviving.filter(e => e.isActive === false);
        // Expandir el primer grupo por defecto al cargar
        if (enrollments.value.length > 0) {
            const firstKey = enrollments.value[0].groupName;
            expandedGroups.value = new Set([firstKey]);
        }
    } catch (e) {
        console.error(e);
        alert('Error al cargar participantes');
    } finally {
        loadingEnrollments.value = false;
    }
}

// ── Group CRUD ─────────────────────────────────────────────────────────────
function openGroupDialog(group?: GroupRow) {
    // Asegurar que firestoreId venga de groupsMeta (fuente de verdad), no del computed groups
    const meta = group
        ? groupsMeta.value.find(g => g.groupName === group.groupName) ?? group
        : null;
    editingGroup.value = meta ?? null;
    editedGroup.value = group
        ? { groupName: group.groupName, graduationDateStr: group.graduationDate.toDate().toISOString().split('T')[0], level: group.level ?? 'distrital', districtId: group.districtId ?? '', districtName: group.districtName ?? '' }
        : { groupName: '', graduationDateStr: new Date().toISOString().split('T')[0], level: 'distrital', districtId: '', districtName: '' };
    groupDialog.value = true;
}

async function saveGroup() {
    if (!editedGroup.value.groupName || !editedGroup.value.graduationDateStr || !selectedModule.value) return;
    const [y, m, d] = editedGroup.value.graduationDateStr.split('-').map(Number);
    const newDate = Timestamp.fromDate(new Date(y, m - 1, d, 12, 0, 0));
    const newName = editedGroup.value.groupName;
    saving.value = true;
    try {
        if (editingGroup.value) {
            // Update Firestore group doc — si no tiene firestoreId (grupo legacy sin doc), crearlo
            const groupFields = {
                groupName: newName, graduationDate: newDate, level: editedGroup.value.level,
                districtId: editedGroup.value.level === 'distrital' ? editedGroup.value.districtId : '',
                districtName: editedGroup.value.level === 'distrital' ? editedGroup.value.districtName : '',
            };
            if (editingGroup.value.firestoreId) {
                await updateDoc(doc(db, 'training_groups', editingGroup.value.firestoreId), groupFields);
            } else {
                await addDoc(collection(db, 'training_groups'), {
                    moduleId: selectedModule.value.id,
                    ...groupFields,
                    createdAt: Timestamp.now(),
                });
            }
            // Update all enrollments in batch (incluyendo attempts que referencien el grupo renombrado)
            const oldName = editingGroup.value!.groupName;
            const oldMillis = editingGroup.value!.graduationDate?.toMillis() ?? 0;
            const sameGroup = (groupName: string, dateMillis: number) =>
                groupName === oldName && Math.abs(dateMillis - oldMillis) < 86400000;
            const toUpdate = enrollments.value.filter(e =>
                sameGroup(e.groupName, e.graduationDate?.toMillis() ?? 0)
            );
            // También actualizar enrollments cuyo historial (attempts) referencia al grupo renombrado
            const withOldAttempt = enrollments.value.filter(e =>
                !toUpdate.includes(e) &&
                e.attempts?.some(a => sameGroup(a.groupName, a.graduationDate?.toMillis() ?? 0))
            );
            if (toUpdate.length > 0 || withOldAttempt.length > 0) {
                const batch = writeBatch(db);
                toUpdate.forEach(e => batch.update(doc(db, 'training_enrollments', e.id), {
                    groupName: newName, graduationDate: newDate, updatedAt: Timestamp.now(),
                }));
                withOldAttempt.forEach(e => {
                    const updatedAttempts = (e.attempts ?? []).map(a =>
                        a.groupName === oldName && a.graduationDate?.toMillis() === oldMillis
                            ? { ...a, groupName: newName, graduationDate: newDate }
                            : a
                    );
                    batch.update(doc(db, 'training_enrollments', e.id), {
                        attempts: updatedAttempts, updatedAt: Timestamp.now(),
                    });
                });
                await batch.commit();
            }
            await loadGroups(selectedModule.value.id);
            await loadEnrollments(selectedModule.value.id);
        } else {
            // Create new group in Firestore
            const key = `${newName}__${newDate.toMillis()}`;
            if (!groupsMeta.value.find(g => g.key === key)) {
                const districtId = editedGroup.value.level === 'distrital' ? editedGroup.value.districtId : '';
                const districtName = editedGroup.value.level === 'distrital' ? editedGroup.value.districtName : '';
                const ref = await addDoc(collection(db, 'training_groups'), {
                    moduleId: selectedModule.value.id,
                    groupName: newName,
                    graduationDate: newDate,
                    level: editedGroup.value.level,
                    districtId,
                    districtName,
                    createdAt: Timestamp.now(),
                });
                groupsMeta.value.push({ key, groupName: newName, graduationDate: newDate, level: editedGroup.value.level, districtId, districtName, firestoreId: ref.id, enrollments: [] });
            }
        }
    } finally {
        saving.value = false;
    }
    groupDialog.value = false;
}

function confirmDeleteGroup(group: GroupRow) {
    groupToDelete.value = group;
    deleteGroupDialog.value = true;
}

async function deleteGroup() {
    if (!groupToDelete.value || !selectedModule.value) return;
    saving.value = true;
    try {
        const toDelete = enrollments.value.filter(e =>
            e.groupName === groupToDelete.value!.groupName &&
            e.graduationDate?.toMillis() === groupToDelete.value!.graduationDate?.toMillis()
        );
        const batch = writeBatch(db);
        toDelete.forEach(e => batch.delete(doc(db, 'training_enrollments', e.id)));
        if (groupToDelete.value.firestoreId) {
            batch.delete(doc(db, 'training_groups', groupToDelete.value.firestoreId));
        }
        await batch.commit();
        groupsMeta.value = groupsMeta.value.filter(g => g.key !== groupToDelete.value!.key);
        await loadEnrollments(selectedModule.value.id);
        enrollmentCountsByModule.value[selectedModule.value.id] = enrollments.value.length;
    } catch (e) {
        console.error(e);
        alert('Error al eliminar el grupo');
    } finally {
        saving.value = false;
        deleteGroupDialog.value = false;
        groupToDelete.value = null;
    }
}

// ── Prerequisite check ────────────────────────────────────────────────────
async function checkPrerequisite(name: string, districtId: string): Promise<PrereqResult> {
    if (!selectedModule.value) return 'ok';
    if ((selectedModule.value.moduleType ?? 'ruta') !== 'ruta') return 'ok';
    if (selectedModule.value.order <= 1) return 'ok';

    const prevModule = modules.value
        .filter(m => (m.moduleType ?? 'ruta') === 'ruta' && m.order < selectedModule.value!.order)
        .sort((a, b) => b.order - a.order)[0];
    if (!prevModule) return 'ok';

    const snap = await getDocs(query(
        collection(db, 'training_enrollments'),
        where('moduleId', '==', prevModule.id),
        where('districtId', '==', districtId),
    ));
    const found = snap.docs.map(d => d.data()).find(e =>
        (e.participantName as string)?.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (!found) return 'missing';
    if (found.gradeStatus === 'aprobado') return 'ok';
    return { status: found.gradeStatus as GradeStatus, grade: found.grade as number };
}

async function clearPrerequisitePending(name: string, districtId: string) {
    if (!selectedModule.value) return;
    const nextModules = modules.value.filter(m =>
        (m.moduleType ?? 'ruta') === 'ruta' && m.order > selectedModule.value!.order
    );
    for (const mod of nextModules) {
        const snap = await getDocs(query(
            collection(db, 'training_enrollments'),
            where('moduleId', '==', mod.id),
            where('districtId', '==', districtId),
        ));
        const toFix = snap.docs.filter(d =>
            (d.data().participantName as string)?.trim().toLowerCase() === name.trim().toLowerCase() &&
            d.data().prerequisitePending === true
        );
        if (toFix.length > 0) {
            const batch = writeBatch(db);
            toFix.forEach(d => batch.update(doc(db, 'training_enrollments', d.id), {
                prerequisitePending: false, updatedAt: Timestamp.now(),
            }));
            await batch.commit();
            // Actualizar en memoria si el módulo actual cargado es alguno de los siguientes
            if (selectedModule.value && toFix.some(d => d.data().moduleId === selectedModule.value!.id)) {
                await loadEnrollments(selectedModule.value.id);
            }
        }
    }
}

// ── Enrollment CRUD ────────────────────────────────────────────────────────
function openEnrollDialog(group: GroupRow) {
    editingEnrollId.value = null;
    currentGroup.value = group;
    editedEnroll.value = { ...defaultEnroll };
    enrollError.value = '';
    prereqWarning.value = null;
    enrollDialog.value = true;
}

function openEditEnrollDialog(item: TrainingEnrollment, group: GroupRow) {
    editingEnrollId.value = item.id;
    currentGroup.value = group;
    editedEnroll.value = {
        participantName: item.participantName,
        participantRole: item.participantRole,
        districtId: item.districtId,
        districtName: item.districtName,
        grade: item.grade,
    };
    enrollError.value = '';
    prereqWarning.value = null;
    enrollDialog.value = true;
}

watch(() => editedEnroll.value.participantRole, (newRole) => {
    if (newRole === 'Líder Distrital' && editedEnroll.value.districtId && !editingEnrollId.value) {
        onDistrictChange(editedEnroll.value.districtId);
    }
});

async function onDistrictChange(id: string) {
    const d = districts.value.find(d => d.id === id);
    editedEnroll.value.districtName = d
        ? `Área ${d.areaNumber} · Distrito ${d.districtNumber} – ${d.location}`
        : '';

    if (editedEnroll.value.participantRole === 'Líder Distrital' && id) {
        loadingLeaderName.value = true;
        try {
            const dlSnap = await getDocs(query(
                collection(db, 'district_leaders'),
                where('districtId', '==', id),
                where('isActive', '==', true),
            ));
            if (!dlSnap.empty) {
                const userId = dlSnap.docs[0].data().userId as string;
                const leaderDoc = await getDoc(doc(db, 'leaders', userId));
                if (leaderDoc.exists()) {
                    const pd = leaderDoc.data().personalData ?? {};
                    const fullName = [pd.firstName, pd.lastName].filter(Boolean).join(' ');
                    if (fullName) editedEnroll.value.participantName = fullName;
                }
            }
        } catch (e) {
            console.error('Error al buscar líder distrital:', e);
        } finally {
            loadingLeaderName.value = false;
        }
    }
}

async function saveEnrollment() {
    if (!selectedModule.value || !currentGroup.value) return;
    enrollError.value = '';

    // Validar: máximo 2 Líderes Distritales por distrito por módulo (pareja de líderes)
    if (editedEnroll.value.participantRole === 'Líder Distrital') {
        const existingLeaders = enrollments.value.filter(e =>
            e.participantRole === 'Líder Distrital' &&
            e.districtId === editedEnroll.value.districtId &&
            e.id !== editingEnrollId.value
        );
        if (existingLeaders.length >= 2) {
            enrollError.value = 'Ya hay 2 líderes distritales registrados para este distrito en este módulo.';
            return;
        }
    }

    // Chequeo de prerrequisito (solo en modo creación y si no hay confirmación pendiente)
    let isPrereqPending = false;
    if (!editingEnrollId.value && !prereqWarning.value?.pendingSubmit) {
        saving.value = true;
        const prereqResult = await checkPrerequisite(
            editedEnroll.value.participantName,
            editedEnroll.value.districtId,
        ).finally(() => { saving.value = false; });

        if (prereqResult !== 'ok') {
            const prevModule = modules.value
                .filter(m => (m.moduleType ?? 'ruta') === 'ruta' && m.order < selectedModule.value!.order)
                .sort((a, b) => b.order - a.order)[0];
            const prevName = prevModule?.name ?? 'el módulo anterior';
            const msg = prereqResult === 'missing'
                ? `Este participante no parece haber llevado "${prevName}". También podría ser un error de escritura en el nombre. ¿Deseas agregarlo de todas formas?`
                : `Este participante llevó "${prevName}" pero no lo aprobó (nota ${(prereqResult as { grade: number; status: string }).grade} – ${(prereqResult as { grade: number; status: string }).status}). ¿Deseas agregarlo de todas formas?`;
            prereqWarning.value = { message: msg, pendingSubmit: true };
            return;
        }
    }

    // Si el admin confirmó la advertencia, el participante tiene prerrequisito pendiente
    if (prereqWarning.value?.pendingSubmit) isPrereqPending = true;
    prereqWarning.value = null;

    saving.value = true;
    try {
        const grade = Number(editedEnroll.value.grade);
        const gradeStatus = getGradeStatus(grade);
        const participantName = editedEnroll.value.participantName.trim().toUpperCase();
        const data = {
            moduleId: selectedModule.value.id,
            groupName: currentGroup.value.groupName,
            graduationDate: currentGroup.value.graduationDate,
            participantName,
            participantRole: editedEnroll.value.participantRole,
            districtId: editedEnroll.value.districtId,
            districtName: editedEnroll.value.districtName,
            grade,
            passed: gradeStatus === 'aprobado',
            gradeStatus,
            prerequisitePending: isPrereqPending,
            updatedAt: Timestamp.now(),
        };

        if (editingEnrollId.value) {
            // Edición directa del registro existente
            await updateDoc(doc(db, 'training_enrollments', editingEnrollId.value), data);
        } else {
            // Nuevo registro: detectar si el participante ya existe en este módulo
            const existingByName = enrollments.value.find(e =>
                e.participantName.trim().toLowerCase() === participantName.trim().toLowerCase() &&
                e.districtId === editedEnroll.value.districtId
            );

            if (existingByName) {
                const newGroupDate = currentGroup.value.graduationDate.toMillis();
                const existingDate = existingByName.graduationDate?.toMillis() ?? 0;

                if (newGroupDate > existingDate) {
                    const previousAttempt: EnrollmentAttempt = {
                        groupName: existingByName.groupName,
                        graduationDate: existingByName.graduationDate,
                        grade: existingByName.grade,
                        gradeStatus: existingByName.gradeStatus,
                    };
                    const updatedAttempts = [...(existingByName.attempts ?? []), previousAttempt];
                    await updateDoc(doc(db, 'training_enrollments', existingByName.id), {
                        ...data,
                        attempts: updatedAttempts,
                    });
                } else {
                    const olderAttempt: EnrollmentAttempt = {
                        groupName: currentGroup.value.groupName,
                        graduationDate: currentGroup.value.graduationDate,
                        grade,
                        gradeStatus,
                    };
                    const updatedAttempts = [...(existingByName.attempts ?? []), olderAttempt];
                    await updateDoc(doc(db, 'training_enrollments', existingByName.id), {
                        attempts: updatedAttempts,
                        updatedAt: Timestamp.now(),
                    });
                }
            } else {
                await addDoc(collection(db, 'training_enrollments'), { ...data, enrolledAt: Timestamp.now() });
            }
        }

        // Si el participante aprobó, limpiar prerequisitePending en módulos posteriores
        if (gradeStatus === 'aprobado') {
            await clearPrerequisitePending(participantName, editedEnroll.value.districtId);
        }

        enrollDialog.value = false;
        await loadEnrollments(selectedModule.value.id);
        enrollmentCountsByModule.value[selectedModule.value.id] = enrollments.value.length;
    } catch (e) {
        console.error(e);
        alert('Error al guardar');
    } finally {
        saving.value = false;
    }
}

function confirmDeleteEnroll(item: TrainingEnrollment) {
    enrollToDelete.value = item;
    deleteEnrollDialog.value = true;
}

function openMoveDialog(item: TrainingEnrollment, group: GroupRow) {
    enrollToMove.value = item;
    groupOfEnrollToMove.value = group;
    moveTargetGroupKey.value = '';
    moveDialog.value = true;
}

async function moveEnrollment() {
    if (!enrollToMove.value || !moveTargetGroupKey.value) return;
    const targetGroup = groups.value.find(g => g.key === moveTargetGroupKey.value);
    if (!targetGroup) return;
    saving.value = true;
    try {
        await updateDoc(doc(db, 'training_enrollments', enrollToMove.value.id), {
            groupName: targetGroup.groupName,
            graduationDate: targetGroup.graduationDate,
            updatedAt: Timestamp.now(),
        });
        moveDialog.value = false;
        if (selectedModule.value) await loadEnrollments(selectedModule.value.id);
    } catch (e) {
        console.error('Error al mover participante:', e);
    } finally {
        saving.value = false;
    }
}

async function deleteEnrollment() {
    if (!enrollToDelete.value || !selectedModule.value) return;
    try {
        await deleteDoc(doc(db, 'training_enrollments', enrollToDelete.value.id));
        await loadEnrollments(selectedModule.value.id);
        enrollmentCountsByModule.value[selectedModule.value.id] = enrollments.value.length;
    } catch (e) {
        console.error(e);
        alert('Error al eliminar');
    } finally {
        deleteEnrollDialog.value = false;
        enrollToDelete.value = null;
    }
}

async function reactivateEnrollment(item: TrainingEnrollment) {
    if (!selectedModule.value) return;
    try {
        const batch = writeBatch(db);
        // Reactivar todos los enrollments del participante en este distrito
        const allInactive = inactiveEnrollments.value.filter(
            e => e.participantName.trim().toLowerCase() === item.participantName.trim().toLowerCase() &&
                 e.districtId === item.districtId
        );
        const targets = allInactive.length > 0 ? allInactive : [item];
        targets.forEach(e => batch.update(doc(db, 'training_enrollments', e.id), {
            isActive: true,
            deactivatedAt: null,
            updatedAt: Timestamp.now(),
        }));
        await batch.commit();
        await loadEnrollments(selectedModule.value.id);
        enrollmentCountsByModule.value[selectedModule.value.id] = enrollments.value.length;
    } catch (e) {
        console.error(e);
        alert('Error al reactivar participante');
    }
}

// ── Certificate ────────────────────────────────────────────────────────────
async function downloadCertificate(enrollment: TrainingEnrollment) {
    if (!selectedModule.value?.certificateImageUrl) {
        alert('Este módulo no tiene plantilla de certificado configurada.');
        return;
    }
    generatingCert.value = enrollment.id;
    try {
        await generateCertificate(enrollment, selectedModule.value, enrollment.graduationDate);
    } catch (e) {
        console.error(e);
        alert('Error al generar el certificado. Verifica que la URL de la plantilla sea accesible.');
    } finally {
        generatingCert.value = null;
    }
}

// ── PDF export ─────────────────────────────────────────────────────────────
function exportPdf() {
    if (!selectedModule.value) return;
    const docPdf = new jsPDF({ orientation: 'landscape' });
    docPdf.setFontSize(14);
    docPdf.text(`Módulo: ${selectedModule.value.name}`, 14, 15);
    const total = enrollments.value.length;
    const passed = enrollments.value.filter(e => e.passed).length;
    docPdf.setFontSize(10);
    docPdf.text(`Total: ${total}  |  Aprobados: ${passed}  |  Reprobados: ${total - passed}`, 14, 22);

    autoTable(docPdf, {
        startY: 28,
        head: [['Grupo', 'Fecha', 'Nombre', 'Rol', 'Distrito', 'Nota', 'Estado']],
        body: enrollments.value.map(e => [
            e.groupName,
            formatDate(e.graduationDate),
            e.participantName,
            e.participantRole,
            e.districtName,
            e.grade,
            statusLabel(e.gradeStatus),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [63, 81, 181] },
        didParseCell: (data) => {
            if (data.column.index === 6 && data.section === 'body') {
                const v = data.cell.raw;
                if (v === 'Aprobado') data.cell.styles.textColor = [0, 128, 0];
                else if (v === 'Observado') data.cell.styles.textColor = [230, 120, 0];
                else data.cell.styles.textColor = [200, 0, 0];
            }
        },
    });

    docPdf.save(`Modulo_${selectedModule.value.name}.pdf`);
}

// ── Réplicas distritales — carga de líderes ────────────────────────────────
async function loadDistrictLeaders() {
    const districtIds = replicasByDistrict.value.map(r => r.districtId).filter(Boolean) as string[];
    if (districtIds.length === 0) return;
    loadingLeaders.value = true;
    try {
        const result: Record<string, string[]> = {};
        await Promise.all(districtIds.map(async (districtId) => {
            const dlSnap = await getDocs(query(
                collection(db, 'district_leaders'),
                where('districtId', '==', districtId),
                where('isActive', '==', true),
            ));
            const names: string[] = [];
            await Promise.all(dlSnap.docs.map(async (dlDoc) => {
                const userId = dlDoc.data().userId as string;
                const leaderDoc = await getDoc(doc(db, 'leaders', userId));
                if (leaderDoc.exists()) {
                    const pd = leaderDoc.data().personalData ?? {};
                    const fullName = [pd.firstName, pd.lastName].filter(Boolean).join(' ');
                    if (fullName) names.push(fullName);
                }
            }));
            result[districtId] = names;
        }));
        districtLeadersMap.value = result;
    } catch (e) {
        console.error('Error cargando líderes distritales:', e);
    } finally {
        loadingLeaders.value = false;
    }
}

watch(activeTab, (tab) => {
    if (tab === 'replicas' && Object.keys(districtLeadersMap.value).length === 0) {
        loadDistrictLeaders();
    }
});

// ── Migración temporal: normalizar participantName a mayúsculas ─────────────
async function migrateNamesToUppercase() {
    migrating.value = true;
    migrateResult.value = null;
    try {
        const snap = await getDocs(collection(db, 'training_enrollments'));
        const batch = writeBatch(db);
        let count = 0;
        snap.forEach(d => {
            const name: string = d.data().participantName ?? '';
            const upper = name.trim().toUpperCase();
            if (name !== upper) {
                batch.update(doc(db, 'training_enrollments', d.id), { participantName: upper });
                count++;
            }
        });
        if (count > 0) await batch.commit();
        migrateResult.value = { type: 'success', message: `${count} nombre(s) normalizados a mayúsculas.` };
    } catch (e) {
        console.error(e);
        migrateResult.value = { type: 'error', message: 'Error al normalizar nombres.' };
    } finally {
        migrating.value = false;
    }
}

onMounted(loadData);
</script>
