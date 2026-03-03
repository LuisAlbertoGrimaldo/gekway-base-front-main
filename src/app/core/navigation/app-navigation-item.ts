import { FuseNavigationItem } from '@fuse/components/navigation';

/*export interface AppNavigationItem extends FuseNavigationItem {
    permission?: string; // 🔑 propiedad extra
}*/

export interface AppNavigationItem extends FuseNavigationItem {
  id?: string;
  title?: string;
  icon?: string;
  link?: string;

  // 🔥 NUEVO
  permission?: string;
  module?: string;

  children?: AppNavigationItem[];
}