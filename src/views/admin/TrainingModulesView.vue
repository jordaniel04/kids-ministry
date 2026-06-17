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

                        <template #[`item.certificateImageUrl`]="{ item }">
                            <div class="d-flex align-center gap-2">
                                <VChip
                                    v-if="item.certificateImageUrl"
                                    color="success"
                                    size="small"
                                    variant="tonal"
                                    prepend-icon="mdi-image-check"
                                >
                                    Configurada
                                </VChip>
                                <VChip v-else color="warning" size="small" variant="tonal" prepend-icon="mdi-image-off">
                                    Sin plantilla
                                </VChip>
                                <VBtn
                                    v-if="item.certificateImageUrl"
                                    icon
                                    size="x-small"
                                    variant="text"
                                    color="primary"
                                    :href="item.certificateImageUrl"
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
                                <VCol cols="12" sm="8">
                                    <VTextField
                                        v-model="editedItem.name"
                                        label="Nombre del Módulo"
                                        placeholder="Ej: Módulo 1: Liderazgo"
                                        :rules="[v => !!v || 'Requerido']"
                                        required
                                    />
                                </VCol>
                                <VCol cols="12" sm="4">
                                    <VTextField
                                        v-model.number="editedItem.order"
                                        label="Orden"
                                        type="number"
                                        :rules="[v => v > 0 || 'Debe ser mayor a 0']"
                                        required
                                    />
                                </VCol>

                                <VCol cols="12">
                                    <VDivider class="mb-4" />
                                    <p class="text-subtitle-2 mb-1">Plantilla de Certificado</p>
                                    <p class="text-caption text-medium-emphasis mb-3">
                                        Sube la imagen a Google Drive, hazla pública y pega el link aquí (cualquier formato de Drive sirve).
                                    </p>
                                </VCol>

                                <VCol cols="12">
                                    <VTextField
                                        v-model="driveInput"
                                        label="Link de Google Drive"
                                        placeholder="https://drive.google.com/file/d/... o solo el ID"
                                        prepend-inner-icon="mdi-image-outline"
                                        clearable
                                        hint="Imagen PNG o JPG con espacio en blanco donde irán el nombre y la fecha"
                                        persistent-hint
                                        @update:model-value="onDriveInputChange"
                                    />
                                </VCol>

                                <VCol cols="12" v-if="editedItem.certificateImageUrl">
                                    <VBtn
                                        size="small"
                                        variant="tonal"
                                        color="primary"
                                        :href="editedItem.certificateImageUrl"
                                        target="_blank"
                                        prepend-icon="mdi-open-in-new"
                                    >
                                        Verificar imagen
                                    </VBtn>
                                    <span class="text-caption text-medium-emphasis ms-3">
                                        URL guardada: <code>{{ editedItem.certificateImageUrl }}</code>
                                    </span>
                                </VCol>

                                <!-- Config de texto -->
                                <VCol cols="12" class="mt-2">
                                    <VExpansionPanels variant="accordion">
                                        <VExpansionPanel>
                                            <VExpansionPanelTitle>
                                                <VIcon class="me-2" size="18">mdi-format-text</VIcon>
                                                Posición del texto en el certificado
                                            </VExpansionPanelTitle>
                                            <VExpansionPanelText>
                                                <p class="text-caption text-medium-emphasis mb-3">
                                                    Coordenadas en píxeles desde la esquina superior izquierda de la imagen.
                                                    Si no sabes los valores exactos, déjalos por defecto y ajusta después de generar un certificado de prueba.
                                                </p>
                                                <VRow dense>
                                                    <VCol cols="6" sm="3">
                                                        <VTextField
                                                            v-model.number="editedItem.certificateTextConfig.nameX"
                                                            label="Nombre X"
                                                            type="number"
                                                            density="compact"
                                                        />
                                                    </VCol>
                                                    <VCol cols="6" sm="3">
                                                        <VTextField
                                                            v-model.number="editedItem.certificateTextConfig.nameY"
                                                            label="Nombre Y"
                                                            type="number"
                                                            density="compact"
                                                        />
                                                    </VCol>
                                                    <VCol cols="6" sm="3">
                                                        <VTextField
                                                            v-model.number="editedItem.certificateTextConfig.dateX"
                                                            label="Fecha X"
                                                            type="number"
                                                            density="compact"
                                                        />
                                                    </VCol>
                                                    <VCol cols="6" sm="3">
                                                        <VTextField
                                                            v-model.number="editedItem.certificateTextConfig.dateY"
                                                            label="Fecha Y"
                                                            type="number"
                                                            density="compact"
                                                        />
                                                    </VCol>
                                                    <VCol cols="6" sm="3">
                                                        <VTextField
                                                            v-model.number="editedItem.certificateTextConfig.fontSize"
                                                            label="Tamaño fuente"
                                                            type="number"
                                                            density="compact"
                                                        />
                                                    </VCol>
                                                    <VCol cols="6" sm="3">
                                                        <VTextField
                                                            v-model="editedItem.certificateTextConfig.fontColor"
                                                            label="Color (hex)"
                                                            placeholder="#1a1a1a"
                                                            density="compact"
                                                        >
                                                            <template #append-inner>
                                                                <div
                                                                    class="color-preview"
                                                                    :style="{ background: editedItem.certificateTextConfig.fontColor }"
                                                                />
                                                            </template>
                                                        </VTextField>
                                                    </VCol>
                                                </VRow>
                                            </VExpansionPanelText>
                                        </VExpansionPanel>
                                    </VExpansionPanels>
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
import { db } from '../../firebase/config';
import type { TrainingModule, CertificateTextConfig } from '../../types/TrainingModule';
import NavigationBar from '../../components/NavigationBar.vue';

const loading = ref(true);
const saving = ref(false);
const dialog = ref(false);
const deleteDialog = ref(false);
const modules = ref<TrainingModule[]>([]);
const itemToDelete = ref<TrainingModule | null>(null);
const editedIndex = ref(-1);
const driveInput = ref('');

function extractDriveId(input: string): string | null {
    const trimmed = input.trim();
    // Si es solo un ID (sin slashes ni http)
    if (/^[A-Za-z0-9_-]{25,}$/.test(trimmed)) return trimmed;
    // Extraer ID de cualquier formato de URL de Drive
    const match = trimmed.match(/\/d\/([A-Za-z0-9_-]+)/);
    if (match) return match[1];
    // URL tipo uc?id=...
    const idParam = trimmed.match(/[?&]id=([A-Za-z0-9_-]+)/);
    if (idParam) return idParam[1];
    return null;
}

function onDriveInputChange(value: string) {
    if (!value) {
        editedItem.value.certificateImageUrl = '';
        return;
    }
    const id = extractDriveId(value);
    if (id) {
        editedItem.value.certificateImageUrl = `https://drive.google.com/uc?export=download&id=${id}`;
    } else {
        editedItem.value.certificateImageUrl = value;
    }
}

interface EditedModule {
    id: string;
    name: string;
    order: number;
    certificateImageUrl: string;
    certificateStoragePath: string;
    certificateTextConfig: CertificateTextConfig;
    isActive: boolean;
}

const defaultTextConfig: CertificateTextConfig = {
    nameX: 400, nameY: 300,
    dateX: 400, dateY: 350,
    fontSize: 24, fontColor: '#1a1a1a'
};

const defaultItem: EditedModule = {
    id: '',
    name: '',
    order: 1,
    certificateImageUrl: '',
    certificateStoragePath: '',
    certificateTextConfig: { ...defaultTextConfig },
    isActive: true,
};

const editedItem = ref<EditedModule>({ ...defaultItem, certificateTextConfig: { ...defaultTextConfig } });

const headers = [
    { title: '#', key: 'order', align: 'center' as const, width: '60px' },
    { title: 'Módulo', key: 'name', align: 'start' as const },
    { title: 'Plantilla', key: 'certificateImageUrl', align: 'start' as const, sortable: false },
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
    editedItem.value = { ...defaultItem, certificateTextConfig: { ...defaultTextConfig } };
    driveInput.value = '';
    dialog.value = true;
}

function editItem(item: TrainingModule) {
    editedIndex.value = modules.value.indexOf(item);
    editedItem.value = {
        id: item.id,
        name: item.name,
        order: item.order,
        certificateImageUrl: item.certificateImageUrl || '',
        certificateStoragePath: '',
        certificateTextConfig: item.certificateTextConfig
            ? { ...item.certificateTextConfig }
            : { ...defaultTextConfig },
        isActive: item.isActive,
    };
    driveInput.value = item.certificateImageUrl || '';
    dialog.value = true;
}

function closeDialog() {
    dialog.value = false;
    editedIndex.value = -1;
    editedItem.value = { ...defaultItem, certificateTextConfig: { ...defaultTextConfig } };
    driveInput.value = '';
}

async function saveModule() {
    saving.value = true;
    try {
        const data = {
            name: editedItem.value.name,
            order: editedItem.value.order,
            certificateImageUrl: editedItem.value.certificateImageUrl,
            certificateTextConfig: { ...editedItem.value.certificateTextConfig },
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

<style scoped>
.color-preview {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.2);
}
</style>
