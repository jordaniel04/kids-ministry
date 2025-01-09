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
                <VTable>
                    <thead>
                        <tr>
                            <th scope="col">Nombre del Distrito</th>
                            <th scope="col" class="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(district, index) in districts" :key="index">
                            <td>{{ district.name }}</td>
                            <td class="text-center">
                                <VIcon
                                    color="primary"
                                    icon="mdi-pencil"
                                    size="small"
                                    class="me-2 cursor-pointer"
                                    @click="editDistrict(district, index)"
                                >
                                    <VTooltip activator="parent" location="top">Editar</VTooltip>
                                </VIcon>
                                <VIcon
                                    color="error"
                                    icon="mdi-delete"
                                    size="small"
                                    class="cursor-pointer"
                                    @click="deleteDistrict(district.id)"
                                >
                                    <VTooltip activator="parent" location="top">Eliminar</VTooltip>
                                </VIcon>
                            </td>
                        </tr>
                    </tbody>
                </VTable>
            </VCardText>
        </VCard>

        <!-- Modal para crear/editar distrito -->
        <VDialog v-model="dialog" max-width="500px">
            <VCard>
                <VCardTitle>
                    <span class="text-h5">{{ formTitle }}</span>
                </VCardTitle>

                <VCardText>
                    <VContainer>
                        <VTextField
                            v-model="editedItem.name"
                            label="Nombre del Distrito"
                            required
                        ></VTextField>
                    </VContainer>
                </VCardText>

                <VCardActions>
                    <VSpacer></VSpacer>
                    <VBtn color="error" variant="text" @click="closeDialog">Cancelar</VBtn>
                    <VBtn color="success" variant="text" @click="saveDistrict">Guardar</VBtn>
                </VCardActions>
            </VCard>
        </VDialog>
    </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import NavigationBar from '../../components/NavigationBar.vue';

interface District {
    id: string;
    name: string;
}

const districts = ref<District[]>([]);
const dialog = ref(false);
const editedIndex = ref(-1);
const editedItem = ref<District>({
    id: '',
    name: ''
});

const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'Nuevo Distrito' : 'Editar Distrito'
});

const loadDistricts = async () => {
    const querySnapshot = await getDocs(collection(db, "districts"));
    districts.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
    }));
};

const editDistrict = (district: District, index: number) => {
    editedIndex.value = index;
    editedItem.value = { ...district };
    dialog.value = true;
};

const deleteDistrict = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este distrito?')) {
        await deleteDoc(doc(db, "districts", id));
        await loadDistricts();
    }
};

const closeDialog = () => {
    dialog.value = false;
    editedIndex.value = -1;
    editedItem.value = {
        id: '',
        name: ''
    };
};

const saveDistrict = async () => {
    try {
        if (editedIndex.value > -1) {
            await updateDoc(doc(db, "districts", editedItem.value.id), {
                name: editedItem.value.name
            });
        } else {
            await addDoc(collection(db, "districts"), {
                name: editedItem.value.name
            });
        }
        await loadDistricts();
        closeDialog();
    } catch (error) {
        console.error('Error al guardar:', error);
    }
};

loadDistricts();
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}
</style> 