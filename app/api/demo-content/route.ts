import { NextResponse } from "next/server";

export async function GET() {
  const sampleContent = `
# Advanced Data Structures and Algorithms

Data structures are specialized formats for organizing, processing, retrieving and storing data. An algorithm is defined as a step-by-step procedure for solving a problem or completing a task. Together, they form the foundation of efficient programming and software development.

## Fundamental Data Structures

### Arrays and Dynamic Arrays
Arrays are collections of elements stored in contiguous memory locations. Dynamic arrays, such as vectors in C++ or lists in Python, can resize automatically. The key characteristics include:
- Random access: O(1) time complexity for accessing elements by index
- Sequential storage: Elements are stored in adjacent memory locations
- Fixed or dynamic size: Traditional arrays have fixed size, while dynamic arrays can grow

### Linked Lists
A linked list is a linear data structure where elements are stored in nodes, and each node contains data and a reference to the next node. Types include:
- Singly linked lists: Each node points to the next node
- Doubly linked lists: Each node has pointers to both next and previous nodes
- Circular linked lists: The last node points back to the first node

### Trees and Binary Search Trees
Trees are hierarchical data structures consisting of nodes connected by edges. A binary search tree (BST) is a special type where:
- Each node has at most two children (left and right)
- Left subtree contains values less than the parent node
- Right subtree contains values greater than the parent node
- Search, insertion, and deletion operations have O(log n) average time complexity

### Hash Tables
Hash tables use hash functions to map keys to array indices, providing efficient data retrieval. The process involves:
- Hash function: Converts keys into array indices
- Collision handling: Manages cases where multiple keys hash to the same index
- Load factor: Ratio of stored elements to table size affects performance

## Algorithm Analysis

### Time Complexity
Time complexity measures how the runtime of an algorithm grows with input size. Common complexities include:
- O(1): Constant time - operations that take the same time regardless of input size
- O(log n): Logarithmic time - algorithms that divide the problem in half each step
- O(n): Linear time - algorithms that process each element once
- O(n²): Quadratic time - algorithms with nested loops over the input

### Space Complexity
Space complexity measures the amount of memory an algorithm uses relative to input size. This includes:
- Auxiliary space: Extra memory used by the algorithm
- Input space: Memory required to store the input
- Total space: Sum of auxiliary and input space

## Sorting Algorithms

### Quick Sort
Quick sort is a divide-and-conquer algorithm that works by selecting a pivot element and partitioning the array around it. The process involves:
1. Choose a pivot element from the array
2. Partition the array so elements smaller than pivot are on the left
3. Recursively apply the same process to sub-arrays
4. Average time complexity: O(n log n), worst case: O(n²)

### Merge Sort
Merge sort divides the array into halves, sorts them separately, and then merges the sorted halves. The algorithm guarantees:
- Stable sorting: Maintains relative order of equal elements
- Consistent O(n log n) time complexity in all cases
- Requires O(n) additional space for merging

## Graph Algorithms

### Breadth-First Search (BFS)
BFS explores a graph level by level, visiting all neighbors before moving to the next level. Applications include:
- Finding shortest path in unweighted graphs
- Level-order traversal of trees
- Connected component detection

### Depth-First Search (DFS)
DFS explores as far as possible along each branch before backtracking. Common uses include:
- Topological sorting
- Cycle detection in graphs
- Finding strongly connected components

## Dynamic Programming

Dynamic programming solves complex problems by breaking them into simpler subproblems and storing results to avoid redundant calculations. Key principles include:
- Optimal substructure: Optimal solution contains optimal solutions to subproblems
- Overlapping subproblems: Same subproblems are solved multiple times
- Memoization: Store results of expensive function calls

## Practical Applications

Modern software systems rely heavily on efficient data structures and algorithms:
- Database indexing uses B-trees for fast data retrieval
- Web search engines employ graph algorithms for page ranking
- Compression algorithms use trees and dynamic programming
- Machine learning algorithms optimize using gradient descent and other techniques
- Network routing protocols use shortest path algorithms

Understanding these concepts is essential for writing efficient code and solving complex computational problems in software development.
`;

  return NextResponse.json({
    success: true,
    content: sampleContent.trim(),
    fileName: "Machine Learning Introduction.md",
    fileUrl: "demo://sample-content"
  });
}