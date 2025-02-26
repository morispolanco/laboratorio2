<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>BioLabAI</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <v-card class="mb-4">
              <v-card-title>Laboratory Results Input</v-card-title>
              <v-card-text>
                <v-form @submit.prevent="analyzeResults">
                  <v-text-field
                    v-model="labResults.glucose"
                    label="Glucose (mg/dL)"
                    type="number"
                  ></v-text-field>
                  <v-text-field
                    v-model="labResults.cholesterol"
                    label="Cholesterol (mg/dL)"
                    type="number"
                  ></v-text-field>
                  <v-text-field
                    v-model="labResults.hemoglobin"
                    label="Hemoglobin (g/dL)"
                    type="number"
                  ></v-text-field>
                  <v-btn
                    color="primary"
                    type="submit"
                    :loading="loading"
                    block
                  >
                    Analyze Results
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card v-if="analysis" class="mb-4">
              <v-card-title>Analysis Results</v-card-title>
              <v-card-text>
                <div class="analysis-content" v-html="formattedAnalysis"></div>
              </v-card-text>
            </v-card>

            <v-card v-if="showChart" class="mb-4">
              <v-card-title>Results Visualization</v-card-title>
              <v-card-text>
                <line-chart :chart-data="chartData" :options="chartOptions" />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { Line as LineChart } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const loading = ref(false);
const analysis = ref('');
const labResults = ref({
  glucose: '',
  cholesterol: '',
  hemoglobin: ''
});

const showChart = computed(() => {
  return Object.values(labResults.value).some(value => value !== '');
});

const chartData = computed(() => ({
  labels: ['Glucose', 'Cholesterol', 'Hemoglobin'],
  datasets: [{
    label: 'Current Results',
    backgroundColor: '#f87979',
    data: [
      parseFloat(labResults.value.glucose),
      parseFloat(labResults.value.cholesterol),
      parseFloat(labResults.value.hemoglobin)
    ]
  }]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
};

const formattedAnalysis = computed(() => {
  return analysis.value.replace(/\n/g, '<br>');
});

async function analyzeResults() {
  try {
    loading.value = true;
    const response = await axios.post('/api/analyze', {
      labResults: labResults.value
    });
    analysis.value = response.data.analysis;
  } catch (error) {
    console.error('Error:', error);
    analysis.value = 'Error analyzing results. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.analysis-content {
  white-space: pre-line;
  line-height: 1.6;
}
</style>