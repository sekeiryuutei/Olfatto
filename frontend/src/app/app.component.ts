import { Component, computed, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonRouterOutlet, IonIcon } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import {
  home,
  homeOutline,
  compass,
  compassOutline,
  add,
  trophy,
  trophyOutline,
  person,
  personOutline,
} from 'ionicons/icons';

addIcons({ home, homeOutline, compass, compassOutline, add, trophy, trophyOutline, person, personOutline });

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, IonIcon, RouterLink, RouterLinkActive, TranslateModule],
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>

      @if (showNav()) {
        <nav
          class="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around
                 h-16 ol-elevated px-2 pb-[env(safe-area-inset-bottom)]"
        >
          <a routerLink="/home" routerLinkActive="text-primary" [routerLinkActiveOptions]="{ exact: true }"
             class="flex flex-col items-center gap-0.5 text-text-secondary text-xs px-3 py-1">
            <ion-icon name="home-outline" class="text-xl"></ion-icon>
            <span>{{ 'NAV.HOME' | translate }}</span>
          </a>
          <a routerLink="/fragrances" routerLinkActive="text-primary"
             class="flex flex-col items-center gap-0.5 text-text-secondary text-xs px-3 py-1">
            <ion-icon name="compass-outline" class="text-xl"></ion-icon>
            <span>{{ 'NAV.EXPLORE' | translate }}</span>
          </a>
          <a routerLink="/fragrances/create"
             class="flex items-center justify-center w-12 h-12 -mt-6 rounded-full
                    bg-primary text-bg shadow-lg">
            <ion-icon name="add" class="text-2xl"></ion-icon>
          </a>
          <a routerLink="/rankings" routerLinkActive="text-primary"
             class="flex flex-col items-center gap-0.5 text-text-secondary text-xs px-3 py-1">
            <ion-icon name="trophy-outline" class="text-xl"></ion-icon>
            <span>{{ 'NAV.RANKINGS' | translate }}</span>
          </a>
          <a routerLink="/profile" routerLinkActive="text-primary"
             class="flex flex-col items-center gap-0.5 text-text-secondary text-xs px-3 py-1">
            <ion-icon name="person-outline" class="text-xl"></ion-icon>
            <span>{{ 'NAV.PROFILE' | translate }}</span>
          </a>
        </nav>
      }
    </ion-app>
  `,
})
export class AppComponent {
  private readonly currentUrl = signal(this.router.url);

  // Auth screens (and the onboarding-less MVP's future routes) render full-bleed, no tab bar.
  readonly showNav = computed(() => !this.currentUrl().startsWith('/auth'));

  constructor(private readonly router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects);
      }
    });
  }
}
