import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading: boolean = false;
  showPassword: boolean = false;
  rememberMe: boolean = false;

  private apiUrl = 'http://127.0.0.1:8000/api/auth/login/';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {
    this.loginForm = this.createForm();
  }

  ngOnInit(): void {
    // Auto-redirect if tokens are present in cookies
    const accessToken = this.cookieService.get('access_token');
    const refreshToken = this.cookieService.get('refresh_token');
    if (accessToken && refreshToken) {
      this.router.navigate(['/home']);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.minLength(1)]],
      password: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onRememberMeChange(event: any): void {
    this.rememberMe = event.target.checked;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      alert('Please fill in all fields');
      return;
    }

    this.isLoading = true;

    const credentials = {
      email: this.loginForm.get('email')?.value.trim(),
      password: this.loginForm.get('password')?.value
    };

    this.http.post<any>(this.apiUrl, credentials).subscribe(
      (response) => {
        this.isLoading = false;

        if (response && response.access) {
          // Store tokens in cookies
          const cookieOptions = this.rememberMe ? { expires: 30 } : undefined;
          this.cookieService.set('access_token', response.access, cookieOptions);
          this.cookieService.set('refresh_token', response.refresh, cookieOptions);
          console.log(response)
          // Optionally store in localStorage
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);

          // Store basic user info
          if (response.user) {
            localStorage.setItem('user_id', response.user.pk);
            localStorage.setItem('email', response.user.email);
            localStorage.setItem('username', response.user.username);
            localStorage.setItem('Role', response.user.role);
          }

          alert('Login successful! Redirecting...');
          this.router.navigate(['/home']);  // Redirect all users to /home
        } else {
          alert('Invalid response from server');
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Login error:', error);

        if (error.status === 400) {
          if (error.error.non_field_errors) {
            alert(error.error.non_field_errors[0]);
          } else if (error.error.email) {
            alert(error.error.email[0]);
          } else if (error.error.password) {
            alert(error.error.password[0]);
          } else {
            alert('Invalid email or password');
          }
        } else if (error.status === 401) {
          alert('Invalid credentials');
        } else if (error.status === 0) {
          alert('Network error. Please check your connection.');
        } else {
          alert('Login failed. Please try again.');
        }
      }
    );
  }

  navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) {
      return `${this.formatFieldName(fieldName)} is required`;
    }

    if (control.errors['minlength']) {
      return `${this.formatFieldName(fieldName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
    }

    return '';
  }

  private formatFieldName(fieldName: string): string {
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }

  hasError(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}
