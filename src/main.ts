import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),   // 🔥 REQUIRED
    provideHttpClient()      // 🔥 REQUIRED
  ]
}).catch(err => console.error(err));
