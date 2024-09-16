import { DirectedGraph } from "graphology";
import { dijkstra } from "graphology-shortest-path";

export interface LayoutItem {
  key: string;
  width: number;
  height: number;
  rowSpan?: 1 | 2;
  featured?: boolean;
  flexibleAspectRatio?: boolean;
  maximizeWidth?: boolean;
  minHeight?: number;
  minWidth?: number;
}

export interface Layout<T = LayoutItem> {
  cells: LayoutCell<T>[];
  rows: LayoutRow<T>[];
  width: number;
  height: number;
}

export interface LayoutRow<T = LayoutItem> {
  /**
   * The cells in this row.
   */
  cells: LayoutCell<T>[];

  /**
   * The total width of this row.
   */
  width: number;

  /**
   * The total height of this row.
   */
  height: number;

  /**
   * The distance between this row's outer margin of top edge and the inner border of the top edge of the layout.
   */
  top: number;
}

export interface LayoutCell<T = LayoutItem> extends LayoutCellBase<T> {
  /**
   * The width of this cell in pixels or whatever unit was used when building the layout.
   */
  width: number;

  /**
   * The height of this cell in pixels or whatever unit was used when building the layout.
   */
  height: number;

  /**
   * The distance between this item's outer margin of left edge and the inner border of left edge of the layout.
   */
  left: number;

  /**
   * The distance between this item's outer margin of top edge and the inner border of the top edge of the layout.
   */
  top: number;
}

interface LayoutCellBase<T = LayoutItem> {
  /**
   * The item in this cell.
   */
  item: T;

  /**
   * The one-based number of the row that contains this cell.
   * If this item spans more than one row, then this is the first row that contains the cell.
   */
  row: number;

  /**
   * The one-based number of this item within the row.
   * If this item spans more than one row, then this is the order in the first row.
   */
  order: number;
}

export interface BuildLayoutOptions {
  layoutWidth: number;
  layoutHeight: number;
  gap: number;
}

export function buildLayout<T extends LayoutItem>(items: T[], options: BuildLayoutOptions): Layout<T> | undefined {
  if (!items || items.length === 0) {
    return undefined;
  }

  const { layoutWidth, layoutHeight, gap } = options;
  const { graph, sourceNode, targetNode } = buildLayoutGraph(items, options);
  const nodeKeys = dijkstra.bidirectional(graph, sourceNode, targetNode, (_, edgeAttributes) => edgeAttributes.weight);
  if (!nodeKeys) {
    return undefined;
  }

  const rowStartItems = nodeKeys.map((nodeKey) => findLayoutItem(items, nodeKey)).filter((item) => item);
  const cells: Array<LayoutCellBase & Partial<LayoutCell>> = [];
  const rowContexts: Array<{
    unscaledRowHeight: number;
    rowHeight: number;
    unscaledRowWidth: number;
    flexibleItemCount: number;
  }> = [];
  let rowIndex = -1;
  let order = 1;
  const rowHeightBuilder = new RowHeightBuilder(5);
  let rowWidthBuilder = 0;
  let flexibleItemCounter = 0;
  for (const item of items) {
    if (rowStartItems.includes(item)) {
      if (rowIndex >= 0) {
        rowContexts[rowIndex] = {
          unscaledRowHeight: rowHeightBuilder.getUnscaledRowHeight(),
          rowHeight: rowHeightBuilder.buildRowHeightForWidth(layoutWidth),
          unscaledRowWidth: rowWidthBuilder,
          flexibleItemCount: flexibleItemCounter,
        };
        rowHeightBuilder.reset();
        rowWidthBuilder = 0;
        flexibleItemCounter = 0;
      }
      rowIndex++;
      order = 1;
    }
    rowHeightBuilder.addItem(item.width, item.height, item.flexibleAspectRatio);
    rowWidthBuilder += item.width;
    if (item.flexibleAspectRatio) {
      flexibleItemCounter++;
    }

    const cell: LayoutCellBase<T> = {
      item,
      row: rowIndex + 1,
      order,
    };
    cells.push(cell);
    order++;
  }
  rowContexts[rowIndex] = {
    unscaledRowHeight: rowHeightBuilder.getUnscaledRowHeight(),
    rowHeight: rowHeightBuilder.buildRowHeightForWidth(layoutWidth),
    unscaledRowWidth: rowWidthBuilder,
    flexibleItemCount: flexibleItemCounter,
  };

  const rows: LayoutRow[] = [];
  let rowTopBuilder = 0;
  for (const { rowHeight } of rowContexts) {
    const row: LayoutRow = { height: rowHeight | 0, top: rowTopBuilder, width: 0, cells: [] };
    row.top = rowTopBuilder;
    rows.push(row);
    rowTopBuilder += rowHeight + gap;
  }

  const allCells: LayoutCell[] = [];
  for (const cell of cells) {
    const rowIndex = cell.row - 1;
    const { rowHeight, unscaledRowHeight, unscaledRowWidth, flexibleItemCount } = rowContexts[rowIndex];
    const itemWidth = cell.item.width;
    const itemHeight = cell.item.flexibleAspectRatio ? Math.max(cell.item.height, unscaledRowHeight) : cell.item.height;
    let cellWidth = scaleWidthToTargetHeight(itemWidth, itemHeight, rowHeight);

    // Flexible items can use up any unallocated horizontal space.
    if (cell.item.flexibleAspectRatio && flexibleItemCount > 0) {
      const rowWidth = scaleWidthToTargetHeight(unscaledRowWidth, unscaledRowHeight, rowHeight);
      if (rowWidth < layoutWidth) {
        const extraRowWidth = layoutWidth - rowWidth;
        cellWidth += Math.floor(extraRowWidth / flexibleItemCount);
      }
    }

    // if (cell.item.flexibleAspectRatio) {
    //   console.log(
    //     `itemHeight (${cell.row}, ${cell.order})`,
    //     cell.item.height,
    //     rowHeight,
    //     unscaledRowHeight,
    //     itemHeight,
    //   );
    //   console.log(`itemWIdth (${cell.row}, ${cell.order})`, cell.item.width, cellWidth);
    // }
    cell.height = rowHeight | 0;
    cell.width = cellWidth | 0;

    const row = rows[rowIndex];
    if (!row) {
      throw new Error(`Missing row for index ${rowIndex}`);
    }

    cell.top = row.top;
    cell.left = row.width;

    row.width += cell.width + gap;
    row.cells.push(cell as LayoutCell);
    allCells.push(cell as LayoutCell);
  }

  for (const row of rows) {
    if (row.width > gap) {
      row.width -= gap;
    }
  }

  const layout: Layout = {
    cells: allCells,
    rows,
    width: layoutWidth,
    height: layoutHeight,
  };
  return layout as Layout<T>;
}

interface LayoutNode {
  /**
   * The first item in the current row.
   */
  item: LayoutItem | undefined;

  /**
   * The index of this node in the item array, or -1 if item is undefined.
   */
  i: number;

  /**
   * The remaining layout height to be filled by this and all successive rows.
   */
  remainingLayoutHeight: number;

  /**
   * A key that uniquely identifies this node.
   */
  toString(): string;
}

interface LayoutEdgeAttributes {
  /**
   * The weight/score for this edge.  Smaller is better.
   */
  weight: number;
}

function generateNodeKey(key: string, remainingLayoutHeight: number): string {
  //return key + ":" + remainingLayoutHeight;

  interface NodeKeyObj {
    k: string;
    h: number;
  }
  const nodeKeyObj: NodeKeyObj = { k: key, h: remainingLayoutHeight | 0 };
  const nodeKey = JSON.stringify(nodeKeyObj);
  return nodeKey;
}

function findLayoutItem(items: LayoutItem[], nodeKey: string): LayoutItem | undefined {
  if (nodeKey === "end") {
    return undefined;
  }

  // const match = nodeKey.match(/^(.+):[0-9\.-]+$/);
  // const key = match?.[1];
  // if (!key) {
  //   return undefined;
  // }
  // return items.find((item) => item.key === key);

  let nodeKeyObj: { k?: string } | undefined;
  try {
    nodeKeyObj = JSON.parse(nodeKey);
  } catch (err) {
    nodeKeyObj = undefined;
  }
  const key = nodeKeyObj?.k;
  if (!key) {
    return undefined;
  }
  return items.find((item) => item.key === key);
}

export function buildLayoutGraph(
  items: LayoutItem[],
  options: BuildLayoutOptions,
): { graph: DirectedGraph; sourceNode: LayoutNode; targetNode: LayoutNode } {
  const { layoutWidth, layoutHeight, gap } = options;
  const idealRowHeight = estimateIdealRowHeight(items, layoutWidth, layoutHeight);

  const nodeMap = new Map<string, LayoutNode>();
  const unprocessedNodeQueue: LayoutNode[] = [];
  const graph = new DirectedGraph<{}, LayoutEdgeAttributes>();
  const getOrCreateLayoutNode = (item: LayoutItem, remainingLayoutHeight: number) => {
    const key = generateNodeKey(item.key, remainingLayoutHeight);
    let node = nodeMap.get(key);
    if (!node) {
      const i = items.indexOf(item);
      node = {
        item,
        i,
        remainingLayoutHeight,
        toString() {
          return key;
        },
      };
      nodeMap.set(key, node);
      unprocessedNodeQueue.push(node);
      graph.addNode(node);
    }
    return node;
  };

  const sourceNode = getOrCreateLayoutNode(items[0], layoutHeight - gap);
  const targetNode: LayoutNode = {
    item: undefined,
    i: -1,
    remainingLayoutHeight: 0,
    toString() {
      return "end";
    },
  };
  graph.addNode(targetNode);

  const rowHeightBuilder = new RowHeightBuilder(gap);
  while (unprocessedNodeQueue.length > 0) {
    const fromNode = unprocessedNodeQueue.pop()!;
    const fromItem = items[fromNode.i];

    rowHeightBuilder.reset();
    rowHeightBuilder.addItem(fromItem.width, fromItem.height, fromItem.flexibleAspectRatio);

    const featuredItems: LayoutItem[] = [];
    const flexibleAspectRatioItems: LayoutItem[] = [];
    if (fromItem.featured) {
      featuredItems.push(fromItem);
    }
    if (fromItem.flexibleAspectRatio) {
      flexibleAspectRatioItems.push(fromItem);
    }

    for (let i = fromNode.i + 1; i < items.length; i++) {
      const toItem = items[i];
      const rowHeight = rowHeightBuilder.buildRowHeightForWidth(layoutWidth);

      rowHeightBuilder.addItem(toItem.width, toItem.height, toItem.flexibleAspectRatio);

      // If we have any featured items in this row, then prefer to have this row double the size of other rows.
      let modifiedIdealRowHeight = idealRowHeight;
      if (featuredItems.length > 0) {
        modifiedIdealRowHeight = idealRowHeight * (2 + Math.min(Math.log10(featuredItems.length), 0.5));
      }
      if (toItem.featured) {
        featuredItems.push(toItem);
      }

      // If we have any flexible aspect ratio items in this row, then prefer to keep their widths as close to their target width as possible.
      let widthWeight = 0;
      if (flexibleAspectRatioItems.length > 0) {
        for (const flexibleAspectRatioItem of flexibleAspectRatioItems) {
          const preferredWidth = Math.min(flexibleAspectRatioItem.width, layoutWidth);

          const itemHeight = Math.max(flexibleAspectRatioItem.height, rowHeightBuilder.getUnscaledRowHeight());
          const scaledItemWidth = scaleWidthToTargetHeight(flexibleAspectRatioItem.width, itemHeight, rowHeight);
          const widthDiff = preferredWidth - scaledItemWidth;
          if (widthDiff > 0) {
            widthWeight += widthDiff * Math.log2(widthDiff);
          }
        }
      }
      if (toItem.flexibleAspectRatio) {
        flexibleAspectRatioItems.push(toItem);
      }

      const heightWeight =
        modifiedIdealRowHeight < rowHeight
          ? Math.abs(Math.pow(modifiedIdealRowHeight - rowHeight, 3))
          : Math.pow(modifiedIdealRowHeight - rowHeight, 2);
      const weight = heightWeight + widthWeight;
      const remainingLayoutHeight = fromNode.remainingLayoutHeight - rowHeight - gap;

      // If we're over the remaining space, then this can't be a breakpoint.
      if (remainingLayoutHeight < 0) {
        continue;
      }

      const toNode = getOrCreateLayoutNode(toItem, remainingLayoutHeight);
      graph.addEdge(fromNode, toNode, { weight });
    }

    // If we're not over the height limit, we can also proceed to the end node.
    const rowHeight = rowHeightBuilder.buildRowHeightForWidth(layoutWidth);
    const remainingLayoutHeight = fromNode.remainingLayoutHeight - rowHeight - gap;
    if (remainingLayoutHeight >= 0) {
      const endWeight = Math.pow(remainingLayoutHeight, 2);
      graph.addEdge(fromNode, targetNode, { weight: endWeight });
    }
  }

  return { graph, sourceNode, targetNode };
}

export class RowHeightBuilder {
  gap: number;
  itemCount: number;
  rowWidth: number;
  rowHeight: number;
  flexibleRowWidth: number;
  isRowHeightFlexible: boolean;

  constructor(gap: number) {
    if (typeof gap !== "number" || isNaN(gap)) {
      throw new Error("gap is not a number: " + gap);
    }

    this.gap = gap;
    this.itemCount = 0;
    this.rowWidth = 0;
    this.rowHeight = 0;
    this.flexibleRowWidth = 0;
    this.isRowHeightFlexible = false;
  }

  addItem(width: number, height: number, flexibleAspectRatio: boolean | undefined) {
    if (typeof width !== "number" || isNaN(width)) {
      throw new Error("width is not a number: " + width);
    }
    if (typeof height !== "number" || isNaN(height)) {
      throw new Error("height is not a number: " + height);
    }

    if (this.rowWidth === 0) {
      this.rowWidth = width;
      this.rowHeight = height;
      if (flexibleAspectRatio) {
        this.isRowHeightFlexible = true;
      }
    } else if (flexibleAspectRatio && height <= this.rowHeight) {
      this.flexibleRowWidth += width;
    } else {
      if (height < this.rowHeight) {
        this.rowWidth = scaleWidthToTargetHeight(this.rowWidth, this.rowHeight, height);
        this.rowHeight = height;
      } else if (this.isRowHeightFlexible) {
        this.rowHeight = height;
        this.isRowHeightFlexible = false;
      }
      const scaledWidth = scaleWidthToTargetHeight(width, height, this.rowHeight);
      this.rowWidth += scaledWidth;
    }
    this.itemCount++;
  }

  buildRowHeightForWidth(layoutWidth: number): number {
    if (typeof layoutWidth !== "number" || isNaN(layoutWidth)) {
      throw new Error("width is not a number: " + layoutWidth);
    }

    const gap = this.gap;
    let itemCount = this.itemCount;
    let rowWidth = this.rowWidth;
    if (this.flexibleRowWidth) {
      // Include some extra space for the flexible items based on how many items we have,
      // otherwise they might get very narrow if there are a lot of items in a row.
      rowWidth += Math.ceil(this.flexibleRowWidth * Math.max(Math.log2(this.itemCount), 1));
    }
    let rowHeight = this.rowHeight;
    return scaleRowHeightToTargetWidth(rowWidth, rowHeight, itemCount, gap, layoutWidth);
  }

  getUnscaledRowHeight() {
    return this.rowHeight;
  }

  reset() {
    this.itemCount = 0;
    this.rowWidth = 0;
    this.rowHeight = 0;
    this.flexibleRowWidth = 0;
  }
}

// export class RowPairHeightBuilder {
//   row1Builder: RowHeightBuilder;
//   row2Builder: RowHeightBuilder;
//   rowSpanBuilder: RowHeightBuilder;

//   constructor(gap: number) {
//     this.row1Builder = new RowHeightBuilder(gap);
//     this.row2Builder = new RowHeightBuilder(gap);
//     this.rowSpanBuilder = new RowHeightBuilder(gap);
//   }

//   addRow1Item(width: number, height: number) {
//     this.row1Builder.addItem(width, height);
//   }

//   addRow1ItemGroup(groupWidth: number, height: number, itemCount: number) {
//     this.row1Builder.addItemGroup(groupWidth, height, itemCount);
//   }

//   addRow2Item(width: number, height: number) {
//     this.row2Builder.addItem(width, height);
//   }

//   addRow2ItemGroup(groupWidth: number, height: number, itemCount: number) {
//     this.row2Builder.addItemGroup(groupWidth, height, itemCount);
//   }

//   addRowSpanItem(width: number, height: number) {
//     this.rowSpanBuilder.addItem(width, height);
//   }

//   buildRowHeightsForWidth(layoutWidth: number): [number, number] {
//     // const gapWidth = this.gap * this.itemCount;
//     // const adjustedLayoutWidth = layoutWidth - gapWidth;
//     // if (this.rowWidth <= adjustedLayoutWidth) {
//     //   return this.rowHeight;
//     // }
//     // return scaleHeightToTargetWidth(this.rowWidth, this.rowHeight, adjustedLayoutWidth);

//   }

//   reset() {
//     this.row1Builder.reset();
//     this.row2Builder.reset();
//     this.rowSpanBuilder.reset();
//   }
// }

function estimateIdealRowHeight(items: LayoutItem[], layoutWidth: number, layoutHeight: number) {
  const rows = estimateNumberOfRows(items, layoutWidth, layoutHeight);
  const rowHeight = (layoutHeight / rows) | 0;
  return rowHeight;
}

function estimateNumberOfRows(items: LayoutItem[], layoutWidth: number, layoutHeight: number) {
  if (!items || items.length === 0) {
    return 0;
  }

  const averageAspectRatio = items.reduce((sum, img) => sum + img.width / img.height, 0) / items.length;
  const discount = 1;
  const estimatedRows = Math.sqrt((averageAspectRatio * discount * items.length * layoutHeight) / layoutWidth);
  return estimatedRows;
}

function scaleRowHeightToTargetWidth(
  rowWidth: number,
  rowHeight: number,
  itemCount: number,
  gap: number,
  layoutWidth: number,
) {
  const gapWidth = gap * itemCount;
  const allowedLayoutWidth = layoutWidth - gapWidth;
  if (rowWidth <= allowedLayoutWidth) {
    return rowHeight;
  }
  return scaleHeightToTargetWidth(rowWidth, rowHeight, allowedLayoutWidth);
}

function scaleWidthToTargetHeight(sourceWidth: number, sourceHeight: number, targetHeight: number): number {
  if (sourceHeight === targetHeight) {
    return sourceWidth;
  }

  const aspectRatio = sourceWidth / sourceHeight;
  const targetWidth = targetHeight * aspectRatio;
  return targetWidth;
}

function scaleHeightToTargetWidth(sourceWidth: number, sourceHeight: number, targetWidth: number): number {
  if (sourceWidth === targetWidth) {
    return sourceWidth;
  }

  const aspectRatio = sourceWidth / sourceHeight;
  const targetHeight = targetWidth / aspectRatio;
  return targetHeight;
}
