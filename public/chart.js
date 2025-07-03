// KODE BARU UNTUK MEMBACA CSV
async function fetchData() {
  // Fungsi pembantu untuk mengambil dan mem-parsing file CSV
  const fetchAndParseCsv = async (filePath) => {
    const response = await fetch(filePath);
    const csvText = await response.text();
    // Papa.parse mengubah teks CSV menjadi data yang bisa dibaca JavaScript
    const parsed = Papa.parse(csvText, {
      header: true,          // Baris pertama CSV adalah nama kolom
      dynamicTyping: true,   // Otomatis deteksi angka/teks
      skipEmptyLines: true   // Abaikan baris kosong
    });
    return parsed.data;
  };

  // Panggil fungsi untuk kedua file CSV Anda.
  // Pastikan nama file dan path-nya benar!
  const data = await fetchAndParseCsv('./data/data_phimart.csv');
  const cluster = await fetchAndParseCsv('./data/cluster_phimart.csv');
  
  return { data, cluster };
}

function getKategoriMap() {
  return { "0": "Tidak Laris", "1": "Sedang", "2": "Laris" };
}

function getChartColors() {
  // Color palette gradasi hijau muda ke biru muda
  return {
    bar: {
      gradient: ['#4ade80', '#38bdf8'], // hijau muda ke biru muda
      solid: '#4ade80'
    },
    bar2: {
      gradient: ['#38bdf8', '#4ade80'], // biru muda ke hijau muda
      solid: '#38bdf8'
    },
    income: {
      gradient: ['#4ade80', '#38bdf8'], // hijau muda ke biru muda
      solid: '#38bdf8'
    },
    pie: ['#4ade80', '#38bdf8', '#a7f3d0'], // hijau muda, biru muda, hijau pastel
    branch: '#a7f3d0', // hijau pastel
    scatter: ['#4ade80', '#38bdf8', '#a7f3d0'], // tiap cluster: hijau muda, biru muda, hijau pastel
    box: '#38bdf8', // biru muda
    gridLight: '#e2e8f0',
    gridDark: '#fff',
    textLight: '#2b2d42',
    textDark: '#fff',
    cardBgDark: '#23243a',
    cardBgLight: '#fff'
  };
}

function getBarGradient(ctx, area, colors) {
  const gradient = ctx.createLinearGradient(area.left, 0, area.right, 0);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);
  return gradient;
}

function isDarkMode() {
  return document.body.classList.contains('dark-mode');
}

function getGridColor() {
  const colors = getChartColors();
  return isDarkMode() ? colors.gridDark : colors.gridLight;
}

function getTextColor() {
  const colors = getChartColors();
  return isDarkMode() ? colors.textDark : colors.textLight;
}

function renderCards(data, cluster) {
  const totalPenjualan = data.reduce((a, b) => a + parseInt(b.total_terjual), 0);
  const totalProduk = [...new Set(data.map(d => d.nama_produk))].length;
  const kategoriDominan = Object.entries(cluster.reduce((acc, cur) => {
    acc[cur.Cluster] = (acc[cur.Cluster] || 0) + 1; return acc;
  }, {})).sort((a, b) => b[1] - a[1])[0][0];
  const kategoriMap = getKategoriMap();
  
  document.getElementById('total-penjualan').innerHTML = `<h2>${totalPenjualan.toLocaleString()}</h2><p>Total Penjualan</p>`;
  document.getElementById('total-produk').innerHTML = `<h2>${totalProduk}</h2><p>Jumlah Produk</p>`;
  document.getElementById('kategori-dominan').innerHTML = `<h2>${kategoriMap[kategoriDominan]}</h2><p>Kategori Dominan</p>`;
  document.getElementById('jumlah-transaksi').innerHTML = `<h2>${data.length}</h2><p>Jumlah Transaksi</p>`;
}

function renderTrendChart(data) {
  const trend = {};
  data.forEach(d => {
    const key = `${d.tahun}-${d.bulan.padStart(2, '0')}`;
    trend[key] = (trend[key] || 0) + parseInt(d.total_terjual);
  });
  const labels = Object.keys(trend).sort();
  const values = labels.map(l => trend[l]);
  
  const ctx = document.getElementById('trendChart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'line',
    data: { 
      labels, 
      datasets: [{
        label: 'Total Penjualan', 
        data: values, 
        borderColor: getChartColors().bar.gradient[0],
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return 'rgba(74,222,128,0.10)'; // hijau muda, opasitas 0.10
          // gradasi hijau muda ke biru muda, opasitas 0.18
          const grad = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
          grad.addColorStop(0, 'rgba(74,222,128,0.18)');
          grad.addColorStop(1, 'rgba(56,189,248,0.18)');
          return grad;
        },
        borderWidth: 3,
        tension: 0.3,
        fill: true
      }] 
    },
    options: { 
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        title: { 
          display: true, 
          text: 'Tren Penjualan Bulanan',
          font: { size: 15 },
          color: getTextColor()
        },
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: getGridColor() },
          ticks: { color: getTextColor() }
        },
        x: {
          grid: { display: false },
          ticks: { color: getTextColor() }
        }
      }
    }
  });
  window.charts.push(chart);
}

function renderPieChart(cluster) {
  const kategoriMap = getKategoriMap();
  const count = { "Laris": 0, "Tidak Laris": 0, "Sedang": 0 };
  cluster.forEach(d => count[kategoriMap[d.Cluster]]++);
  const ctx = document.getElementById('pieChart');
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: { 
      labels: Object.keys(count), 
      datasets: [{
        data: Object.values(count), 
        backgroundColor: getChartColors().pie,
        borderWidth: 0,
        hoverOffset: 15
      }] 
    },
    options: { 
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        title: { 
          display: true, 
          text: 'Distribusi Kategori Produk',
          font: { size: 24 },
          color: getTextColor()
        },
        legend: {
          position: 'bottom',
          labels: { 
            padding: 20,
            color: getTextColor()
          }
        }
      },
      cutout: '60%'
    }
  });
  window.charts.push(chart);
}

function renderBarChart(cluster) {
  const sorted = [...cluster].sort((a, b) => b.total_terjual - a.total_terjual).slice(0, 10);
  const ctx = document.getElementById('barChart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'bar',
    data: { 
      labels: sorted.map(d => d.nama_produk), 
      datasets: [{
        label: 'Total Terjual', 
        data: sorted.map(d => d.total_terjual), 
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return getChartColors().bar.solid;
          return getBarGradient(ctx, chartArea, getChartColors().bar.gradient);
        },
        borderRadius: 6,
        borderSkipped: false
      }] 
    },
    options: { 
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        title: { 
          display: true, 
          text: '10 Produk Terlaris',
          font: { size: 24 },
          color: getTextColor()
        },
        legend: { display: false }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: getGridColor() },
          ticks: { color: getTextColor() }
        },
        y: {
          ticks: { color: getTextColor() }
        }
      }
    }
  });
  window.charts.push(chart);
}

function renderIncomeChart(cluster) {
  const sorted = [...cluster].sort((a, b) => b.total_bayar - a.total_bayar).slice(0, 10);
  const ctx = document.getElementById('incomeChart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'bar',
    data: { 
      labels: sorted.map(d => d.nama_produk), 
      datasets: [{
        label: 'Total Pendapatan', 
        data: sorted.map(d => d.total_bayar), 
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return getChartColors().income.solid;
          return getBarGradient(ctx, chartArea, getChartColors().income.gradient);
        },
        borderRadius: 6,
        borderSkipped: false
      }] 
    },
    options: { 
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        title: { 
          display: true, 
          text: '10 Produk Pendapatan Tertinggi',
          font: { size: 24 },
          color: getTextColor()
        },
        legend: { display: false }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: getGridColor() },
          ticks: { color: getTextColor() }
        },
        y: {
          ticks: { color: getTextColor() }
        }
      }
    }
  });
  window.charts.push(chart);
}

function renderBranchSales(data) {
  const branchSales = {};
  data.forEach(d => {
    if (!branchSales[d.nama_cabang]) branchSales[d.nama_cabang] = 0;
    branchSales[d.nama_cabang] += parseInt(d.total_terjual);
  });
  const labels = Object.keys(branchSales);
  const values = labels.map(l => branchSales[l]);
  const ctx = document.getElementById('branchSalesChart');
  const chart = new Chart(ctx, {
    type: 'bar',
    data: { 
      labels, 
      datasets: [{
        label: 'Total Penjualan per Cabang', 
        data: values, 
        backgroundColor: getChartColors().branch,
        borderRadius: 8
      }] 
    },
    options: { 
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        title: { 
          display: true, 
          text: 'Penjualan per Cabang',
          font: { size: 24 },
          color: getTextColor()
        },
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: getGridColor() },
          ticks: { color: getTextColor() }
        },
        x: {
          ticks: { color: getTextColor() }
        }
      }
    }
  });
  window.charts.push(chart);
}

// HAPUS: renderProductMonthHeatmap

// Boxplot tetap HTML table, tidak perlu chart.js
function renderBoxplotCluster(cluster) {
  const kategoriMap = { "0": "Tidak Laris", "1": "Sedang", "2": "Laris" };
  const clusters = [0,1,2];
  
  const boxData = clusters.map(cl => {
    const vals = cluster.filter(d=>d.Cluster==cl).map(d=>+d.total_terjual).sort((a,b)=>a-b);
    if (vals.length === 0) return {label:kategoriMap[cl], min:0, q1:0, med:0, q3:0, max:0};
    
    const q1 = vals[Math.floor(vals.length*0.25)];
    const med = vals[Math.floor(vals.length*0.5)];
    const q3 = vals[Math.floor(vals.length*0.75)];
    
    return {label:kategoriMap[cl], min:vals[0], q1, med, q3, max:vals[vals.length-1]};
  });
  
  let html = '<div class="chart-container" id="boxplot-container"><h3>Boxplot Penjualan per Cluster</h3>';
  html += '<div class="table-responsive"><table><thead><tr><th>Cluster</th><th>Min</th><th>Q1</th><th>Median</th><th>Q3</th><th>Max</th></tr></thead><tbody>';
  
  boxData.forEach(b => {
    html += `<tr>
      <td>${b.label}</td>
      <td>${b.min}</td>
      <td>${b.q1}</td>
      <td>${b.med}</td>
      <td>${b.q3}</td>
      <td>${b.max}</td>
    </tr>`;
  });
  
  html += '</tbody></table></div></div>';
  document.getElementById('boxplot-area').innerHTML = html;
}

function renderScatterCluster(cluster) {
  // Warna cluster: orange, ungu, pink
  const clusterColors = getChartColors().scatter;
  const data = cluster.map(d => ({
    x: +d.total_terjual,
    y: +d.total_bayar,
    label: d.nama_produk,
    cluster: d.Cluster
  }));
  const ctx = document.getElementById('scatterClusterChart');
  const chart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Tidak Laris',
          data: data.filter(d => d.cluster == 0),
          backgroundColor: clusterColors[0],
          pointRadius: 8,
          pointHoverRadius: 10
        },
        {
          label: 'Sedang',
          data: data.filter(d => d.cluster == 1),
          backgroundColor: clusterColors[1],
          pointRadius: 8,
          pointHoverRadius: 10
        },
        {
          label: 'Laris',
          data: data.filter(d => d.cluster == 2),
          backgroundColor: clusterColors[2],
          pointRadius: 8,
          pointHoverRadius: 10
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { 
          display: true, 
          text: 'Scatter Plot Total Terjual vs Total Bayar per Produk',
          font: { size: 24 },
          color: getTextColor()
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const d = context.raw;
              return `${d.label}: Terjual ${d.x}, Bayar ${d.y}`;
            }
          }
        }
      },
      scales: {
        x: { 
          title: { 
            display: true, 
            text: 'Total Terjual',
            color: getTextColor()
          },
          grid: { color: getGridColor() },
          ticks: { color: getTextColor() }
        },
        y: { 
          title: { 
            display: true, 
            text: 'Total Bayar',
            color: getTextColor()
          },
          grid: { color: getGridColor() },
          ticks: { color: getTextColor() }
        }
      }
    }
  });
  window.charts.push(chart);
}

fetchData().then(({ data, cluster }) => {
  window.charts = [];
  cluster.forEach(d => { d.total_terjual = +d.total_terjual; d.total_bayar = +d.total_bayar; });
  renderCards(data, cluster);
  renderTrendChart(data);
  renderPieChart(cluster);
  renderBarChart(cluster);
  renderIncomeChart(cluster);
  renderBoxplotCluster(cluster);
  renderBranchSales(data);
  renderScatterCluster(cluster);
});