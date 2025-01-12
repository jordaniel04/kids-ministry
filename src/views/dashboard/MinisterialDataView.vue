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
                                <td class="text-center">{{ getLatestMinisterialData(church).totalTeachers }}</td>
                                <td class="text-center">{{ getLatestMinisterialData(church).totalChildren }}</td>
                                <td class="text-center">{{ getLatestMinisterialData(church).convertedChildren }}</td>
                                <td class="text-center">{{ getLatestMinisterialData(church).memberChildren }}</td>
                                <td class="text-center">{{ getLatestMinisterialData(church).baptizedChildren }}</td>
                                <td class="text-center">{{ getLatestMinisterialData(church).consolidatedGraduates }}</td>
                                <td class="text-center">{{ getLatestMinisterialData(church).sacramentsGraduates }}</td>
                                <td class="text-center">{{ getLatestMinisterialData(church).rescueClubChildren }}</td>
                                <td class="text-center">{{ getLatestMinisterialData(church).discipleshipGraduates }}</td>
                                <td class="text-center">{{ getLatestMinisterialData(church).connection911Children }}</td>
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
                                    <VIcon
                                        color="info"
                                        icon="mdi-history"
                                        size="small"
                                        class="me-2 cursor-pointer"
                                        @click="viewHistory(church)"
                                    >
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
                                        <div class="text-h6">{{ getLatestMinisterialData(church).totalTeachers }}</div>
                                    </div>
                    <div>
                                        <div class="text-caption">Total Niños</div>
                                        <div class="text-h6">{{ getLatestMinisterialData(church).totalChildren }}</div>
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
                                                <div>{{ getLatestMinisterialData(church).convertedChildren }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Niños Miembros</div>
                                                <div>{{ getLatestMinisterialData(church).memberChildren }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Bautizados E.S.</div>
                                                <div>{{ getLatestMinisterialData(church).baptizedChildren }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Graduados Consolidado</div>
                                                <div>{{ getLatestMinisterialData(church).consolidatedGraduates }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Graduados Sacramentos</div>
                                                <div>{{ getLatestMinisterialData(church).sacramentsGraduates }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Club Al Rescate</div>
                                                <div>{{ getLatestMinisterialData(church).rescueClubChildren }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Graduados Discipulado</div>
                                                <div>{{ getLatestMinisterialData(church).discipleshipGraduates }}</div>
                                            </div>
                                            <div class="d-flex justify-space-between mb-2">
                                                <div class="text-caption">Conexión 9.11</div>
                                                <div>{{ getLatestMinisterialData(church).connection911Children }}</div>
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

            <ChurchHistoryDialog
                v-model="showHistory"
                :church="selectedChurch"
            />
    </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit, Timestamp, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import NavigationBar from '../../components/NavigationBar.vue';
import type { ReportPeriod, MinisterialReport } from '../../types/MinisterialReport';
import type { Church } from '../../types/Church';
import type { MinisterialData } from '../../types/MinisterialData';
const ChurchFormDialog = defineAsyncComponent(() => import('../../components/ChurchFormDialog.vue'));
const ChurchHistoryDialog = defineAsyncComponent(() => import('../../components/ChurchHistoryDialog.vue'));

const authStore = useAuthStore();
const districtName = ref('');
const userData = ref<MinisterialData | null>(null);
const churches = ref<Church[]>([]);
const showDetailsFor = ref<string | null>(null);
const summary = ref<any>(null);

const toggleDetails = (churchName: string) => {
    showDetailsFor.value = showDetailsFor.value === churchName ? null : churchName;
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
            connection911Children: 0,
            updatedAt: Timestamp.now(),
            reportPeriodId: undefined
        };
    }
    
    // Ordenar por fecha y obtener el más reciente
    return church.ministerialData.sort((a, b) => 
        b.updatedAt.seconds - a.updatedAt.seconds
    )[0];
};

const totals = computed(() => {
    return churches.value.reduce((sum, church) => {
        const data = getLatestMinisterialData(church);
        return {
            totalTeachers: sum.totalTeachers + Number(data.totalTeachers || 0),
            totalChildren: sum.totalChildren + Number(data.totalChildren || 0),
            convertedChildren: sum.convertedChildren + Number(data.convertedChildren || 0),
            memberChildren: sum.memberChildren + Number(data.memberChildren || 0),
            baptizedChildren: sum.baptizedChildren + Number(data.baptizedChildren || 0),
            consolidatedGraduates: sum.consolidatedGraduates + Number(data.consolidatedGraduates || 0),
            sacramentsGraduates: sum.sacramentsGraduates + Number(data.sacramentsGraduates || 0),
            rescueClubChildren: sum.rescueClubChildren + Number(data.rescueClubChildren || 0),
            discipleshipGraduates: sum.discipleshipGraduates + Number(data.discipleshipGraduates || 0),
            connection911Children: sum.connection911Children + Number(data.connection911Children || 0)
        };
    }, {
        totalTeachers: 0,
        totalChildren: 0,
        convertedChildren: 0,
        memberChildren: 0,
        baptizedChildren: 0,
        consolidatedGraduates: 0,
        sacramentsGraduates: 0,
        rescueClubChildren: 0,
        discipleshipGraduates: 0,
        connection911Children: 0
    });
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
    try {
        // 1. Cargar el período activo
        const periodsRef = collection(db, "report_periods");
        const periodQuery = query(periodsRef, where("isActive", "==", true));
        const periodSnapshot = await getDocs(periodQuery);
        
        if (!periodSnapshot.empty) {
            activePeriod.value = {
                id: periodSnapshot.docs[0].id,
                ...periodSnapshot.docs[0].data()
            } as ReportPeriod;
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
            const districtDoc = await getDoc(doc(db, "districts", districtLeader.districtId));
            if (districtDoc.exists()) {
                const districtData = districtDoc.data();
                districtName.value = districtData.location; // Aquí establecemos el nombre del distrito
            }

            // 3. Cargar las iglesias del distrito
            const churchesRef = collection(db, "churches");
            const churchesQuery = query(
                churchesRef,
                where("districtId", "==", districtLeader.districtId),
                where("isActive", "==", true)
            );
            
            const churchesSnapshot = await getDocs(churchesQuery);
            churches.value = churchesSnapshot.docs.map(doc => {
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
                    ministerialData: data.ministerialData || []
                } as Church;
            });
        }
    } catch (error) {
        console.error("Error al cargar datos:", error);
    }
};

const dialog = ref(false);
const editedIndex = ref(-1);
const editedItem = ref<Church>({
    id: '',
    name: '',
    leaderName: '',
    districtId: '',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: '',
    updatedBy: '',
    isActive: true,
    ministerialData: []
});

const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'Nueva Iglesia' : 'Editar Iglesia'
});

const closeDialog = () => {
    dialog.value = false;
    editedIndex.value = -1;
    editedItem.value = {
        id: '',
        name: '',
        leaderName: '',
        districtId: '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: '',
        updatedBy: '',
        isActive: true,
        ministerialData: []
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
            ministerialData: [{
                ...churchData.ministerialData,
                updatedAt: now,
                reportPeriodId: activePeriod.value?.id || null
            }]
        };

        // 3. Guardar en Firestore
        const churchesRef = collection(db, "churches");
        if (editedIndex.value > -1 && editedItem.value.id) {
            // Actualizar iglesia existente
            const existingChurch = await getDoc(doc(db, "churches", editedItem.value.id));
            if (existingChurch.exists()) {
                const existingData = existingChurch.data();
                await updateDoc(doc(db, "churches", editedItem.value.id), {
                    name: church.name,
                    leaderName: church.leaderName,
                    ministerialData: [...(existingData.ministerialData || []), church.ministerialData![0]],
                    updatedAt: now,
                    updatedBy: authStore.user?.id
                });
            }
        } else {
            // Crear nueva iglesia
            await addDoc(churchesRef, {
                ...church,
                createdAt: now,
                updatedAt: now,
                createdBy: authStore.user?.id,
                updatedBy: authStore.user?.id
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

const editItem = (church: Church, index: number) => {
    editedIndex.value = index;
    const ministerialData = getLatestMinisterialData(church);
    editedItem.value = { 
        id: church.id,
        name: church.name,
        leaderName: church.leaderName,
        districtId: church.districtId,
        createdAt: church.createdAt,
        updatedAt: Timestamp.now(),
        createdBy: church.createdBy,
        updatedBy: authStore.user?.id || '',
        isActive: true,
        ministerialData: [{
            totalTeachers: ministerialData.totalTeachers,
            totalChildren: ministerialData.totalChildren,
            convertedChildren: ministerialData.convertedChildren,
            memberChildren: ministerialData.memberChildren,
            nonRepentantChildren: ministerialData.nonRepentantChildren,
            baptizedChildren: ministerialData.baptizedChildren,
            consolidatedGraduates: ministerialData.consolidatedGraduates,
            sacramentsGraduates: ministerialData.sacramentsGraduates,
            rescueClubChildren: ministerialData.rescueClubChildren,
            discipleshipGraduates: ministerialData.discipleshipGraduates,
            connection911Children: ministerialData.connection911Children,
            updatedAt: Timestamp.now(),
            reportPeriodId: ministerialData.reportPeriodId
        }]
    };
    dialog.value = true;
};

const deleteItem = async (church: Church, index: number) => {
    if (confirm('¿Estás seguro de eliminar esta iglesia?')) {
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
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Error al guardar los cambios");
    }
};

const showHistory = ref(false);
const selectedChurch = ref<Church | undefined>();

const viewHistory = (church: Church) => {
    selectedChurch.value = church;
    showHistory.value = true;
};

onMounted(async () => {
    await loadActivePeriod();
    await loadData();
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
