import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup implements OnInit {
  signupForm: FormGroup;
  isLoading: boolean = false;
  showPassword1: boolean = false;
  showPassword2: boolean = false;
  passwordStrength: number = 0;
  passwordStrengthText: string = '';

  private apiUrl = 'http://127.0.0.1:8000/api/auth/registration/';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.signupForm = this.createForm();
  }

  ngOnInit(): void {}

  private createForm(): FormGroup {
    return this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(150)]],
        email: ['', [Validators.required, Validators.email]],
        password1: ['', [Validators.required, Validators.minLength(8)]],
        password2: ['', [Validators.required, Validators.minLength(8)]]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password1 = control.get('password1');
    const password2 = control.get('password2');
    if (!password1 || !password2) return null;
    return password1.value === password2.value ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'password1') this.showPassword1 = !this.showPassword1;
    else if (field === 'password2') this.showPassword2 = !this.showPassword2;
  }

  checkPasswordStrength(): void {
    const password = this.signupForm.get('password1')?.value || '';
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    this.passwordStrength = Math.min(strength, 5);
    this.passwordStrengthText =
      this.passwordStrength <= 1
        ? 'Weak'
        : this.passwordStrength <= 2
        ? 'Fair'
        : this.passwordStrength <= 3
        ? 'Good'
        : this.passwordStrength <= 4
        ? 'Strong'
        : 'Very Strong';
  }

  getPasswordStrengthColor(): string {
    switch (this.passwordStrength) {
      case 1: return '#e74c3c';
      case 2: return '#f39c12';
      case 3: return '#f1c40f';
      case 4: return '#2ecc71';
      case 5: return '#27ae60';
      default: return '#bdc3c7';
    }
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
      this.snackBar.open('Please fill in all fields correctly', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    const formData = {
      username: this.signupForm.get('username')?.value.trim(),
      email: this.signupForm.get('email')?.value.trim(),
      password1: this.signupForm.get('password1')?.value,
      password2: this.signupForm.get('password2')?.value
    };

    this.http.post<any>(this.apiUrl, formData).subscribe(
      response => {
        this.isLoading = false;
        this.snackBar.open('Account created successfully! Redirecting to login...', 'Close', { duration: 3000 });
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error => {
        this.isLoading = false;
        console.error('Signup error:', error);

        if (error.error) {
          if (error.error.username) this.snackBar.open(error.error.username[0], 'Close', { duration: 3000 });
          else if (error.error.email) this.snackBar.open(error.error.email[0], 'Close', { duration: 3000 });
          else if (error.error.password1) this.snackBar.open(error.error.password1[0], 'Close', { duration: 3000 });
          else if (error.error.password2) this.snackBar.open(error.error.password2[0], 'Close', { duration: 3000 });
          else if (error.error.non_field_errors) this.snackBar.open(error.error.non_field_errors[0], 'Close', { duration: 3000 });
          else this.snackBar.open('Signup failed. Please try again.', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Network error. Please check your connection.', 'Close', { duration: 3000 });
        }
      }
    );
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.signupForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';
    if (control.errors['required']) return `${this.formatFieldName(fieldName)} is required`;
    if (control.errors['minlength']) return `${this.formatFieldName(fieldName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
    if (control.errors['maxlength']) return `${this.formatFieldName(fieldName)} cannot exceed ${control.errors['maxlength'].requiredLength} characters`;
    if (control.errors['email']) return 'Please enter a valid email address';
    if (fieldName === 'password2' && this.signupForm.errors?.['passwordMismatch']) return 'Passwords do not match';
    return '';
  }

  private formatFieldName(fieldName: string): string {
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1');
  }

  hasError(fieldName: string): boolean {
    const control = this.signupForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}
