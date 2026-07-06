<template>
    <div class="d-flex flex-column" style="min-height: 100vh;">
        <NavigationBar class="z-10" />
        <VContainer class="flex-grow-1">
            <div class="d-flex justify-space-between align-center mb-4">
                <h1>Módulos de Formación</h1>
                <VBtn color="primary" prepend-icon="mdi-plus" @click="createItem">
                    Nuevo Módulo
                </VBtn>
            </div>

            <VCard>
                <VCardText>
                    <VDataTable
                        :headers="headers"
                        :items="modules"
                        :loading="loading"
                        :sort-by="[{ key: 'order', order: 'asc' }]"
                    >
                        <template #[`item.order`]="{ item }">
                            <VChip color="primary" size="small" variant="tonal">{{ item.order }}</VChip>
                        </template>

                        <template #[`item.moduleType`]="{ item }">
                            <VChip
                                :color="(item.moduleType ?? 'ruta') === 'ruta' ? 'indigo' : 'deep-orange'"
                                size="small" variant="tonal"
                            >
                                {{ (item.moduleType ?? 'ruta') === 'ruta' ? 'Ruta' : 'Certificación' }}
                            </VChip>
                        </template>

                        <template #[`item.certificateTemplateUrl`]="{ item }">
                            <div class="d-flex align-center gap-2">
                                <VChip
                                    v-if="item.certificateTemplateUrl"
                                    color="success"
                                    size="small"
                                    variant="tonal"
                                    prepend-icon="mdi-file-check"
                                >
                                    Configurada
                                </VChip>
                                <VChip v-else color="warning" size="small" variant="tonal" prepend-icon="mdi-file-alert">
                                    Sin plantilla
                                </VChip>
                                <VBtn
                                    v-if="item.certificateTemplateUrl"
                                    icon
                                    size="x-small"
                                    variant="text"
                                    color="primary"
                                    :href="item.certificateTemplateUrl"
                                    target="_blank"
                                >
                                    <VIcon size="16">mdi-open-in-new</VIcon>
                                    <VTooltip activator="parent" location="top">Ver plantilla</VTooltip>
                                </VBtn>
                            </div>
                        </template>

                        <template #[`item.isActive`]="{ item }">
                            <VSwitch
                                v-model="item.isActive"
                                @change="toggleActive(item)"
                                :color="item.isActive ? 'success' : 'grey'"
                                density="compact"
                                hide-details
                                inset
                            />
                        </template>

                        <template #[`item.actions`]="{ item }">
                            <div class="d-flex gap-1">
                                <VBtn icon color="primary" size="small" variant="tonal" @click="editItem(item)">
                                    <VIcon>mdi-pencil</VIcon>
                                    <VTooltip activator="parent" location="top">Editar módulo</VTooltip>
                                </VBtn>
                                <VBtn icon color="error" size="small" variant="tonal" @click="confirmDelete(item)">
                                    <VIcon>mdi-delete</VIcon>
                                    <VTooltip activator="parent" location="top">Eliminar módulo</VTooltip>
                                </VBtn>
                            </div>
                        </template>
                    </VDataTable>
                </VCardText>
            </VCard>

            <!-- Dialog crear/editar -->
            <VDialog v-model="dialog" max-width="650px" persistent @click:outside="closeDialog">
                <VCard>
                    <VCardTitle>
                        <span class="text-h5">{{ formTitle }}</span>
                    </VCardTitle>

                    <VCardText>
                        <VContainer>
                            <VRow>
                                <VCol cols="12" sm="6">
                                    <VTextField
                                        v-model="editedItem.name"
                                        label="Nombre del Módulo"
                                        placeholder="Ej: Módulo 1: Liderazgo"
                                        :rules="[v => !!v || 'Requerido']"
                                        required
                                    />
                                </VCol>
                                <VCol cols="6" sm="3">
                                    <VTextField
                                        v-model.number="editedItem.order"
                                        label="Orden"
                                        type="number"
                                        :rules="[v => v > 0 || 'Debe ser mayor a 0']"
                                        required
                                    />
                                </VCol>
                                <VCol cols="6" sm="3">
                                    <VSelect
                                        v-model="editedItem.moduleType"
                                        :items="[{ title: 'Ruta de Formación', value: 'ruta' }, { title: 'Certificación', value: 'certificacion' }]"
                                        item-title="title"
                                        item-value="value"
                                        label="Tipo"
                                        required
                                    />
                                </VCol>

                                <VCol cols="12">
                                    <VDivider class="mb-4" />
                                    <p class="text-subtitle-2 mb-1">Plantilla de Certificado</p>
                                    <p class="text-caption text-medium-emphasis mb-3">
                                        Sube un PDF diseñado con campos de formulario llamados <code>nombre</code> y <code>fecha</code>
                                        en las posiciones donde deben aparecer esos datos.
                                    </p>
                                </VCol>

                                <VCol cols="12">
                                    <VFileInput
                                        v-model="templateFile"
                                        label="Plantilla PDF"
                                        placeholder="Selecciona el archivo PDF de la plantilla"
                                        prepend-icon="mdi-file-pdf-box"
                                        accept="application/pdf"
                                        :loading="uploadingTemplate"
                                        :disabled="uploadingTemplate"
                                        clearable
                                        @update:model-value="onTemplateFileChange"
                                    />
                                </VCol>

                                <VCol cols="12" v-if="editedItem.certificateTemplateUrl">
                                    <VBtn
                                        size="small"
                                        variant="tonal"
                                        color="primary"
                                        :href="editedItem.certificateTemplateUrl"
                                        target="_blank"
                                        prepend-icon="mdi-open-in-new"
                                    >
                                        Verificar plantilla
                                    </VBtn>
                                </VCol>
                            </VRow>
                        </VContainer>
                    </VCardText>

                    <VCardActions>
                        <VSpacer />
                        <VBtn color="error" variant="text" @click="closeDialog" :disabled="saving">Cancelar</VBtn>
                        <VBtn
                            color="success"
                            variant="text"
                            @click="saveModule"
                            :disabled="!isFormValid || saving"
                            :loading="saving"
                        >
                            Guardar
                        </VBtn>
                    </VCardActions>
                </VCard>
            </VDialog>

            <!-- Dialog confirmar eliminar -->
            <VDialog v-model="deleteDialog" max-width="400px">
                <VCard>
                    <VCardTitle>Confirmar eliminación</VCardTitle>
                    <VCardText>
                        ¿Eliminar el módulo <strong>{{ itemToDelete?.name }}</strong>?
                    </VCardText>
                    <VCardActions>
                        <VSpacer />
                        <VBtn color="grey" variant="text" @click="deleteDialog = false">Cancelar</VBtn>
                        <VBtn color="error" variant="text" @click="deleteModule">Eliminar</VBtn>
                    </VCardActions>
                </VCard>
            </VDialog>
        </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
    collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
    Timestamp, orderBy, query
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import type { TrainingModule, ModuleType } from '../../types/TrainingModule';
import NavigationBar from '../../components/NavigationBar.vue';

const loading = ref(true);
const saving = ref(false);
const uploadingTemplate = ref(false);
const dialog = ref(false);
const deleteDialog = ref(false);
const modules = ref<TrainingModule[]>([]);
const itemToDelete = ref<TrainingModule | null>(null);
const editedIndex = ref(-1);
const templateFile = ref<File | null>(null);

async function onTemplateFileChange(value: File | File[] | null) {
    const file = Array.isArray(value) ? value[0] : value;
    if (!file) return;
    uploadingTemplate.value = true;
    try {
        const path = `certificate-templates/${Date.now()}_${file.name}`;
        const fileRef = storageRef(storage, path);
        await uploadBytes(fileRef, file);
        editedItem.value.certificateTemplateUrl = await getDownloadURL(fileRef);
    } catch (e) {
        console.error(e);
        alert('Error al subir la plantilla');
        templateFile.value = null;
    } finally {
        uploadingTemplate.value = false;
    }
}

interface EditedModule {
    id: string;
    name: string;
    order: number;
    moduleType: ModuleType;
    certificateTemplateUrl: string;
    isActive: boolean;
}

const defaultItem: EditedModule = {
    id: '',
    name: '',
    order: 1,
    moduleType: 'ruta',
    certificateTemplateUrl: '',
    isActive: true,
};

const editedItem = ref<EditedModule>({ ...defaultItem });

const headers = [
    { title: '#', key: 'order', align: 'center' as const, width: '60px' },
    { title: 'Módulo', key: 'name', align: 'start' as const },
    { title: 'Tipo', key: 'moduleType', align: 'center' as const, sortable: false, width: '140px' },
    { title: 'Plantilla', key: 'certificateTemplateUrl', align: 'start' as const, sortable: false },
    { title: 'Activo', key: 'isActive', align: 'center' as const, sortable: false, width: '100px' },
    { title: 'Acciones', key: 'actions', align: 'center' as const, sortable: false, width: '100px' },
];

const formTitle = computed(() => editedIndex.value === -1 ? 'Nuevo Módulo' : 'Editar Módulo');

const isFormValid = computed(() =>
    !!editedItem.value.name && editedItem.value.order > 0
);

async function loadModules() {
    loading.value = true;
    try {
        const q = query(collection(db, 'training_modules'), orderBy('order'));
        const snap = await getDocs(q);
        modules.value = snap.docs.map(d => ({ id: d.id, ...d.data() } as TrainingModule));
    } catch (e) {
        console.error(e);
        alert('Error al cargar los módulos');
    } finally {
        loading.value = false;
    }
}

function createItem() {
    editedIndex.value = -1;
    editedItem.value = { ...defaultItem };
    templateFile.value = null;
    dialog.value = true;
}

function editItem(item: TrainingModule) {
    editedIndex.value = modules.value.indexOf(item);
    editedItem.value = {
        id: item.id,
        name: item.name,
        order: item.order,
        moduleType: item.moduleType ?? 'ruta',
        certificateTemplateUrl: item.certificateTemplateUrl || '',
        isActive: item.isActive,
    };
    templateFile.value = null;
    dialog.value = true;
}

function closeDialog() {
    dialog.value = false;
    editedIndex.value = -1;
    editedItem.value = { ...defaultItem };
    templateFile.value = null;
}

async function saveModule() {
    saving.value = true;
    try {
        const data = {
            name: editedItem.value.name,
            order: editedItem.value.order,
            moduleType: editedItem.value.moduleType,
            certificateTemplateUrl: editedItem.value.certificateTemplateUrl,
            isActive: editedItem.value.isActive,
        };

        if (editedItem.value.id) {
            await updateDoc(doc(db, 'training_modules', editedItem.value.id), data);
        } else {
            await addDoc(collection(db, 'training_modules'), { ...data, createdAt: Timestamp.now() });
        }
        await loadModules();
        closeDialog();
    } catch (e) {
        console.error(e);
        alert('Error al guardar el módulo');
    } finally {
        saving.value = false;
    }
}

async function toggleActive(item: TrainingModule) {
    try {
        await updateDoc(doc(db, 'training_modules', item.id), { isActive: item.isActive });
    } catch (e) {
        console.error(e);
        item.isActive = !item.isActive;
        alert('Error al cambiar estado');
    }
}

function confirmDelete(item: TrainingModule) {
    itemToDelete.value = item;
    deleteDialog.value = true;
}

async function deleteModule() {
    if (!itemToDelete.value) return;
    try {
        await deleteDoc(doc(db, 'training_modules', itemToDelete.value.id));
        await loadModules();
    } catch (e) {
        console.error(e);
        alert('Error al eliminar el módulo');
    } finally {
        deleteDialog.value = false;
        itemToDelete.value = null;
    }
}

onMounted(loadModules);
</script>
