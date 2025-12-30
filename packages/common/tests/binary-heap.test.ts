import { BinaryHeap } from "../src/binary-heap";

describe("BinaryHeap", () => {
  it("should push items and pop them in sorted order (min-heap)", () => {
    const heap = new BinaryHeap<number>((n) => n);

    heap.push(5);
    heap.push(3);
    heap.push(1);
    heap.push(4);
    heap.push(2);

    expect(heap.size()).toBe(5);

    expect(heap.pop()).toBe(1);
    expect(heap.pop()).toBe(2);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(4);
    expect(heap.pop()).toBe(5);

    expect(heap.size()).toBe(0);
    expect(heap.pop()).toBe(null);
  });

  it("should handle random insertions and maintain heap property", () => {
    const heap = new BinaryHeap<number>((n) => n);
    const nums: number[] = [];
    const count = 100;

    for (let i = 0; i < count; i++) {
      const n = Math.floor(Math.random() * 1000);
      nums.push(n);
      heap.push(n);
    }

    nums.sort((a, b) => a - b);

    for (let i = 0; i < count; i++) {
      expect(heap.pop()).toBe(nums[i]);
    }
  });

  it("should remove items correctly", () => {
    const heap = new BinaryHeap<number>((n) => n);

    heap.push(10);
    heap.push(20);
    heap.push(5);
    heap.push(15);

    // Heap should be: 5, 15, 10, 20 (roughly)

    heap.remove(15);
    expect(heap.size()).toBe(3);

    expect(heap.pop()).toBe(5);
    expect(heap.pop()).toBe(10);
    expect(heap.pop()).toBe(20);
  });

  it("should handle remove of the last item", () => {
    const heap = new BinaryHeap<number>((n) => n);
    heap.push(1);
    heap.push(2);

    heap.remove(2);
    expect(heap.size()).toBe(1);
    expect(heap.pop()).toBe(1);
  });

  it("should handle remove of the root item", () => {
    const heap = new BinaryHeap<number>((n) => n);
    heap.push(1);
    heap.push(2);

    heap.remove(1);
    expect(heap.size()).toBe(1);
    expect(heap.pop()).toBe(2);
  });
});
