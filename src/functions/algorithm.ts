type RawEuroJackpotDraw = {
  numbers: Array<number | string>;
  starNumbers: Array<number | string>;
  date?: string;
};

type EuroJackpotDraw = {
  numbers: number[];
  starNumbers: number[];
  date?: string;
};

export type GeneratedTicket = {
  numbers: number[];
  starNumbers: number[];
  strategy: string;
  rationale: string;
  disclaimer: string;
  closing: string;
};

import euroJackpotData from "../../eurojackpot_data.json";

const MAIN_MIN = 1;
const MAIN_MAX = 50;
const EURO_MIN = 1;
const EURO_MAX = 12;

const DISCLAIMER =
  "This is for entertainment only. Past draws do NOT predict future ones. Every combination has exactly the same 1/139,838,160 jackpot chance. This suggestion uses historical patterns only as a heuristic - it has no mathematical advantage over random.";

const CLOSING =
  "Play responsibly - the house edge means long-term expected value is negative.";

const STRATEGIES = [
  { id: "balanced-frequency", label: "Balanced frequency mix" },
  { id: "historical-shape", label: "Historical average shape" },
  { id: "mild-hot-bias", label: "Mild hot bias + randomness" },
  { id: "overdue-light-cold", label: "Overdue / light cold bias" },
  { id: "random-constraints", label: "Pure random with constraints" },
] as const;

type StrategyId = (typeof STRATEGIES)[number]["id"];

const normalizeDraws = (rawData: RawEuroJackpotDraw[]): EuroJackpotDraw[] =>
  rawData.map((draw) => ({
    numbers: normalizeNumberArray(draw.numbers, MAIN_MAX),
    starNumbers: normalizeNumberArray(draw.starNumbers, EURO_MAX),
    date: draw.date,
  }));

const normalizeNumberArray = (
  values: Array<number | string>,
  maxValue: number
): number[] => {
  const parsed = values
    .map((value) => (typeof value === "number" ? value : parseInt(value, 10)))
    .filter((value) => Number.isFinite(value))
    .filter((value) => value >= 1 && value <= maxValue);

  return Array.from(new Set(parsed));
};

const range = (min: number, max: number): number[] =>
  Array.from({ length: max - min + 1 }, (_, index) => min + index);

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandomUnique = (pool: number[], count: number): number[] => {
  if (count <= 0) {
    return [];
  }

  const available = pool.slice();
  const selected: number[] = [];

  while (selected.length < count && available.length > 0) {
    const index = Math.floor(Math.random() * available.length);
    selected.push(available.splice(index, 1)[0]);
  }

  return selected;
};

const pickWeightedUnique = (
  pool: number[],
  frequencyMap: Map<number, number>,
  count: number
): number[] => {
  const available = pool.slice();
  const selected: number[] = [];

  while (selected.length < count && available.length > 0) {
    const totalWeight = available.reduce(
      (sum, value) => sum + (frequencyMap.get(value) || 1),
      0
    );

    if (totalWeight <= 0) {
      return selected.concat(
        pickRandomUnique(available, count - selected.length)
      );
    }

    let roll = Math.random() * totalWeight;
    let pickedIndex = 0;

    for (let i = 0; i < available.length; i += 1) {
      roll -= frequencyMap.get(available[i]) || 1;
      if (roll <= 0) {
        pickedIndex = i;
        break;
      }
    }

    selected.push(available.splice(pickedIndex, 1)[0]);
  }

  return selected;
};

const sumNumbers = (numbers: number[]): number =>
  numbers.reduce((total, value) => total + value, 0);

const countOdds = (numbers: number[]): number =>
  numbers.filter((value) => value % 2 !== 0).length;

const countLows = (numbers: number[]): number =>
  numbers.filter((value) => value <= 25).length;

const buildFrequencyMap = (
  draws: EuroJackpotDraw[],
  maxValue: number,
  key: "numbers" | "starNumbers"
): Map<number, number> => {
  const frequency = new Map<number, number>();
  range(1, maxValue).forEach((value) => frequency.set(value, 0));

  draws.forEach((draw) => {
    draw[key].forEach((value) => {
      frequency.set(value, (frequency.get(value) || 0) + 1);
    });
  });

  return frequency;
};

const sortByFrequency = (frequencyMap: Map<number, number>): number[] =>
  Array.from(frequencyMap.keys()).sort(
    (a, b) => (frequencyMap.get(b) || 0) - (frequencyMap.get(a) || 0)
  );

const buildOverdueList = (
  draws: EuroJackpotDraw[],
  maxValue: number,
  key: "numbers" | "starNumbers"
): number[] => {
  const lastSeen = new Map<number, number>();
  range(1, maxValue).forEach((value) => lastSeen.set(value, -1));

  draws.forEach((draw, index) => {
    draw[key].forEach((value) => {
      lastSeen.set(value, index);
    });
  });

  return range(1, maxValue).sort((a, b) => {
    const ageA = draws.length - 1 - (lastSeen.get(a) ?? -1);
    const ageB = draws.length - 1 - (lastSeen.get(b) ?? -1);
    if (ageA === ageB) {
      return a - b;
    }
    return ageB - ageA;
  });
};

const buildStats = (draws: EuroJackpotDraw[]) => {
  const allMainNumbers = range(MAIN_MIN, MAIN_MAX);
  const allEuroNumbers = range(EURO_MIN, EURO_MAX);

  const mainFrequency = buildFrequencyMap(draws, MAIN_MAX, "numbers");
  const euroFrequency = buildFrequencyMap(draws, EURO_MAX, "starNumbers");

  const mainSortedByFrequency = sortByFrequency(mainFrequency);
  const euroSortedByFrequency = sortByFrequency(euroFrequency);

  const recentDraws = draws.slice(Math.max(0, draws.length - 100));
  const recentMainFrequency = buildFrequencyMap(
    recentDraws,
    MAIN_MAX,
    "numbers"
  );
  const recentMainSortedByFrequency = sortByFrequency(recentMainFrequency);

  const mainOverdueSorted = buildOverdueList(draws, MAIN_MAX, "numbers");
  const euroOverdueSorted = buildOverdueList(draws, EURO_MAX, "starNumbers");

  const averageMainSum =
    draws.length > 0
      ? draws.reduce((total, draw) => total + sumNumbers(draw.numbers), 0) /
        draws.length
      : 135;

  return {
    allMainNumbers,
    allEuroNumbers,
    mainFrequency,
    euroFrequency,
    mainSortedByFrequency,
    euroSortedByFrequency,
    recentMainSortedByFrequency,
    mainOverdueSorted,
    euroOverdueSorted,
    averageMainSum,
  };
};

const pickEuroNumbers = (
  stats: ReturnType<typeof buildStats>,
  strategy: StrategyId
): number[] => {
  const hot = stats.euroSortedByFrequency.slice(0, 6);
  const mid = stats.euroSortedByFrequency.slice(4, 10);
  const overdue = stats.euroOverdueSorted.slice(0, 4);

  switch (strategy) {
    case "balanced-frequency": {
      const first = pickWeightedUnique(hot, stats.euroFrequency, 1)[0];
      const pool = mid.filter((value) => value !== first);
      const second = pickWeightedUnique(
        pool.length > 0
          ? pool
          : stats.allEuroNumbers.filter((v) => v !== first),
        stats.euroFrequency,
        1
      )[0];
      return [first, second].sort((a, b) => a - b);
    }
    case "mild-hot-bias": {
      const first = pickWeightedUnique(hot, stats.euroFrequency, 1)[0];
      const secondaryPool = stats.euroSortedByFrequency
        .slice(6)
        .filter((value) => value !== first);
      const second = pickWeightedUnique(
        secondaryPool.length > 0
          ? secondaryPool
          : stats.allEuroNumbers.filter((value) => value !== first),
        stats.euroFrequency,
        1
      )[0];
      return [first, second].sort((a, b) => a - b);
    }
    case "overdue-light-cold": {
      const first = pickRandomUnique(overdue, 1)[0];
      const pool = hot.filter((value) => value !== first);
      const second = pickWeightedUnique(
        pool.length > 0
          ? pool
          : stats.allEuroNumbers.filter((v) => v !== first),
        stats.euroFrequency,
        1
      )[0];
      return [first, second].sort((a, b) => a - b);
    }
    case "historical-shape":
    case "random-constraints":
    default:
      return pickWeightedUnique(
        stats.allEuroNumbers,
        stats.euroFrequency,
        2
      ).sort((a, b) => a - b);
  }
};

const attemptWithConstraints = (
  attempts: number,
  generator: () => number[],
  isValid: (candidate: number[]) => boolean
): number[] | null => {
  for (let i = 0; i < attempts; i += 1) {
    const candidate = generator();
    if (isValid(candidate)) {
      return candidate;
    }
  }
  return null;
};

const pickBalancedFrequency = (
  stats: ReturnType<typeof buildStats>
): number[] => {
  const hot = stats.recentMainSortedByFrequency.slice(0, 15);
  const cold = stats.mainSortedByFrequency.slice(-10);
  const mid = stats.mainSortedByFrequency.filter(
    (value) => !hot.includes(value) && !cold.includes(value)
  );

  const hotCount = randomInt(2, 3);
  const hotPicks = pickWeightedUnique(hot, stats.mainFrequency, hotCount);
  const midPool = mid.filter((value) => !hotPicks.includes(value));
  const fallbackPool = stats.mainSortedByFrequency.filter(
    (value) => !hotPicks.includes(value) && !cold.includes(value)
  );
  const midPicks = pickRandomUnique(
    midPool.length >= 5 - hotCount ? midPool : fallbackPool,
    5 - hotCount
  );

  return [...hotPicks, ...midPicks];
};

const pickHistoricalShape = (
  stats: ReturnType<typeof buildStats>
): number[] => {
  const minSum = Math.max(120, Math.floor(stats.averageMainSum - 15));
  const maxSum = Math.min(150, Math.ceil(stats.averageMainSum + 15));

  const candidate = attemptWithConstraints(
    600,
    () => pickRandomUnique(stats.allMainNumbers, 5),
    (numbers) => {
      const sum = sumNumbers(numbers);
      const oddCount = countOdds(numbers);
      const lowCount = countLows(numbers);
      const highCount = numbers.length - lowCount;
      return (
        sum >= minSum &&
        sum <= maxSum &&
        oddCount >= 2 &&
        oddCount <= 3 &&
        lowCount >= 2 &&
        highCount >= 2
      );
    }
  );

  return candidate ?? pickRandomUnique(stats.allMainNumbers, 5);
};

const pickMildHotBias = (stats: ReturnType<typeof buildStats>): number[] => {
  const hot = stats.mainSortedByFrequency.slice(0, 15);
  const hotCount = randomInt(3, 4);
  const hotPicks = pickWeightedUnique(hot, stats.mainFrequency, hotCount);
  const remaining = stats.allMainNumbers.filter(
    (value) => !hotPicks.includes(value)
  );
  const rest = pickRandomUnique(remaining, 5 - hotCount);

  return [...hotPicks, ...rest];
};

const pickOverdueLightCold = (
  stats: ReturnType<typeof buildStats>
): number[] => {
  const overdue = stats.mainOverdueSorted.slice(0, 15);
  const hot = stats.mainSortedByFrequency.slice(0, 12);
  const overdueCount = randomInt(3, 4);
  const overduePicks = pickRandomUnique(overdue, overdueCount);
  const hotPool = hot.filter((value) => !overduePicks.includes(value));
  const hotPicks = pickWeightedUnique(
    hotPool.length > 0
      ? hotPool
      : stats.allMainNumbers.filter((value) => !overduePicks.includes(value)),
    stats.mainFrequency,
    5 - overdueCount
  );

  return [...overduePicks, ...hotPicks];
};

const pickRandomWithConstraints = (
  stats: ReturnType<typeof buildStats>
): number[] => {
  const minSum = Math.max(110, Math.floor(stats.averageMainSum - 30));
  const maxSum = Math.min(170, Math.ceil(stats.averageMainSum + 30));

  const candidate = attemptWithConstraints(
    600,
    () => pickRandomUnique(stats.allMainNumbers, 5),
    (numbers) => {
      const sum = sumNumbers(numbers);
      const oddCount = countOdds(numbers);
      const lowCount = countLows(numbers);
      const highCount = numbers.length - lowCount;
      return (
        sum >= minSum &&
        sum <= maxSum &&
        oddCount >= 1 &&
        oddCount <= 4 &&
        lowCount >= 1 &&
        highCount >= 1
      );
    }
  );

  return candidate ?? pickRandomUnique(stats.allMainNumbers, 5);
};

const buildRationale = (
  strategy: StrategyId,
  numbers: number[],
  stats: ReturnType<typeof buildStats>
): string => {
  const sortedNumbers = numbers.slice().sort((a, b) => a - b);
  const sum = sumNumbers(sortedNumbers);
  const oddCount = countOdds(sortedNumbers);
  const lowCount = countLows(sortedNumbers);
  const highCount = sortedNumbers.length - lowCount;

  const hotSet = new Set(stats.mainSortedByFrequency.slice(0, 15));
  const overdueSet = new Set(stats.mainOverdueSorted.slice(0, 15));
  const hotHits = sortedNumbers.filter((value) => hotSet.has(value));
  const overdueHits = sortedNumbers.filter((value) => overdueSet.has(value));

  const hotText = hotHits.length > 0 ? ` (${hotHits.join(", ")})` : "";
  const overdueText =
    overdueHits.length > 0 ? ` (${overdueHits.join(", ")})` : "";

  switch (strategy) {
    case "balanced-frequency":
      return `Balanced mix with some frequently drawn mains${hotText}, ${oddCount} odd and ${
        sortedNumbers.length - oddCount
      } even, and a sum of ${sum}.`;
    case "historical-shape":
      return `Built to match a typical draw shape: sum ${sum}, ${oddCount} odd, and a low/high split of ${lowCount}/${highCount}.`;
    case "mild-hot-bias":
      return `Leans slightly toward historically frequent mains${hotText} with random fillers for variety. Sum ${sum} with ${oddCount} odd.`;
    case "overdue-light-cold":
      return `Includes a few overdue mains${overdueText} plus some hot numbers${hotText} to avoid extremes. Sum ${sum}.`;
    case "random-constraints":
    default:
      return `Uniform random with light constraints to avoid extreme all-low/all-high or all-odd/all-even patterns. Sum ${sum} with ${oddCount} odd.`;
  }
};

export const generateTicket = (
  rawData: RawEuroJackpotDraw[]
): GeneratedTicket => {
  const pastData = normalizeDraws(rawData);
  const stats = buildStats(pastData);
  const strategy = STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)];

  let numbers: number[] = [];

  switch (strategy.id) {
    case "balanced-frequency":
      numbers = pickBalancedFrequency(stats);
      break;
    case "historical-shape":
      numbers = pickHistoricalShape(stats);
      break;
    case "mild-hot-bias":
      numbers = pickMildHotBias(stats);
      break;
    case "overdue-light-cold":
      numbers = pickOverdueLightCold(stats);
      break;
    case "random-constraints":
    default:
      numbers = pickRandomWithConstraints(stats);
      break;
  }

  const starNumbers = pickEuroNumbers(stats, strategy.id);

  const sortedNumbers = numbers.slice().sort((a, b) => a - b);
  const sortedStars = starNumbers.slice().sort((a, b) => a - b);

  return {
    numbers: sortedNumbers,
    starNumbers: sortedStars,
    strategy: strategy.label,
    rationale: buildRationale(strategy.id, sortedNumbers, stats),
    disclaimer: DISCLAIMER,
    closing: CLOSING,
  };
};

const typedEuroJackpotData: RawEuroJackpotDraw[] = euroJackpotData;

export const initialTicket = generateTicket(typedEuroJackpotData);
