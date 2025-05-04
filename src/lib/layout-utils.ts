import { type Node, type Edge } from 'reactflow';
// Basic hierarchical layout - consider using a library like ELKjs for complex graphs

const HORIZONTAL_SPACING = 250;
const VERTICAL_SPACING = 100;

type NodeWithChildren = Node & { children?: NodeWithChildren[] };

export function layoutElements(nodes: Node[], edges: Edge[]): { nodes: Node[], edges: Edge[] } {
    if (!nodes || nodes.length === 0) {
        return { nodes, edges };
    }

    console.log("Starting layout process...");

    // Build adjacency list (children for each node)
    const adj = new Map<string, string[]>();
    edges.forEach(edge => {
        const children = adj.get(edge.source) || [];
        children.push(edge.target);
        adj.set(edge.source, children);
    });

     // Find root nodes (nodes with no incoming edges from *within the main flow*)
     // This assumes project -> chapter -> scene -> panel -> dialogue structure
     const nodeIds = new Set(nodes.map(n => n.id));
     const targetIds = new Set(edges.map(e => e.target));
     const rootIds = nodes.filter(n => !targetIds.has(n.id) || n.type === 'project').map(n => n.id); // Assume 'project' is always a root

    if (rootIds.length === 0 && nodes.length > 0) {
        console.warn("No root nodes found for layout, using first node as root.");
        rootIds.push(nodes[0].id); // Fallback: use the first node as root
    }
     console.log("Root nodes identified:", rootIds);


    const nodeMap = new Map(nodes.map(node => [node.id, { ...node } as NodeWithChildren]));
    const positionedNodes = new Set<string>();
    let currentX = 50; // Initial X position

    function positionNodes(nodeId: string, x: number, y: number, level: number): number {
         if (positionedNodes.has(nodeId)) {
             // If already positioned (e.g., multiple parents), adjust Y if necessary, but avoid infinite loops
             const existingNode = nodeMap.get(nodeId);
             if (existingNode && existingNode.position.y < y) {
                 // existingNode.position.y = y; // Simple adjustment, might overlap siblings
             }
             return y; // Return current y to avoid pushing siblings further down based on revisited node
         }

        const node = nodeMap.get(nodeId);
        if (!node) return y;

        console.log(`Positioning node ${node.id} (${node.data.type}) at (${x}, ${y})`);
        node.position = { x, y };
        positionedNodes.add(nodeId);

        let currentY = y;
        const children = adj.get(nodeId) || [];

        if (children.length > 0) {
             // Position children horizontally first
             let childX = x + HORIZONTAL_SPACING;
             let maxYadvance = 0; // Track max Y needed by this level's children

             children.forEach((childId, index) => {
                 const childNode = nodeMap.get(childId);
                 if (childNode && !positionedNodes.has(childId)) { // Avoid repositioning visited nodes in this pass
                     // Determine Y position for this child - needs to be below the previous sibling's tree
                     const childStartY = currentY + (index > 0 ? VERTICAL_SPACING : 0); // Start below previous sibling OR at current level
                     const childEndY = positionNodes(childId, childX, childStartY, level + 1);
                     maxYadvance = Math.max(maxYadvance, childEndY - y); // How far down did this child's subtree go?
                     currentY = childEndY; // Next sibling starts below the previous one's entire subtree
                 } else if (childNode && positionedNodes.has(childId)) {
                      // If child was already positioned (e.g. multiple parents), ensure currentY accounts for it
                      currentY = Math.max(currentY, childNode.position.y);
                 }
             });
              return y + maxYadvance; // Return the max Y reached by this node's children subtrees relative to the start y
        }

         // If node has no children, it advances Y by standard spacing for the next node at *its* level
        return y + VERTICAL_SPACING / 2; // Leaf node takes up some vertical space
    }

     // Position nodes starting from roots
     let globalY = 50;
     rootIds.forEach(rootId => {
         globalY = positionNodes(rootId, currentX, globalY, 0);
         globalY += VERTICAL_SPACING; // Add spacing between root trees if multiple roots
     });

    console.log("Layout process finished.");
    return { nodes: Array.from(nodeMap.values()), edges };
}
