<template>
    <div>
        <NavigationBar />
        <VContainer>
            <h1>Gestión de Reportes de Iglesias</h1>

            <!-- Filtros -->
            <VCard class="mb-4">
                <VCardText>
                    <VRow>
                        <VCol cols="12" sm="4">
                            <VSelect
                                v-model="selectedPeriod"
                                :items="periods"
                                label="Período"
                                item-title="name"
                                item-value="id"
                                @update:model-value="loadChurchConfirmations"
                            />
                        </VCol>
                        <VCol cols="12" sm="4">
                            <VSelect
                                v-model="selectedDistrict"
                                :items="districts"
                                label="Distrito"
                                item-title="location"
                                item-value="id"
                                @update:model-value="loadChurchConfirmations"
                            />
                        </VCol>
                    </VRow>
                </VCardText>
            </VCard>

            <!-- Tabla de Iglesias y sus Estados -->
            <VCard>
                <VCardText>
                    <VDataTable
                        :headers="headers"
                        :items="churchConfirmations"
                        :loading="loading"
                    >
                        <template #[`item.status`]="{ item }">
                            <VChip
                                :color="item.isLocked ? 'success' : 'warning'"
                                :text="item.isLocked ? 'Confirmado' : 'Pendiente'"
                            />
                        </template>

                        <template #[`item.actions`]="{ item }">
                            <VBtn
                                v-if="item.isLocked"
                                color="primary"
                                size="small"
                                @click="unlockChurchEditing(item)"
                            >
                                Desbloquear Edición
                            </VBtn>
                        </template>
                    </VDataTable>
                </VCardText>
            </VCard>
        </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import NavigationBar from '../../components/NavigationBar.vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const loading = ref(false);
const periods = ref([]);
const districts = ref([]);
const selectedPeriod = ref('');
const selectedDistrict = ref('');
const churchConfirmations = ref([]);

const headers = [
    { title: 'Iglesia', key: 'churchName' },
    { title: 'Distrito', key: 'districtName' },
    { title: 'Última Actualización', key: 'updatedAt' },
    { title: 'Estado', key: 'status' },
    { title: 'Confirmado Por', key: 'confirmedBy' },
    { title: 'Acciones', key: 'actions' }
];

const loadChurchConfirmations = async () => {
    if (!selectedPeriod.value || !selectedDistrict.value) return;
    
    loading.value = true;
    try {
        const confirmationsRef = collection(db, "church_period_confirmations");
        const q = query(
            confirmationsRef,
            where("periodId", "==", selectedPeriod.value),
            where("districtId", "==", selectedDistrict.value)
        );
        
        const snapshot = await getDocs(q);
        churchConfirmations.value = await Promise.all(
            snapshot.docs.map(async doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Formatear datos para la tabla
                };
            })
        );
    } catch (error) {
        console.error("Error al cargar confirmaciones:", error);
        alert("Error al cargar los datos");
    } finally {
        loading.value = false;
    }
};

const unlockChurchEditing = async (item: any) => {
    try {
        await updateDoc(doc(db, "church_period_confirmations", item.id), {
            isLocked: false,
            unlockedAt: new Date(),
            unlockedBy: authStore.user?.id
        });
        
        await loadChurchConfirmations();
    } catch (error) {
        console.error("Error al desbloquear edición:", error);
        alert("Error al desbloquear la edición");
    }
};

// Cargar períodos y distritos al montar el componente
onMounted(async () => {
    // Cargar períodos
    const periodsSnapshot = await getDocs(collection(db, "report_periods"));
    periods.value = periodsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
    }));

    // Cargar distritos
    const districtsSnapshot = await getDocs(collection(db, "districts"));
    districts.value = districtsSnapshot.docs.map(doc => ({
        id: doc.id,
        location: doc.data().location
    }));
});
</script> 