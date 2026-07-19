export const INCLUDED_USERS = 5;
export const MIN_USERS = 5;
export const MAX_USERS = 50;

export const PADDLE_PRICES = {
    month: {
        base: 'pri_01kxt4ejrmq9tm7jw5jda2h4pn',
        seat: 'pri_01kxt4m9c0e7d3rtxgnjhn7gde',
    },
    year: {
        base: 'pri_01kxt4nr8y9jehazc92yv82tqk',
        seat: 'pri_01kxt4pdvfn2m46qdt7qqbt1mk',
    },
} as const;

const SEAT_PRICE_IDS = new Set<string>([PADDLE_PRICES.month.seat, PADDLE_PRICES.year.seat]);
const BASE_PRICE_IDS = new Set<string>([PADDLE_PRICES.month.base, PADDLE_PRICES.year.base]);

export const clampUsers = (users: number) =>
    Math.min(MAX_USERS, Math.max(MIN_USERS, Math.floor(users)));

export const extraSeats = (users: number) => Math.max(0, clampUsers(users) - INCLUDED_USERS);

export const isSeatPriceId = (priceId?: string | null) => !!priceId && SEAT_PRICE_IDS.has(priceId);

export const isBasePriceId = (priceId?: string | null) => !!priceId && BASE_PRICE_IDS.has(priceId);

export const userCountFromSubscriptionItems = (
    items: Array<{ quantity?: number; price?: { id?: string } | null }> | null | undefined,
    fallback: number
) => {
    if (!items?.length) return fallback;

    let seats = 0;
    let hasKnownPrice = false;

    for (const item of items) {
        const priceId = item.price?.id;
        if (isSeatPriceId(priceId)) {
            seats += item.quantity ?? 0;
            hasKnownPrice = true;
        } else if (isBasePriceId(priceId)) {
            hasKnownPrice = true;
        }
    }

    if (!hasKnownPrice) return fallback;
    return clampUsers(INCLUDED_USERS + seats);
};

export const checkoutItemsForUsers = (users: number, interval: 'month' | 'year') => {
    const prices = PADDLE_PRICES[interval];
    const items: { priceId: string; quantity: number }[] = [
        { priceId: prices.base, quantity: 1 },
    ];
    const seats = extraSeats(users);
    if (seats > 0) items.push({ priceId: prices.seat, quantity: seats });
    return items;
};
