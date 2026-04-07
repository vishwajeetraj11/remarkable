export interface MazeCell {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export interface MazePuzzle {
  grid: MazeCell[][];
  width: number;
  height: number;
  solution: [number, number][];
}

function createCell(): MazeCell {
  return { top: true, right: true, bottom: true, left: true };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Neighbour = { row: number; col: number; wall: keyof MazeCell; opposite: keyof MazeCell };

function getNeighbours(row: number, col: number, width: number, height: number): Neighbour[] {
  const neighbours: Neighbour[] = [];
  if (row > 0)          neighbours.push({ row: row - 1, col, wall: "top",    opposite: "bottom" });
  if (row < height - 1) neighbours.push({ row: row + 1, col, wall: "bottom", opposite: "top"    });
  if (col > 0)          neighbours.push({ row, col: col - 1, wall: "left",   opposite: "right"  });
  if (col < width - 1)  neighbours.push({ row, col: col + 1, wall: "right",  opposite: "left"   });
  return neighbours;
}

export function generateMaze(width: number, height: number): MazePuzzle {
  const w = Math.max(4, width);
  const h = Math.max(4, height);

  // Initialize grid — all walls up
  const grid: MazeCell[][] = Array.from({ length: h }, () =>
    Array.from({ length: w }, createCell)
  );

  const visited: boolean[][] = Array.from({ length: h }, () =>
    Array(w).fill(false)
  );

  // Iterative DFS (recursive backtracking) to avoid stack overflow on large mazes
  const stack: [number, number][] = [];
  visited[0][0] = true;
  stack.push([0, 0]);

  while (stack.length > 0) {
    const [row, col] = stack[stack.length - 1];
    const unvisited = shuffle(getNeighbours(row, col, w, h)).filter(
      (n) => !visited[n.row][n.col]
    );

    if (unvisited.length === 0) {
      stack.pop();
    } else {
      const next = unvisited[0];
      // Remove wall between current and next
      grid[row][col][next.wall] = false;
      grid[next.row][next.col][next.opposite] = false;
      visited[next.row][next.col] = true;
      stack.push([next.row, next.col]);
    }
  }

  // Solve: BFS from (0,0) to (h-1, w-1)
  const solution = solveMaze(grid, w, h);

  return { grid, width: w, height: h, solution };
}

function solveMaze(
  grid: MazeCell[][],
  width: number,
  height: number
): [number, number][] {
  const endRow = height - 1;
  const endCol = width - 1;

  const visited: boolean[][] = Array.from({ length: height }, () =>
    Array(width).fill(false)
  );
  const parent: ([number, number] | null)[][] = Array.from(
    { length: height },
    () => Array(width).fill(null)
  );

  const queue: [number, number][] = [[0, 0]];
  visited[0][0] = true;

  const wallToDir: { wall: keyof MazeCell; dr: number; dc: number }[] = [
    { wall: "top",    dr: -1, dc:  0 },
    { wall: "bottom", dr:  1, dc:  0 },
    { wall: "left",   dr:  0, dc: -1 },
    { wall: "right",  dr:  0, dc:  1 },
  ];

  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    if (row === endRow && col === endCol) break;

    for (const { wall, dr, dc } of wallToDir) {
      if (!grid[row][col][wall]) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < height && nc >= 0 && nc < width && !visited[nr][nc]) {
          visited[nr][nc] = true;
          parent[nr][nc] = [row, col];
          queue.push([nr, nc]);
        }
      }
    }
  }

  // Reconstruct path
  const path: [number, number][] = [];
  let cur: [number, number] | null = [endRow, endCol];
  while (cur !== null) {
    path.unshift(cur);
    cur = parent[cur[0]][cur[1]];
  }

  return path;
}
