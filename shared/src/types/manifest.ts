export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  order: number;
  roles?: string[];
}

export interface ModuleCardConfig {
  id: string;
  title: string;
  description: string;
  path: string;
  icon?: string;
  category: "academic" | "admin" | "finance" | "campus" | "system";
  order: number;
}

export interface ModuleManifest {
  id: string;
  name: string;
  slug: string;
  version: string;
  status: "NOT-STARTED" | "CONTRACT-FROZEN" | "BUILDING" | "FROZEN";
  navigation?: NavigationItem[];
  moduleCard?: ModuleCardConfig;
  permissions?: string[];
}
