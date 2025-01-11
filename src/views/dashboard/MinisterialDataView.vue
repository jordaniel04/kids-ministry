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
                                <th scope="col" class="text-center">Niños Ministrados</th>
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
                                <td class="text-center">{{ church.ministeredChildren }}</td>
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

            <!-- Tarjeta de Resumen de Totales -->
            <VCard class="mt-4">
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
                                    <div class="text-caption">Niños Ministrados</div>
                                    <div class="text-h6">{{ totals.ministeredChildren }}</div>
                                </div>
                            </div>
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                            <div class="d-flex align-center mb-2">
                                <VIcon color="warning" class="me-2">mdi-heart</VIcon>
                                <div>
                                    <div class="text-caption">Niños Convertidos</div>
                                    <div class="text-h6">{{ totals.convertedChildren }}</div>
                                </div>
                            </div>
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                            <div class="d-flex align-center mb-2">
                                <VIcon color="deep-purple" class="me-2">mdi-account-check</VIcon>
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
                                <VIcon color="teal" class="me-2">mdi-certificate</VIcon>
                                <div>
                                    <div class="text-caption">Graduados Consolidado</div>
                                    <div class="text-h6">{{ totals.consolidatedGraduates }}</div>
                                </div>
                            </div>
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                            <div class="d-flex align-center mb-2">
                                <VIcon color="indigo" class="me-2">mdi-book-open-variant</VIcon>
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
                                <VIcon color="blue-grey" class="me-2">mdi-school-outline</VIcon>
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
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import NavigationBar from '../../components/NavigationBar.vue';
const ChurchFormDialog = defineAsyncComponent(() => import('../../components/ChurchFormDialog.vue'));

interface Church {
    name: string;
    leaderName: string;
    totalTeachers: number;
    totalChildren: number;
    ministeredChildren: number;
    convertedChildren: number;
    memberChildren: number;
    baptizedChildren: number;
    consolidatedGraduates: number;
    sacramentsGraduates: number;
    rescueClubChildren: number;
    discipleshipGraduates: number;
    connection911Children: number;
}

const authStore = useAuthStore();
const districtName = ref('');
const churches = ref<Church[]>([]);

const totals = computed(() => {
    return {
        totalTeachers: churches.value.reduce((sum, church) => sum + Number(church.totalTeachers || 0), 0),
        totalChildren: churches.value.reduce((sum, church) => sum + Number(church.totalChildren || 0), 0),
        ministeredChildren: churches.value.reduce((sum, church) => sum + Number(church.ministeredChildren || 0), 0),
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

const loadData = async () => {
    if (!authStore.user?.id) return;

    try {
        // Primero cargar datos del usuario para obtener su distrito
        const userDoc = await getDoc(doc(db, "users", authStore.user.id));
        if (!userDoc.exists()) return;
        
        const userData = userDoc.data();
        districtName.value = userData.location || 'No especificado';

        // Luego cargar datos ministeriales
        const leaderRef = doc(db, "leaders", authStore.user.id);
        const leaderDoc = await getDoc(leaderRef);
        
        if (leaderDoc.exists()) {
            const data = leaderDoc.data();
            churches.value = data.churches || [];
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
    ministeredChildren: 0,
    convertedChildren: 0,
    memberChildren: 0,
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
    // Resetear el formulario
    editedItem.value = {
        name: '',
        leaderName: '',
        totalTeachers: 0,
        totalChildren: 0,
        ministeredChildren: 0,
        convertedChildren: 0,
        memberChildren: 0,
        baptizedChildren: 0,
        consolidatedGraduates: 0,
        sacramentsGraduates: 0,
        rescueClubChildren: 0,
        discipleshipGraduates: 0,
        connection911Children: 0
    };
};

const saveChurch = async () => {
    try {
        if (editedIndex.value > -1) {
            churches.value[editedIndex.value] = { ...editedItem.value };
        } else {
            churches.value.push({ ...editedItem.value });
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