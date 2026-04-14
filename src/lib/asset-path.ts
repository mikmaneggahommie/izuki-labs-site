const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const normalizedBasePath =
  rawBasePath === "/" ? "" : rawBasePath.replace(/\/$/, "");

export function assetPath(path: string) {
  if (!path) {
    return path;
  }

  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBasePath}${normalizedPath}`;
}
