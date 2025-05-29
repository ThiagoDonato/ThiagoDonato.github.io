// optimizer.js
let tablePromise;

/** Lazy-loads optimizers.json exactly once. */
async function loadTable() {
  if (!tablePromise) {
    tablePromise = fetch('optimizers.json').then(r => r.json());
  }
  return tablePromise;
}

/**
 * Re-orders a selected subsequence using the pre-computed pattern
 * from optimizers.json. Mirrors apply_optimizer in Python. :contentReference[oaicite:3]{index=3}
 * @returns {Promise<number[]>} the optimized subsequence
 */
export async function applyOptimizer(subseq) {
  const map = await loadTable();
  const key = String(subseq.length);

  if (!map[key]) {
    throw new Error('No optimizer available for this length');
  }

  // rank-map & un-rank map
  const sorted = [...subseq].sort((a,b) => a - b);
  const rank   = new Map(sorted.map((v,i) => [v, i]));
  const unrank = sorted;                     // index -> original value

  // convert to ranks
  const normalized = subseq.map(v => rank.get(v));

  // reorder using pattern
  const pattern = map[key];      // zero-based permutation
  const reorderedRanks = pattern.map(i => normalized[i]); // step 4 (logical)
  const reordered      = reorderedRanks.map(i => unrank[i]); // step 6

  return reordered;
}
