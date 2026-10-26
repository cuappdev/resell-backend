/**
 * Listing categories as the iOS app titles them (`Constants.filters`).
 * Category names are stored in this form.
 */
export const CATEGORY_NAMES = [
  "Clothing",
  "Books",
  "School",
  "Electronics",
  "Household",
  "Handmade",
  "Active",
  "Other",
];

const CATEGORY_NAME_BY_LOWERCASE = new Map(
  CATEGORY_NAMES.map((name) => [name.toLowerCase(), name]),
);

/**
 * The stored form of a category name: its app title when it is a known
 * category in any casing ("ELECTRONICS" -> "Electronics"), otherwise the name
 * trimmed.
 */
export function canonicalCategoryName(name: string): string {
  const trimmed = name.trim();
  return CATEGORY_NAME_BY_LOWERCASE.get(trimmed.toLowerCase()) ?? trimmed;
}
