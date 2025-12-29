
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css'],
})  
export class HomePage {
  isSidebarOpen: boolean = true;
  currentUser: string = 'User';
  activeNav: string = 'dashboard';

  // Full API URL directly here
  private hrApiUrl = 'http://127.0.0.1:8000/dashboard/hr';
  private employeeApiUrl = 'http://127.0.0.1:8000/dashboard/employee';


  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
  if (isPlatformBrowser(this.platformId)) {
    this.fetchEmployeeDashboard();
  }
}


  // Fetch employee dashboard and set username
  fetchEmployeeDashboard(): void {
  const token = localStorage.getItem('access_token');

  if (!token) {
    this.router.navigate(['/login']);
    return;
  }

  // 🔹 Try HR first
  this.http.get(this.hrApiUrl, {
    headers: { Authorization: `Bearer ${token}` },
  }).subscribe({
    next: (res: any) => {
      this.currentUser = res.username || 'User';
    },
    error: (err) => {
      // 🔹 If HR forbidden → try employee
      if (err.status === 403) {
        this.http.get(this.employeeApiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }).subscribe({
          next: (res: any) => {
            this.currentUser = res.username || 'User';
          },
          error: (err) => {
            if (err.status === 401) {
              this.router.navigate(['/login']);
            }
          }
        });
      } else if (err.status === 401) {
        this.router.navigate(['/login']);
      }
    }
  });
}


  dashboardStats = [
    { label: 'Total Placements', value: '248', icon: '👥', color: '#482e20' },
    { label: 'Active Positions', value: '12', icon: '📋', color: '#d4a574' },
    { label: 'Pending Approvals', value: '5', icon: '⏳', color: '#482e20' },
    { label: 'Success Rate', value: '94%', icon: '⭐', color: '#d4a574' },
  ];

  recentActivities = [
    { type: 'placement', title: 'New Placement Confirmed', description: 'John Doe placed at Tech Corp', time: '2 hours ago' },
    { type: 'journal', title: 'Journal Entry Added', description: 'You added a new journal entry', time: '5 hours ago' },
    { type: 'achievement', title: 'Achievement Unlocked', description: 'Reached 250 successful placements', time: '1 day ago' },
    { type: 'notification', title: 'New Message', description: 'You have a new message from admin', time: '2 days ago' },
  ];

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  navigateTo(section: string): void {
    this.activeNav = section;
    switch (section) {
      case 'profile': this.router.navigate(['/profile']); break;
      case 'journals': this.router.navigate(['/journal']); break;
      case 'notifications': this.router.navigate(['/notifications']); break;
      case 'achievements': this.router.navigate(['/achievements']); break;
      default: this.activeNav = 'dashboard';
    }
  }

  logout(): void {
  if (isPlatformBrowser(this.platformId)) {
    // 1. Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');

    // 2. Clear ALL cookies (very important)
    this.clearAllCookies();
  }

  // 3. Navigate to login and hard reset app state
  this.router.navigate(['/login']).then(() => {
    window.location.reload();
  });
}

private clearAllCookies(): void {
  document.cookie.split(';').forEach((cookie) => {
    document.cookie = cookie
      .replace(/^ +/, '')
      .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
  });
}


  getActivityIcon(type: string): string {
    const icons: any = {
      placement: '👥',
      journal: '📝',
      achievement: '🏆',
      notification: '🔔',
    };
    return icons[type] || '📌';
  }
}
