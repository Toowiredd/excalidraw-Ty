export class BinaryHeap<T> {
  private content: T[] = [];

  constructor(private scoreFunction: (node: T) => number) {}

  /**
   * Sift-up logic: moves the node at `idx` up the tree until heap property is restored.
   * Note: The method name `sinkDown` is legacy/inverted; it actually performs a "swim" or "sift up" operation.
   */
  sinkDown(idx: number) {
    const node = this.content[idx];
    const score = this.scoreFunction(node);

    while (idx > 0) {
      const parentIdx = ((idx + 1) >> 1) - 1;
      const parent = this.content[parentIdx];
      if (score < this.scoreFunction(parent)) {
        this.content[idx] = parent;
        idx = parentIdx;
      } else {
        break;
      }
    }
    this.content[idx] = node;
  }

  /**
   * Sift-down logic: moves the node at `idx` down the tree until heap property is restored.
   * Note: The method name `bubbleUp` is legacy/inverted; it actually performs a "sink" or "sift down" operation.
   */
  bubbleUp(idx: number) {
    const length = this.content.length;
    const node = this.content[idx];
    const score = this.scoreFunction(node);

    while (true) {
      const child2Idx = (idx + 1) << 1;
      const child1Idx = child2Idx - 1;
      let swap: number | null = null;
      let child1Score = 0;

      if (child1Idx < length) {
        const child1 = this.content[child1Idx];
        child1Score = this.scoreFunction(child1);
        if (child1Score < score) {
          swap = child1Idx;
        }
      }

      if (child2Idx < length) {
        const child2 = this.content[child2Idx];
        const child2Score = this.scoreFunction(child2);
        if (child2Score < (swap === null ? score : child1Score)) {
          swap = child2Idx;
        }
      }

      if (swap !== null) {
        this.content[idx] = this.content[swap];
        idx = swap;
      } else {
        break;
      }
    }
    this.content[idx] = node;
  }

  push(node: T) {
    this.content.push(node);
    this.sinkDown(this.content.length - 1);
  }

  pop(): T | null {
    if (this.content.length === 0) {
      return null;
    }

    const result = this.content[0];
    const end = this.content.pop()!;

    if (this.content.length > 0) {
      this.content[0] = end;
      this.bubbleUp(0);
    }

    return result;
  }

  remove(node: T) {
    if (this.content.length === 0) {
      return;
    }

    const i = this.content.indexOf(node);
    const end = this.content.pop()!;

    if (i < this.content.length) {
      this.content[i] = end;

      if (this.scoreFunction(end) < this.scoreFunction(node)) {
        this.sinkDown(i);
      } else {
        this.bubbleUp(i);
      }
    }
  }

  size(): number {
    return this.content.length;
  }

  rescoreElement(node: T) {
    this.sinkDown(this.content.indexOf(node));
  }
}
