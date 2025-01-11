<template>
    <VDialog 
        :model-value="modelValue" 
        @update:model-value="$emit('update:modelValue', $event)"
        max-width="800px"
    >
        <template v-slot:activator="{ props }">
            <VBtn
                color="primary"
                v-bind="props"
                prepend-icon="mdi-plus"
            >
                Agregar Iglesia
            </VBtn>
        </template>
        <VCard>
            <VCardTitle>
                <span class="text-h5">{{ formTitle }}</span>
            </VCardTitle>

            <VCardText>
                <VContainer>
                    <VRow>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="localItem.name"
                                label="Nombre de la Iglesia"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="localItem.leaderName"
                                label="Nombre del Líder"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="localItem.totalTeachers"
                                label="Total Maestras"
                                type="number"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="localItem.totalChildren"
                                label="Total Niños"
                                type="number"
                                readonly
                                :value="totalChildren"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="localItem.convertedChildren"
                                label="Niños Convertidos"
                                type="number"
                                :rules="[rules.nonNegative]"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="localItem.memberChildren"
                                label="Niños Miembros"
                                type="number"
                                :rules="[rules.nonNegative]"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="localItem.nonRepentantChildren"
                                label="Niños Sin Arrepentir"
                                type="number"
                                :rules="[rules.nonNegative]"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="localItem.baptizedChildren"
                                label="Bautizados E.S."
                                type="number"
                                :rules="[rules.nonNegative]"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="localItem.consolidatedGraduates"
                                label="Graduados Consolidados"
                                type="number"
                                :rules="[rules.nonNegative, rules.graduateRules.consolidated]"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="localItem.sacramentsGraduates"
                                label="Graduados Sacramentos"
                                type="number"
                                :rules="[rules.nonNegative, rules.graduateRules.sacraments]"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="localItem.rescueClubChildren"
                                label="Club al Rescate"
                                type="number"
                                :rules="[rules.nonNegative, rules.graduateRules.rescue]"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="localItem.discipleshipGraduates"
                                label="Graduados Discipulado"
                                type="number"
                                :rules="[rules.nonNegative, rules.graduateRules.discipleship]"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="localItem.connection911Children"
                                label="Niños Conexión 911"
                                type="number"
                                required
                            ></VTextField>
                        </VCol>
                    </VRow>
                </VContainer>
            </VCardText>

            <VCardActions>
                <VSpacer></VSpacer>
                <VBtn color="error" variant="text" @click="close">Cancelar</VBtn>
                <VBtn color="success" variant="text" @click="save">Guardar</VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface Props {
    modelValue: boolean;
    editedItem: any;
    editedIndex: number;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    editedIndex: -1
});

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'save': [item: any]
    'close': []
}>();

// Crear una copia local del editedItem
const localItem = ref({
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
    connection911Children: 0,
    ...props.editedItem
});

// Actualizar localItem cuando cambie props.editedItem
watch(() => props.editedItem, (newVal) => {
    Object.assign(localItem.value, newVal);
}, { deep: true });

const formTitle = computed(() => {
    return props.editedIndex === -1 ? 'Nueva Iglesia' : 'Editar Iglesia'
});

const rules = {
    nonNegative: (v: number) => v >= 0 || 'El valor no puede ser negativo',
    graduateRules: {
        consolidated: (v: number) => Number(v) <= Number(localItem.value.convertedChildren) || 
            'Graduados Consolidados no puede ser mayor que Niños Convertidos',
        sacraments: (v: number) => Number(v) <= Number(localItem.value.consolidatedGraduates) || 
            'Graduados Sacramentos no puede ser mayor que Graduados Consolidados',
        rescue: (v: number) => Number(v) <= Number(localItem.value.sacramentsGraduates) || 
            'Club al Rescate no puede ser mayor que Graduados Sacramentos',
        discipleship: (v: number) => Number(v) <= Number(localItem.value.sacramentsGraduates) || 
            'Graduados Discipulado no puede ser mayor que Graduados Sacramentos'
    }
};

const totalChildren = computed(() => {
    return Number(localItem.value.convertedChildren || 0) + 
           Number(localItem.value.memberChildren || 0) + 
           Number(localItem.value.nonRepentantChildren || 0);
});

const close = () => {
    emit('close');
};

const save = () => {
    const formattedItem = {
        name: localItem.value.name,
        leaderName: localItem.value.leaderName,
        totalTeachers: Number(localItem.value.totalTeachers),
        totalChildren: totalChildren.value,
        convertedChildren: Number(localItem.value.convertedChildren),
        memberChildren: Number(localItem.value.memberChildren),
        nonRepentantChildren: Number(localItem.value.nonRepentantChildren),
        baptizedChildren: Number(localItem.value.baptizedChildren),
        consolidatedGraduates: Number(localItem.value.consolidatedGraduates),
        sacramentsGraduates: Number(localItem.value.sacramentsGraduates),
        rescueClubChildren: Number(localItem.value.rescueClubChildren),
        discipleshipGraduates: Number(localItem.value.discipleshipGraduates),
        connection911Children: Number(localItem.value.connection911Children)
    };
    
    emit('save', formattedItem);
    emit('update:modelValue', false);
};
</script> 