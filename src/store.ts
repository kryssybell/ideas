import type { Review } from './types';

const STORAGE_KEY = 'ideas_reviews';

export function loadReviews(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReviews(reviews: Review[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function getReview(id: string): Review | undefined {
  return loadReviews().find((r) => r.id === id);
}

export function upsertReview(review: Review): void {
  const reviews = loadReviews();
  const idx = reviews.findIndex((r) => r.id === review.id);
  if (idx >= 0) {
    reviews[idx] = review;
  } else {
    reviews.unshift(review);
  }
  saveReviews(reviews);
}

export function deleteReview(id: string): void {
  saveReviews(loadReviews().filter((r) => r.id !== id));
}
