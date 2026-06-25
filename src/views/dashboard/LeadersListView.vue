<template>
    <div>
        <NavigationBar />
        <VContainer>
            <h1>Listado de Líderes</h1>
            
            <VCard class="mb-4">
                <VCardTitle class="d-flex justify-space-between align-center">
                    <span>Información de Líderes</span>
                    <VBtn
                        color="success"
                        prepend-icon="mdi-file-pdf-box"
                        @click="exportToPDF"
                        :loading="exporting"
                    >
                        Exportar PDF
                    </VBtn>
                </VCardTitle>
                
                <VCardText>
                    <!-- Buscador -->
                    <VTextField
                        v-model="search"
                        prepend-icon="mdi-magnify"
                        label="Buscar líder"
                        single-line
                        hide-details
                        class="mb-4"
                    ></VTextField>

                    <!-- Vista Desktop -->
                    <VDataTable
                        v-if="$vuetify.display.mdAndUp"
                        :headers="headers"
                        :items="filteredLeaders"
                        :loading="loading"
                        :search="search"
                        item-key="id"
                        class="elevation-1"
                    >
                        <template #[`item.personalData.birthDate`]="{ item }">
                            {{ formatDate(item.personalData?.birthDate) }}
                        </template>
                        <template #[`item.personalData.maritalStatus`]="{ item }">
                            <VChip :color="getMaritalStatusColor(item.personalData?.maritalStatus)">
                                {{ item.personalData?.maritalStatus || 'No especificado' }}
                            </VChip>
                        </template>
                        <template #[`item.district.location`]="{ item }">
                            <span :class="item.hasPendingData ? 'text-deep-orange font-weight-bold' : ''">
                                {{ item.district?.location || 'Sin asignar' }}
                            </span>
                        </template>
                        <template #[`item.personalData.firstName`]="{ item }">
                            <span :class="item.hasPendingData ? 'text-deep-orange' : ''">
                                {{ item.hasPendingData ? '⚠ Pendiente de actualización' : item.personalData?.firstName }}
                            </span>
                        </template>
                        <template #[`item.personalData.lastName`]="{ item }">
                            <span :class="item.hasPendingData ? 'text-deep-orange' : ''">
                                {{ item.hasPendingData ? '—' : item.personalData?.lastName }}
                            </span>
                        </template>
                        <template #[`item.actions`]="{ item }">
                            <VIcon
                                color="info"
                                icon="mdi-eye"
                                size="small"
                                class="me-2 cursor-pointer"
                                @click="viewLeaderDetails(item)"
                            >
                                <VTooltip activator="parent" location="top">Ver Detalles</VTooltip>
                            </VIcon>
                            <VIcon
                                color="warning"
                                icon="mdi-account-switch"
                                size="small"
                                class="cursor-pointer"
                                @click="openChangeLeaderDialog(item)"
                            >
                                <VTooltip activator="parent" location="top">Cambiar Líder</VTooltip>
                            </VIcon>
                        </template>
                    </VDataTable>

                    <!-- Vista Móvil -->
                    <VRow v-else>
                        <VCol v-for="leader in filteredLeaders" :key="leader.id" cols="12">
                            <VCard class="mb-3" :style="leader.hasPendingData ? { borderLeft: '4px solid #F4511E' } : {}">
                                <VCardTitle :class="leader.hasPendingData ? 'text-deep-orange' : ''">
                                    {{ leader.hasPendingData ? '⚠ Pendiente de actualización' : `${leader.personalData?.firstName} ${leader.personalData?.lastName}` }}
                                </VCardTitle>
                                <VCardText>
                                    <div class="mb-2">
                                        <strong>Distrito:</strong>
                                        <span :class="leader.hasPendingData ? 'text-deep-orange font-weight-bold' : ''">
                                            {{ leader.district?.location || 'Sin asignar' }}
                                        </span>
                                    </div>
                                    <div class="mb-2" v-if="!leader.hasPendingData">
                                        <strong>Teléfono:</strong> {{ leader.personalData?.phoneNumber || 'No especificado' }}
                                    </div>
                                </VCardText>
                                <VCardActions>
                                    <VSpacer />
                                    <VBtn color="warning" variant="text" @click="openChangeLeaderDialog(leader)">
                                        Cambiar Líder
                                    </VBtn>
                                    <VBtn color="info" variant="text" @click="viewLeaderDetails(leader)">
                                        Ver Detalles
                                    </VBtn>
                                </VCardActions>
                            </VCard>
                        </VCol>
                    </VRow>
                </VCardText>
            </VCard>
        </VContainer>

        <!-- Diálogo Cambiar Líder -->
        <VDialog v-model="changeLeaderDialog" max-width="450px">
            <VCard>
                <VCardTitle class="d-flex align-center gap-2 pt-4">
                    <VIcon color="warning" icon="mdi-account-switch" />
                    Cambiar Líder
                </VCardTitle>
                <VCardText>
                    <VAlert type="warning" variant="tonal" class="mb-4">
                        Esta acción borrará los datos personales del líder actual. El nuevo líder deberá ingresar sus propios datos al iniciar sesión.
                    </VAlert>
                    <div class="text-body-2 mb-1"><strong>Distrito:</strong> {{ changeLeaderTarget?.district?.location ?? '—' }}</div>
                    <div class="text-body-2"><strong>Líder actual:</strong> {{ previousLeaderName || '(Sin datos registrados)' }}</div>
                </VCardText>
                <VCardActions>
                    <VSpacer />
                    <VBtn variant="text" @click="changeLeaderDialog = false">Cancelar</VBtn>
                    <VBtn color="warning" variant="tonal" :loading="changingLeader" @click="changeLeader">
                        Confirmar Cambio
                    </VBtn>
                </VCardActions>
            </VCard>
        </VDialog>

        <!-- Diálogo de detalles del líder -->
        <VDialog v-model="detailsDialog" max-width="600px">
            <VCard v-if="selectedLeader">
                <VCardTitle>
                    <span class="text-h5">Detalles del Líder</span>
                </VCardTitle>
                <VCardText>
                    <VContainer>
                        <VRow>
                            <VCol cols="12" sm="6">
                                <div class="mb-3">
                                    <strong>Nombre Completo:</strong><br>
                                    {{ selectedLeader.personalData?.firstName }} {{ selectedLeader.personalData?.lastName }}
                                </div>
                            </VCol>
                            <VCol cols="12" sm="6">
                                <div class="mb-3">
                                    <strong>Email:</strong><br>
                                    {{ selectedLeader.email }}
                                </div>
                            </VCol>
                            <VCol cols="12" sm="6">
                                <div class="mb-3">
                                    <strong>Teléfono:</strong><br>
                                    {{ selectedLeader.personalData?.phoneNumber || 'No especificado' }}
                                </div>
                            </VCol>
                            <VCol cols="12" sm="6">
                                <div class="mb-3">
                                    <strong>Fecha de Nacimiento:</strong><br>
                                    {{ formatDate(selectedLeader.personalData?.birthDate) }}
                                </div>
                            </VCol>
                            <VCol cols="12" sm="6">
                                <div class="mb-3">
                                    <strong>Estado Civil:</strong><br>
                                    <VChip :color="getMaritalStatusColor(selectedLeader.personalData?.maritalStatus)">
                                        {{ selectedLeader.personalData?.maritalStatus || 'No especificado' }}
                                    </VChip>
                                </div>
                            </VCol>
                            <VCol cols="12" sm="6">
                                <div class="mb-3">
                                    <strong>Distrito:</strong><br>
                                    {{ selectedLeader.district?.location || 'Sin asignar' }}
                                </div>
                            </VCol>
                            <VCol cols="12" v-if="selectedLeader.personalData?.address">
                                <div class="mb-3">
                                    <strong>Dirección:</strong><br>
                                    {{ selectedLeader.personalData.address }}
                                </div>
                            </VCol>
                        </VRow>
                    </VContainer>
                </VCardText>
                <VCardActions>
                    <VSpacer />
                    <VBtn color="primary" variant="text" @click="detailsDialog = false">
                        Cerrar
                    </VBtn>
                </VCardActions>
            </VCard>
        </VDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { db } from "../../firebase/config";
import { collection, getDocs, query, where, doc, getDoc, updateDoc, writeBatch, deleteField, Timestamp } from "firebase/firestore";
import NavigationBar from '../../components/NavigationBar.vue';
import { useAuthStore } from '../../stores/auth';
import { COLLECTIONS } from '@/constants';

const authStore = useAuthStore();

interface Leader {
    id: string;
    email: string;
    role: string;
    hasPendingData: boolean;
    personalData?: {
        firstName?: string;
        lastName?: string;
        birthDate?: any;
        phoneNumber?: string;
        maritalStatus?: string;
        address?: string;
    };
    district?: {
        id: string;
        location: string;
        areaNumber: number;
        districtNumber: number;
    };
}

const leaders = ref<Leader[]>([]);
const loading = ref(true);
const search = ref("");
const detailsDialog = ref(false);
const selectedLeader = ref<Leader | null>(null);
const exporting = ref(false);

const headers = [
    { title: "Distrito", key: "district.location", sortable: true },
    { title: "Nombre", key: "personalData.firstName", sortable: true },
    { title: "Apellido", key: "personalData.lastName", sortable: true },
    { title: "Teléfono", key: "personalData.phoneNumber", sortable: true },
    { title: "Acciones", key: "actions", sortable: false }
];

const filteredLeaders = computed(() => {
    if (!leaders.value) return [];
    
    return leaders.value.filter(leader => {
        const searchTerm = search.value.toLowerCase();
        return (
            leader?.email?.toLowerCase().includes(searchTerm) ||
            leader?.personalData?.firstName?.toLowerCase().includes(searchTerm) ||
            leader?.personalData?.lastName?.toLowerCase().includes(searchTerm) ||
            leader?.district?.location?.toLowerCase().includes(searchTerm) ||
            false
        );
    });
});

const loadLeaders = async () => {
    try {
        // 1. Obtener todos los usuarios con rol 'lider'
        const usersQuery = query(
            collection(db, "users"),
            where("role", "==", "lider")
        );
        const usersSnapshot = await getDocs(usersQuery);
        
        const userIds = usersSnapshot.docs.map(d => d.id);

        // 2. Cargar leaders, district_leaders activos y todos los distritos en paralelo
        const [leadersSnap, districtLeadersSnap, districtsSnap] = await Promise.all([
            Promise.all(userIds.map(id => getDoc(doc(db, "leaders", id)))),
            getDocs(query(
                collection(db, "district_leaders"),
                where("isActive", "==", true)
            )),
            getDocs(collection(db, "districts"))
        ]);

        // Indexar en Maps para O(1) lookup
        const personalDataMap = new Map(
            leadersSnap.filter(d => d.exists()).map(d => [d.id, d.data().personalData || {}])
        );
        const districtMap = new Map(
            districtsSnap.docs.map(d => [d.id, d.data()])
        );
        // userId -> districtId
        const userDistrictMap = new Map(
            districtLeadersSnap.docs.map(d => [d.data().userId, d.data().districtId])
        );

        const leadersData = usersSnapshot.docs.map(userDoc => {
            const userData = userDoc.data();
            const districtId = userDistrictMap.get(userDoc.id);
            const districtData = districtId ? districtMap.get(districtId) : null;
            const pd = personalDataMap.get(userDoc.id);
            const hasPendingData = !pd?.firstName || !pd?.lastName;
            return {
                id: userDoc.id,
                email: userData.email,
                role: userData.role,
                hasPendingData,
                personalData: pd ?? {},
                district: districtData ? {
                    id: districtId as string,
                    location: districtData.location,
                    areaNumber: districtData.areaNumber,
                    districtNumber: districtData.districtNumber
                } : null
            };
        });

        // Ordenar alfabéticamente por distrito
        leaders.value = (leadersData as Leader[]).sort((a, b) =>
            (a.district?.location || '').localeCompare(b.district?.location || '')
        );
    } catch (error) {
        console.error("Error al obtener líderes:", error);
    } finally {
        loading.value = false;
    }
};

const formatDate = (date: any) => {
    if (!date) return 'No especificado';
    
    try {
        // Si es un Timestamp de Firestore
        if (date.toDate) {
            return date.toDate().toLocaleDateString('es-ES');
        }
        // Si es una fecha normal
        if (date instanceof Date) {
            return date.toLocaleDateString('es-ES');
        }
        // Si es un string
        if (typeof date === 'string') {
            return new Date(date).toLocaleDateString('es-ES');
        }
        return 'Formato inválido';
    } catch (error) {
        return 'Formato inválido';
    }
};

const getMaritalStatusColor = (status: string | undefined) => {
    switch (status) {
        case 'Soltero':
        case 'Soltera':
            return 'blue';
        case 'Casado':
        case 'Casada':
            return 'green';
        case 'Divorciado':
        case 'Divorciada':
            return 'orange';
        case 'Viudo':
        case 'Viuda':
            return 'purple';
        default:
            return 'grey';
    }
};

const viewLeaderDetails = (leader: Leader) => {
    selectedLeader.value = leader;
    detailsDialog.value = true;
};

const exportToPDF = async () => {
    exporting.value = true;
    try {
        const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
            import('jspdf'),
            import('jspdf-autotable')
        ]);
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString();

        // Título del documento
        doc.setFontSize(18);
        doc.text("Listado de Líderes", 14, 15);
        doc.setFontSize(10);
        doc.text(`Fecha de generación: ${currentDate}`, 14, 22);

        // Definir columnas
        const bodyColumns = [
            { header: 'Distrito', dataKey: 'district' },
            { header: 'Nombre', dataKey: 'firstName' },
            { header: 'Apellido', dataKey: 'lastName' },
            { header: 'Teléfono', dataKey: 'phone' },
            { header: 'Fecha Nacimiento', dataKey: 'birthDate' }
        ];

        // Preparar filas
        const rows = filteredLeaders.value.map(leader => ({
            district: leader.district?.location || 'Sin asignar',
            firstName: leader.personalData?.firstName || '',
            lastName: leader.personalData?.lastName || '',
            phone: leader.personalData?.phoneNumber || 'No especificado',
            birthDate: formatDate(leader.personalData?.birthDate)
        }));

        // Generar tabla PDF
        autoTable(doc, {
            head: [bodyColumns.map(c => c.header)],
            body: rows.map(r => bodyColumns.map(c => (r as any)[c.dataKey])),
            startY: 28,
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [63, 81, 181] }, // Indigo primario
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        doc.save('listado_lideres.pdf');
    } catch (error) {
        console.error('Error al exportar PDF:', error);
        alert('Error al generar el PDF de líderes');
    } finally {
        exporting.value = false;
    }
};

const changeLeaderDialog = ref(false);
const changingLeader = ref(false);
const changeLeaderTarget = ref<Leader | null>(null);
const previousLeaderName = ref('');

const openChangeLeaderDialog = async (leader: Leader) => {
    changeLeaderTarget.value = leader;
    previousLeaderName.value = [leader.personalData?.firstName, leader.personalData?.lastName]
        .filter(Boolean).join(' ').trim();
    changeLeaderDialog.value = true;
};

const changeLeader = async () => {
    if (!changeLeaderTarget.value) return;
    changingLeader.value = true;
    try {
        const now = Timestamp.now();
        const batch = writeBatch(db);

        const dlSnap = await getDocs(query(
            collection(db, COLLECTIONS.DISTRICT_LEADERS),
            where('userId', '==', changeLeaderTarget.value.id),
            where('isActive', '==', true)
        ));
        if (!dlSnap.empty) {
            batch.update(dlSnap.docs[0].ref, {
                previousLeaderName: previousLeaderName.value || '(Sin datos registrados)',
                updatedAt: now,
                updatedBy: authStore.user?.id
            });
        }

        batch.update(doc(db, COLLECTIONS.LEADERS, changeLeaderTarget.value.id), {
            personalData: deleteField(),
            ministerialData: deleteField(),
            secondLeader: deleteField()
        });

        batch.update(doc(db, COLLECTIONS.USERS, changeLeaderTarget.value.id), {
            personalDataComplete: deleteField(),
            updatedAt: now,
            updatedBy: authStore.user?.id
        });

        await batch.commit();
        changeLeaderDialog.value = false;
        changeLeaderTarget.value = null;
        previousLeaderName.value = '';
        await loadLeaders();
    } catch (e) {
        console.error('Error al cambiar líder:', e);
        alert('Error al cambiar líder. Intenta de nuevo.');
    } finally {
        changingLeader.value = false;
    }
};

onMounted(() => {
    loadLeaders();
});
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}
</style> 