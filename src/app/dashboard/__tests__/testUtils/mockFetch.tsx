// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockFetchResponse(data: any, ok = true) {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(data),
    })
  ) as unknown as typeof fetch)
}

