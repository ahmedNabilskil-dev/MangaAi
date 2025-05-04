
import { type Node, type Edge, Position } from 'reactflow';
import type { NodeData } from '@/types/nodes';

// --- Constants for Layout ---
const HORIZONTAL_SPACING = 300; // Keep horizontal spacing significant
const VERTICAL_SPACING = 100;   // Increased spacing between nodes in the same column level
const CHARACTER_VERTICAL_SPACING = 80; // Spacing for character nodes
const CHARACTER_X_OFFSET = 50; // X position for character column
const CHARACTER_Y_OFFSET = 50; // Initial Y offset for characters
const HIERARCHY_X_OFFSET = CHARACTER_X_OFFSET + 250; // Start hierarchy further right
const HIERARCHY_Y_OFFSET = 50; // Initial Y offset for hierarchy

type NodeWithPosition = Node<NodeData> & { position: { x: number; y: number } };

export function layoutElements(nodes: Node[], edges: Edge[]): { nodes: Node[], edges: Edge[] } {
    if (!nodes || nodes.length === 0) {
        return { nodes, edges };
    }

    console.log("Starting hierarchical layout process (v2)...");

    const nodeMap = new Map<string, NodeWithPosition>();
    const characterNodes: NodeWithPosition[] = [];
    const mainHierarchyNodes: NodeWithPosition[] = [];

    // Initialize nodeMap and separate nodes
    nodes.forEach(node => {
        const nodeWithPos = { ...node, position: { ...node.position } } as NodeWithPosition;
        nodeMap.set(node.id, nodeWithPos);
        if (node.type === 'character') {
            characterNodes.push(nodeWithPos);
        } else {
            mainHierarchyNodes.push(nodeWithPos);
        }
    });


    // --- Position Characters ---
    let characterY = CHARACTER_Y_OFFSET;
    characterNodes.forEach(charNode => {
        charNode.position = { x: CHARACTER_X_OFFSET, y: characterY };
        nodeMap.set(charNode.id, charNode); // Update map
        characterY += CHARACTER_VERTICAL_SPACING;
        console.log(`Positioned character ${charNode.id} at (${charNode.position.x}, ${charNode.position.y})`);
    });

    // --- Build Hierarchy Tree (excluding character nodes and edges marked noLayout) ---
    const childrenMap = new Map<string, string[]>();
    const parentMap = new Map<string, string>(); // Store parent for each node
    const mainHierarchyNodeIds = new Set(mainHierarchyNodes.map(n => n.id));

    edges.forEach(edge => {
        // Only consider edges between nodes in the main hierarchy AND not marked noLayout
        if (
            !edge.data?.noLayout && // Check for layout exclusion flag
            mainHierarchyNodeIds.has(edge.source) &&
            mainHierarchyNodeIds.has(edge.target)
        ) {
            const children = childrenMap.get(edge.source) || [];
            children.push(edge.target);
            childrenMap.set(edge.source, children);
            parentMap.set(edge.target, edge.source); // Store parent
        }
    });

    // --- Find Root (Project) ---
    let rootNodeId: string | null = null;
    for (const node of mainHierarchyNodes) {
        // A root node is one in the main hierarchy that has no parent according to the layout edges
        if (node.type === 'project' && !parentMap.has(node.id)) {
            rootNodeId = node.id;
            break;
        }
    }

     // Fallback if no project node found or it has an unexpected parent link
    if (!rootNodeId && mainHierarchyNodes.length > 0) {
        for (const node of mainHierarchyNodes) {
            if (!parentMap.has(node.id)) {
                rootNodeId = node.id;
                 console.warn(`Project node not found as root. Using node ${rootNodeId} (${node.type}) as root.`);
                break;
            }
        }
        if (!rootNodeId) {
             rootNodeId = mainHierarchyNodes[0].id; // Ultimate fallback
             console.warn(`No clear root found. Using first main node ${rootNodeId} as root.`);
        }
    }

    if (!rootNodeId) {
        console.error("Could not determine root node for layout.");
        // Return only positioned characters if no root found
        const finalNodes = Array.from(nodeMap.values()).filter(n => characterNodes.some(cn => cn.id === n.id));
        return { nodes: finalNodes, edges };
    }

    console.log(`Root node identified: ${rootNodeId}`);


    // --- Position Nodes Recursively ---
    const positionedNodeIds = new Set<string>();
    // Keep track of the next available Y position for each column (level)
    const levelYOffset = new Map<number, number>();

    function positionHierarchy(nodeId: string, level: number): number {
        const node = nodeMap.get(nodeId);
        if (!node || positionedNodeIds.has(nodeId)) {
            return 0; // Already positioned or doesn't exist
        }

        // Determine X based on level (Starting hierarchy further right)
        const x = HIERARCHY_X_OFFSET + level * HORIZONTAL_SPACING;

        // Determine Y based on the current offset for this level
        const currentY = levelYOffset.get(level) ?? HIERARCHY_Y_OFFSET; // Start Y offset for this level
        node.position = { x, y: currentY };

        console.log(`Positioning node ${node.id} (${node.data.type}) at level ${level}, pos (${x}, ${currentY})`);
        nodeMap.set(nodeId, node); // Update map with positioned node
        positionedNodeIds.add(nodeId);

        // Calculate height occupied by this node (including vertical spacing)
        const nodeHeight = VERTICAL_SPACING;
        // Update the Y offset for the *next* node at *this* level
        levelYOffset.set(level, currentY + nodeHeight);

        const children = childrenMap.get(nodeId) || [];
        if (children.length > 0) {
             // Start children positioning vertically aligned or slightly below parent
             // Ensure children start at least at the parent's Y or the current level offset
             let childStartY = currentY;
             levelYOffset.set(level + 1, Math.max(levelYOffset.get(level + 1) ?? HIERARCHY_Y_OFFSET, childStartY));

             // Position children and calculate total height of the subtree rooted at children
            let childrenTotalHeight = 0;
            children.forEach((childId) => {
                childrenTotalHeight += positionHierarchy(childId, level + 1);
            });

            // Update this level's Y offset based on the height of its children's subtree
            levelYOffset.set(level, Math.max(currentY + nodeHeight, levelYOffset.get(level+1) ?? 0));

            return Math.max(nodeHeight, childrenTotalHeight); // Return the max height used by this node or its children subtrees
        }

        return nodeHeight; // Return height of this node row if it has no children
    }

    // Start positioning from the root
    positionHierarchy(rootNodeId, 0);

    // Combine all positioned nodes from the map
    const finalNodes = Array.from(nodeMap.values());

    console.log("Hierarchical layout process finished (v2).");
    // console.log("Final Node Positions:", finalNodes.map(n => ({ id: n.id, type: n.type, x: n.position.x, y: n.position.y })));

    return { nodes: finalNodes, edges };
}
