// countingTypes.js
/**
 * Port of count_2413_w_set_type and helpers. :contentReference[oaicite:2]{index=2}
 */
export function count2413WithSetType(P) {
    const types = [0, 0, 0];
    const n = P.length;
  
    for (let i = 0; i < n - 3; i++) {
      for (let j = i + 1; j < n - 2; j++) {
        if (P[i] >= P[j]) continue;
        for (let k = j + 1; k < n - 1; k++) {
          if (P[k] >= P[i]) continue;
          for (let l = k + 1; l < n; l++) {
            if (P[l] < P[j] && P[l] > P[i]) {
              const occ = [P[i], P[j], P[k], P[l]];
              if (checkType1(occ, n)) types[0] += 1;
              else if (checkType2(occ, n)) types[1] += 1;
              else if (checkType3(occ, n)) types[2] += 1;
            }
          }
        }
      }
    }
    return types;
  }
  
  function checkType1(e, n) {
    return e[0] >= n/4 && e[1] >= 3*n/4 && e[2] < n/4 && e[3] < 3*n/4;
  }
  function checkType2(e, n) {
    let edge = 0;
    for (const v of e) if (v < n/4 || v >= 3*n/4) edge += 1;
    return edge === 1;
  }
  function checkType3(e, n) {
    return e.every(v => v >= n/4 && v < 3*n/4);
  }
  