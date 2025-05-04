
import { type Node, type Edge } from 'reactflow';
import type { NodeData } from '@/types/nodes';

// --- Constants for Layout ---
const HORIZONTAL_SPACING = 275; // Increased spacing between columns
const VERTICAL_SPACING = 70;   // Spacing between nodes in the same column level
const CHARACTER_VERTICAL_SPACING = 80; // Spacing for character nodes
const CHARACTER_X_OFFSET = 50;
const CHARACTER_Y_OFFSET = 50;
const DEFAULT_NODE_WIDTH = 180; // Approximate width of a node for overlap checks (adjust if needed)
const DEFAULT_NODE_HEIGHT = 50; // Approximate height of a node

type NodeWithPosition = Node<NodeData> & { position: { x: number; y: number } };

export function layoutElements(nodes: Node[], edges: Edge[]): { nodes: Node[], edges: Edge[] } {
    if (!nodes || nodes.length === 0) {
        return { nodes, edges };
    }

    console.log("Starting hierarchical layout process...");

    // --- Separate Characters ---
    const characterNodes: NodeWithPosition[] = [];
    const mainHierarchyNodes: NodeWithPosition[] = [];
    const nodeMap = new Map<string, NodeWithPosition>(
        nodes.map(node => [node.id, { ...node } as NodeWithPosition]) // Initialize with existing nodes
    );

    nodes.forEach(node => {
        if (node.type === 'character') {
            characterNodes.push(node as NodeWithPosition);
        } else {
            mainHierarchyNodes.push(node as NodeWithPosition);
        }
    });

    // --- Position Characters ---
    let characterY = CHARACTER_Y_OFFSET;
    characterNodes.forEach(charNode => {
        charNode.position = { x: CHARACTER_X_OFFSET, y: characterY };
        nodeMap.set(charNode.id, charNode); // Update map with positioned char node
        characterY += CHARACTER_VERTICAL_SPACING;
        console.log(`Positioned character ${charNode.id} at (${charNode.position.x}, ${charNode.position.y})`);
    });

    // --- Build Hierarchy Tree (excluding character nodes/edges) ---
    const childrenMap = new Map<string, string[]>();
    const parentMap = new Map<string, string>(); // Store parent for each node
    const mainHierarchyNodeIds = new Set(mainHierarchyNodes.map(n => n.id));

    edges.forEach(edge => {
        // Only consider edges between nodes in the main hierarchy for layout
        if (mainHierarchyNodeIds.has(edge.source) && mainHierarchyNodeIds.has(edge.target)) {
            const children = childrenMap.get(edge.source) || [];
            children.push(edge.target);
            childrenMap.set(edge.source, children);
            parentMap.set(edge.target, edge.source); // Store parent
        }
    });

    // --- Find Root (Project) ---
    let rootNodeId: string | null = null;
    for (const node of mainHierarchyNodes) {
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
        // Return characters only if no root is found for main hierarchy
        return { nodes: characterNodes, edges };
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

        // Determine X based on level
        const x = CHARACTER_X_OFFSET + level * HORIZONTAL_SPACING;

        // Determine Y based on the current offset for this level
        const y = levelYOffset.get(level) ?? CHARACTER_Y_OFFSET; // Start Y offset for this level
        levelYOffset.set(level, y + VERTICAL_SPACING); // Update Y offset for the next node at this level

        console.log(`Positioning node ${node.id} (${node.data.type}) at level ${level}, pos (${x}, ${y})`);
        node.position = { x, y };
        nodeMap.set(nodeId, node); // Update map with positioned node
        positionedNodeIds.add(nodeId);

        let subtreeHeight = VERTICAL_SPACING; // Minimum height of a node row

        const children = childrenMap.get(nodeId) || [];
        if (children.length > 0) {
            let childrenHeight = 0;
            children.forEach((childId) => {
                // Recursively position children in the next level
                childrenHeight += positionHierarchy(childId, level + 1);
            });
            // Ensure the current node's level Y offset accounts for the tallest child branch
            levelYOffset.set(level, Math.max(levelYOffset.get(level) ?? 0, y + childrenHeight));
            subtreeHeight = Math.max(subtreeHeight, childrenHeight); // Height is determined by children
        }

        return subtreeHeight; // Return the total vertical space taken by this node and its descendants
    }

    // Start positioning from the root
    positionHierarchy(rootNodeId, 0);

    // Combine positioned main nodes and character nodes
    const finalNodes = [
        ...Array.from(nodeMap.values()).filter(n => mainHierarchyNodeIds.has(n.id)), // Get updated main nodes from map
        ...characterNodes // Add the separately positioned characters
    ];


    console.log("Hierarchical layout process finished.");
    // console.log("Final Node Positions:", finalNodes.map(n => ({ id: n.id, type: n.type, x: n.position.x, y: n.position.y })));

    return { nodes: finalNodes, edges };
}
