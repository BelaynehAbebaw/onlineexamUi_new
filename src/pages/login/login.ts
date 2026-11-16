
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email: string = '';
  password: string = '';
  message: string = '';
  showPassword: boolean = false;

  constructor(private router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {

    this.message = '';

    if (!this.email || !this.password) {
      this.message = 'Please enter your email and password.';
      return;
    }

    // Temporary frontend testing
    // Later connect this method to your Spring Boot login API.

    this.message = 'Login successful!';

    this.router.navigate(['/dashboard']);
  }
}
