# Author: Murisi Tarusenga

import math

# The following is a divide-and-conquer algorithm to find the maximum sum subarray of a
# given array. It works by recursively finding the maximum subarray attached to the left
# boundary, the maximum subarray attached to the right boundary, the maximum subarray
# attached to both boundaries, and the maximum subarray in the absolute sense, and then
# combining the results.

# Time complexity satisfies the equation T(n)=2T(n/2)+c. Hence T(n)=an-c=O(n).

# The following function works on indicies frm to to of the array x. It returns a
# quadruple whose:
# 1) first element is the maximum sum subarray,
# 2) second element is the maximum sum subarray starting at frm,
# 3) third element is the maximum sum subarray ending at to,
# 4) fourth element is the total sum

def max_sub_arr_aux(frm, to, x):
  if frm == to:
    # Trivial case: empty array
    return ((frm, to, 0), (frm, to, 0), (frm, to, 0), (frm, to, 0))
  elif frm + 1 == to and x[frm] <= 0:
    # Trivial case: singleton array containing non-positive element
    return ((frm, frm, 0), (frm, frm, 0), (to, to, 0), (frm, to, x[frm]))
  elif frm + 1 == to:
    # Trivial case: singleton array containing positive element
    return ((frm, to, x[frm]), (frm, to, x[frm]), (frm, to, x[frm]), (frm, to, x[frm]))
  else:
    # Cut array roughly into half and solve augmented maximum subarray problem on both
    mid = math.ceil((frm+to)/2)
    ((lifrm, lito, lisum), (llfrm, llto, llsum), (lrfrm, lrto, lrsum), (lofrm, loto, losum)) = max_sub_arr_aux(frm, mid, x)
    ((rifrm, rito, risum), (rlfrm, rlto, rlsum), (rrfrm, rrto, rrsum), (rofrm, roto, rosum)) = max_sub_arr_aux(mid, to, x)
    # Figure out the sum of the maximum subarray on left boundary, right boundary, and on
    # neither boundary.
    isum = max(lisum, lrsum+rlsum, risum)
    lsum = max(llsum, losum+rlsum)
    rsum = max(lrsum+rosum, rrsum)
    # Figure out the indicies corresponding to the above sums.
    if isum == lisum:
      (ifrm, ito) = (lifrm, lito)
    elif isum == lrsum+rlsum:
      (ifrm, ito) = (lrfrm, rlto)
    elif isum == risum:
      (ifrm, ito) = (rifrm, rito)
    if lsum == llsum:
      (lfrm, lto) = (llfrm, llto)
    elif lsum == losum+rlsum:
      (lfrm, lto) = (lofrm, rlto)
    if rsum == lrsum+rosum:
      (rfrm, rto) = (lrfrm, roto)
    elif rsum == rrsum:
      (rfrm, rto) = (rrfrm, rrto)
    return ((ifrm, ito, isum), (lfrm, lto, lsum), (rfrm, rto, rsum), (lofrm, roto, losum+rosum))

# The following function returns a triple containing the from index, to index, and sum
# of the subarray of x with the largest sum.

def max_sub_arr(x):
  return max_sub_arr_aux(0, len(x), x)[0]

# The following evaluates to (3, 7, 32). That is, the maximum subarray begins at index 3
# (inclusive) and ends at index 7 (exclusive) of [5,2,-10, 20, 3, 4, 5,-7], and sums up
# to 32.

max_sub_arr([5,2,-10, 20, 3, 4, 5,-7])

# The following is a bottom-up dynamic programming algorithm for finding the maximum sum
# subarray. It works by building up a table tab such that each entry tab[i][j] equals
# the sum of the elements of x from index i (inclusive) to index j (exclusive). Complexity
# is O(n^2). Return value has same structure as that of max_sub_arr.

def max_sub_arr_dyn(x):
  # The from index, to index, and sum of the maximum subarray known so far.
  msa = (0,0,0)
  # Initialize table for memoization
  tab = [[0]*len(x) for i in range(len(x))]
  for j in range(len(x)):
    for i in range(j, -1, -1):
      if j == i:
        # Trivial case: empty array
        tab[i][j] = 0
      elif i == j-1:
        # Trivial case: singleton array
        tab[i][j] = x[i]
      else:
        # Use associativity of summation to find larger sums
        tab[i][j] = tab[i][j-1] + tab[j-1][j]
      # Track the maximum sum subarray as we calculate sums of subarrays
      if tab[i][j] > msa[2]:
        msa = (i, j, tab[i][j])
  return msa

# Result is the same as that of max_sub_arr

max_sub_arr_dyn([5,2,-10, 20, 3, 4, 5,-7])

