import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

  profileOpen = false;

  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;
  }

}