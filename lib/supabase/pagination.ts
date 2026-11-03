export const SUPABASE_PAGE_SIZE = 500;

type PageResult<T> = PromiseLike<{ data: T[] | null }>;

export async function readAllPages<T>(
  readPage: (from: number, to: number) => PageResult<T>,
  pageSize = SUPABASE_PAGE_SIZE
) {
  const rows: T[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data } = await readPage(from, from + pageSize - 1);
    const page = data ?? [];
    rows.push(...page);
    if (page.length < pageSize) break;
  }

  return rows;
}
