
export class HTTPError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function handleFetchResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 404) {
      return null as T;
    }
    throw new HTTPError(
      response.status,
      `HTTP error! status: ${response.status}`,
    );
  }
  
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new TypeError("Response was not JSON");
  }

  return response.json() as Promise<T>;
}