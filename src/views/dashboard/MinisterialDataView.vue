<template>
    <div>
        <NavigationBar />
        <VOverlay v-model="loading" class="align-center justify-center">
            <VProgressCircular
                indeterminate
                size="64"
            ></VProgressCircular>
        </VOverlay>
        
        <!-- Overlay con fondo semi-transparente -->
        <VOverlay 
            :model-value="loading || loadingDelete" 
            class="align-center justify-center"
            persistent
            :scrim="'rgba(255, 255, 255, 0.5)'"
            :z-index="9999"
        >
            <VProgressCircular 
                indeterminate 
                size="64"
                color="primary"
            />
        </VOverlay>
        
        <!-- Contenido principal (sin v-if) -->
        <VContainer v-if="!loading">
            <!-- Indicador de Estado de Edición -->
            <VAlert 
                v-if="activePeriod" 
                :type="isConfirmed ? 'success' : (activePeriod.allowEditing ? 'info' : 'warning')" 
                class="mb-4"
            >
                <div>
                    <span class="font-weight-bold">{{ activePeriod.name }}</span>
                    <template v-if="isConfirmed">
                        - Reporte confirmado exitosamente
                    </template>
                    <template v-else>
                        - {{
                            activePeriod.allowEditing
                                ? "La edición está habilitada."
                                : "La edición está deshabilitada."
                        }}
                    </template>
                </div>
            </VAlert>

            <div class="d-flex gap-2 mb-4">
                <VBtn
                    v-if="activePeriod && !isConfirmed"
                    color="success"
                    prepend-icon="mdi-check-circle"
                    @click="confirmDistrictData"
                    :loading="confirming"
                    size="x-large"
                    block
                >
                    Confirmar Datos del Distrito
                </VBtn>
            </div>

            <h2 class="text-h4 mb-4">
                Datos de las iglesias del Distrito: {{ districtName }}
            </h2>

            <div class="d-flex gap-2">
                <VBtn 
                    v-if="activePeriod?.allowEditing && !isConfirmed" 
                    color="primary" 
                    prepend-icon="mdi-plus"
                    @click="openNewChurchDialog"
                    :disabled="loadingSave || loadingDelete"
                >
                    Agregar Iglesia
                </VBtn>
            </div>


            <!-- Vista Desktop -->
            <VCard class="mb-4 d-none d-md-block">
                <VCardText>
                    <VTable fixed-header height="300px">
                        <thead>
                            <tr>
                                <th scope="col" class="text-left">Nombre de la Iglesia</th>
                                <th scope="col" class="text-left">Nombre del Líder</th>
                                <th scope="col" class="text-center">Total Maestras</th>
                                <th scope="col" class="text-center">Total Niños</th>
                                <th scope="col" class="text-center">Niños Convertidos</th>
                                <th scope="col" class="text-center">Niños Miembros</th>
                                <th scope="col" class="text-center">Niños Sin Arrepentir</th>
                                <th scope="col" class="text-center">Bautizados E.S.</th>
                                <th scope="col" class="text-center">Graduados Consolidado</th>
                                <th scope="col" class="text-center">Graduados Sacramentos</th>
                                <th scope="col" class="text-center">Graduados Discipulado</th>
                                <th scope="col" class="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(church, index) in churchesWithLatestData" :key="church.name">
                                <td>{{ church.name }}</td>
                                <td>{{ church.leaderName }}</td>
                                <td class="text-center">{{ church.latestData.totalTeachers }}</td>
                                <td class="text-center">{{ church.latestData.totalChildren }}</td>
                                <td class="text-center">{{ church.latestData.convertedChildren }}</td>
                                <td class="text-center">{{ church.latestData.memberChildren }}</td>
                                <td class="text-center">{{ church.latestData.nonRepentantChildren }}</td>
                                <td class="text-center">{{ church.latestData.baptizedChildren }}</td>
                                <td class="text-center">{{ church.latestData.consolidatedGraduates }}</td>
                                <td class="text-center">{{ church.latestData.sacramentsGraduates }}</td>
                                <td class="text-center">{{ church.latestData.discipleshipGraduates }}</td>
                                <td class="text-center">
                                    <VIcon 
                                        v-if="activePeriod?.allowEditing && !isConfirmed"
                                        color="primary" 
                                        icon="mdi-pencil" 
                                        size="small" 
                                        class="me-2"
                                        @click="editItem(church, index)"
                                    >
                                        <VTooltip activator="parent" location="top">Editar</VTooltip>
                                    </VIcon>
                                    <VIcon 
                                        v-if="activePeriod?.allowEditing && !isConfirmed"
                                        color="error" 
                                        icon="mdi-delete" 
                                        size="small"
                                        @click="deleteItem(church, index)"
                                        :loading="loadingDelete"
                                        :disabled="loadingDelete || !activePeriod?.allowEditing"
                                    >
                                        <VTooltip activator="parent" location="top">Eliminar</VTooltip>
                                    </VIcon>
                                    <VIcon color="info" icon="mdi-history" size="small" class="me-2 cursor-pointer"
                                        @click="viewHistory(church)">
                                        <VTooltip activator="parent" location="top">Ver Historial</VTooltip>
                                    </VIcon>
                                </td>
                            </tr>
                        </tbody>
                    </VTable>
                </VCardText>
            </VCard>

            <!-- Vista Móvil -->
            <div class="d-md-none">
                <!-- Tarjeta de Resumen de Totales para Móvil -->
                <VCard class="mb-4">
                    <VCardTitle>Resumen de Totales</VCardTitle>
                    <VCardText>
                        <VRow>
                            <!-- Columna Izquierda -->
                            <VCol cols="6">
                                <!-- Total Maestras -->
                                <div class="d-flex align-center mb-4">
                                    <VIcon color="primary" class="me-2">mdi-account-group</VIcon>
                                    <div>
                                        <div class="text-caption">Total Maestras</div>
                                        <div class="text-h6">{{ totals.totalTeachers }}</div>
                                    </div>
                                </div>

                                <!-- Total Niños -->
                                <div class="d-flex align-center mb-4">
                                    <VIcon color="info" class="me-2">mdi-account-child</VIcon>
                                    <div>
                                        <div class="text-caption">Total Niños</div>
                                        <div class="text-h6">{{ totals.totalChildren }}</div>
                                    </div>
                                </div>

                                <!-- Niños Convertidos -->
                                <div class="d-flex align-center mb-4">
                                    <VIcon color="success" class="me-2">mdi-school</VIcon>
                                    <div>
                                        <div class="text-caption">Niños Convertidos</div>
                                        <div class="text-h6">{{ totals.convertedChildren }}</div>
                                    </div>
                                </div>

                                <!-- Niños Miembros -->
                                <div class="d-flex align-center mb-4">
                                    <VIcon color="warning" class="me-2">mdi-heart</VIcon>
                                    <div>
                                        <div class="text-caption">Niños Miembros</div>
                                        <div class="text-h6">{{ totals.memberChildren }}</div>
                                    </div>
                                </div>

                                <!-- Niños Sin Arrepentir -->
                                <div class="d-flex align-center mb-4">
                                    <VIcon color="error" class="me-2">mdi-account-alert</VIcon>
                                    <div>
                                        <div class="text-caption">Niños Sin Arrepentir</div>
                                        <div class="text-h6">{{ totals.nonRepentantChildren }}</div>
                                    </div>
                                </div>
                            </VCol>

                            <!-- Columna Derecha -->
                            <VCol cols="6">
                                <!-- Bautizados E.S. -->
                                <div class="d-flex align-center mb-4">
                                    <VIcon color="red" class="me-2">mdi-fire</VIcon>
                                    <div>
                                        <div class="text-caption">Bautizados E.S.</div>
                                        <div class="text-h6">{{ totals.baptizedChildren }}</div>
                                    </div>
                                </div>

                                <!-- Graduados Consolidado -->
                                <div class="d-flex align-center mb-4">
                                    <VIcon color="deep-purple" class="me-2">mdi-school-outline</VIcon>
                                    <div>
                                        <div class="text-caption">Graduados Consolidado</div>
                                        <div class="text-h6">
                                            {{ totals.consolidatedGraduates }}
                                        </div>
                                    </div>
                                </div>

                                <!-- Graduados Sacramentos -->
                                <div class="d-flex align-center mb-4">
                                    <VIcon color="teal" class="me-2">mdi-certificate</VIcon>
                                    <div>
                                        <div class="text-caption">Graduados Sacramentos</div>
                                        <div class="text-h6">{{ totals.sacramentsGraduates }}</div>
                                    </div>
                                </div>

                                <!-- Graduados Discipulado -->
                                <div class="d-flex align-center mb-4">
                                    <VIcon color="blue-grey" class="me-2">mdi-book-open-variant</VIcon>
                                    <div>
                                        <div class="text-caption">Graduados Discipulado</div>
                                        <div class="text-h6">
                                            {{
                                                totals.discipleshipGraduates
                                            }}
                                        </div>
                                    </div>
                                </div>
                            </VCol>
                        </VRow>
                    </VCardText>
                </VCard>

                <!-- Cards de Iglesias -->
                <VRow>
                    <VCol v-for="(church, index) in churchesWithLatestData" :key="church.name" cols="12">
                        <VCard>
                            <VCardTitle>{{ church.name }}</VCardTitle>
                            <VCardSubtitle>{{ church.leaderName }}</VCardSubtitle>

                            <!-- Resumen -->
                            <VCardText>
                                <div class="d-flex justify-space-between align-center mb-2">
                                    <div>
                                        <div class="text-caption">Total Maestras</div>
                                        <div class="text-h6">{{ church.latestData.totalTeachers }}</div>
                                    </div>
                                    <div>
                                        <div class="text-caption">Total Niños</div>
                                        <div class="text-h6">{{ church.latestData.totalChildren }}</div>
                                    </div>
                                </div>

                                <VBtn block variant="text" @click="toggleDetails(church.name)" class="mt-2">
                                    {{
                                        showDetailsFor === church.name
                                            ? "Ocultar Detalles"
                                            : "Ver Detalles"
                                    }}
                                </VBtn>

                                <!-- Detalles expandibles -->
                                <VExpandTransition>
                                    <div v-if="showDetailsFor === church.name">
                                        <VDivider class="my-2"></VDivider>
                                        <div class="mt-2">
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Niños Convertidos</div>
                                                <div>{{ church.latestData.convertedChildren }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Niños Miembros</div>
                                                <div>{{ church.latestData.memberChildren }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Bautizados E.S.</div>
                                                <div>{{ church.latestData.baptizedChildren }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Graduados Consolidado</div>
                                                <div>{{ church.latestData.consolidatedGraduates }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Graduados Sacramentos</div>
                                                <div>{{ church.latestData.sacramentsGraduates }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Graduados Discipulado</div>
                                                <div>{{ church.latestData.discipleshipGraduates }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </VExpandTransition>
                            </VCardText>

                            <VCardActions>
                                <VSpacer />
                                <VIcon 
                                    v-if="activePeriod?.allowEditing && !isConfirmed"
                                    color="primary" 
                                    icon="mdi-pencil" 
                                    size="small" 
                                    class="me-2"
                                    @click="editItem(church, index)"
                                />
                                <VIcon 
                                    v-if="activePeriod?.allowEditing && !isConfirmed"
                                    color="error" 
                                    icon="mdi-delete" 
                                    size="small"
                                    @click="deleteItem(church, index)"
                                    :loading="loadingDelete"
                                    :disabled="loadingDelete || !activePeriod?.allowEditing"
                                />
                                <VIcon 
                                    color="info" 
                                    icon="mdi-history" 
                                    size="small" 
                                    class="me-2"
                                    @click="viewHistory(church)" 
                                />
                            </VCardActions>
                        </VCard>
                    </VCol>
                </VRow>
            </div>

            <!-- Tarjeta de Resumen de Totales para Desktop -->
            <VCard class="mt-4 d-none d-md-block">
                <VCardTitle>Resumen de Totales</VCardTitle>
                <VCardText>
                    <VRow>
                        <VCol cols="12" sm="6" md="3">
                            <div class="d-flex align-center mb-2">
                                <VIcon color="primary" class="me-2">mdi-account-group</VIcon>
                                <div>
                                    <div class="text-caption">Total Maestras</div>
                                    <div class="text-h6">{{ totals.totalTeachers }}</div>
                                </div>
                            </div>
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                            <div class="d-flex align-center mb-2">
                                <VIcon color="info" class="me-2">mdi-account-child</VIcon>
                                <div>
                                    <div class="text-caption">Total Niños</div>
                                    <div class="text-h6">{{ totals.totalChildren }}</div>
                                </div>
                            </div>
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                            <div class="d-flex align-center mb-2">
                                <VIcon color="success" class="me-2">mdi-school</VIcon>
                                <div>
                                    <div class="text-caption">Niños Convertidos</div>
                                    <div class="text-h6">{{ totals.convertedChildren }}</div>
                                </div>
                            </div>
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                            <div class="d-flex align-center mb-2">
                                <VIcon color="warning" class="me-2">mdi-heart</VIcon>
                                <div>
                                    <div class="text-caption">Niños Miembros</div>
                                    <div class="text-h6">{{ totals.memberChildren }}</div>
                                </div>
                            </div>
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                            <div class="d-flex align-center mb-2">
                                <VIcon color="error" class="me-2">mdi-account-alert</VIcon>
                                <div>
                                    <div class="text-caption">Niños Sin Arrepentir</div>
                                    <div class="text-h6">{{ totals.nonRepentantChildren }}</div>
                                </div>
                            </div>
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                            <div class="d-flex align-center mb-2">
                                <VIcon color="red" class="me-2">mdi-fire</VIcon>
                                <div>
                                    <div class="text-caption">Bautizados E.S.</div>
                                    <div class="text-h6">{{ totals.baptizedChildren }}</div>
                                </div>
                            </div>
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                            <div class="d-flex align-center mb-2">
                                <VIcon color="deep-purple" class="me-2">mdi-school-outline</VIcon>
                                <div>
                                    <div class="text-caption">Graduados Consolidado</div>
                                    <div class="text-h6">{{ totals.consolidatedGraduates }}</div>
                                </div>
                            </div>
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                            <div class="d-flex align-center mb-2">
                                <VIcon color="teal" class="me-2">mdi-certificate</VIcon>
                                <div>
                                    <div class="text-caption">Graduados Sacramentos</div>
                                    <div class="text-h6">{{ totals.sacramentsGraduates }}</div>
                                </div>
                            </div>
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                            <div class="d-flex align-center mb-2">
                                <VIcon color="blue-grey" class="me-2">mdi-book-open-variant</VIcon>
                                <div>
                                    <div class="text-caption">Graduados Discipulado</div>
                                    <div class="text-h6">{{ totals.discipleshipGraduates }}</div>
                                </div>
                            </div>
                        </VCol>
                    </VRow>
                </VCardText>
            </VCard>
        </VContainer>

        <!-- Diálogo para crear/editar iglesia -->
        <ChurchFormDialog 
            v-model="dialog" 
            :church="editedItem" 
            :active-period="activePeriod" 
            @save="saveChurch"
            @close="closeDialog" 
            :loading="loadingSave"
        />

        <!-- Diálogo de confirmación -->
        <VDialog v-model="confirmDialog" max-width="500px">
            <VCard>
                <VCardTitle class="text-h5">Confirmar Datos del Distrito</VCardTitle>
                <VCardText>
                    <VAlert type="warning" class="mb-4">
                        <strong>¡Atención!</strong> Una vez confirmados los datos:
                        <ul class="mt-2">
                            <li>No se podrán agregar nuevas iglesias</li>
                            <li>No se podrán editar los datos existentes</li>
                            <li>No se podrán eliminar registros</li>
                            <li>La edición se habilitará en el siguiente período de reporte</li>
                        </ul>
                    </VAlert>
                    <p>¿Está seguro de confirmar los datos del distrito?</p>
                </VCardText>
                <VCardActions>
                    <VSpacer />
                    <VBtn color="error" variant="text" @click="confirmDialog = false">
                        Cancelar
                    </VBtn>
                    <VBtn 
                        color="success" 
                        variant="text" 
                        @click="processDistrictConfirmation"
                        :loading="confirming"
                    >
                        Confirmar
                    </VBtn>
                </VCardActions>
            </VCard>
        </VDialog>

        <!-- Agregar el diálogo de historial -->
        <ChurchHistoryDialog 
            v-model="showHistory"
            :church="selectedChurch"
        />
    </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    Timestamp,
    updateDoc,
    addDoc,
    deleteDoc,
    type DocumentData,
    type DocumentReference,
    writeBatch,
    limit
} from "firebase/firestore";
import { db } from "@/firebase/config";
import NavigationBar from "@/components/NavigationBar.vue";
import type {
    ReportPeriod,
    MinisterialReport,
} from "@/types/MinisterialReport";
import type { Church } from "@/types/Church";
import ChurchFormDialog from "@/components/ChurchFormDialog.vue";
import ChurchHistoryDialog from '@/components/ChurchHistoryDialog.vue';
import { useDistrictStore } from '@/stores/district';
import { COLLECTIONS } from '@/constants';
import { useUserDistrict } from '@/composables/useUserDistrict';

const authStore = useAuthStore();
const districtStore = useDistrictStore();
const districtName = ref("");
const currentDistrict = ref<{ id: string; }>({ id: "" });
const churches = ref<Church[]>([]);
const showDetailsFor = ref<string | null>(null);
const activePeriod = ref<ReportPeriod | null>(null);
const loading = ref(true);
const dialog = ref(false);
const selectedChurch = ref<Church | undefined>(undefined);
const editedIndex = ref(-1);
const editedItem = ref<any>(null);
const showHistory = ref(false);
const churchConfirmations = ref(new Map());
const completionPercentage = ref(0);
const confirming = ref(false);
const isConfirmed = ref(false);
const confirmDialog = ref(false);
const loadingSave = ref(false);
const loadingDelete = ref(false);

const defaultItem = {
    id: "",
    name: "",
    leaderName: "",
    districtId: "",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: "",
    updatedBy: "",
    isActive: true,
    ministerialData: [{
        totalTeachers: 0,
        totalChildren: 0,
        convertedChildren: 0,
        memberChildren: 0,
        nonRepentantChildren: 0,
        baptizedChildren: 0,
        consolidatedGraduates: 0,
        sacramentsGraduates: 0,
        discipleshipGraduates: 0,
        updatedAt: Timestamp.now(),
        reportPeriodId: activePeriod.value?.id
    }]
};

const toggleDetails = (churchName: string) => {
    showDetailsFor.value =
        showDetailsFor.value === churchName ? null : churchName;
};

const EMPTY_MINISTERIAL_DATA = {
    totalTeachers: 0,
    totalChildren: 0,
    convertedChildren: 0,
    memberChildren: 0,
    nonRepentantChildren: 0,
    baptizedChildren: 0,
    consolidatedGraduates: 0,
    sacramentsGraduates: 0,
    rescueClubChildren: 0,
    discipleshipGraduates: 0,
};

const getLatestMinisterialData = (church: Church) => {
    if (!church.ministerialData || church.ministerialData.length === 0) {
        return EMPTY_MINISTERIAL_DATA;
    }
    return church.ministerialData.sort(
        (a, b) => b.updatedAt.seconds - a.updatedAt.seconds
    )[0];
};

// Pre-calcula latestData una vez por iglesia en lugar de llamar getLatestMinisterialData en cada celda del template
const churchesWithLatestData = computed(() =>
    churches.value.map(church => ({
        ...church,
        latestData: getLatestMinisterialData(church)
    }))
);

// Totales computados en un solo loop
const totals = computed(() => {
  const acc = {
    totalTeachers: 0,
    totalChildren: 0,
    convertedChildren: 0,
    memberChildren: 0,
    nonRepentantChildren: 0,
    baptizedChildren: 0,
    consolidatedGraduates: 0,
    sacramentsGraduates: 0,
    discipleshipGraduates: 0,
  };
  for (const church of churches.value) {
    const d = church.ministerialData?.[0];
    if (!d) continue;
    acc.totalTeachers += d.totalTeachers || 0;
    acc.totalChildren += d.totalChildren || 0;
    acc.convertedChildren += d.convertedChildren || 0;
    acc.memberChildren += d.memberChildren || 0;
    acc.nonRepentantChildren += d.nonRepentantChildren || 0;
    acc.baptizedChildren += d.baptizedChildren || 0;
    acc.consolidatedGraduates += d.consolidatedGraduates || 0;
    acc.sacramentsGraduates += d.sacramentsGraduates || 0;
    acc.discipleshipGraduates += d.discipleshipGraduates || 0;
  }
  return acc;
});

const loadActivePeriod = async () => {
    const periodsRef = collection(db, COLLECTIONS.REPORT_PERIODS);
    const q = query(periodsRef, where("isActive", "==", true));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        const period: ReportPeriod = {
            id: snapshot.docs[0].id,
            name: data.name,
            description: data.description,
            startDate: data.startDate,
            endDate: data.endDate,
            isActive: data.isActive,
            allowEditing: data.allowEditing ?? false,
        };
        activePeriod.value = period;
    }
};

const loadData = async () => {
    if (!authStore.user) return;
    
    try {
        // 1. Obtener el distrito del usuario
        const districtLeaderQuery = query(
            collection(db, 'district_leaders'),
            where('userId', '==', authStore.user.id),
            where('isActive', '==', true),
            limit(1)
        );
        const districtLeaderSnapshot = await getDocs(districtLeaderQuery);
        
        if (!districtLeaderSnapshot.empty) {
            const districtId = districtLeaderSnapshot.docs[0].data().districtId;
            currentDistrict.value.id = districtId; // Asignar el districtId
            
            // Obtener los datos del distrito
            const districtDoc = await getDoc(doc(db, 'districts', districtId));
            if (districtDoc.exists()) {
                districtName.value = districtDoc.data().location;
            }
            
            // 2. Obtener período activo (pero no bloqueamos la carga de datos si no hay período activo)
            const periodsQuery = query(
                collection(db, 'report_periods'),
                where('isActive', '==', true),
                limit(1)
            );
            const periodsSnapshot = await getDocs(periodsQuery);
            
            if (!periodsSnapshot.empty) {
                const periodData = periodsSnapshot.docs[0].data();
                activePeriod.value = {
                    id: periodsSnapshot.docs[0].id,
                    name: periodData.name,
                    description: periodData.description,
                    startDate: periodData.startDate,
                    endDate: periodData.endDate,
                    isActive: periodData.isActive,
                    allowEditing: periodData.allowEditing ?? false
                };
            }
            
            // 3. Obtener datos de las iglesias
            const churchesQuery = query(
                collection(db, 'churches'),
                where('districtId', '==', districtId),
                where('isActive', '==', true),
                limit(100)
            );
            const churchesSnapshot = await getDocs(churchesQuery);
            
            churches.value = churchesSnapshot.docs.map(doc => {
                const data = doc.data();
                // Ordenar ministerialData por fecha de actualización descendente
                const sortedMinisterialData = (data.ministerialData || [])
                    .sort((a: any, b: any) => b.updatedAt.seconds - a.updatedAt.seconds);
                
                return {
                    id: doc.id,
                    name: data.name,
                    leaderName: data.leaderName,
                    districtId: data.districtId,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    createdBy: data.createdBy,
                    updatedBy: data.updatedBy,
                    isActive: data.isActive,
                    // Tomar los datos ministeriales más recientes
                    ministerialData: sortedMinisterialData
                };
            });
            
            // 4. Verificar si el reporte está confirmado (solo si hay período activo)
            if (activePeriod.value) {
                const confirmationQuery = query(
                    collection(db, 'district_confirmations'),
                    where('districtId', '==', districtId),
                    where('periodId', '==', activePeriod.value.id),
                    limit(1)
                );
                const confirmationSnapshot = await getDocs(confirmationQuery);
                isConfirmed.value = !confirmationSnapshot.empty;
            }
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
    } finally {
        loading.value = false;
    }
};

const closeDialog = () => {
    dialog.value = false;
    editedIndex.value = -1;
    editedItem.value = {
        id: "",
        name: "",
        leaderName: "",
        districtId: "",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: "",
        updatedBy: "",
        isActive: true,
        ministerialData: [{
            totalTeachers: 0,
            totalChildren: 0,
            convertedChildren: 0,
            memberChildren: 0,
            nonRepentantChildren: 0,
            baptizedChildren: 0,
            consolidatedGraduates: 0,
            sacramentsGraduates: 0,
            discipleshipGraduates: 0,
            updatedAt: Timestamp.now(),
            reportPeriodId: activePeriod.value?.id
        }]
    };
};

const saveChurch = async (churchData: any) => {
    loadingSave.value = true;
    try {
        // 1. Obtener el distrito activo del líder
        const { getActiveDistrictLeader } = useUserDistrict();
        const districtLeader = await getActiveDistrictLeader();

        if (!districtLeader) {
            throw new Error("No se encontró un distrito activo para el líder");
        }

        const now = Timestamp.now();

        // 2. Preparar datos de la iglesia
        const church: Partial<Church> = {
            name: churchData.name,
            leaderName: churchData.leaderName,
            districtId: districtLeader.districtId,
            isActive: true,
            ministerialData: [
                {
                    ...churchData.ministerialData,
                    updatedAt: now,
                    reportPeriodId: activePeriod.value?.id,
                },
            ],
        };

        // 3. Guardar en Firestore
        const churchesRef = collection(db, COLLECTIONS.CHURCHES);
        if (editedIndex.value > -1 && editedItem.value.id) {
            // Actualizar iglesia existente
            const existingChurch = await getDoc(
                doc(db, COLLECTIONS.CHURCHES, editedItem.value.id)
            );
            if (existingChurch.exists()) {
                const existingData = existingChurch.data();
                await updateDoc(doc(db, COLLECTIONS.CHURCHES, editedItem.value.id), {
                    name: church.name,
                    leaderName: church.leaderName,
                    ministerialData: [
                        ...(existingData.ministerialData || []),
                        church.ministerialData![0],
                    ],
                    updatedAt: now,
                    updatedBy: authStore.user?.id,
                });
            }
        } else {
            // Crear nueva iglesia
            await addDoc(churchesRef, {
                ...church,
                createdAt: now,
                updatedAt: now,
                createdBy: authStore.user?.id,
                updatedBy: authStore.user?.id,
            });
        }

        // 4. Recargar datos y cerrar diálogo
        await loadData();
        dialog.value = false;
    } catch (error) {
        console.error("Error al guardar iglesia:", error);
        alert("Error al guardar la iglesia: " + (error as Error).message);
    } finally {
        loadingSave.value = false;
    }
};

const editItem = async (church: Church, index: number) => {
    if (!activePeriod.value?.allowEditing) return;

    editedIndex.value = index;
    editedItem.value = { ...church };
    dialog.value = true;
};

const deleteItem = async (church: Church, index: number) => {
    if (!activePeriod.value?.allowEditing) return;

    if (confirm("¿Estás seguro de eliminar esta iglesia?")) {
        loadingDelete.value = true;
        try {
            const churchRef: DocumentReference<DocumentData> = doc(db, "churches", church.id);
            await deleteDoc(churchRef);
            
            // Recargar la lista de iglesias
            await loadData();
            
            alert("Iglesia eliminada exitosamente");
        } catch (error) {
            console.error("Error al eliminar iglesia:", error);
            alert("Error al eliminar la iglesia: " + (error as Error).message);
        } finally {
            loadingDelete.value = false;
        }
    }
};

const viewHistory = (church: Church) => {
    selectedChurch.value = church;
    showHistory.value = true;
};

const closeHistory = () => {
    selectedChurch.value = undefined;
    showHistory.value = false;
};

onMounted(async () => {
    await loadData();
    await districtStore.loadDistrictData();
});

const headers = [
    { title: "Iglesia", key: "name", sortable: true },
    { title: "Líder", key: "leaderName", sortable: true },
    { title: "Maestras", key: "ministerialData.totalTeachers", sortable: true },
    {
        title: "Total Niños",
        key: "ministerialData.totalChildren",
        sortable: true,
    },
    {
        title: "Convertidos",
        key: "ministerialData.convertedChildren",
        sortable: true,
    },
    { title: "Miembros", key: "ministerialData.memberChildren", sortable: true },
    {
        title: "Niños Sin Arrepentir",
        key: "ministerialData.nonRepentantChildren",
        sortable: true,
    },
    {
        title: "Bautizados",
        key: "ministerialData.baptizedChildren",
        sortable: true,
    },
    { title: "Acciones", key: "actions", sortable: false },
];

// Función para calcular el porcentaje de completitud
const calculateCompletionPercentage = () => {
    if (!churches.value.length) return 0;
    const confirmedCount = Array.from(churchConfirmations.value.values()).filter(
        (conf) => conf.isConfirmed
    ).length;
    return Math.round((confirmedCount / churches.value.length) * 100);
};

const loadConfirmations = async () => {
    if (!activePeriod.value) return;

    const confirmationsRef = collection(db, COLLECTIONS.CHURCH_CONFIRMATIONS);
    const q = query(
        confirmationsRef,
        where("periodId", "==", activePeriod.value.id),
        where("districtId", "==", currentDistrict.value.id)
    );

    const snapshot = await getDocs(q);

    churchConfirmations.value.clear();
    snapshot.docs.forEach((doc) => {
        const data = doc.data();
        churchConfirmations.value.set(data.churchId, {
            id: doc.id,
            ...data,
        });
    });

    completionPercentage.value = calculateCompletionPercentage();
};

const canManageChurches = computed(() => {
    return activePeriod.value?.allowEditing && activePeriod.value?.isActive;
});

const canConfirmChurch = (churchId: string) => {
    const church = churches.value.find((c) => c.id === churchId);
    if (!church?.ministerialData?.length) return false;

    const latestData = church.ministerialData[church.ministerialData.length - 1];
    return (
        latestData.totalTeachers > 0 &&
        latestData.totalChildren > 0 &&
        latestData.reportPeriodId === activePeriod.value?.id
    );
};

const addItem = () => {
    if (!activePeriod.value?.allowEditing) return;

    editedIndex.value = -1;
    editedItem.value = { ...defaultItem };
    dialog.value = true;
};

const openNewChurchDialog = () => {
    editedItem.value = { ...defaultItem };
    editedIndex.value = -1;
    dialog.value = true;
};

// Función para confirmar los datos del distrito
const confirmDistrictData = () => {
    confirmDialog.value = true;
};

// Nueva función para procesar la confirmación
const processDistrictConfirmation = async () => {
    if (!activePeriod.value || !currentDistrict.value || !authStore.user?.id) return;
    
    confirming.value = true;
    try {
        // Verificar que todas las iglesias tengan datos ministeriales
        const churchesWithoutData = churches.value.filter(
            church => !church.ministerialData || !church.ministerialData.length
        );

        if (churchesWithoutData.length > 0) {
            alert('Todas las iglesias deben tener datos ministeriales antes de confirmar');
            return;
        }

        // Crear confirmación del distrito
        await addDoc(collection(db, COLLECTIONS.DISTRICT_CONFIRMATIONS), {
            districtId: currentDistrict.value.id,
            periodId: activePeriod.value.id,
            confirmedAt: Timestamp.now(),
            confirmedBy: authStore.user.id,
            churchesCount: churches.value.length,
            totalTeachers: churches.value.reduce((sum: number, church) => 
                sum + (church.ministerialData?.[0]?.totalTeachers || 0), 0),
            totalChildren: churches.value.reduce((sum: number, church) => 
                sum + (church.ministerialData?.[0]?.totalChildren || 0), 0),
            convertedChildren: churches.value.reduce((sum: number, church) => 
                sum + (church.ministerialData?.[0]?.convertedChildren || 0), 0),
            memberChildren: churches.value.reduce((sum: number, church) => 
                sum + (church.ministerialData?.[0]?.memberChildren || 0), 0),
            nonRepentantChildren: churches.value.reduce((sum: number, church) => 
                sum + (church.ministerialData?.[0]?.nonRepentantChildren || 0), 0),
            baptizedChildren: churches.value.reduce((sum: number, church) => 
                sum + (church.ministerialData?.[0]?.baptizedChildren || 0), 0),
            consolidatedGraduates: churches.value.reduce((sum: number, church) => 
                sum + (church.ministerialData?.[0]?.consolidatedGraduates || 0), 0),
            sacramentsGraduates: churches.value.reduce((sum: number, church) => 
                sum + (church.ministerialData?.[0]?.sacramentsGraduates || 0), 0),
            discipleshipGraduates: churches.value.reduce((sum: number, church) => 
                sum + (church.ministerialData?.[0]?.discipleshipGraduates || 0), 0)
        });

        // Guardar las confirmaciones de iglesias en una sola operación
        const batch = writeBatch(db);
        churches.value.forEach((church) => {
            const confirmationRef = doc(collection(db, COLLECTIONS.CHURCH_CONFIRMATIONS));
            batch.set(confirmationRef, {
                churchId: church.id,
                periodId: activePeriod.value!.id,
                districtId: currentDistrict.value!.id,
                confirmedAt: Timestamp.now(),
                confirmedBy: authStore.user!.id,
                churchName: church.name,
                leaderName: church.leaderName,
                ministerialData: church.ministerialData[0]
            });
        });
        
        await batch.commit();

        isConfirmed.value = true;
        confirmDialog.value = false;
        alert('Datos del distrito confirmados exitosamente');
    } catch (error) {
        console.error('Error al confirmar datos del distrito:', error);
        alert('Error al confirmar los datos del distrito');
    } finally {
        confirming.value = false;
    }
};
</script>
<style scoped>
.totals-card {
    position: sticky;
    bottom: 0;
    z-index: 2;
    background-color: white;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

/* Estilos para la tabla en desktop */
.v-table {
    width: 100%;
    overflow-x: auto;
}

@media (min-width: 960px) {

    .v-table th,
    .v-table td {
        white-space: nowrap;
        padding: 8px;
    }
}

.cursor-pointer {
    cursor: pointer;
}

.district-name {
    color: var(--v-primary-base);
    font-weight: 600;
}
</style>

