from flask import Flask, request, jsonify, send_from_directory
from counting_types import count_2413_w_set_type
from collections import defaultdict
import os
import json

app = Flask(__name__, static_folder='../frontend', static_url_path='')

## Counting functions -- not numba so far because doesn't work well on my Mac
def count_elements_to_right(l1, l2):
    l1_set = set(l1)
    right_count = {x: 0 for x in l1_set}
    count = 0
    
    # Traverse l2 from right to left
    for i in reversed(range(len(l2))):
        if l2[i] in l1_set:
            # If l2[i] is in l1, store the current count for that element
            right_count[l2[i]] = count
        elif l2[i] not in l1_set:
            # If l2[i] is not in l1, increment count
            count += 1
    
    # Sum the right counts for each element in l1
    return sum(right_count[x] for x in l1_set)

def n3_fitness(perm):
    smaller = defaultdict(list)
    larger = defaultdict(list)
    for idx, n in enumerate(perm):
        for i in range(idx+1, len(perm)):
            if perm[i] < n:
                smaller[n].append(perm[i])
            else:
                larger[n].append(perm[i])
    
    out = 0
    for s in list(smaller.keys()):
        list1 = smaller[s]
        for l in larger[s]:
            if l in smaller:     
                out += count_elements_to_right(list1, list(smaller[l]))
    return out

## Helper functions to get data from optimizers
with open("backend/optimizers.json") as f:
    allstar_table = json.load(f)

# Function to apply optimizer to a selected subsequence
def apply_optimizer(subseq):
    length = len(subseq)
    print(length)

    key = str(length)
    if key not in allstar_table:
        return {"error": "No optimizer available for this length"}, 400

    # 1) Build rank map (value -> rank)
    sorted_vals = sorted(subseq)
    rank_map = {val: i for i, val in enumerate(sorted_vals)}
    # 2) Build unrank map (rank -> value)
    unrank_map = {i: val for i, val in enumerate(sorted_vals)}

    # 3) Convert subsequence to ranks
    normalized = [rank_map[val] for val in subseq]

    # 4) Reorder using allstar_table's zero-based pattern
    optimizer = allstar_table[key]  # e.g. [1,3,0,2] for length=4
    reordered = [normalized[i] for i in optimizer]

    # 5) Apply the pattern to create the new arrangement
    reordered = [optimizer[i] for i in range(length)]  # This just copies the pattern
    
    # 6) Unrank them back to original values
    new_subseq = [unrank_map[i] for i in reordered]

    return new_subseq



#testing server
@app.route('/hello', methods=['GET'])
def hello():
    return "Hello from the backend."

# route for counting 2413 patterns
@app.route('/count_2413', methods=['POST'])
def count_2413():
    data = request.get_json()
    permutation = data.get('permutation', [])
    count = n3_fitness(permutation)
    return jsonify({"count":count})

# route for counting types of 2413 patterns
@app.route('/count_2413_types', methods=['POST'])
def count_2413_types():
    data = request.get_json()
    permutation = data.get('permutation', [])
    # Call your new counting logic
    # Suppose count_2413_w_set_type(permutation)[2] => [type1_count, type2_count, type3_count]
    type_counts = count_2413_w_set_type(permutation)
    type1, type2, type3 = type_counts  # Destructure the list

    return jsonify({"type1": type1, "type2": type2, "type3": type3})

@app.route('/optimize_subsequence', methods=['POST'])
def optimize_subsequence():
    data = request.get_json()
    subseq = data.get("subseq", [])

    optimized = apply_optimizer(subseq)

    if isinstance(optimized, tuple):
        return jsonify(optimized[0]), optimized[1]

    return jsonify({"optimized": optimized})                   

# default route to serve front-end from Flask
@app.route('/')
def serve_index():
    return send_from_directory('../frontend', 'index.html')

if __name__ == "__main__":
    app.run(debug=True)