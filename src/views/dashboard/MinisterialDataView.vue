<template>
    <div>
        <NavigationBar />
        <VContainer>
            <!-- Indicador de Progreso -->
            <VCard class="mb-4" v-if="activePeriod">
                <VCardText>
                    <div class="d-flex align-center justify-space-between">
                        <div>Progreso de Confirmación</div>
                        <div class="text-h6">{{ completionPercentage }}%</div>
                    </div>
                    <VProgressLinear :model-value="completionPercentage" color="primary" height="20">
                        <template v-slot:default="{ value }">
                            <strong>{{ Math.ceil(value) }}%</strong>
                        </template>
                    </VProgressLinear>
                </VCardText>
            </VCard>

            <!-- Indicador de Estado de Edición -->
            <VAlert v-if="activePeriod" :type="activePeriod.allowEditing ? 'info' : 'warning'" class="mb-4">
                <div>
                    Período activo: {{ activePeriod.name }}.
                    {{
                        activePeriod.allowEditing
                            ? "La edición está habilitada."
                            : "La edición está deshabilitada."
                    }}
                </div>
            </VAlert>

            <div class="d-flex justify-space-between align-center mb-4">
                <h2 class="text-h4">
                    Datos de las iglesias del Distrito: {{ districtName }}
                </h2>
                <div class="d-flex gap-2">
                    <VBtn 
                        v-if="activePeriod?.allowEditing && !isConfirmed" 
                        color="primary" 
                        prepend-icon="mdi-plus"
                        @click="openNewChurchDialog"
                    >
                        Agregar Iglesia
                    </VBtn>
                    <VBtn
                        v-if="activePeriod && !isConfirmed"
                        color="success"
                        prepend-icon="mdi-check-circle"
                        @click="confirmDistrictData"
                        :loading="confirming"
                    >
                        Confirmar Datos del Distrito
                    </VBtn>
                </div>
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
                                <th scope="col" class="text-center">Club Al Rescate</th>
                                <th scope="col" class="text-center">Graduados Discipulado</th>
                                <th scope="col" class="text-center">Conexión 9.11</th>
                                <th scope="col" class="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(church, index) in churches" :key="church.name">
                                <td>{{ church.name }}</td>
                                <td>{{ church.leaderName }}</td>
                                <td class="text-center">
                                    {{ getLatestMinisterialData(church).totalTeachers }}
                                </td>
                                <td class="text-center">
                                    {{ getLatestMinisterialData(church).totalChildren }}
                                </td>
                                <td class="text-center">
                                    {{ getLatestMinisterialData(church).convertedChildren }}
                                </td>
                                <td class="text-center">
                                    {{ getLatestMinisterialData(church).memberChildren }}
                                </td>
                                <td class="text-center">
                                    {{ getLatestMinisterialData(church).nonRepentantChildren }}
                                </td>
                                <td class="text-center">
                                    {{ getLatestMinisterialData(church).baptizedChildren }}
                                </td>
                                <td class="text-center">
                                    {{ getLatestMinisterialData(church).consolidatedGraduates }}
                                </td>
                                <td class="text-center">
                                    {{ getLatestMinisterialData(church).sacramentsGraduates }}
                                </td>
                                <td class="text-center">
                                    {{ getLatestMinisterialData(church).rescueClubChildren }}
                                </td>
                                <td class="text-center">
                                    {{ getLatestMinisterialData(church).discipleshipGraduates }}
                                </td>
                                <td class="text-center">
                                    {{ getLatestMinisterialData(church).connection911Children }}
                                </td>
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
                                    <VIcon color="deep-purple" class="me-2">mdi-account-check</VIcon>
                                    <div>
                                        <div class="text-caption">Bautizados E.S.</div>
                                        <div class="text-h6">{{ totals.baptizedChildren }}</div>
                                    </div>
                                </div>

                                <!-- Graduados Consolidado -->
                                <div class="d-flex align-center mb-4">
                                    <VIcon color="red" class="me-2">mdi-fire</VIcon>
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

                                <!-- Club Al Rescate -->
                                <div class="d-flex align-center mb-4">
                                    <VIcon color="orange" class="me-2">mdi-lifebuoy</VIcon>
                                    <div>
                                        <div class="text-caption">Club Al Rescate</div>
                                        <div class="text-h6">{{ totals.rescueClubChildren }}</div>
                                    </div>
                                </div>

                                <!-- Graduados Discipulado -->
                                <div class="d-flex align-center mb-4">
                                    <VIcon color="blue-grey" class="me-2">mdi-school-outline</VIcon>
                                    <div>
                                        <div class="text-caption">Graduados Discipulado</div>
                                        <div class="text-h6">
                                            {{ totals.discipleshipGraduates }}
                                        </div>
                                    </div>
                                </div>

                                <!-- Conexión 9.11 -->
                                <div class="d-flex align-center mb-4">
                                    <VIcon color="cyan" class="me-2">mdi-connection</VIcon>
                                    <div>
                                        <div class="text-caption">Conexión 9.11</div>
                                        <div class="text-h6">
                                            {{ totals.connection911Children }}
                                        </div>
                                    </div>
                                </div>
                            </VCol>
                        </VRow>
                    </VCardText>
                </VCard>

                <!-- Cards de Iglesias -->
                <VRow>
                    <VCol v-for="church in churches" :key="church.name" cols="12">
                        <VCard>
                            <VCardTitle>{{ church.name }}</VCardTitle>
                            <VCardSubtitle>{{ church.leaderName }}</VCardSubtitle>

                            <!-- Resumen -->
                            <VCardText>
                                <div class="d-flex justify-space-between align-center mb-2">
                                    <div>
                                        <div class="text-caption">Total Maestras</div>
                                        <div class="text-h6">
                                            {{ getLatestMinisterialData(church).totalTeachers }}
                                        </div>
                                    </div>
                                    <div>
                                        <div class="text-caption">Total Niños</div>
                                        <div class="text-h6">
                                            {{ getLatestMinisterialData(church).totalChildren }}
                                        </div>
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
                                                <div>
                                                    {{
                                                        getLatestMinisterialData(church).convertedChildren
                                                    }}
                                                </div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Niños Miembros</div>
                                                <div>
                                                    {{ getLatestMinisterialData(church).memberChildren }}
                                                </div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Bautizados E.S.</div>
                                                <div>
                                                    {{
                                                        getLatestMinisterialData(church).baptizedChildren
                                                    }}
                                                </div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Graduados Consolidado</div>
                                                <div>
                                                    {{
                                                        getLatestMinisterialData(church)
                                                            .consolidatedGraduates
                                                    }}
                                                </div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Graduados Sacramentos</div>
                                                <div>
                                                    {{
                                                        getLatestMinisterialData(church).sacramentsGraduates
                                                    }}
                                                </div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Club Al Rescate</div>
                                                <div>
                                                    {{
                                                        getLatestMinisterialData(church).rescueClubChildren
                                                    }}
                                                </div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Graduados Discipulado</div>
                                                <div>
                                                    {{
                                                        getLatestMinisterialData(church)
                                                            .discipleshipGraduates
                                                    }}
                                                </div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Conexión 9.11</div>
                                                <div>
                                                    {{
                                                        getLatestMinisterialData(church)
                                                            .connection911Children
                                                    }}
                                                </div>
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
                                    @click="editItem(church, churches.indexOf(church))" 
                                />
                                <VIcon 
                                    v-if="activePeriod?.allowEditing && !isConfirmed"
                                    color="error" 
                                    icon="mdi-delete" 
                                    size="small"
                                    @click="deleteItem(church, churches.indexOf(church))" 
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
                                <VIcon color="orange" class="me-2">mdi-lifebuoy</VIcon>
                                <div>
                                    <div class="text-caption">Club Al Rescate</div>
                                    <div class="text-h6">{{ totals.rescueClubChildren }}</div>
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
                        <VCol cols="12" sm="6" md="3">
                            <div class="d-flex align-center mb-2">
                                <VIcon color="cyan" class="me-2">mdi-connection</VIcon>
                                <div>
                                    <div class="text-caption">Conexión 9.11</div>
                                    <div class="text-h6">{{ totals.connection911Children }}</div>
                                </div>
                            </div>
                        </VCol>
                    </VRow>
                </VCardText>
            </VCard>
        </VContainer>

        <!-- Diálogo para crear/editar iglesia -->
        <ChurchFormDialog v-model="dialog" :church="editedItem" :active-period="activePeriod" @save="saveChurch"
            @close="closeDialog" />

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
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
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
} from "firebase/firestore";
import { db } from "../../firebase/config";
import NavigationBar from "../../components/NavigationBar.vue";
import type {
    ReportPeriod,
    MinisterialReport,
} from "../../types/MinisterialReport";
import type { Church } from "../../types/Church";
import ChurchFormDialog from "../../components/ChurchFormDialog.vue";

const authStore = useAuthStore();
const districtName = ref("");
const currentDistrict = ref<{ id: string; }>({ id: "" });
const churches = ref<Church[]>([]);
const showDetailsFor = ref<string | null>(null);
const activePeriod = ref<ReportPeriod | null>(null);
const currentReport = ref<MinisterialReport | null>(null);
const loading = ref(false);
const dialog = ref(false);
const historyDialog = ref(false);
const selectedChurch = ref<Church | null>(null);
const editedIndex = ref(-1);
const editedItem = ref<any>(null);
const showHistory = ref(false);
const churchConfirmations = ref(new Map());
const completionPercentage = ref(0);
const confirming = ref(false);
const isConfirmed = ref(false);
const confirmDialog = ref(false);

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
        rescueClubChildren: 0,
        discipleshipGraduates: 0,
        connection911Children: 0,
        updatedAt: Timestamp.now(),
        reportPeriodId: activePeriod.value?.id
    }]
};

const toggleDetails = (churchName: string) => {
    showDetailsFor.value =
        showDetailsFor.value === churchName ? null : churchName;
};

const getLatestMinisterialData = (church: Church) => {
    if (!church.ministerialData || church.ministerialData.length === 0) {
        return {
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
            connection911Children: 0
        };
    }

    return church.ministerialData.sort(
        (a, b) => b.updatedAt.seconds - a.updatedAt.seconds
    )[0];
};

interface TotalAccumulator {
    totalTeachers: number;
    totalChildren: number;
    convertedChildren: number;
    memberChildren: number;
    nonRepentantChildren: number;
    baptizedChildren: number;
    consolidatedGraduates: number;
    sacramentsGraduates: number;
    rescueClubChildren: number;
    discipleshipGraduates: number;
    connection911Children: number;
}

const totals = computed(() => {
    const initialValue: TotalAccumulator = {
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
        connection911Children: 0
    };

    return churches.value.reduce((sum, church) => {
        const data = getLatestMinisterialData(church);
        return {
            totalTeachers: sum.totalTeachers + Number(data.totalTeachers || 0),
            totalChildren: sum.totalChildren + Number(data.totalChildren || 0),
            convertedChildren: sum.convertedChildren + Number(data.convertedChildren || 0),
            memberChildren: sum.memberChildren + Number(data.memberChildren || 0),
            nonRepentantChildren: sum.nonRepentantChildren + Number(data.nonRepentantChildren || 0),
            baptizedChildren: sum.baptizedChildren + Number(data.baptizedChildren || 0),
            consolidatedGraduates: sum.consolidatedGraduates + Number(data.consolidatedGraduates || 0),
            sacramentsGraduates: sum.sacramentsGraduates + Number(data.sacramentsGraduates || 0),
            rescueClubChildren: sum.rescueClubChildren + Number(data.rescueClubChildren || 0),
            discipleshipGraduates: sum.discipleshipGraduates + Number(data.discipleshipGraduates || 0),
            connection911Children: sum.connection911Children + Number(data.connection911Children || 0)
        };
    }, initialValue);
});

const loadActivePeriod = async () => {
    const periodsRef = collection(db, "report_periods");
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
    try {
        // 1. Cargar el período activo
        const periodsRef = collection(db, "report_periods");
        const periodQuery = query(periodsRef, where("isActive", "==", true));
        const periodSnapshot = await getDocs(periodQuery);

        if (!periodSnapshot.empty) {
            const periodData = periodSnapshot.docs[0].data();
            activePeriod.value = {
                id: periodSnapshot.docs[0].id,
                name: periodData.name,
                description: periodData.description,
                startDate: periodData.startDate,
                endDate: periodData.endDate,
                isActive: periodData.isActive,
                allowEditing: periodData.allowEditing ?? false
            };

            // 2. Verificar confirmación del distrito
            if (currentDistrict.value?.id) {
                const confirmationQuery = query(
                    collection(db, "district_confirmations"),
                    where("districtId", "==", currentDistrict.value.id),
                    where("periodId", "==", periodSnapshot.docs[0].id)
                );
                const confirmationSnapshot = await getDocs(confirmationQuery);
                isConfirmed.value = !confirmationSnapshot.empty;
            }
        }

        // 2. Cargar distrito del líder actual
        const districtLeadersRef = collection(db, "district_leaders");
        const dlQuery = query(
            districtLeadersRef,
            where("userId", "==", authStore.user?.id),
            where("isActive", "==", true)
        );
        const districtLeaderDocs = await getDocs(dlQuery);

        if (!districtLeaderDocs.empty) {
            const districtLeader = districtLeaderDocs.docs[0].data();

            // Obtener los datos del distrito
            const districtDoc = await getDoc(
                doc(db, "districts", districtLeader.districtId)
            );
            if (districtDoc.exists()) {
                const districtData = districtDoc.data();
                districtName.value = districtData.location;
                currentDistrict.value = {
                    id: districtDoc.id,
                };
            }

            // 3. Cargar las iglesias del distrito
            const churchesRef = collection(db, "churches");
            const churchesQuery = query(
                churchesRef,
                where("districtId", "==", districtLeader.districtId),
                where("isActive", "==", true)
            );

            const churchesSnapshot = await getDocs(churchesQuery);
            churches.value = churchesSnapshot.docs.map((doc) => {
                const data = doc.data();
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
                    ministerialData: data.ministerialData || [],
                } as Church;
            });
        }
    } catch (error) {
        console.error("Error al cargar datos:", error);
        alert("Error al cargar los datos");
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
            rescueClubChildren: 0,
            discipleshipGraduates: 0,
            connection911Children: 0,
            updatedAt: Timestamp.now(),
            reportPeriodId: activePeriod.value?.id
        }]
    };
};

const saveChurch = async (churchData: any) => {
    try {
        // 1. Obtener el distrito activo del líder
        const districtLeadersRef = collection(db, "district_leaders");
        const q = query(
            districtLeadersRef,
            where("userId", "==", authStore.user?.id),
            where("isActive", "==", true)
        );
        const districtLeaderDocs = await getDocs(q);

        if (districtLeaderDocs.empty) {
            throw new Error("No se encontró un distrito activo para el líder");
        }

        const districtLeader = districtLeaderDocs.docs[0].data();
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
        const churchesRef = collection(db, "churches");
        if (editedIndex.value > -1 && editedItem.value.id) {
            // Actualizar iglesia existente
            const existingChurch = await getDoc(
                doc(db, "churches", editedItem.value.id)
            );
            if (existingChurch.exists()) {
                const existingData = existingChurch.data();
                await updateDoc(doc(db, "churches", editedItem.value.id), {
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
        churches.value.splice(index, 1);
        await saveToFirestore();
    }
};

const saveToFirestore = async () => {
    if (!authStore.user?.id || !currentReport.value?.id) return;

    try {
        const reportRef = doc(db, "ministerial_reports", currentReport.value.id);
        await updateDoc(reportRef, {
            churches: churches.value,
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Error al guardar los cambios");
    }
};

const viewHistory = (church: Church) => {
    selectedChurch.value = church;
    showHistory.value = true;
};

onMounted(async () => {
    await loadActivePeriod();
    await loadData();
    
    // Verificar si el distrito ya está confirmado para el período actual
    if (activePeriod.value && currentDistrict.value) {
        const confirmationQuery = query(
            collection(db, "district_confirmations"),
            where("districtId", "==", currentDistrict.value.id),
            where("periodId", "==", activePeriod.value.id)
        );
        const confirmationSnapshot = await getDocs(confirmationQuery);
        isConfirmed.value = !confirmationSnapshot.empty;
    }
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

// Función para confirmar datos de una iglesia
const confirmChurchData = async (churchId: string) => {
    try {
        if (!activePeriod.value) throw new Error("No hay período activo");

        // 1. Verificar datos ministeriales
        const church = churches.value.find((c) => c.id === churchId);
        if (!church?.ministerialData?.length) {
            throw new Error("No hay datos ministeriales para confirmar");
        }

        // 2. Guardar confirmación
        await addDoc(collection(db, "church_confirmations"), {
            churchId,
            periodId: activePeriod.value.id,
            districtId: currentDistrict.value.id,
            confirmedAt: Timestamp.now(),
            confirmedBy: authStore.user?.id,
            isConfirmed: true,
            ministerialData:
                church.ministerialData[church.ministerialData.length - 1],
        });

        await loadConfirmations();
        completionPercentage.value = calculateCompletionPercentage();
    } catch (error) {
        console.error("Error al confirmar datos:", error);
        alert("Error al confirmar los datos de la iglesia");
    }
};

// Desbloquear edición (solo admin)
const unlockChurchEditing = async (churchId: string) => {
    try {
        if (!activePeriod.value) return;

        const confirmationsRef = collection(db, "church_period_confirmations");
        const q = query(
            confirmationsRef,
            where("churchId", "==", churchId),
            where("periodId", "==", activePeriod.value.id)
        );

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const confirmationDoc = snapshot.docs[0];
            await updateDoc(
                doc(db, "church_period_confirmations", confirmationDoc.id),
                {
                    isLocked: false,
                    unlockedAt: Timestamp.now(),
                    unlockedBy: authStore.user?.id,
                }
            );
        }

        await loadConfirmations();
    } catch (error) {
        console.error("Error al desbloquear edición:", error);
        alert("Error al desbloquear la edición");
    }
};

const isChurchConfirmed = (churchId: string) => {
    return churchConfirmations.value.get(churchId)?.isConfirmed || false;
};

const loadConfirmations = async () => {
    if (!activePeriod.value) return;

    const confirmationsRef = collection(db, "church_confirmations");
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
        await addDoc(collection(db, "district_confirmations"), {
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
                sum + (church.ministerialData?.[0]?.sacramentsGraduates || 0), 0)
        });

        // Confirmar cada iglesia individualmente
        for (const church of churches.value) {
            await addDoc(collection(db, "church_confirmations"), {
                churchId: church.id,
                periodId: activePeriod.value.id,
                districtId: currentDistrict.value.id,
                confirmedAt: Timestamp.now(),
                confirmedBy: authStore.user.id,
                churchName: church.name,
                leaderName: church.leaderName,
                ministerialData: church.ministerialData[0]
            });
        }

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
