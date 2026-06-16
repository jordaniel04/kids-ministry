<template>
    <div>
        <NavigationBar />
        <VContainer>
            <h1>Reportes por Distrito</h1>

            <!-- Tabs para cambiar entre vistas -->
            <VTabs v-model="activeTab" class="mb-4" :touch="false">
                <VTab value="period">Por Período</VTab>
                <VTab value="historical">Histórico</VTab>
                <VTab value="national">Reporte Nacional</VTab>
            </VTabs>

            <!-- Vista por Período -->
            <VWindow v-model="activeTab">
                <VWindowItem value="period">
                    <!-- Filtros existentes -->
            <VCard class="mb-4">
                <VCardText>
                    <VRow>
                        <VCol cols="12" sm="6" md="4">
                                    <VSelect v-model="selectedDistrict" :items="districts" label="Distrito"
                                        item-title="location" item-value="id" @update:model-value="loadDistrictData" />
                        </VCol>
                        <VCol cols="12" sm="6" md="4">
                                    <VSelect v-model="selectedPeriod" :items="periods" label="Período" item-title="name"
                                        item-value="id" @update:model-value="loadDistrictData" />
                        </VCol>
                    </VRow>
                </VCardText>
            </VCard>

            <!-- Tabla de Datos -->
            <VCard v-if="selectedDistrict && selectedPeriod">
                <VCardTitle>Datos del Distrito</VCardTitle>
                <VCardText>
                    <VDataTable
                        :headers="headers"
                        :items="churchesData"
                        :loading="loading"
                                :items-per-page-options="[10, 25, 50, 100, -1]"
                                :items-per-page="100"
                                hover
                    >
                        <template #[`item.isInactive`]="{ item }">
                            <VChip
                                v-if="item.isInactive"
                                color="warning"
                                size="small"
                                variant="tonal"
                            >Inactiva</VChip>
                            <VIcon v-else color="success" size="small">mdi-check-circle</VIcon>
                        </template>
                        <template #[`item.name`]="{ item }">
                            <span :class="{ 'text-disabled font-italic': item.isInactive }">{{ item.name }}</span>
                        </template>
                        <template #bottom>
                            <div class="d-flex justify-end align-center gap-4 pt-4 px-2">
                                <div v-if="churchesData.filter(c => c.isInactive).length > 0" class="text-subtitle-1 text-warning">
                                    Iglesias Inactivas: {{ churchesData.filter(c => c.isInactive).length }}
                                </div>
                                <div class="text-subtitle-1 font-weight-bold">
                                    Total Iglesias: {{ churchesData.length }}
                                </div>
                            </div>
                        </template>
                    </VDataTable>
                </VCardText>
            </VCard>

            <!-- Resumen de Totales -->
            <VCard v-if="churchesData.length > 0" class="mt-4">
                <VCardTitle>Resumen del Distrito</VCardTitle>
                <VCardText>
                    <VRow>
                        <VCol v-for="(total, key) in districtTotals" :key="key" cols="12" sm="6" md="3">
                            <div class="d-flex align-center justify-space-between pa-2 rounded bg-surface">
                                <span class="text-subtitle-2">{{ formatTotalLabel(key) }}:</span>
                                <span class="text-h6">{{ total }}</span>
                            </div>
                        </VCol>
                    </VRow>
                </VCardText>
            </VCard>
                </VWindowItem>

                <!-- Vista Histórica -->
                <VWindowItem value="historical">
                    <VCard class="mb-4">
                        <VCardText>
                            <VSelect v-model="selectedHistoricalDistrict" :items="districts" label="Distrito"
                                item-title="location" item-value="id" @update:model-value="loadHistoricalData" />
                        </VCardText>
                    </VCard>

                    <VCard v-if="selectedHistoricalDistrict && historicalData.length > 0">
                        <VCardTitle>Totales por Período</VCardTitle>
                        <VCardText>
                            <VDataTable :headers="historicalHeaders" :items="historicalData" :loading="loading" />
                        </VCardText>
                    </VCard>
                </VWindowItem>

                <!-- Vista Nacional -->
                <VWindowItem value="national">
                    <VCard class="mb-4">
                        <VCardText>
                            <VSelect 
                                v-model="selectedNationalPeriod" 
                                :items="periods" 
                                label="Período" 
                                item-title="name"
                                item-value="id" 
                                @update:model-value="loadNationalData" 
                            />
                        </VCardText>
                    </VCard>

                    <VCard v-if="nationalData.length > 0">
                        <VCardTitle>Totales Nacionales por Distrito</VCardTitle>
                        <VCardText>
                            <VDataTable 
                                :headers="nationalHeaders" 
                                :items="nationalData.slice(0, -1)" 
                                :loading="loading"
                            />
                            
                            <!-- Resumen de Totales Nacionales -->
                            <VCard class="mt-4 totals-card">
                                <VCardTitle>Resumen Nacional</VCardTitle>
                                <VCardText>
                                    <VRow>
                                        <VCol cols="12" sm="6" md="3">
                                            <div class="d-flex align-center mb-2">
                                                <VIcon color="primary" class="me-2">mdi-account-group</VIcon>
                                                <div>
                                                    <div class="text-caption">Total Maestras</div>
                                                    <div class="text-h6">{{ nationalTotals.totalTeachers }}</div>
                                                </div>
                                            </div>
                                        </VCol>

                                        <VCol cols="12" sm="6" md="3">
                                            <div class="d-flex align-center mb-2">
                                                <VIcon color="info" class="me-2">mdi-account-child</VIcon>
                                                <div>
                                                    <div class="text-caption">Total Niños</div>
                                                    <div class="text-h6">{{ nationalTotals.totalChildren }}</div>
                                                </div>
                                            </div>
                                        </VCol>

                                        <VCol cols="12" sm="6" md="3">
                                            <div class="d-flex align-center mb-2">
                                                <VIcon color="success" class="me-2">mdi-heart</VIcon>
                                                <div>
                                                    <div class="text-caption">Convertidos</div>
                                                    <div class="text-h6">{{ nationalTotals.convertedChildren }}</div>
                                                </div>
                                            </div>
                                        </VCol>

                                        <VCol cols="12" sm="6" md="3">
                                            <div class="d-flex align-center mb-2">
                                                <VIcon color="warning" class="me-2">mdi-account-check</VIcon>
                                                <div>
                                                    <div class="text-caption">Miembros</div>
                                                    <div class="text-h6">{{ nationalTotals.memberChildren }}</div>
                                                </div>
                                            </div>
                                        </VCol>

                                        <VCol cols="12" sm="6" md="3">
                                            <div class="d-flex align-center mb-2">
                                                <VIcon color="error" class="me-2">mdi-account-alert</VIcon>
                                                <div>
                                                    <div class="text-caption">Sin Arrepentir</div>
                                                    <div class="text-h6">{{ nationalTotals.nonRepentantChildren }}</div>
                                                </div>
                                            </div>
                                        </VCol>

                                        <VCol cols="12" sm="6" md="3">
                                            <div class="d-flex align-center mb-2">
                                                <VIcon color="purple" class="me-2">mdi-water</VIcon>
                                                <div>
                                                    <div class="text-caption">Bautizados</div>
                                                    <div class="text-h6">{{ nationalTotals.baptizedChildren }}</div>
                                                </div>
                                            </div>
                                        </VCol>

                                        <VCol cols="12" sm="6" md="3">
                                            <div class="d-flex align-center mb-2">
                                                <VIcon color="deep-purple" class="me-2">mdi-school</VIcon>
                                                <div>
                                                    <div class="text-caption">Graduados Consolidados</div>
                                                    <div class="text-h6">{{ nationalTotals.consolidatedGraduates }}</div>
                                                </div>
                                            </div>
                                        </VCol>

                                        <VCol cols="12" sm="6" md="3">
                                            <div class="d-flex align-center mb-2">
                                                <VIcon color="indigo" class="me-2">mdi-certificate</VIcon>
                                                <div>
                                                    <div class="text-caption">Graduados Sacramentos</div>
                                                    <div class="text-h6">{{ nationalTotals.sacramentsGraduates }}</div>
                                                </div>
                                            </div>
                                        </VCol>

                                        <VCol cols="12" sm="6" md="3">
                                            <div class="d-flex align-center mb-2">
                                                <VIcon color="blue-grey" class="me-2">mdi-school-outline</VIcon>
                                                <div>
                                                    <div class="text-caption">Graduados Discipulado</div>
                                                    <div class="text-h6">{{ nationalTotals.discipleshipGraduates }}</div>
                                                </div>
                                            </div>
                                        </VCol>

                                        <VCol cols="12" sm="6" md="3">
                                            <div class="d-flex align-center mb-2">
                                                <VIcon color="teal" class="me-2">mdi-church</VIcon>
                                                <div>
                                                    <div class="text-caption">Total Iglesias</div>
                                                    <div class="text-h6">{{ nationalTotals.churchesCount }}</div>
                                                </div>
                                            </div>
                                        </VCol>

                                        <VCol cols="12" sm="6" md="3">
                                            <div class="d-flex align-center mb-2">
                                                <VIcon color="warning" class="me-2">mdi-domain-off</VIcon>
                                                <div>
                                                    <div class="text-caption">Iglesias Inactivas</div>
                                                    <div class="text-h6 text-warning">{{ nationalTotals.inactiveChurchesCount || 0 }}</div>
                                                </div>
                                            </div>
                                        </VCol>
                                    </VRow>
                                </VCardText>
                            </VCard>
                        </VCardText>
                    </VCard>
                </VWindowItem>
            </VWindow>
        </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import NavigationBar from '../../components/NavigationBar.vue';
import type { District } from '../../types/District';
import type { ReportPeriod } from '../../types/MinisterialReport';
import type { MinisterialData } from '../../types/MinisterialData';
import { useFirestoreCache } from '../../composables/useFirestoreCache';

interface ChurchSummary {
    id: string;
    name: string;
    leaderName: string;
    isInactive: boolean;
    ministerialData: MinisterialData[];
}

const { getFromCache, setInCache } = useFirestoreCache();
const loading = ref(false);
const districts = ref<District[]>([]);
const periods = ref<ReportPeriod[]>([]);
const selectedDistrict = ref('');
const selectedPeriod = ref('');
const churchesData = ref<ChurchSummary[]>([]);
const activeTab = ref('period');
const selectedHistoricalDistrict = ref('');
const historicalData = ref<any[]>([]);
const selectedNationalPeriod = ref('');
const nationalData = ref<any[]>([]);

const headers = [
    { title: 'Iglesia', key: 'name', sortable: true },
    { title: 'Líder', key: 'leaderName', sortable: true },
    { title: 'Estado', key: 'isInactive', sortable: true, align: 'center' as const },
    {
        title: 'Total Maestras',
        key: 'ministerialData[0].totalTeachers',
        sortable: true,
        align: 'end' as const
    },
    {
        title: 'Total Niños',
        key: 'ministerialData[0].totalChildren',
        sortable: true,
        align: 'end' as const
    },
    {
        title: 'Niños Convertidos',
        key: 'ministerialData[0].convertedChildren',
        sortable: true,
        align: 'end' as const
    },
    {
        title: 'Niños Miembros',
        key: 'ministerialData[0].memberChildren',
        sortable: true,
        align: 'end' as const
    },
    {
        title: 'Niños Sin Arrepentir',
        key: 'ministerialData[0].nonRepentantChildren',
        sortable: true,
        align: 'end' as const
    },
    {
        title: 'Niños Bautizados',
        key: 'ministerialData[0].baptizedChildren',
        sortable: true,
        align: 'end' as const
    },
    {
        title: 'Graduados Consolidados',
        key: 'ministerialData[0].consolidatedGraduates',
        sortable: true,
        align: 'end' as const
    },
    {
        title: 'Graduados Sacramentos',
        key: 'ministerialData[0].sacramentsGraduates',
        sortable: true,
        align: 'end' as const
    },
    {
        title: 'Graduados Discipulado',
        key: 'ministerialData[0].discipleshipGraduates',
        sortable: true,
        align: 'end' as const
    }
];

const historicalHeaders = [
    { title: 'Período', key: 'periodName', sortable: true },
    { title: 'Total Maestras', key: 'totalTeachers', sortable: true, align: 'end' as const },
    { title: 'Total Niños', key: 'totalChildren', sortable: true, align: 'end' as const },
    { title: 'Convertidos', key: 'convertedChildren', sortable: true, align: 'end' as const },
    { title: 'Miembros', key: 'memberChildren', sortable: true, align: 'end' as const },
    { title: 'Niños Sin Arrepentir', key: 'nonRepentantChildren', sortable: true, align: 'end' as const },
    { title: 'Bautizados', key: 'baptizedChildren', sortable: true, align: 'end' as const },
    { title: 'Graduados Consolidados', key: 'consolidatedGraduates', sortable: true, align: 'end' as const },
    { title: 'Graduados Sacramentos', key: 'sacramentsGraduates', sortable: true, align: 'end' as const },
    { title: 'Graduados Discipulado', key: 'discipleshipGraduates', sortable: true, align: 'end' as const },
    { title: 'Total Iglesias', key: 'churchesCount', sortable: true, align: 'end' as const },
    { title: 'Iglesias Inactivas', key: 'inactiveChurchesCount', sortable: true, align: 'end' as const }
];

const nationalHeaders = [
    { title: 'Distrito', key: 'districtName', sortable: true },
    { title: 'Total Maestras', key: 'totalTeachers', sortable: true, align: 'end' as const },
    { title: 'Total Niños', key: 'totalChildren', sortable: true, align: 'end' as const },
    { title: 'Convertidos', key: 'convertedChildren', sortable: true, align: 'end' as const },
    { title: 'Miembros', key: 'memberChildren', sortable: true, align: 'end' as const },
    { title: 'Niños Sin Arrepentir', key: 'nonRepentantChildren', sortable: true, align: 'end' as const },
    { title: 'Bautizados', key: 'baptizedChildren', sortable: true, align: 'end' as const },
    { title: 'Graduados Consolidados', key: 'consolidatedGraduates', sortable: true, align: 'end' as const },
    { title: 'Graduados Sacramentos', key: 'sacramentsGraduates', sortable: true, align: 'end' as const },
    { title: 'Graduados Discipulado', key: 'discipleshipGraduates', sortable: true, align: 'end' as const },
    { title: 'Total Iglesias', key: 'churchesCount', sortable: true, align: 'end' as const },
    { title: 'Iglesias Inactivas', key: 'inactiveChurchesCount', sortable: true, align: 'end' as const }
];

// Cargar períodos y distritos al montar el componente
onMounted(async () => {
    try {
        // Cargar períodos con cache de 5 minutos
        const cachedPeriods = getFromCache('report_periods');
        if (cachedPeriods) {
            periods.value = cachedPeriods;
        } else {
            const periodsSnapshot = await getDocs(collection(db, "report_periods"));
            periods.value = periodsSnapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name,
                startDate: doc.data().startDate,
                endDate: doc.data().endDate,
                isActive: doc.data().isActive,
                allowEditing: doc.data().allowEditing
            }));
            setInCache('report_periods', periods.value);
        }

        // Cargar distritos con cache de 5 minutos
        const cachedDistricts = getFromCache('districts');
        if (cachedDistricts) {
            districts.value = cachedDistricts;
        } else {
            const districtsSnapshot = await getDocs(collection(db, "districts"));
            districts.value = districtsSnapshot.docs
                .map(doc => ({
                id: doc.id,
                areaNumber: doc.data().areaNumber,
                districtNumber: doc.data().districtNumber,
                location: doc.data().location,
                createdAt: doc.data().createdAt,
                updatedAt: doc.data().updatedAt
                } as District))
                .sort((a, b) => a.location.localeCompare(b.location));
            setInCache('districts', districts.value);
        }
    } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        alert("Error al cargar los datos");
    }
});

const loadDistrictData = async () => {
    if (!selectedDistrict.value || !selectedPeriod.value) return;
    
    loading.value = true;
    try {
        const confirmationsRef = collection(db, "church_confirmations");
        const confirmationsQuery = query(
            confirmationsRef,
            where("districtId", "==", selectedDistrict.value),
            where("periodId", "==", selectedPeriod.value)
        );
        
        const confirmationsSnapshot = await getDocs(confirmationsQuery);
        churchesData.value = confirmationsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                name: data.churchName as string,
                leaderName: data.leaderName as string,
                isInactive: (data.isInactive as boolean) ?? false,
                ministerialData: [{
                    totalTeachers: Number(data.ministerialData.totalTeachers) || 0,
                    totalChildren: Number(data.ministerialData.totalChildren) || 0,
                    convertedChildren: Number(data.ministerialData.convertedChildren) || 0,
                    baptizedChildren: Number(data.ministerialData.baptizedChildren) || 0,
                    consolidatedGraduates: Number(data.ministerialData.consolidatedGraduates) || 0,
                    sacramentsGraduates: Number(data.ministerialData.sacramentsGraduates) || 0,
                    memberChildren: Number(data.ministerialData.memberChildren) || 0,
                    nonRepentantChildren: Number(data.ministerialData.nonRepentantChildren) || 0,
                    discipleshipGraduates: Number(data.ministerialData.discipleshipGraduates) || 0,
                    reportPeriodId: selectedPeriod.value,
                    updatedAt: data.ministerialData.updatedAt || new Date()
                }]
                };
            });
    } catch (error) {
        console.error("Error al cargar datos:", error);
        alert("Error al cargar los datos del distrito");
    } finally {
        loading.value = false;
    }
};

const loadHistoricalData = async () => {
    if (!selectedHistoricalDistrict.value) return;

    loading.value = true;
    try {
        const confirmationsRef = collection(db, "district_confirmations");
        const confirmationsQuery = query(
            confirmationsRef,
            where("districtId", "==", selectedHistoricalDistrict.value)
        );

        const confirmationsSnapshot = await getDocs(confirmationsQuery);
        const confirmations = confirmationsSnapshot.docs.map(doc => doc.data());

        const periodsRef = collection(db, "report_periods");
        const periodsSnapshot = await getDocs(periodsRef);
        const periodsMap = new Map(
            periodsSnapshot.docs.map(doc => [doc.id, doc.data().name])
        );

        historicalData.value = confirmations.map(conf => ({
            periodName: periodsMap.get(conf.periodId) || 'Período Desconocido',
            totalTeachers: conf.totalTeachers || 0,
            totalChildren: conf.totalChildren || 0,
            convertedChildren: conf.convertedChildren || 0,
            memberChildren: conf.memberChildren || 0,
            nonRepentantChildren: conf.nonRepentantChildren || 0,
            baptizedChildren: conf.baptizedChildren || 0,
            consolidatedGraduates: conf.consolidatedGraduates || 0,
            sacramentsGraduates: conf.sacramentsGraduates || 0,
            discipleshipGraduates: conf.discipleshipGraduates || 0,
            churchesCount: conf.churchesCount || 0,
            inactiveChurchesCount: conf.inactiveChurchesCount || 0
        }));

    } catch (error) {
        console.error("Error al cargar datos históricos:", error);
        alert("Error al cargar los datos históricos");
    } finally {
        loading.value = false;
    }
};

const loadNationalData = async () => {
    if (!selectedNationalPeriod.value) return;

    loading.value = true;
    try {
        const confirmationsRef = collection(db, "district_confirmations");
        const confirmationsQuery = query(
            confirmationsRef,
            where("periodId", "==", selectedNationalPeriod.value)
        );

        const confirmationsSnapshot = await getDocs(confirmationsQuery);
        const confirmations = confirmationsSnapshot.docs.map(doc => doc.data());

        // Agrupar por distrito
        const districtTotals = new Map();
        
        for (const conf of confirmations) {
            if (!districtTotals.has(conf.districtId)) {
                const district = districts.value.find(d => d.id === conf.districtId);
                districtTotals.set(conf.districtId, {
                    districtName: district ? `${district.location}` : 'Distrito Desconocido',
                    totalTeachers: conf.totalTeachers || 0,
                    totalChildren: conf.totalChildren || 0,
                    convertedChildren: conf.convertedChildren || 0,
                    memberChildren: conf.memberChildren || 0,
                    nonRepentantChildren: conf.nonRepentantChildren || 0,
                    baptizedChildren: conf.baptizedChildren || 0,
                    consolidatedGraduates: conf.consolidatedGraduates || 0,
                    sacramentsGraduates: conf.sacramentsGraduates || 0,
                    discipleshipGraduates: conf.discipleshipGraduates || 0,
                    churchesCount: conf.churchesCount || 0,
                    inactiveChurchesCount: conf.inactiveChurchesCount || 0
                });
            }
        }

        nationalData.value = Array.from(districtTotals.values());

        // Calcular totales pero mantenerlos separados
        const totals = nationalData.value.reduce((acc, curr) => {
            Object.keys(curr).forEach(key => {
                if (key !== 'districtName' && typeof curr[key] === 'number') {
                    acc[key] = (acc[key] || 0) + curr[key];
                }
            });
            return acc;
        }, {
            districtName: 'TOTAL NACIONAL',
            totalTeachers: 0,
            totalChildren: 0,
            convertedChildren: 0,
            memberChildren: 0,
            nonRepentantChildren: 0,
            baptizedChildren: 0,
            consolidatedGraduates: 0,
            sacramentsGraduates: 0,
            discipleshipGraduates: 0,
            churchesCount: 0,
            inactiveChurchesCount: 0
        });

        // Agregar los totales al final del array pero no se mostrarán en la tabla
        nationalData.value.push(totals);

    } catch (error) {
        console.error("Error al cargar datos nacionales:", error);
        alert("Error al cargar los datos nacionales");
    } finally {
        loading.value = false;
    }
};

type TotalKeys = 'totalTeachers' | 'totalChildren' | 'convertedChildren' | 'memberChildren' | 
    'nonRepentantChildren' | 'baptizedChildren' | 'consolidatedGraduates' | 'sacramentsGraduates' | 
    'discipleshipGraduates';

const labels: Record<TotalKeys, string> = {
    totalTeachers: 'Total Maestras',
    totalChildren: 'Total Niños',
    convertedChildren: 'Niños Convertidos',
    memberChildren: 'Niños Miembros',
    nonRepentantChildren: 'Niños Sin Arrepentir',
    baptizedChildren: 'Niños Bautizados',
    consolidatedGraduates: 'Graduados Consolidados',
    sacramentsGraduates: 'Graduados Sacramentos',
    discipleshipGraduates: 'Graduados Discipulado'
};

const formatTotalLabel = (key: TotalKeys): string => {
    return labels[key];
};

const districtTotals = computed(() => {
    return churchesData.value
        .filter(church => !church.isInactive)
        .reduce((acc: Record<TotalKeys, number>, church) => {
            const md = church.ministerialData[0] || {};
            Object.keys(labels).forEach(key => {
                const totalKey = key as TotalKeys;
                acc[totalKey] = (acc[totalKey] || 0) + (md[totalKey] || 0);
            });
            return acc;
        }, {
            totalTeachers: 0,
            totalChildren: 0,
            convertedChildren: 0,
            memberChildren: 0,
            nonRepentantChildren: 0,
            baptizedChildren: 0,
            consolidatedGraduates: 0,
            sacramentsGraduates: 0,
            discipleshipGraduates: 0
        });
});

const nationalTotals = computed(() => {
    if (!nationalData.value.length) return {};
    return nationalData.value[nationalData.value.length - 1];
});
</script> 

<style scoped>
.v-data-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.v-data-table__wrapper {
    touch-action: pan-y pinch-zoom;
}

:deep(.national-total-row) {
    background-color: #1867C0 !important;
}

:deep(.national-total-row td) {
    color: white !important;
    font-weight: 700 !important;
    font-size: 1.1em !important;
    letter-spacing: 0.5px !important;
    text-transform: uppercase !important;
}

:deep(.national-total-row:hover td) {
    background-color: #1867C0 !important;
    color: white !important;
}

:deep(.national-total-row td:first-child) {
    font-size: 1.2em !important;
}
</style>