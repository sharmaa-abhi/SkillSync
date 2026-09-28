import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedMultiSubjects() {
  console.log("🌱 Upserting Multi-Subject Curriculum into SkillSync Database...");

  // 1. Operating Systems
  const os = await prisma.subject.upsert({
    where: { name: "Operating Systems" },
    update: { isActive: true },
    create: {
      name: "Operating Systems",
      description: "Core principles of process management, CPU scheduling, deadlocks, and virtual memory paging.",
      icon: "💻",
      isActive: true,
    },
  });
  console.log(`✅ Subject: ${os.name} (${os.id})`);

  const osTopics = [
    { name: "Process Scheduling", description: "Preemptive vs non-preemptive algorithms: FCFS, SJF, Round Robin, and Priority Scheduling.", order: 1, difficulty: "beginner" },
    { name: "Deadlocks", description: "Four Coffman conditions, resource allocation graphs, and Dijkstra's Banker's Algorithm.", order: 2, difficulty: "intermediate" },
    { name: "Virtual Memory & Paging", description: "MMU address translation, page tables, page faults, and LRU replacement.", order: 3, difficulty: "advanced" },
    { name: "Concurrency & Mutex", description: "Critical section problem, Peterson's algorithm, mutex locks, and counting semaphores.", order: 4, difficulty: "intermediate" },
  ];

  for (const t of osTopics) {
    const topic = await prisma.topic.upsert({
      where: { subjectId_name: { subjectId: os.id, name: t.name } },
      update: {},
      create: { ...t, subjectId: os.id },
    });

    // Seed questions for diagnostic
    const existingQ = await prisma.question.findFirst({ where: { topicId: topic.id } });
    if (!existingQ) {
      if (t.name === "Process Scheduling") {
        await prisma.question.create({
          data: {
            topicId: topic.id,
            text: "In Round Robin CPU scheduling, if the time quantum is extremely large, the algorithm behaves identically to which policy?",
            options: JSON.stringify(["First-Come, First-Served (FCFS)", "Shortest Job First (SJF)", "Priority Preemptive", "Multilevel Feedback Queue"]),
            correctAnswer: 0,
            explanation: "As time quantum approaches infinity, each process runs to completion without preemption, mimicking FCFS.",
            difficulty: "easy",
            type: "assessment",
          },
        });
      } else if (t.name === "Deadlocks") {
        await prisma.question.create({
          data: {
            topicId: topic.id,
            text: "Which of the following is NOT one of the four necessary Coffman conditions required for a deadlock to occur?",
            options: JSON.stringify(["Mutual Exclusion", "Hold and Wait", "Preemption Allowed", "Circular Wait"]),
            correctAnswer: 2,
            explanation: "No preemption is required for deadlocks; allowing preemption eliminates circular waiting and breaks deadlocks.",
            difficulty: "medium",
            type: "assessment",
          },
        });
      } else if (t.name === "Virtual Memory & Paging") {
        await prisma.question.create({
          data: {
            topicId: topic.id,
            text: "What event occurs when a CPU attempts to access a page marked invalid in the page table?",
            options: JSON.stringify(["Page Fault Interrupt", "System Kernel Panic", "TLB Flush", "Buffer Cache Miss"]),
            correctAnswer: 0,
            explanation: "An invalid page table bit triggers a page fault trap to the OS kernel to bring the missing page into physical RAM.",
            difficulty: "medium",
            type: "assessment",
          },
        });
      } else {
        await prisma.question.create({
          data: {
            topicId: topic.id,
            text: "What is the primary condition that semaphores satisfy to guarantee mutual exclusion in critical sections?",
            options: JSON.stringify(["Atomic wait() and signal() execution", "Busy-waiting loops only", "Fixed process ID allocations", "Non-preemptive OS kernel"]),
            correctAnswer: 0,
            explanation: "Atomic execution ensures no two processes can alter the semaphore value simultaneously.",
            difficulty: "medium",
            type: "assessment",
          },
        });
      }
    }
  }

  // 2. Computer Networks
  const cn = await prisma.subject.upsert({
    where: { name: "Computer Networks" },
    update: { isActive: true },
    create: {
      name: "Computer Networks",
      description: "Layered architecture, IPv4/IPv6 CIDR subnetting, TCP reliable transport, and routing protocols.",
      icon: "🌐",
      isActive: true,
    },
  });
  console.log(`✅ Subject: ${cn.name} (${cn.id})`);

  const cnTopics = [
    { name: "OSI & TCP/IP Models", description: "7-layer vs 4-layer architecture, encapsulation, and protocol headers.", order: 1, difficulty: "beginner" },
    { name: "IP Addressing & Subnetting", description: "IPv4 classful vs CIDR notation, subnet masks, network IDs, and host calculation.", order: 2, difficulty: "intermediate" },
    { name: "TCP Flow & Congestion Control", description: "Three-way handshake, sliding window, slow start, and AIMD.", order: 3, difficulty: "advanced" },
    { name: "Routing Protocols", description: "Distance Vector (Bellman-Ford) vs Link State (Dijkstra) and BGP peering.", order: 4, difficulty: "advanced" },
  ];

  for (const t of cnTopics) {
    const topic = await prisma.topic.upsert({
      where: { subjectId_name: { subjectId: cn.id, name: t.name } },
      update: {},
      create: { ...t, subjectId: cn.id },
    });

    const existingQ = await prisma.question.findFirst({ where: { topicId: topic.id } });
    if (!existingQ) {
      if (t.name === "OSI & TCP/IP Models") {
        await prisma.question.create({
          data: {
            topicId: topic.id,
            text: "At which layer of the OSI model does logical IP packet addressing and path determination take place?",
            options: JSON.stringify(["Network Layer (Layer 3)", "Transport Layer (Layer 4)", "Data Link Layer (Layer 2)", "Session Layer (Layer 5)"]),
            correctAnswer: 0,
            explanation: "The Network layer handles logical addressing (IPv4/IPv6) and router packet forwarding.",
            difficulty: "easy",
            type: "assessment",
          },
        });
      } else if (t.name === "IP Addressing & Subnetting") {
        await prisma.question.create({
          data: {
            topicId: topic.id,
            text: "How many usable host IP addresses are available in a /28 IPv4 subnet?",
            options: JSON.stringify(["14", "16", "30", "32"]),
            correctAnswer: 0,
            explanation: "Host bits h = 32 - 28 = 4. Usable hosts = 2^4 - 2 = 16 - 2 = 14 (subtracting network and broadcast addresses).",
            difficulty: "medium",
            type: "assessment",
          },
        });
      } else if (t.name === "TCP Flow & Congestion Control") {
        await prisma.question.create({
          data: {
            topicId: topic.id,
            text: "Which mechanism does TCP use to prevent a fast sender from overflowing a slow receiver's buffer?",
            options: JSON.stringify(["Receiver Advertised Window (rwnd)", "Slow Start Threshold", "AIMD Congestion Window", "Exponential Backoff"]),
            correctAnswer: 0,
            explanation: "TCP Flow Control uses rwnd in the TCP header so the sender never transmits more bytes than the receiver can buffer.",
            difficulty: "medium",
            type: "assessment",
          },
        });
      } else {
        await prisma.question.create({
          data: {
            topicId: topic.id,
            text: "Which routing algorithm is utilized by the Link-State routing protocol OSPF?",
            options: JSON.stringify(["Dijkstra's Shortest Path Algorithm", "Bellman-Ford Distance Vector", "Flooding Protocol", "Spanning Tree Protocol"]),
            correctAnswer: 0,
            explanation: "OSPF nodes flood link-state advertisements and each computes the shortest path tree using Dijkstra's algorithm.",
            difficulty: "medium",
            type: "assessment",
          },
        });
      }
    }
  }

  // 3. Data Structures & Algorithms
  const dsa = await prisma.subject.upsert({
    where: { name: "Data Structures & Algorithms" },
    update: { isActive: true },
    create: {
      name: "Data Structures & Algorithms",
      description: "Fundamental and advanced algorithms: Asymptotic analysis, Trees, Graphs, and Dynamic Programming.",
      icon: "⚡",
      isActive: true,
    },
  });
  console.log(`✅ Subject: ${dsa.name} (${dsa.id})`);

  const dsaTopics = [
    { name: "Asymptotic Complexity", description: "Big-O, Big-Omega, Big-Theta, and Master Theorem for divide-and-conquer recurrences.", order: 1, difficulty: "beginner" },
    { name: "Binary Search Trees", description: "BST invariant, inorder traversal, node insertion, and AVL balancing.", order: 2, difficulty: "intermediate" },
    { name: "Dynamic Programming", description: "Optimal substructure, overlapping subproblems, memoization vs tabulation, and Knapsack.", order: 3, difficulty: "advanced" },
    { name: "Graph Algorithms", description: "Breadth-First Search (BFS), Depth-First Search (DFS), topological sort, and Dijkstra.", order: 4, difficulty: "advanced" },
  ];

  for (const t of dsaTopics) {
    const topic = await prisma.topic.upsert({
      where: { subjectId_name: { subjectId: dsa.id, name: t.name } },
      update: {},
      create: { ...t, subjectId: dsa.id },
    });

    const existingQ = await prisma.question.findFirst({ where: { topicId: topic.id } });
    if (!existingQ) {
      if (t.name === "Asymptotic Complexity") {
        await prisma.question.create({
          data: {
            topicId: topic.id,
            text: "What is the time complexity to build a Binary Heap from an unsorted array of n elements using Bottom-Up Heapify?",
            options: JSON.stringify(["O(n)", "O(n log n)", "O(n²)", "O(log n)"]),
            correctAnswer: 0,
            explanation: "Linear bottom-up build-heap runs in O(n) time due to summing heights across nodes: sum(n/2^(h+1) * O(h)) = O(n).",
            difficulty: "medium",
            type: "assessment",
          },
        });
      } else if (t.name === "Binary Search Trees") {
        await prisma.question.create({
          data: {
            topicId: topic.id,
            text: "What type of tree traversal on a Binary Search Tree (BST) visits elements in ascending sorted order?",
            options: JSON.stringify(["Inorder Traversal", "Preorder Traversal", "Postorder Traversal", "Level-Order Traversal"]),
            correctAnswer: 0,
            explanation: "Inorder traversal (Left, Root, Right) follows the BST invariant (Left < Root < Right), producing sorted keys.",
            difficulty: "easy",
            type: "assessment",
          },
        });
      } else if (t.name === "Dynamic Programming") {
        await prisma.question.create({
          data: {
            topicId: topic.id,
            text: "Which two mathematical properties are required for a problem to be solvable via Dynamic Programming?",
            options: JSON.stringify(["Optimal Substructure & Overlapping Subproblems", "Greedy Choice & Independence", "Divide & Conquer & Linearity", "Monotonicity & Convexity"]),
            correctAnswer: 0,
            explanation: "Dynamic programming requires optimal substructure (optimal solution contains optimal sub-solutions) and overlapping subproblems.",
            difficulty: "medium",
            type: "assessment",
          },
        });
      } else {
        await prisma.question.create({
          data: {
            topicId: topic.id,
            text: "Which data structure is fundamentally utilized to implement Breadth-First Search (BFS) in an unweighted graph?",
            options: JSON.stringify(["FIFO Queue", "LIFO Stack", "Priority Queue / Min-Heap", "Disjoint Set Union (DSU)"]),
            correctAnswer: 0,
            explanation: "A FIFO Queue ensures vertices are explored in order of increasing distance from the starting root.",
            difficulty: "easy",
            type: "assessment",
          },
        });
      }
    }
  }

  console.log("✨ All subjects, topics, and diagnostic questions seeded successfully!");
}

seedMultiSubjects()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
