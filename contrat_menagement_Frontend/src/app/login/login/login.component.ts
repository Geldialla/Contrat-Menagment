// login.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private router: Router) { }

  login() {
    // Here you can implement your login logic
    console.log('admin:', this.username);
    console.log('admin:', this.password);
    
    // Example: Check if login is successful
    const loginSuccessful = true; // You should implement your actual login logic here
    
    if (loginSuccessful) {
      // Navigate to DashboardComponent if login is successful
      this.router.navigate(['/Dashboard']);
    }
  }
}
