export interface BlizzardItem {
  id: number;
  name: {
    en_US: string;
  };
}

export interface BlizzardApiResponse {
  page: number;
  pageSize: number;
  maxPageSize: number;
  pageCount: number;
  results: { data: BlizzardItem }[];
}