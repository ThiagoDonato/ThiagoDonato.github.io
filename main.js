import { n3Fitness }              from './fitness.js';
import { count2413WithSetType }   from './countingTypes.js';
import { applyOptimizer }         from './optimizer.js';

/******************** Global Variables ********************/
let optimizerMode = false;     // Are we in optimizer mode or not
let swapSelection = [];        // Tracks up to 2 points for swapping
let selectedIndices = [];      // Tracks points for subsequence optimization
window.currentPermutation = []; // The active permutation array

// We'll keep references to the chart layout & config
let chartLayout = {
  width: 500,
  height: 500,
  margin: { l: 50, r: 50, t: 50, b: 50 }
};

let chartConfig = {
  scrollZoom: true,    // Allow scroll-based zoom
  responsive: true     // Make the plot responsive
};

let chartRef; // Will store the reference to the created Plotly chart

/******************** INITIALIZE PLOT (One-Time) ********************/
function initializePlot(perm) {
  // Build the initial trace with default colors
  const trace = {
    x: perm.map((_, i) => i),
    y: perm,
    mode: "markers",
    marker: { size: 12, color: "blue" },
    type: "scatter"
  };

  // Create the plot once
  Plotly.newPlot("chart", [trace], chartLayout, chartConfig).then(graph => {
    chartRef = graph; // Store reference
    // Register the click callback
    chartRef.on("plotly_click", data => {
      const clickedIndex = data.points[0].x; 
      handlePointClick(clickedIndex);
    });
  });

  updateFitnessCount(perm);
}

/******************** UPDATE PLOT (Subsequent Changes) ********************/
function updatePlot(perm) {
  // Build a color array: red=swap, green=optimizer, blue=default
  const colors = perm.map((_, i) => {
    if (swapSelection.includes(i)) return "red";
    if (selectedIndices.includes(i)) return "green";
    return "blue";
  });

  // Prepare updated trace
  const updatedTrace = {
    x: perm.map((_, i) => i),
    y: perm,
    marker: { size: 12, color: colors }
  };

  // Use Plotly.react to preserve zoom & pan
  Plotly.react("chart", [ {
      ...updatedTrace,
      mode: "markers",
      type: "scatter"
    } ],
    chartLayout,
    chartConfig
  );

  updateFitnessCount(perm);
}

/******************** EVENT LISTENERS ********************/
document.getElementById("plotBtn").addEventListener("click", () => {
  const input = document.getElementById("permInput").value;
  const perm = input.split(",").map(Number).filter(num => !isNaN(num));
  window.currentPermutation = perm;

  resetSelections();

  // Initialize the plot for the first time
  initializePlot(perm);
});

document.getElementById("toggleOptimizerMode").addEventListener("click", () => {
  optimizerMode = !optimizerMode;
  resetSelections();
  document.getElementById("toggleOptimizerMode").innerText =
    `Optimizer Mode: ${optimizerMode ? "ON" : "OFF"}`;
});

document.getElementById("applyOptimizer").addEventListener("click", () => {
    if (selectedIndices.length > 0) {
      optimizeSubsequence();
    } else {
      alert("Please select at least one point before applying the optimizer.");
    }
});

document.getElementById("copyPermBtn").addEventListener("click", () => {
    // Get the current permutation
    const perm = window.currentPermutation;
    
    // Convert to a comma-separated string
    const permString = perm.join(",");
    
    // Copy to clipboard
    navigator.clipboard.writeText(permString)
      .then(() => {
        // Provide feedback that the copy was successful
        const originalText = document.getElementById("copyPermBtn").innerText;
        document.getElementById("copyPermBtn").innerText = "Copied!";
        
        // Reset button text after 2 seconds
        setTimeout(() => {
          document.getElementById("copyPermBtn").innerText = originalText;
        }, 2000);
      })
      .catch(err => {
        console.error("Failed to copy permutation: ", err);
        alert("Failed to copy permutation to clipboard.");
      });
  });

/******************** POINT CLICK HANDLER ********************/
function handlePointClick(index) {
  // If we're in optimizer mode, gather points for optimization
  if (optimizerMode) {
    if (selectedIndices.includes(index)) {
      // Deselect if already selected
      selectedIndices = selectedIndices.filter(i => i !== index);
    } else {
      selectedIndices.push(index);
    }
    // Enable/disable Apply Optimizer button
    document.getElementById("applyOptimizer").disabled = selectedIndices.length === 0;

  } else {
    // Swap mode: select exactly two points
    if (swapSelection.includes(index)) {
      swapSelection = swapSelection.filter(i => i !== index);
    } else {
      swapSelection.push(index);
    }
    // If we have two points, perform the swap and reset
    if (swapSelection.length === 2) {
      swapPoints(swapSelection[0], swapSelection[1]);
      swapSelection = [];
    }
  }

  // Update the chart with new color coding
  updatePlot(window.currentPermutation);
}

/******************** SWAP TWO POINTS ********************/
function swapPoints(i1, i2) {
  const perm = window.currentPermutation;
  [perm[i1], perm[i2]] = [perm[i2], perm[i1]];
  updatePlot(perm);
}

/******************** OPTIMIZE SUBSEQUENCE ********************/
function optimizeSubsequence() {
  const perm = window.currentPermutation;
  selectedIndices.sort((a, b) => a - b);
  const subseq = selectedIndices.map(i => perm[i]);

  applyOptimizer(subseq)
    .then(optimizedSubseq => {
      // Replace the selected indices with the optimized arrangement
      selectedIndices.forEach((idx, j) => {
        perm[idx] = optimizedSubseq[j];
      });

      selectedIndices = [];
      document.getElementById("applyOptimizer").disabled = true;
      updatePlot(perm);
    })
    .catch(err => {
      alert(err.message);
      selectedIndices = [];
      updatePlot(perm);
      console.error("Error optimizing subsequence:", err);
    });
}

/******************** RESET SELECTIONS ********************/
function resetSelections() {
  swapSelection = [];
  selectedIndices = [];
  document.getElementById("applyOptimizer").disabled = true;
}

/******************** UPDATE FITNESS COUNT ********************/
function updateFitnessCount(perm) {
  try {
    // total 2413 occurrences
    const total = n3Fitness(perm);
    document.getElementById("countOutput").innerText = total;

    // subtype breakdown
    const [type1, type2, type3] = count2413WithSetType(perm);
    document.getElementById("type1Output").innerText = type1;
    document.getElementById("type2Output").innerText = type2;
    document.getElementById("type3Output").innerText = type3;
  } catch (err) {
    console.error("Error computing 2413 fitness:", err);
  }
}
