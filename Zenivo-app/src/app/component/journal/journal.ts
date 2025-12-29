import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 

interface Journal {
  id?: number;
  title: string;
  thoughts: string;
  mood: string;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './journal.html',
  styleUrls: ['./journal.css']
})
export class JournalsComponent implements OnInit {
  journalForm: FormGroup;
  journals: Journal[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;
  showForm: boolean = false;
  editingId: number | null = null;
  selectedMood: string = 'happy';
  currentTags: string[] = [];
  tagInput: string = '';

  moods = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'excited', emoji: '🤩', label: 'Excited' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'stressed', emoji: '😰', label: 'Stressed' },
    { value: 'motivated', emoji: '💪', label: 'Motivated' },
    { value: 'grateful', emoji: '🙏', label: 'Grateful' },
    { value: 'thoughtful', emoji: '🤔', label: 'Thoughtful' }
  ];

  private apiUrl = 'http://127.0.0.1:8000/api/journal/create/';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.journalForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadJournals();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  private loadJournals(): void {
    this.journals = []; // placeholder for future GET API
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  private resetForm(): void {
    this.journalForm.reset();
    this.currentTags = [];
    this.tagInput = '';
    this.selectedMood = 'happy';
    this.editingId = null;
  }

  addTag(): void {
    const tag = this.tagInput.trim();
    if (tag && !this.currentTags.includes(tag)) {
      this.currentTags.push(tag);
      this.tagInput = '';
    }
  }

  removeTag(index: number): void {
    this.currentTags.splice(index, 1);
  }

  onTagKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  onSubmit(): void {
    if (this.journalForm.invalid) {
      Object.keys(this.journalForm.controls).forEach(key => {
        this.journalForm.get(key)?.markAsTouched();
      });
      alert('Please fill in all required fields');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Unauthorized: Please log in again');
      this.router.navigate(['/login']);
      return;
    }

    this.isSaving = true;

    const journalData: Journal = {
      title: this.journalForm.get('title')?.value,
      thoughts: this.journalForm.get('content')?.value,
      mood: this.selectedMood,
      tags: this.currentTags
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    if (this.editingId) {
      this.http.put(`${this.apiUrl}${this.editingId}/`, journalData, { headers })
        .subscribe({
          next: () => {
            this.isSaving = false;
            alert('Journal updated successfully');
            this.resetForm();
            this.showForm = false;
            this.loadJournals();
          },
          error: (err) => {
            this.isSaving = false;
            console.error('Error updating journal:', err);
            if (err.status === 401) {
              alert('Unauthorized: Please log in again');
              this.router.navigate(['/login']);
            } else {
              alert('Failed to update journal');
            }
          }
        });
    } else {
      this.http.post(this.apiUrl, journalData, { headers })
        .subscribe({
          next: () => {
            this.isSaving = false;
            alert('Journal created successfully');
            this.resetForm();
            this.showForm = false;
            this.journals.push(journalData);
          },
          error: (err) => {
            this.isSaving = false;
            console.error('Error creating journal:', err);
            if (err.status === 401) {
              alert('Unauthorized: Please log in again');
              this.router.navigate(['/login']);
            } else {
              alert('Failed to create journal');
            }
          }
        });
    }
  }

  editJournal(journal: Journal): void {
    this.editingId = journal.id || null;
    this.journalForm.patchValue({
      title: journal.title,
      content: journal.thoughts
    });
    this.selectedMood = journal.mood;
    this.currentTags = [...journal.tags];
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteJournal(journalId?: number): void {
    if (!journalId) return;

    if (!confirm('Are you sure you want to delete this journal?')) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Unauthorized: Please log in again');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.delete(`${this.apiUrl}${journalId}/`, { headers })
      .subscribe({
        next: () => {
          alert('Journal deleted successfully');
          this.journals = this.journals.filter(j => j.id !== journalId);
        },
        error: (err) => {
          console.error('Error deleting journal:', err);
          if (err.status === 401) {
            alert('Unauthorized: Please log in again');
            this.router.navigate(['/login']);
          } else {
            alert('Failed to delete journal');
          }
        }
      });
  }

  getMoodEmoji(mood: string): string {
    const moodObj = this.moods.find(m => m.value === mood);
    return moodObj ? moodObj.emoji : '😐';
  }

  hasError(fieldName: string): boolean {
    const control = this.journalForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.journalForm.get(fieldName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (control.errors['minlength']) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  truncateContent(content: string, limit: number = 100): string {
    if (!content) return '';
    return content.length > limit ? content.substring(0, limit) + '...' : content;
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
