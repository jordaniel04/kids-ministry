<template>
    <VDialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="800px">
        <VCard>
            <VCardTitle>
                <span class="text-h5">{{ formTitle }}</span>
            </VCardTitle>

            <VCardText>
                <VContainer>
                    <VRow>
                        <VCol cols="12" sm="6">
                            <VTextField v-model="localItem.name" label="Nombre de la Iglesia" required></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField v-model="localItem.leaderName" label="Nombre del Líder" required></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField v-model="localItem.ministerialData.totalTeachers" label="Total Maestras"
                                type="number" required></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField v-model="localItem.ministerialData.totalChildren" label="Total Niños"
                                type="number" readonly :value="totalChildren" color="primary"
                                bg-color="primary-lighten-5" class="total-field" required></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField v-model="localItem.ministerialData.convertedChildren" label="Niños Convertidos"
                                type="number" :rules="[rules.nonNegative]" color="success" bg-color="success-lighten-5"
                                class="calculation-field" @focus="clearDefaultValue('convertedChildren')"
                                @input="handleInput($event, 'convertedChildren')" required></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField v-model="localItem.ministerialData.memberChildren" label="Niños Miembros"
                                type="number" :rules="[rules.nonNegative]" color="success" bg-color="success-lighten-5"
                                class="calculation-field" @focus="clearDefaultValue('memberChildren')" required>
                            </VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField v-model="localItem.ministerialData.nonRepentantChildren"
                                label="Niños Sin Arrepentir" type="number" :rules="[rules.nonNegative]" color="success"
                                bg-color="success-lighten-5" class="calculation-field"
                                @focus="clearDefaultValue('nonRepentantChildren')" required></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField v-model="localItem.ministerialData.baptizedChildren" label="Bautizados E.S."
                                type="number" :rules="[rules.nonNegative, rules.graduateRules.baptized]"
                                @focus="clearDefaultValue('baptizedChildren')"
                                @input="handleInput($event, 'baptizedChildren')" required></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField v-model="localItem.ministerialData.consolidatedGraduates"
                                label="Graduados Consolidados" type="number"
                                :rules="[rules.nonNegative, rules.graduateRules.consolidated]"
                                @focus="clearDefaultValue('consolidatedGraduates')" required></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField v-model="localItem.ministerialData.sacramentsGraduates"
                                label="Graduados Sacramentos" type="number"
                                :rules="[rules.nonNegative, rules.graduateRules.sacraments]"
                                @focus="clearDefaultValue('sacramentsGraduates')" required></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField v-model="localItem.ministerialData.discipleshipGraduates"
                                label="Graduados Discipulado" type="number"
                                :rules="[rules.nonNegative, rules.graduateRules.discipleship]"
                                @focus="clearDefaultValue('discipleshipGraduates')" required></VTextField>
                        </VCol>
                    </VRow>
                </VContainer>
            </VCardText>

            <VCardActions>
                <VSpacer></VSpacer>
                <VBtn color="error" variant="text" @click="close" :disabled="loading">Cancelar</VBtn>
                <VBtn color="success" variant="text" @click="save" :loading="loading" :disabled="loading">
                    Guardar
                </VBtn>
            </VCardActions>

            <!-- Indicador de Carga Global -->
            <VOverlay :model-value="loading" absolute>
                <VProgressCircular indeterminate color="primary"></VProgressCircular>
            </VOverlay>
        </VCard>
    </VDialog>
</template>

<script lang="ts">
import { computed, ref, watch, defineComponent } from 'vue';
import { Timestamp } from 'firebase/firestore';
import type { ReportPeriod } from '../types/MinisterialReport';
import type { LocalItem, NumericFields } from '../types/MinisterialData';

export default defineComponent({
    name: 'ChurchFormDialog',
    emits: ['update:modelValue', 'save', 'close'],
    props: {
        modelValue: {
            type: Boolean,
            required: true
        },
        church: {
            type: Object,
            default: null
        },
        activePeriod: {
            type: Object as () => ReportPeriod | null,
            default: null
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    setup(props, { emit }) {
        const localItem = ref<LocalItem>({
            name: '',
            leaderName: '',
            ministerialData: {
                totalTeachers: 0,
                totalChildren: 0,
                convertedChildren: 0,
                memberChildren: 0,
                nonRepentantChildren: 0,
                baptizedChildren: 0,
                consolidatedGraduates: 0,
                sacramentsGraduates: 0,
                discipleshipGraduates: 0,
                updatedAt: Timestamp.now(),
                reportPeriodId: props.activePeriod?.id || null
            }
        });

        watch(() => props.church, (newVal) => {
            if (newVal) {
                const ministerialData = newVal.ministerialData?.[0] || {};
                localItem.value = {
                    name: newVal.name || '',
                    leaderName: newVal.leaderName || '',
                    ministerialData: {
                        totalTeachers: ministerialData.totalTeachers || 0,
                        totalChildren: ministerialData.totalChildren || 0,
                        convertedChildren: ministerialData.convertedChildren || 0,
                        memberChildren: ministerialData.memberChildren || 0,
                        nonRepentantChildren: ministerialData.nonRepentantChildren || 0,
                        baptizedChildren: ministerialData.baptizedChildren || 0,
                        consolidatedGraduates: ministerialData.consolidatedGraduates || 0,
                        sacramentsGraduates: ministerialData.sacramentsGraduates || 0,
                        discipleshipGraduates: ministerialData.discipleshipGraduates || 0,
                        updatedAt: Timestamp.now(),
                        reportPeriodId: ministerialData.reportPeriodId || null
                    }
                };
            } else {
                localItem.value = {
                    name: '',
                    leaderName: '',
                    ministerialData: {
                        totalTeachers: 0,
                        totalChildren: 0,
                        convertedChildren: 0,
                        memberChildren: 0,
                        nonRepentantChildren: 0,
                        baptizedChildren: 0,
                        consolidatedGraduates: 0,
                        sacramentsGraduates: 0,
                        discipleshipGraduates: 0,
                        updatedAt: Timestamp.now(),
                        reportPeriodId: props.activePeriod?.id || null
                    }
                };
            }
        }, { immediate: true });

        const formTitle = computed(() => {
            return props.church?.id ? 'Editar Iglesia' : 'Nueva Iglesia';
        });

        const rules = {
            nonNegative: (v: number) => v >= 0 || 'El valor no puede ser negativo',
            graduateRules: {
                baptized: (v: number) => Number(v) <= totalChildren.value ||
                    'Bautizados E.S. no puede ser mayor que el Total de Niños',
                consolidated: (v: number) => Number(v) <= totalConvertedAndMembers.value ||
                    'Graduados Consolidados no puede ser mayor que la suma de Niños Convertidos y Niños Miembros',
                sacraments: (v: number) => Number(v) <= Number(localItem.value.ministerialData.consolidatedGraduates) ||
                    'Graduados Sacramentos no puede ser mayor que Graduados Consolidados',
                rescue: (v: number) => Number(v) <= Number(localItem.value.ministerialData.sacramentsGraduates) ||
                    'Club al Rescate no puede ser mayor que Graduados Sacramentos',
                discipleship: (v: number) => Number(v) <= Number(localItem.value.ministerialData.sacramentsGraduates) ||
                    'Graduados Discipulado no puede ser mayor que Graduados Sacramentos'
            }
        };

        const clearDefaultValue = (field: NumericFields) => {
            return;
        };

        const handleInput = (event: Event, field: NumericFields) => {
            const input = event.target as HTMLInputElement;
            const value = input.value.replace(/\D/g, '');
            if (value !== '') {
                localItem.value.ministerialData[field] = Number(value);
            }
        };

        const getNumericValue = (value: string | number): number => {
            return typeof value === 'string' ? Number(value) || 0 : value;
        };

        const totalChildren = computed(() => {
            const md = localItem.value.ministerialData;
            const converted = getNumericValue(md.convertedChildren);
            const members = getNumericValue(md.memberChildren);
            const nonRepentant = getNumericValue(md.nonRepentantChildren);
            return converted + members + nonRepentant;
        });

        const totalConvertedAndMembers = computed(() => {
            return Number(localItem.value.ministerialData.convertedChildren) +
                Number(localItem.value.ministerialData.memberChildren);
        });

        const close = () => {
            emit('close');
        };

        const save = () => {
            if (!localItem.value.name || !localItem.value.leaderName) {
                alert('Por favor complete los campos requeridos');
                return;
            }

            // Validar campos numéricos
            const numericalFields: NumericFields[] = [
                'totalTeachers',
                'convertedChildren',
                'memberChildren',
                'nonRepentantChildren',
                'baptizedChildren',
                'consolidatedGraduates',
                'sacramentsGraduates',
                'discipleshipGraduates',
            ];

            for (const field of numericalFields) {
                const value = Number(localItem.value.ministerialData[field]);
                if (isNaN(value) || value < 0) {
                    alert(`El campo ${field} debe ser un número válido no negativo`);
                    return;
                }
                localItem.value.ministerialData[field] = value;
            }

            // Validar reglas de graduados
            if (!validateGraduateRules()) {
                return;
            }

            emit('save', {
                name: localItem.value.name,
                leaderName: localItem.value.leaderName,
                ministerialData: {
                    ...localItem.value.ministerialData,
                    totalChildren: totalChildren.value
                }
            });
        };

        const validateGraduateRules = () => {
            const md = localItem.value.ministerialData;

            if (md.consolidatedGraduates > (md.convertedChildren + md.memberChildren)) {
                alert('Graduados Consolidados no puede ser mayor que la suma de Niños Convertidos y Niños Miembros');
                return false;
            }
            if (md.sacramentsGraduates > md.consolidatedGraduates) {
                alert('Graduados Sacramentos no puede ser mayor que Graduados Consolidados');
                return false;
            }
            if (md.discipleshipGraduates > md.sacramentsGraduates) {
                alert('Graduados Discipulado no puede ser mayor que Graduados Sacramentos');
                return false;
            }

            return true;
        };

        return {
            localItem,
            formTitle,
            rules,
            clearDefaultValue,
            handleInput,
            totalChildren,
            totalConvertedAndMembers,
            close,
            save,
            validateGraduateRules
        };
    }
});
</script>

<style scoped>
.calculation-field {
    border-left: 3px solid var(--v-success-base) !important;
}

.total-field {
    border-left: 3px solid var(--v-primary-base) !important;
    font-weight: bold;
}

/* Estilo para los campos numéricos */
:deep(.v-field__input) {
    text-align: right;
}

/* Remover flechas de incremento/decremento */
:deep(input[type="number"]::-webkit-inner-spin-button),
:deep(input[type="number"]::-webkit-outer-spin-button) {
    -webkit-appearance: none;
    margin: 0;
}

:deep(input[type="number"]) {
    -moz-appearance: textfield;
    appearance: textfield;
}
</style>