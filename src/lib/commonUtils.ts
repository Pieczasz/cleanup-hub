
import { use } from "react";

export function usePromiseParams<T>(params: Promise<T>): T {
  return use(params);
}