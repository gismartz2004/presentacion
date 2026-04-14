function normalizeDiscountCode(code) {
  if (code == null) return null;
  const normalized = String(code).trim().toUpperCase();
  return normalized.length ? normalized : null;
}

function isDiscountActive(discount, now = new Date()) {
  const startsAt = discount?.starts_at ? new Date(discount.starts_at) : null;
  const endsAt = discount?.ends_at ? new Date(discount.ends_at) : null;

  if (startsAt && now < startsAt) return false;
  if (endsAt && now > endsAt) return false;

  return true;
}

function clampPercentValue(percentValue) {
  if (!Number.isFinite(percentValue)) return 0;
  return Math.min(1, Math.max(0, percentValue));
}

function sortDiscountsForApplication(discounts) {
  return [...discounts].sort((a, b) => {
    const prioA = Number(a?.priority ?? 0);
    const prioB = Number(b?.priority ?? 0);
    if (prioA !== prioB) return prioB - prioA;

    const percentA = Number(a?.percent ?? 0);
    const percentB = Number(b?.percent ?? 0);
    if (percentA !== percentB) return percentB - percentA;

    return Number(a?.id ?? 0) - Number(b?.id ?? 0);
  });
}

/**
 * Regla de stacking (determinística):
 * - Se consideran solo descuentos activos por tiempo.
 * - Si existe al menos 1 descuento con stackable=false: aplica SOLO 1 → mayor prioridad, luego mayor %.
 * - Si todos son stackable=true: se aplican todos en ese orden (priority desc, percent desc), con composición:
 *   effective = 1 - Π(1 - p_i)
 */
function getEffectivePriceForProduct(discounts, now = new Date(), basePrice) {
  const active = (discounts ?? []).filter((d) => isDiscountActive(d, now));
  if (active.length === 0) {
    return { effectivePrice: 0, appliedDiscounts: [] };
  }

  // const ordered = sortDiscountsForApplication(active);
  // const hasNonStackable = ordered.some((d) => !Boolean(d?.stackable));

  // if (hasNonStackable) {
  //   const best = ordered[0];
  //   const pv = clampPercentValue(Number(best?.percent_value ?? 0));
  //   return { effectivePercentValue: pv, appliedDiscounts: [best] };
  // }

  // let remaining = 1;
  // const applied = [];
  // for (const d of ordered) {
  //   const pv = clampPercentValue(Number(d?.percent_value ?? 0));
  //   if (pv <= 0) continue;
  //   remaining *= 1 - pv;
  //   applied.push(d);
  // }

  // const effective = clampPercentValue(1 - remaining);

  const effective = applyDiscounts(basePrice, discounts);
  return { effectivePrice: effective, appliedDiscounts: (discounts ?? []).map(d => d.percent_value) };
}

const getDiscountSteps = (
  basePrice,
  discounts
) => {
  let runningPrice = basePrice ?? 0;

  return discounts.map((d) => {
    runningPrice -= runningPrice * (d.percent_value ?? 0);

    return {
      percent: d.percent ?? 0,
      price: runningPrice <= 0 ? 0 : runningPrice,
    };
  });
};

function getFinalUnitPrice(
  basePrice,
  discounts
) {
  const steps = getDiscountSteps(basePrice, discounts);

  return {
    finalPrice: steps.at(-1)?.price ?? basePrice,
    steps,
  };
}

function applyDiscounts (
  basePrice,
  discounts
) {
  return getDiscountSteps(basePrice, discounts).at(-1)?.price ?? basePrice;
};

module.exports = {
  normalizeDiscountCode,
  isDiscountActive,
  getEffectivePriceForProduct,
  getFinalUnitPrice,
  applyDiscounts
};
