import { AssociationMiningResult, AssociationRule, CleanedReviewRow } from '../types';

export function runAssociationMining(
  rows: CleanedReviewRow[],
  minSupportPct: number = 0.05,
  minConfidence: number = 0.4
): AssociationMiningResult {
  if (!rows || rows.length === 0) {
    return { itemsets: [], rules: [] };
  }

  const N = rows.length;

  // 1. Get transaction itemsets (unique tokens per review)
  const transactions: Set<string>[] = rows.map(r => new Set(r.tokens || []));

  // 2. Compute 1-itemset supports
  const itemCounts: Record<string, number> = {};
  for (const tran of transactions) {
    for (const item of tran) {
      itemCounts[item] = (itemCounts[item] || 0) + 1;
    }
  }

  const minSupportCount = Math.max(2, Math.ceil(N * minSupportPct));
  const frequent1Items: string[] = Object.entries(itemCounts)
    .filter(([_, count]) => count >= minSupportCount)
    .map(([item, _]) => item);

  // 3. Compute 2-itemset supports
  const pairCounts: Record<string, number> = {};
  for (const tran of transactions) {
    const validItemsInTran = frequent1Items.filter(i => tran.has(i));
    for (let i = 0; i < validItemsInTran.length; i++) {
      for (let j = i + 1; j < validItemsInTran.length; j++) {
        const itemA = validItemsInTran[i];
        const itemB = validItemsInTran[j];
        const pairKey = itemA < itemB ? `${itemA}|||${itemB}` : `${itemB}|||${itemA}`;
        pairCounts[pairKey] = (pairCounts[pairKey] || 0) + 1;
      }
    }
  }

  const itemsets: { items: string[]; support: number }[] = [];
  const rules: AssociationRule[] = [];

  // Add 1-itemsets
  frequent1Items.forEach(item => {
    itemsets.push({
      items: [item],
      support: Number((itemCounts[item] / N).toFixed(3))
    });
  });

  // 4. Generate Association Rules from 2-itemsets
  Object.entries(pairCounts).forEach(([pairKey, pairCount]) => {
    if (pairCount >= minSupportCount) {
      const [itemA, itemB] = pairKey.split('|||');
      const supportPair = pairCount / N;

      itemsets.push({
        items: [itemA, itemB],
        support: Number(supportPair.toFixed(3))
      });

      // Direction 1: A => B
      const confAtoB = pairCount / itemCounts[itemA];
      const suppB = itemCounts[itemB] / N;
      const liftAtoB = confAtoB / (suppB || 0.001);

      if (confAtoB >= minConfidence) {
        rules.push({
          antecedent: [itemA],
          consequent: [itemB],
          ruleString: `${itemA} ➔ ${itemB}`,
          support: Number(supportPair.toFixed(3)),
          confidence: Number(confAtoB.toFixed(3)),
          lift: Number(liftAtoB.toFixed(3)),
          explanation: `When users mention '${itemA}', they also mention '${itemB}' in ${(confAtoB * 100).toFixed(0)}% of reviews (${liftAtoB.toFixed(2)}x more strongly associated than random).`
        });
      }

      // Direction 2: B => A
      const confBtoA = pairCount / itemCounts[itemB];
      const suppA = itemCounts[itemA] / N;
      const liftBtoA = confBtoA / (suppA || 0.001);

      if (confBtoA >= minConfidence) {
        rules.push({
          antecedent: [itemB],
          consequent: [itemA],
          ruleString: `${itemB} ➔ ${itemA}`,
          support: Number(supportPair.toFixed(3)),
          confidence: Number(confBtoA.toFixed(3)),
          lift: Number(liftBtoA.toFixed(3)),
          explanation: `When users mention '${itemB}', they also mention '${itemA}' in ${(confBtoA * 100).toFixed(0)}% of reviews (${liftBtoA.toFixed(2)}x more strongly associated than random).`
        });
      }
    }
  });

  // Sort rules by Lift descending
  return {
    itemsets: itemsets.sort((a, b) => b.support - a.support),
    rules: rules.sort((a, b) => b.lift - a.lift).slice(0, 15)
  };
}
