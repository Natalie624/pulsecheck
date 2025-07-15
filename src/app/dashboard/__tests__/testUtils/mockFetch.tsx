export function mockFetchResponse(
  data: Record<string, unknown>,
  ok = true
): void {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(data),
    })
  ) as unknown as typeof fetch)
}


