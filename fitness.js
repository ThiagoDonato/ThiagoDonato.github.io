// fitness.js
// Counts every 2413 pattern in permutation P in O(n4) time.
export function n3Fitness(P) {
    let count = 0;
    const n = P.length;
  
    for (let i = 0; i < n - 3; i++) {
      const Pi = P[i];
  
      for (let j = i + 1; j < n - 2; j++) {
        const Pj = P[j];
        if (Pi >= Pj) continue;          // need P[i] < P[j]
  
        for (let k = j + 1; k < n - 1; k++) {
          const Pk = P[k];
          if (Pk >= Pi) continue;        // need P[k] < P[i]
  
          for (let l = k + 1; l < n; l++) {
            const Pl = P[l];
            // need P[i] < P[l] < P[j]
            if (Pl > Pi && Pl < Pj) count += 1;
          }
        }
      }
    }
    return count;
  }
  