import { Series } from "./types";

export function getSeriesTitle(series: Series) {
  if (series.comics.length === 1) {
    return series.comics[0].title;
  }
  return series.title;
}
