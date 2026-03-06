import { inject } from '@angular/core';
import { forkJoin, map } from 'rxjs';

import { NavigationService } from 'app/core/navigation/navigation.service';
import { NavigationFilterService } from 'app/core/navigation/navigation-filter.service';

import { MessagesService } from 'app/layout/common/messages/messages.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { QuickChatService } from 'app/layout/common/quick-chat/quick-chat.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';

import { NavigationBuilderService } from 'app/core/navigation/navigation-builder.service';
import { PermissionService } from 'app/core/auth/permission.service';

export const initialDataResolver = () => {

    const messagesService = inject(MessagesService);
    const navigationService = inject(NavigationService);
    const notificationsService = inject(NotificationsService);
    const quickChatService = inject(QuickChatService);
    const shortcutsService = inject(ShortcutsService);

    // 🔥 INYECTAR EL BUILDER
    const navigationBuilder = inject(NavigationBuilderService);

    const permissionService = inject(PermissionService);
    permissionService.cargarSesion();

    return forkJoin([
        messagesService.getAll(),
        notificationsService.getAll(),
        quickChatService.getChats(),
        shortcutsService.getAll()
    ]).pipe(
        map(([messages, notifications, chats, shortcuts]) => {

            const navigation = navigationBuilder.buildNavigation();

            navigationService.setNavigation({
                default: navigation,
                compact: navigation,
                futuristic: navigation,
                horizontal: navigation
            });

            return {
                messages,
                notifications,
                chats,
                shortcuts
            };
        })
    );
};