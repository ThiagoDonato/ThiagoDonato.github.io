'''
Count 2413 occurences naively but also collecting all the occurences and their types
Input: permutation as a list
Return: list
        types - list counting type 1, 2, 3 occurences respectively ONLY for horizontal (left-right) type 2 and 3
'''
def count_2413_w_set_type(permutation):
    types = [0, 0, 0]
    P = permutation
    n = len(P)
    for i in range(n-3):
        for j in range(i+1,n-2):
            if P[i] < P[j]:
                for k in range(j+1,n-1):
                    if P[k] < P[i]:
                        for l in range(k+1,n):
                            if P[l] < P[j] and P[l] >  P[i]:
                                occur = [P[i],P[j],P[k],P[l]]
                                if (check_type_1(occur, n)):
                                  types[0] += 1
                                elif (check_type_2(occur, n)):
                                  types[1] += 1
                                elif (check_type_3(occur, n)):
                                  types[2] += 1
    return types

def check_type_1(element, n):
  if (element[0] >= n / 4 and element[1] >= 3 * n / 4 and element[2] < n / 4 and element[3] < 3 * n / 4):
    return True

  return False

def check_type_2(element, n):
  works = 0
  for i in range(len(element)):
    if (element[i] < n / 4 or element[i] >= 3 * n / 4):
      works += 1

  return works == 1

def check_type_3(element, n):
  for i in range(len(element)):
      if (element[i] < n / 4 or element[i] >= 3 * n / 4):
        return False
  return True