<template>
    <div>
        <NavigationBar />
    <VContainer>
            <h1>Datos de Iglesias del Distrito: 
                <span class="district-name">{{ districtName }}</span>
            </h1>

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
                                <td class="text-center">{{ church.totalTeachers }}</td>
                                <td class="text-center">{{ church.totalChildren }}</td>
                                <td class="text-center">{{ church.convertedChildren }}</td>
                                <td class="text-center">{{ church.memberChildren }}</td>
                                <td class="text-center">{{ church.baptizedChildren }}</td>
                                <td class="text-center">{{ church.consolidatedGraduates }}</td>
                                <td class="text-center">{{ church.sacramentsGraduates }}</td>
                                <td class="text-center">{{ church.rescueClubChildren }}</td>
                                <td class="text-center">{{ church.discipleshipGraduates }}</td>
                                <td class="text-center">{{ church.connection911Children }}</td>
                            <td class="text-center">
                                    <VIcon
                                        color="primary"
                                    icon="mdi-pencil"
                                    size="small"
                                        class="me-2 cursor-pointer"
                                        @click="editItem(church, index)"
                                    >
                                        <VTooltip activator="parent" location="top">Editar</VTooltip>
                                    </VIcon>
                                    <VIcon
                                        color="error"
                                        icon="mdi-delete"
                                    size="small"
                                        class="cursor-pointer"
                                        @click="deleteItem(church, index)"
                                    >
                                        <VTooltip activator="parent" location="top">Eliminar</VTooltip>
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
                            <VCol cols="6">
                                <div class="d-flex align-center mb-2">
                                    <VIcon color="primary" class="me-2">mdi-account-group</VIcon>
                                    <div>
                                        <div class="text-caption">Total Maestras</div>
                                        <div class="text-h6">{{ totals.totalTeachers }}</div>
                                    </div>
                                </div>
                            </VCol>
                            <VCol cols="6">
                                <div class="d-flex align-center mb-2">
                                    <VIcon color="info" class="me-2">mdi-account-child</VIcon>
                                    <div>
                                        <div class="text-caption">Total Niños</div>
                                        <div class="text-h6">{{ totals.totalChildren }}</div>
                                    </div>
                                </div>
                            </VCol>
                            <VCol cols="6">
                                <div class="d-flex align-center mb-2">
                                    <VIcon color="success" class="me-2">mdi-school</VIcon>
                                    <div>
                                        <div class="text-caption">Niños Convertidos</div>
                                        <div class="text-h6">{{ totals.convertedChildren }}</div>
                                    </div>
                                </div>
                            </VCol>
                            <VCol cols="6">
                                <div class="d-flex align-center mb-2">
                                    <VIcon color="warning" class="me-2">mdi-heart</VIcon>
                                    <div>
                                        <div class="text-caption">Niños Miembros</div>
                                        <div class="text-h6">{{ totals.memberChildren }}</div>
                                    </div>
                                </div>
                            </VCol>
                            <VCol cols="6">
                                <div class="d-flex align-center mb-2">
                                    <VIcon color="deep-purple" class="me-2">mdi-account-check</VIcon>
                                    <div>
                                        <div class="text-caption">Bautizados E.S.</div>
                                        <div class="text-h6">{{ totals.baptizedChildren }}</div>
                                    </div>
                                </div>
                            </VCol>
                            <VCol cols="6">
                                <div class="d-flex align-center mb-2">
                                    <VIcon color="red" class="me-2">mdi-fire</VIcon>
                                    <div>
                                        <div class="text-caption">Graduados Consolidado</div>
                                        <div class="text-h6">{{ totals.consolidatedGraduates }}</div>
                                    </div>
                                </div>
                            </VCol>
                            <VCol cols="6">
                                <div class="d-flex align-center mb-2">
                                    <VIcon color="teal" class="me-2">mdi-certificate</VIcon>
                                    <div>
                                        <div class="text-caption">Graduados Sacramentos</div>
                                        <div class="text-h6">{{ totals.sacramentsGraduates }}</div>
                                    </div>
                                </div>
                            </VCol>
                            <VCol cols="6">
                                <div class="d-flex align-center mb-2">
                                    <VIcon color="orange" class="me-2">mdi-lifebuoy</VIcon>
                                    <div>
                                        <div class="text-caption">Club Al Rescate</div>
                                        <div class="text-h6">{{ totals.rescueClubChildren }}</div>
                                    </div>
                                </div>
                            </VCol>
                            <VCol cols="6">
                                <div class="d-flex align-center mb-2">
                                    <VIcon color="blue-grey" class="me-2">mdi-school-outline</VIcon>
                                    <div>
                                        <div class="text-caption">Graduados Discipulado</div>
                                        <div class="text-h6">{{ totals.discipleshipGraduates }}</div>
                                    </div>
                                </div>
                            </VCol>
                            <VCol cols="6">
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
                                        <div class="text-h6">{{ church.totalTeachers }}</div>
                                    </div>
                    <div>
                                        <div class="text-caption">Total Niños</div>
                                        <div class="text-h6">{{ church.totalChildren }}</div>
                                    </div>
                                </div>
                                
                        <VBtn
                                    block
                                    variant="text"
                                    @click="toggleDetails(church.name)"
                                    class="mt-2"
                                >
                                    {{ showDetailsFor === church.name ? 'Ocultar Detalles' : 'Ver Detalles' }}
                                </VBtn>

                                <!-- Detalles expandibles -->
                                <VExpandTransition>
                                    <div v-if="showDetailsFor === church.name">
                                        <VDivider class="my-2"></VDivider>
                                        <div class="mt-2">
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Niños Convertidos</div>
                                                <div>{{ church.convertedChildren }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Niños Miembros</div>
                                                <div>{{ church.memberChildren }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Bautizados E.S.</div>
                                                <div>{{ church.baptizedChildren }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Graduados Consolidado</div>
                                                <div>{{ church.consolidatedGraduates }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Graduados Sacramentos</div>
                                                <div>{{ church.sacramentsGraduates }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Club Al Rescate</div>
                                                <div>{{ church.rescueClubChildren }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Graduados Discipulado</div>
                                                <div>{{ church.discipleshipGraduates }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Conexión 9.11</div>
                                                <div>{{ church.connection911Children }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </VExpandTransition>
                            </VCardText>

                            <VCardActions>
                                <VSpacer />
                                <VIcon
                                    color="primary"
                            icon="mdi-pencil"
                            size="small"
                                    class="me-2"
                                    @click="editItem(church, churches.indexOf(church))"
                                />
                                <VIcon
                                    color="error"
                                    icon="mdi-delete"
                            size="small"
                                    @click="deleteItem(church, churches.indexOf(church))"
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

            <!-- Modal para agregar/editar iglesia -->
            <ChurchFormDialog
                v-model="dialog"
                :edited-item="editedItem"
                :edited-index="editedIndex"
                @save="saveChurch"
                @close="closeDialog"
            />
    </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import NavigationBar from '../../components/NavigationBar.vue';
import type { ReportPeriod, MinisterialReport } from '../../types/MinisterialReport';
const ChurchFormDialog = defineAsyncComponent(() => import('../../components/ChurchFormDialog.vue'));

interface Church {
    name: string;
    leaderName: string;
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

const authStore = useAuthStore();
const districtName = ref('');
const userData = ref<any>(null);
const churches = ref<Church[]>([]);
const showDetailsFor = ref<string | null>(null);

const toggleDetails = (churchName: string) => {
    showDetailsFor.value = showDetailsFor.value === churchName ? null : churchName;
};

const totals = computed(() => {
    return {
        totalTeachers: churches.value.reduce((sum, church) => sum + Number(church.totalTeachers || 0), 0),
        totalChildren: churches.value.reduce((sum, church) => sum + Number(church.totalChildren || 0), 0),
        convertedChildren: churches.value.reduce((sum, church) => sum + Number(church.convertedChildren || 0), 0),
        memberChildren: churches.value.reduce((sum, church) => sum + Number(church.memberChildren || 0), 0),
        baptizedChildren: churches.value.reduce((sum, church) => sum + Number(church.baptizedChildren || 0), 0),
        consolidatedGraduates: churches.value.reduce((sum, church) => sum + Number(church.consolidatedGraduates || 0), 0),
        sacramentsGraduates: churches.value.reduce((sum, church) => sum + Number(church.sacramentsGraduates || 0), 0),
        rescueClubChildren: churches.value.reduce((sum, church) => sum + Number(church.rescueClubChildren || 0), 0),
        discipleshipGraduates: churches.value.reduce((sum, church) => sum + Number(church.discipleshipGraduates || 0), 0),
        connection911Children: churches.value.reduce((sum, church) => sum + Number(church.connection911Children || 0), 0)
    };
});

const activePeriod = ref<ReportPeriod | null>(null);
const currentReport = ref<MinisterialReport | null>(null);

const loadActivePeriod = async () => {
    const periodsRef = collection(db, "report_periods");
    const q = query(periodsRef, where("isActive", "==", true));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
        activePeriod.value = {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
        } as ReportPeriod;
    }
};

const loadData = async () => {
    if (!authStore.user?.id) return;

    try {
        // 1. Cargar datos del district_leaders para obtener el districtId
        const districtLeadersRef = collection(db, "district_leaders");
        const q = query(
            districtLeadersRef, 
            where("userId", "==", authStore.user.id),
            where("isActive", "==", true)
        );
        const districtLeaderDocs = await getDocs(q);
        
        if (!districtLeaderDocs.empty) {
            const districtLeader = districtLeaderDocs.docs[0].data();
            
            // 2. Cargar datos del distrito
            const districtDoc = await getDoc(doc(db, "districts", districtLeader.districtId));
            if (districtDoc.exists()) {
                const districtData = districtDoc.data();
                userData.value = {
                    areaNumber: districtData.areaNumber,
                    districtNumber: districtData.districtNumber,
                    location: districtData.location
                };
                districtName.value = `Área ${districtData.areaNumber} - Distrito ${districtData.districtNumber} - ${districtData.location}`;
            }
        }

        await loadActivePeriod();
        
        // Continuar con el resto de la carga de datos...
        if (activePeriod.value) {
            const reportsRef = collection(db, "ministerial_reports");
            const reportQuery = query(
                reportsRef, 
                where("userId", "==", authStore.user.id),
                where("reportPeriod", "==", activePeriod.value.id)
            );
            const snapshot = await getDocs(reportQuery);
            
            if (!snapshot.empty) {
                currentReport.value = {
                    id: snapshot.docs[0].id,
                    ...snapshot.docs[0].data()
                } as MinisterialReport;
                churches.value = currentReport.value.churches;
            }
        }
    } catch (error) {
        console.error("Error al cargar los datos:", error);
    }
};

const dialog = ref(false);
const editedIndex = ref(-1);
const editedItem = ref({
    name: '',
    leaderName: '',
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
});

const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'Nueva Iglesia' : 'Editar Iglesia'
});

const closeDialog = () => {
    dialog.value = false;
    editedIndex.value = -1;
    editedItem.value = {
        name: '',
        leaderName: '',
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
};

const saveChurch = async (formData: any) => {
    try {
        if (editedIndex.value > -1) {
            churches.value[editedIndex.value] = { ...formData };
        } else {
            churches.value.push({ ...formData });
        }
        await saveToFirestore();
        closeDialog();
    } catch (error) {
        console.error('Error al guardar:', error);
    }
};

const saveToFirestore = async () => {
    if (!authStore.user?.id) return;

    try {
        const leaderRef = doc(db, "leaders", authStore.user.id);
        await setDoc(leaderRef, { churches: churches.value }, { merge: true });
    } catch (error) {
        console.error("Error al guardar:", error);
    }
};

const editItem = (church: Church, index: number) => {
    editedIndex.value = index;
    editedItem.value = { ...church };
    dialog.value = true;
};

const deleteItem = async (church: Church, index: number) => {
    if (confirm('¿Estás seguro de eliminar esta iglesia?')) {
        churches.value.splice(index, 1);
        await saveToFirestore();
    }
};

onMounted(() => {
    loadData();
});
</script>
<style scoped>
.totals-card {
    position: sticky;
    bottom: 0;
    z-index: 2;
    background-color: white;
    box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
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
