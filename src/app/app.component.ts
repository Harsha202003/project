import { Component } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterModule, CommonModule, FormsModule],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent { }
