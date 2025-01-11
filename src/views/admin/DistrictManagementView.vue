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
                    <!-- Buscador -->
                    <VTextField
                        v-model="search"
                        prepend-icon="mdi-magnify"
                        label="Buscar distrito"
                        single-line
                        hide-details
                        class="mb-4"
                    ></VTextField>

                    <VDataTable
                        :headers="headers"
                        :items="formattedDistricts"
                        :loading="loading"
                        :search="search"
                        class="elevation-1"
                        :items-per-page="10"
                    >
                        <template #[`item.actions`]="{ item }">
                            <VIcon
                                size="small"
                                class="me-2 cursor-pointer"
                                @click="editDistrict(item.id)"
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
    location: '',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
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

const editDistrict = (id: string) => {
    const district = districts.value.find(d => d.id === id);
    if (district) {
        editedIndex.value = districts.value.findIndex(d => d.id === id);
        editedItem.value = { ...district };
        dialog.value = true;
    }
};

const closeDialog = () => {
    dialog.value = false;
    editedIndex.value = -1;
    editedItem.value = {
        id: '',
        areaNumber: 1,
        districtNumber: 1,
        location: '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    };
};

const loading = ref(false);

// Computed property para formatear los distritos
const formattedDistricts = computed(() => {
    return districts.value.map(district => ({
        ...district,
        areaNumber: `Área ${district.areaNumber}`,
        districtNumber: `Distrito ${district.districtNumber}`,
        createdAt: formatDate(district.createdAt)
    }));
});

// Modificamos los headers para usar directamente los valores formateados
const headers = [
    { title: 'Área', key: 'areaNumber', sortable: true },
    { title: 'Distrito', key: 'districtNumber', sortable: true },
    { title: 'Lugar', key: 'location', sortable: true },
    { title: 'Fecha de Creación', key: 'createdAt', sortable: true },
    { title: 'Acciones', key: 'actions', sortable: false }
];

// Agregar ref para el buscador
const search = ref('');

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