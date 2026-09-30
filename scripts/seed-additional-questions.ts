import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding additional questions for OS, CN, and DSA...");

  // 1. Operating Systems
  const os = await prisma.subject.findFirst({
    where: { name: "Operating Systems" },
    include: { topics: true },
  });

  if (os) {
    const topicMap = new Map(os.topics.map(t => [t.name, t.id]));

    const osQuestions = [
      {
        topicId: topicMap.get("Process Scheduling")!,
        text: "Which CPU scheduling algorithm is known to provide the optimal (minimal) average waiting time for a set of stationary processes?",
        options: JSON.stringify(["Shortest Job First (SJF)", "First-Come, First-Served (FCFS)", "Round Robin (RR)", "Priority Scheduling"]),
        correctAnswer: 0,
        explanation: "Shortest Job First (SJF) is provably optimal because scheduling the shortest CPU burst first minimizes total queue waiting time.",
        difficulty: "medium",
      },
      {
        topicId: topicMap.get("Deadlocks")!,
        text: "In Banker's Algorithm for deadlock avoidance, a system state is considered 'safe' if and only if:",
        options: JSON.stringify([
          "There exists at least one sequence of process execution that avoids deadlock",
          "All resources are currently fully allocated without idle units",
          "No process requests more than one resource instance at a time",
          "Preemption is enabled for all running processes"
        ]),
        correctAnswer: 0,
        explanation: "A safe state guarantees that there exists a safe sequence <P1, P2, ... Pn> such that each process can satisfy its maximum demand and terminate.",
        difficulty: "hard",
      },
      {
        topicId: topicMap.get("Virtual Memory & Paging")!,
        text: "What hardware component is responsible for accelerating virtual-to-physical address translation by caching recent page-table entries?",
        options: JSON.stringify([
          "Translation Lookaside Buffer (TLB)",
          "Direct Memory Access (DMA) controller",
          "Memory Protection Unit (MPU)",
          "Instruction Cache (L1i)"
        ]),
        correctAnswer: 0,
        explanation: "The TLB is a high-speed associative hardware cache inside the MMU that stores recent page-to-frame translations.",
        difficulty: "medium",
      },
      {
        topicId: topicMap.get("Concurrency & Mutex")!,
        text: "What condition in process synchronization describes a situation where two or more threads continuously change their states in response to each other without making any useful progress?",
        options: JSON.stringify(["Livelock", "Deadlock", "Starvation", "Race Condition"]),
        correctAnswer: 0,
        explanation: "In a livelock, threads actively change state and consume CPU cycles in reaction to each other, but none progresses to completion.",
        difficulty: "hard",
      },
    ];

    for (const q of osQuestions) {
      if (q.topicId) {
        await prisma.question.create({ data: q });
      }
    }
    console.log("Added 4 OS questions.");
  }

  // 2. Computer Networks
  const cn = await prisma.subject.findFirst({
    where: { name: "Computer Networks" },
    include: { topics: true },
  });

  if (cn) {
    const topicMap = new Map(cn.topics.map(t => [t.name, t.id]));

    const cnQuestions = [
      {
        topicId: topicMap.get("OSI & TCP/IP Models")!,
        text: "Which layer of the OSI reference model is directly responsible for logical dialog control, token management, and synchronization checkpoints?",
        options: JSON.stringify(["Session Layer (Layer 5)", "Transport Layer (Layer 4)", "Presentation Layer (Layer 6)", "Data Link Layer (Layer 2)"]),
        correctAnswer: 0,
        explanation: "The Session Layer establishes, manages, and terminates connections between applications, providing checkpoints and dialog control.",
        difficulty: "easy",
      },
      {
        topicId: topicMap.get("IP Addressing & Subnetting")!,
        text: "What is the network address and broadcast address for an IP address 192.168.1.135 with subnet mask 255.255.255.192 (/26)?",
        options: JSON.stringify([
          "Network: 192.168.1.128, Broadcast: 192.168.1.191",
          "Network: 192.168.1.135, Broadcast: 192.168.1.255",
          "Network: 192.168.1.0, Broadcast: 192.168.1.192",
          "Network: 192.168.1.128, Broadcast: 192.168.1.255"
        ]),
        correctAnswer: 0,
        explanation: "/26 block size is 2^(32-26) = 64. Subnet blocks start at 0, 64, 128, 192. 135 falls in [128, 191], so network is .128 and broadcast is .191.",
        difficulty: "hard",
      },
      {
        topicId: topicMap.get("TCP Flow & Congestion Control")!,
        text: "In TCP congestion control, how does TCP adjust its congestion window (cwnd) during the Congestion Avoidance phase upon receiving successful ACKs?",
        options: JSON.stringify([
          "Additive Increase: increases cwnd by approximately 1 MSS per Round Trip Time (RTT)",
          "Multiplicative Increase: doubles cwnd every RTT",
          "Exponential Growth: increases by 2 MSS per ACK",
          "Constant Window: maintains fixed window size until a packet drop"
        ]),
        correctAnswer: 0,
        explanation: "TCP uses Additive Increase Multiplicative Decrease (AIMD). During Congestion Avoidance, cwnd increases linearly by 1 MSS per RTT.",
        difficulty: "medium",
      },
      {
        topicId: topicMap.get("Routing Protocols")!,
        text: "Which routing protocol uses the Dijkstra shortest-path-first algorithm and floods Link-State Advertisements (LSAs) throughout an autonomous system?",
        options: JSON.stringify(["OSPF (Open Shortest Path First)", "RIP (Routing Information Protocol)", "BGP (Border Gateway Protocol)", "EGP"]),
        correctAnswer: 0,
        explanation: "OSPF is a link-state routing protocol that maintains a synchronized topological link-state database and computes paths via Dijkstra.",
        difficulty: "medium",
      },
    ];

    for (const q of cnQuestions) {
      if (q.topicId) {
        await prisma.question.create({ data: q });
      }
    }
    console.log("Added 4 CN questions.");
  }

  // 3. Data Structures & Algorithms
  const dsa = await prisma.subject.findFirst({
    where: { name: "Data Structures & Algorithms" },
    include: { topics: true },
  });

  if (dsa) {
    const topicMap = new Map(dsa.topics.map(t => [t.name, t.id]));

    const dsaQuestions = [
      {
        topicId: topicMap.get("Binary Search Trees")!,
        text: "In a self-balancing AVL Tree, what is the maximum permissible difference between the heights of the left and right subtrees for any node?",
        options: JSON.stringify(["1", "0", "2", "log(n)"]),
        correctAnswer: 0,
        explanation: "By AVL Tree invariants, the balance factor (height(left) - height(right)) must always be in {-1, 0, 1}.",
        difficulty: "medium",
      },
      {
        topicId: topicMap.get("Dynamic Programming")!,
        text: "What two foundational properties must an optimization problem possess to be solvable via Dynamic Programming?",
        options: JSON.stringify([
          "Optimal Substructure and Overlapping Subproblems",
          "Greedy Choice Property and Independence",
          "Polynomial Time Bounds and Associativity",
          "Divide-and-Conquer Partitioning and Monotonicity"
        ]),
        correctAnswer: 0,
        explanation: "DP requires optimal substructure (optimal solution contains optimal sub-solutions) and overlapping subproblems (memoization avoids recomputation).",
        difficulty: "medium",
      },
      {
        topicId: topicMap.get("Asymptotic Complexity")!,
        text: "What is the worst-case time complexity of QuickSelect when choosing the pivot naively (e.g. always first element on sorted input)?",
        options: JSON.stringify(["O(n²)", "O(n log n)", "O(n)", "O(log n)"]),
        correctAnswer: 0,
        explanation: "On already sorted input with naive pivot selection, each partition only reduces problem size by 1, leading to O(n²) worst-case performance.",
        difficulty: "medium",
      },
      {
        topicId: topicMap.get("Graph Algorithms")!,
        text: "Which algorithm finds the single-source shortest paths in a directed weighted graph that may contain negative edge weights, and can detect negative cycles?",
        options: JSON.stringify([
          "Bellman-Ford Algorithm",
          "Dijkstra's Algorithm with Fibonacci Heap",
          "Prim's Minimum Spanning Tree Algorithm",
          "Kruskal's Disjoint-Set Algorithm"
        ]),
        correctAnswer: 0,
        explanation: "Bellman-Ford runs in O(V · E) time, tolerates negative edge weights, and detects negative-weight cycles if relaxation continues in the V-th pass.",
        difficulty: "hard",
      },
    ];

    for (const q of dsaQuestions) {
      if (q.topicId) {
        await prisma.question.create({ data: q });
      }
    }
    console.log("Added 4 DSA questions.");
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
