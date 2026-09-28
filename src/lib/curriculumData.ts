/**
 * SkillSync AI — Multi-Subject Curriculum Catalog
 * Comprehensive curriculum definitions for Mathematics, Operating Systems, Computer Networks, and DSA.
 */

export interface SubjectDefinition {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  color: string;
  topics: TopicDefinition[];
}

export interface TopicDefinition {
  id: string;
  name: string;
  description: string;
  order: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  prerequisites: string[];
  keyConcept: string;
}

export const MULTI_SUBJECT_CATALOG: SubjectDefinition[] = [
  {
    id: "sub_math",
    name: "Mathematics",
    code: "MATH-101",
    description: "High-yield foundational to advanced algebra: Algebraic Manipulation, Factorisation, and Quadratic Equations.",
    icon: "📐",
    color: "indigo",
    topics: [
      {
        id: "math_t1",
        name: "Algebraic Manipulation",
        description: "Expanding brackets, collecting like terms, and working with algebraic fractions",
        order: 1,
        difficulty: "beginner",
        estimatedMinutes: 15,
        prerequisites: [],
        keyConcept: "Distributive law: a(b + c) = ab + ac",
      },
      {
        id: "math_t2",
        name: "Factorisation",
        description: "Factoring out GCF, grouping, difference of two squares, and monic trinomial factoring",
        order: 2,
        difficulty: "intermediate",
        estimatedMinutes: 20,
        prerequisites: ["Algebraic Manipulation"],
        keyConcept: "Splitting middle terms: x² + (p+q)x + pq = (x+p)(x+q)",
      },
      {
        id: "math_t3",
        name: "Quadratic Equations",
        description: "Standard form ax² + bx + c = 0, discriminant test, and quadratic formula application",
        order: 3,
        difficulty: "intermediate",
        estimatedMinutes: 25,
        prerequisites: ["Factorisation"],
        keyConcept: "Roots: x = (-b ± √(b² - 4ac)) / (2a)",
      },
      {
        id: "math_t4",
        name: "Polynomials",
        description: "Degree, roots, polynomial division, and the Factor / Remainder theorems",
        order: 4,
        difficulty: "intermediate",
        estimatedMinutes: 20,
        prerequisites: ["Algebraic Manipulation"],
        keyConcept: "Factor Theorem: P(c) = 0 implies (x - c) is a factor",
      },
      {
        id: "math_t5",
        name: "Coordinate Geometry",
        description: "Parabolas, vertex form, axis of symmetry, and intercepts on the Cartesian plane",
        order: 5,
        difficulty: "advanced",
        estimatedMinutes: 30,
        prerequisites: ["Quadratic Equations"],
        keyConcept: "Vertex form: y = a(x - h)² + k",
      },
    ],
  },
  {
    id: "sub_os",
    name: "Operating Systems",
    code: "CS-301",
    description: "Core principles of process management, CPU scheduling, deadlocks, and virtual memory paging.",
    icon: "💻",
    color: "purple",
    topics: [
      {
        id: "os_t1",
        name: "Process Scheduling",
        description: "Preemptive vs non-preemptive algorithms: FCFS, SJF, Round Robin, and Priority Scheduling.",
        order: 1,
        difficulty: "beginner",
        estimatedMinutes: 20,
        prerequisites: [],
        keyConcept: "Turnaround Time = Completion - Arrival; Waiting Time = Turnaround - Burst",
      },
      {
        id: "os_t2",
        name: "Deadlocks",
        description: "Four Coffman conditions, resource allocation graphs, and Dijkstra's Banker's Algorithm.",
        order: 2,
        difficulty: "intermediate",
        estimatedMinutes: 25,
        prerequisites: ["Process Scheduling"],
        keyConcept: "Banker's Algorithm: Need[i] = Max[i] - Allocation[i]; Safe state analysis",
      },
      {
        id: "os_t3",
        name: "Virtual Memory & Paging",
        description: "MMU address translation, page tables, page faults, and LRU / FIFO replacement algorithms.",
        order: 3,
        difficulty: "advanced",
        estimatedMinutes: 30,
        prerequisites: ["Process Scheduling"],
        keyConcept: "Effective Access Time (EAT) = (1 - p)*Memory_Access + p*Page_Fault_Overhead",
      },
      {
        id: "os_t4",
        name: "Concurrency & Semaphores",
        description: "Critical section problem, Peterson's algorithm, mutex locks, and counting semaphores.",
        order: 4,
        difficulty: "intermediate",
        estimatedMinutes: 25,
        prerequisites: ["Process Scheduling"],
        keyConcept: "Atomic wait() and signal() semaphore operations",
      },
    ],
  },
  {
    id: "sub_cn",
    name: "Computer Networks",
    code: "CS-302",
    description: "Layered architecture, IPv4/IPv6 CIDR subnetting, TCP reliable transport, and routing protocols.",
    icon: "🌐",
    color: "emerald",
    topics: [
      {
        id: "cn_t1",
        name: "OSI & TCP/IP Models",
        description: "7-layer vs 4-layer models, protocol data units, and layer encapsulation/decapsulation.",
        order: 1,
        difficulty: "beginner",
        estimatedMinutes: 15,
        prerequisites: [],
        keyConcept: "Application (Message) -> Transport (Segment) -> Network (Packet) -> Link (Frame)",
      },
      {
        id: "cn_t2",
        name: "IP Addressing & Subnetting",
        description: "IPv4 classful vs CIDR notation, subnet masks, network IDs, and broadcast addresses.",
        order: 2,
        difficulty: "intermediate",
        estimatedMinutes: 25,
        prerequisites: ["OSI & TCP/IP Models"],
        keyConcept: "Usable hosts per subnet = 2^(32 - prefix) - 2",
      },
      {
        id: "cn_t3",
        name: "TCP Flow & Congestion Control",
        description: "Three-way handshake (SYN, SYN-ACK, ACK), sliding window, slow start, and AIMD.",
        order: 3,
        difficulty: "advanced",
        estimatedMinutes: 30,
        prerequisites: ["OSI & TCP/IP Models"],
        keyConcept: "Window = min(cwnd, rwnd); Multiplicative decrease on packet loss",
      },
      {
        id: "cn_t4",
        name: "Routing Protocols",
        description: "Intra-domain vs inter-domain routing: Distance Vector (Bellman-Ford) and Link State (Dijkstra / OSPF).",
        order: 4,
        difficulty: "advanced",
        estimatedMinutes: 30,
        prerequisites: ["IP Addressing & Subnetting"],
        keyConcept: "Count-to-infinity problem & Split Horizon solution",
      },
    ],
  },
  {
    id: "sub_dsa",
    name: "Data Structures & Algorithms",
    code: "CS-201",
    description: "Fundamental and advanced algorithms: Asymptotic analysis, Trees, Graphs, and Dynamic Programming.",
    icon: "⚡",
    color: "amber",
    topics: [
      {
        id: "dsa_t1",
        name: "Asymptotic Complexity",
        description: "Big-O, Big-Omega, Big-Theta bounds, and Master Theorem for divide-and-conquer recurrences.",
        order: 1,
        difficulty: "beginner",
        estimatedMinutes: 15,
        prerequisites: [],
        keyConcept: "Master Theorem: T(n) = aT(n/b) + O(n^d)",
      },
      {
        id: "dsa_t2",
        name: "Binary Search Trees",
        description: "BST invariant, inorder traversal, node insertion, deletion with in-order successor, and AVL balancing.",
        order: 2,
        difficulty: "intermediate",
        estimatedMinutes: 25,
        prerequisites: ["Asymptotic Complexity"],
        keyConcept: "Inorder traversal of a BST yields elements in sorted order",
      },
      {
        id: "dsa_t3",
        name: "Graph Algorithms",
        description: "Breadth-First Search (BFS), Depth-First Search (DFS), topological sort, and Dijkstra's algorithm.",
        order: 3,
        difficulty: "advanced",
        estimatedMinutes: 30,
        prerequisites: ["Asymptotic Complexity"],
        keyConcept: "BFS uses FIFO Queue for shortest paths; DFS uses recursion/stack",
      },
      {
        id: "dsa_t4",
        name: "Dynamic Programming",
        description: "Optimal substructure, overlapping subproblems, memoization vs tabulation, and 0/1 Knapsack.",
        order: 4,
        difficulty: "advanced",
        estimatedMinutes: 35,
        prerequisites: ["Asymptotic Complexity"],
        keyConcept: "State transition equation: dp[i] = optimal choice of sub-states",
      },
    ],
  },
];
