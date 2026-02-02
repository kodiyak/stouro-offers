import { queryClient } from "../clients/query";

export async function invalidateQueries(paths: string[]) {
  await Promise.all(
    paths.map((path) =>
      queryClient.invalidateQueries({ queryKey: [...path.split("/")] }),
    ),
  );
}
