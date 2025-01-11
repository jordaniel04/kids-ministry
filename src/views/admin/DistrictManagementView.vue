<template>
    <div>
        <NavigationBar />
        <VContainer>
            <h1>Gestión de Distritos</h1>
            
            <VCard class="mb-4">
                <VCardTitle class="d-flex justify-space-between align-center">
                    <span>Lista de Distritos</span>
                    <VBtn
                        color="primary"
                        prepend-icon="mdi-plus"
                        @click="dialog = true"
                    >
                        Nuevo Distrito
                    </VBtn>
                </VCardTitle>
                
                <VCardText>
                    <VDataTable
                        :headers="headers"
                        :items="districts"
                        :loading="loading"
                        class="elevation-1"
                        :items-per-page="10"
                    >
                        <template #[`item.actions`]="{ item }">
                            <VIcon
                                size="small"
                                class="me-2 cursor-pointer"
                                @click="editDistrict(item, districts.indexOf(item))"
                            >
                                mdi-pencil
                            </VIcon>
                            <VIcon
                                size="small"
                                class="cursor-pointer"
                                @click="deleteDistrict(item.id)"
                            >
                                mdi-delete
                            </VIcon>
                        </template>
                        <template #[`item.areaNumber`]="{ item }">
                            Área {{ item.areaNumber }}
                        </template>
                        <template #[`item.districtNumber`]="{ item }">
                            Distrito {{ item.districtNumber }}
                        </template>
                        <template #[`item.createdAt`]="{ item }">
                            {{ formatDate(item.createdAt) }}
                        </template>
                    </VDataTable>
                </VCardText>
            </VCard>

            <DistrictFormDialog
                v-model="dialog"
                :edited-item="editedItem"
                :edited-index="editedIndex"
                @save="saveDistrict"
                @close="closeDialog"
            />
        </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuthStore } from '../../stores/auth';
import NavigationBar from '../../components/NavigationBar.vue';
import DistrictFormDialog from '../../components/DistrictFormDialog.vue';
import type { District } from '../../types/District';

// Función para formatear la fecha
const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return '-';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const authStore = useAuthStore();
const districts = ref<District[]>([]);
const dialog = ref(false);
const editedIndex = ref(-1);
const editedItem = ref<District>({
    id: '',
    areaNumber: 1,
    districtNumber: 1,
    location: ''
});

// Generar arrays para los selectores
const areaNumbers = Array.from({ length: 11 }, (_, i) => i + 1);
const districtNumbers = Array.from({ length: 10 }, (_, i) => i + 1);

const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'Nuevo Distrito' : 'Editar Distrito'
});

const loadDistricts = async () => {
    const querySnapshot = await getDocs(collection(db, "districts"));
    districts.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as District));
};

const saveDistrict = async () => {
    try {
        const currentUser = authStore.user;
        if (!currentUser?.id) throw new Error("Usuario no autenticado");

        const now = Timestamp.now();
        
        if (editedIndex.value > -1) {
            // Actualizar distrito existente
            const districtRef = doc(db, "districts", editedItem.value.id);
            await updateDoc(districtRef, {
                ...editedItem.value,
                updatedAt: now,
                updatedBy: currentUser.id
            });
        } else {
            // Crear nuevo distrito
            const districtsRef = collection(db, "districts");
            await addDoc(districtsRef, {
                areaNumber: editedItem.value.areaNumber,
                districtNumber: editedItem.value.districtNumber,
                location: editedItem.value.location,
                createdAt: now,
                updatedAt: now,
                createdBy: currentUser.id,
                updatedBy: currentUser.id
            });
        }

        await loadDistricts();
        closeDialog();
    } catch (error) {
        console.error('Error al guardar distrito:', error);
        alert('Error al guardar el distrito');
    }
};

const deleteDistrict = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este distrito?')) {
        try {
            await deleteDoc(doc(db, "districts", id));
            await loadDistricts();
        } catch (error) {
            console.error('Error al eliminar distrito:', error);
            alert('Error al eliminar el distrito');
        }
    }
};

const editDistrict = (district: District, index: number) => {
    editedIndex.value = index;
    editedItem.value = { ...district };
    dialog.value = true;
};

const closeDialog = () => {
    dialog.value = false;
    editedIndex.value = -1;
    editedItem.value = {
        id: '',
        areaNumber: 1,
        districtNumber: 1,
        location: ''
    };
};

const loading = ref(false);

const headers = [
    { title: 'Área', key: 'areaNumber', sortable: true },
    { title: 'Distrito', key: 'districtNumber', sortable: true },
    { title: 'Lugar', key: 'location', sortable: true },
    { title: 'Fecha de Creación', key: 'createdAt', sortable: true },
    { title: 'Acciones', key: 'actions', sortable: false }
];

// Cargar distritos al montar el componente
onMounted(() => {
    loadDistricts();
});
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}
</style> 