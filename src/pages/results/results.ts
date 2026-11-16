
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface ExamResult {
  id?: number;
  userId?: number;
  user?: {
    id?: number;
    name?: string;
    email?: string;
  };
  studentName?: string;
  subject: string;
  score: number;
  totalQuestions: number;
  examDate?: string;
}

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './results.html'
})
export class Results implements OnInit {

  private apiUrl = 'http://localhost:8080/api/results';

  results: ExamResult[] = [];
  filteredResults: ExamResult[] = [];

  searchText = '';
  selectedSubject = '';

  loading = false;
  saving = false;

  showForm = false;
  editingResult = false;

  successMessage = '';
  errorMessage = '';

  result: ExamResult = this.emptyResult();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadResults();
  }

  emptyResult(): ExamResult {
    return {
      userId: undefined,
      subject: '',
      score: 0,
      totalQuestions: 0,
      examDate: ''
    };
  }

  // Get all results
  loadResults(): void {
    this.loading = true;
    this.clearMessages();

    this.http.get<ExamResult[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.results = Array.isArray(data) ? data : [];
        this.filterResults();
        this.loading = false;
      },
      error: (error) => {
        console.error('Loading results failed:', error);
        this.errorMessage =
          'Unable to load results. Please check the backend API.';
        this.loading = false;
      }
    });
  }

  // Get student name
  getStudentName(item: ExamResult): string {
    return item.studentName || item.user?.name || 'Unknown student';
  }

  // Calculate percentage
  getPercentage(item: ExamResult): number {
    if (!item.totalQuestions || item.totalQuestions <= 0) {
      return 0;
    }

    return Math.round((item.score / item.totalQuestions) * 100);
  }

  // Pass / fail
  isPassed(item: ExamResult): boolean {
    return this.getPercentage(item) >= 50;
  }

  // Open edit form
  editResult(item: ExamResult): void {
    this.result = { ...item };
    this.editingResult = true;
    this.showForm = true;
    this.clearMessages();
  }

  // Close form
  closeForm(): void {
    this.showForm = false;
    this.editingResult = false;
    this.result = this.emptyResult();
  }

  // Update result
  saveResult(): void {
    if (
      !this.result.id ||
      !this.result.subject.trim() ||
      this.result.score < 0 ||
      this.result.totalQuestions <= 0 ||
      this.result.score > this.result.totalQuestions
    ) {
      this.errorMessage = 'Please enter valid result information.';
      return;
    }

    this.saving = true;
    this.clearMessages();

    const payload = {
      userId: this.result.userId ?? this.result.user?.id,
      subject: this.result.subject,
      score: this.result.score,
      totalQuestions: this.result.totalQuestions,
      examDate: this.result.examDate
    };

    this.http.put(
      `${this.apiUrl}/${this.result.id}`,
      payload
    ).subscribe({
      next: () => {
        this.successMessage = 'Result updated successfully.';
        this.closeForm();
        this.loadResults();
      },
      error: (error) => {
        console.error('Updating result failed:', error);
        this.errorMessage =
          error?.error?.message || 'Unable to update result.';
        this.saving = false;
      },
      complete: () => {
        this.saving = false;
      }
    });
  }

  // Delete result
  deleteResult(item: ExamResult): void {
    if (!item.id) {
      this.errorMessage = 'Result ID is missing.';
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete the result for ${this.getStudentName(item)}?`
    );

    if (!confirmed) {
      return;
    }

    this.clearMessages();

    this.http.delete(`${this.apiUrl}/${item.id}`).subscribe({
      next: () => {
        this.successMessage = 'Result deleted successfully.';
        this.loadResults();
      },
      error: (error) => {
        console.error('Deleting result failed:', error);
        this.errorMessage =
          error?.error?.message || 'Unable to delete result.';
      }
    });
  }

  // Search and filter
  filterResults(): void {
    const search = this.searchText.trim().toLowerCase();

    this.filteredResults = this.results.filter(item => {
      const matchesSearch =
        this.getStudentName(item).toLowerCase().includes(search) ||
        (item.user?.email || '').toLowerCase().includes(search) ||
        (item.subject || '').toLowerCase().includes(search);

      const matchesSubject =
        !this.selectedSubject ||
        item.subject === this.selectedSubject;

      return matchesSearch && matchesSubject;
    });
  }

  get subjects(): string[] {
    return [...new Set(
      this.results
        .map(item => item.subject)
        .filter((subject): subject is string => !!subject)
    )];
  }

  // Export CSV
  exportResults(): void {
    const headers = [
      'Student',
      'Email',
      'Subject',
      'Score',
      'Total Questions',
      'Percentage',
      'Status',
      'Exam Date'
    ];

    const rows = this.filteredResults.map(item => [
      this.getStudentName(item),
      item.user?.email || '',
      item.subject,
      item.score,
      item.totalQuestions,
      this.getPercentage(item) + '%',
      this.isPassed(item) ? 'PASS' : 'FAIL',
      item.examDate || ''
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(value =>
        `"${String(value ?? '').replace(/"/g, '""')}"`
      ).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'examination-results.csv';
    link.click();

    URL.revokeObjectURL(url);
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
