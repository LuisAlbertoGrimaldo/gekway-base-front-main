import { inject } from '@angular/core';
import { forkJoin, map } from 'rxjs';

import { NavigationService } from 'app/core/navigation/navigation.service';
import { NavigationFilterService } from 'app/core/navigation/navigation-filter.service';
import { defaultNavigation } from 'app/mock-api/common/navigation/data';

import { MessagesService } from 'app/layout/common/messages/messages.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { QuickChatService } from 'app/layout/common/quick-chat/quick-chat.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';

export const initialDataResolver = () => {
    const messagesService = inject(MessagesService);
    const navigationService = inject(NavigationService);
    const notificationsService = inject(NotificationsService);
    const quickChatService = inject(QuickChatService);
    const shortcutsService = inject(ShortcutsService);
    const navFilter = inject(NavigationFilterService);

    return forkJoin([
        messagesService.getAll(),
        notificationsService.getAll(),
        quickChatService.getChats(),
        shortcutsService.getAll()
    ]).pipe(
        map(([messages, notifications, chats, shortcuts]) => {

            // 🔥 filtrar navegación por permisos
            const filteredNavigation = navFilter.filterNavigation(defaultNavigation);

            // 🔥 inyectar navegación al NavigationService
            navigationService.setNavigation({
                default: filteredNavigation,
                compact: filteredNavigation,
                futuristic: filteredNavigation,
                horizontal: filteredNavigation
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