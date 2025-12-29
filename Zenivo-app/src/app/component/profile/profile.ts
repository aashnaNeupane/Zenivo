import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  profileData: ProfileResponse | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.isLoading = true;
    this.error = null;

    this.http.get<ProfileResponse>('http://127.0.0.1:8000/api/auth/profile/', { headers })
      .subscribe({
        next: (data) => {
          this.profileData = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching profile:', err);
          this.isLoading = false;
          if (err.status === 401) {
            localStorage.removeItem('access_token');
            this.router.navigate(['/login']);
          } else {
            this.error = 'Failed to load profile';
          }
        }
      });
  }

  getRoleBadgeColor() {
    if (!this.profileData?.role) return '#ccc';
    switch (this.profileData.role.toUpperCase()) {
      case 'HR': return '#6a5acd';
      case 'ADMIN': return '#ff6347';
      default: return '#1e90ff';
    }
  }

  getRoleEmoji() {
    if (!this.profileData?.role) return '👤';
    switch (this.profileData.role.toUpperCase()) {
      case 'HR': return '🧑‍💼';
      case 'ADMIN': return '⭐';
      default: return '👨‍💻';
    }
  }

  getAvatarInitials() {
    if (!this.profileData?.username) return '?';
    return this.profileData.username.substring(0, 2).toUpperCase();
  }

  getAccountAge() {
    return 'Active';
  }

  getDashboardTypeLabel() {
    return this.profileData?.role === 'HR' ? 'HR Dashboard' : 'Employee Dashboard';
  }
}

export interface ProfileResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}
