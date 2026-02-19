function parsePagination(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20))
    const offset = (page - 1) * limit
    return { page, limit, offset }
}

function buildPaginationMeta(page, limit, totalItems) {
    const totalPages = Math.ceil(totalItems / limit)
    return {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    }
}

module.exports = { parsePagination, buildPaginationMeta }
