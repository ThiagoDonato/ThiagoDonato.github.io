// optimizer.js  (replace the old applyOptimizer with this one)
let tablePromise;

// one-time fetch of optimizers.json
async function loadTable() {
  if (!tablePromise) {
    tablePromise = fetch('optimizers.json').then(r => r.json());
  }
  return tablePromise;
}

/**
 * Apply the pre-computed pattern for a given subsequence length.
 * Behaviour now mirrors the Python apply_optimizer step-for-step.
 * @param {number[]} subseq  The values user selected in the permutation
 * @returns {Promise<number[]>}  Re-ordered subsequence
 */
export async function applyOptimizer(subseq) {
  const map = await loadTable();
  const key = String(subseq.length);

  if (!map[key]) {
    throw new Error('No optimizer available for this length');
  }

  // 1) Ascending sort of the chosen values
  const sortedVals = [...subseq].sort((a, b) => a - b);

  // 2) Apply the zero-based permutation pattern directly to the *sorted* list
  const pattern = map[key];           // e.g. [1, 3, 0, 2]
  const newSubseq = pattern.map(i => sortedVals[i]);

  return newSubseq;                   // ready to splice back into perm
}
