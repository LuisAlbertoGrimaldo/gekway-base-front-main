import { Injectable, inject } from '@angular/core';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { PermissionService } from '../auth/permission.service';
import { MODULES_CATALOG } from './modules.catalog';

@Injectable({ providedIn: 'root' })
export class NavigationBuilderService {

private permService = inject(PermissionService);
private navigationService = inject(NavigationService);

buildNavigation() {

return MODULES_CATALOG
    .filter(module => {

        if (this.permService.isSuperAdmin()) {
            return true;
        }

        return this.permService.has(module.permission);

    })
    .map(module => ({
        id: module.id,
        title: module.title,
        type: 'basic',
        icon: module.icon,
        link: module.link
    }));

}

refreshNavigation() {

const navigation = this.buildNavigation();

this.navigationService.setNavigation({
    default: navigation,
    compact: navigation,
    futuristic: navigation,
    horizontal: navigation
});

}

}