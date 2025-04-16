const apiURL = 'https://api.thingspeak.com/channels/2921362/feeds.json?api_key=GGQFKSK9TDDNO1JX&results=20';

async function fetchSensorData() {
  try {
    const response = await fetch(apiURL);
    const data = await response.json();
    const feeds = data.feeds;

    const timestamps = [];
    const soilData = [];
    const lightData = [];

    let latestLightWarning = 0;
    let latestOverWaterWarning = 0;

    feeds.forEach(feed => {
      const dateObj = new Date(feed.created_at);
      const timestamp = `${dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
      timestamps.push(timestamp);
      soilData.push(parseFloat(feed.field1) || 0);
      lightData.push(parseFloat(feed.field2) || 0);
    });

    if (feeds.length > 0) {
      const latest = feeds[feeds.length - 1];
      latestLightWarning = parseInt(latest.field3) || 0;
      latestOverWaterWarning = parseInt(latest.field4) || 0;
    }

    updateCharts(timestamps, soilData, lightData);
    updateWarnings(latestLightWarning, latestOverWaterWarning);

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function updateCharts(timestamps, soilData, lightData) {
  const soilCtx = document.getElementById('soilChart').getContext('2d');
  const lightCtx = document.getElementById('lightChart').getContext('2d');

  new Chart(soilCtx, {
    type: 'line',
    data: {
      labels: timestamps,
      datasets: [{
        label: 'Soil Moisture',
        data: soilData,
        borderColor: '#76ff03',
        backgroundColor: 'rgba(118, 255, 3, 0.2)',
        fill: true,
        tension: 0.4
      }]
    },
    options: chartOptions()
  });

  new Chart(lightCtx, {
    type: 'line',
    data: {
      labels: timestamps,
      datasets: [{
        label: 'Light Level',
        data: lightData,
        borderColor: '#ffc107',
        backgroundColor: 'rgba(255, 193, 7, 0.2)',
        fill: true,
        tension: 0.4
      }]
    },
    options: chartOptions()
  });
}

function chartOptions() {
  return {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#fff'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#fff'
        },
        title: {
          color: '#fff'
        }
      },
      y: {
        ticks: {
          color: '#fff'
        },
        title: {
          color: '#fff'
        }
      }
    }
  };
}

function updateWarnings(lightWarning, overWaterWarning) {
  const warningBox = document.getElementById('warningBox');

  if (lightWarning) {
    warningBox.style.display = 'block';
    warningBox.innerHTML = "⚠️ Excess light detected! It can damage your plants. Consider adjusting the lighting.";
  } else if (overWaterWarning) {
    warningBox.style.display = 'block';
    warningBox.innerHTML = "⚠️ Overwatering detected! Excess water usage is leading to higher carbon emissions and damaging plants. Reduce watering to save plants and resources!";
  } else {
    warningBox.style.display = 'none';
  }
}

window.onload = fetchSensorData;
