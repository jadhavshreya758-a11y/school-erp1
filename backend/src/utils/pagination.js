/**
 * ─────────────────────────────────────────────
 *  Utility — Pagination Helper
 * ─────────────────────────────────────────────
 */
import { PAGINATION } from '../constants/index.js';

/**
 * Parse page/limit from query string and return
 * { page, limit, skip } safe integers.
 */
export const parsePagination = (query) => {
  const page  = Math.max(1, parseInt(query.page,  10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT),
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build the pagination meta object returned in responses.
 */
export const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});
