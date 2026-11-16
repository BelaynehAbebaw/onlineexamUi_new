
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Question {
  id?: number;
  questionText: string;
  questionType: string;
  subject: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
}

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './questions.html'
})
export class Questions implements OnInit {

  private apiUrl = 'http://localhost:8080/api/questions';

  questions: Question[] = [];
  filteredQuestions: Question[] = [];

  searchText = '';

  loading = false;
  saving = false;
  isModalOpen = false;
  isEditing = false;

  selectedId: number | null = null;

  message = '';
  errorMessage = '';

  question: Question = this.emptyQuestion();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  emptyQuestion(): Question {
    return {
      questionText: '',
      questionType: 'MULTIPLE_CHOICE',
      subject: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
      explanation: ''
    };
  }

  loadQuestions(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<Question[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.questions = data || [];
        this.filterQuestions();
        this.loading = false;
      },
      error: (error) => {
        console.error('Loading questions failed:', error);
        this.errorMessage = 'Unable to load questions. Check that the backend is running.';
        this.loading = false;
      }
    });
  }

  openAddModal(): void {
    this.question = this.emptyQuestion();
    this.selectedId = null;
    this.isEditing = false;
    this.isModalOpen = true;
    this.clearMessages();
  }

  openEditModal(item: Question): void {
    this.question = { ...item };
    this.selectedId = item.id ?? null;
    this.isEditing = true;
    this.isModalOpen = true;
    this.clearMessages();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.question = this.emptyQuestion();
  }

  saveQuestion(): void {
    if (
      !this.question.questionText.trim() ||
      !this.question.subject.trim() ||
      !this.question.optionA.trim() ||
      !this.question.optionB.trim() ||
      !this.question.optionC.trim() ||
      !this.question.optionD.trim() ||
      !this.question.correctAnswer
    ) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.saving = true;
    this.clearMessages();

    if (this.isEditing && this.selectedId !== null) {
      this.http.put<Question>(
        `${this.apiUrl}/${this.selectedId}`,
        this.question
      ).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.message = 'Question updated successfully.';
          this.loadQuestions();
        },
        error: (error) => this.handleSaveError(error)
      });
    } else {
      this.http.post<Question>(
        this.apiUrl,
        this.question
      ).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.message = 'Question added successfully.';
          this.loadQuestions();
        },
        error: (error) => this.handleSaveError(error)
      });
    }
  }

  deleteQuestion(item: Question): void {
    if (!item.id) {
      this.errorMessage = 'Question ID is missing.';
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete this question?`
    );

    if (!confirmed) {
      return;
    }

    this.clearMessages();

    this.http.delete(`${this.apiUrl}/${item.id}`).subscribe({
      next: () => {
        this.message = 'Question deleted successfully.';
        this.loadQuestions();
      },
      error: (error) => {
        console.error('Delete question failed:', error);
        this.errorMessage = 'Unable to delete question.';
      }
    });
  }

  filterQuestions(): void {
    const search = this.searchText.toLowerCase().trim();

    this.filteredQuestions = this.questions.filter(item =>
      item.questionText?.toLowerCase().includes(search) ||
      item.subject?.toLowerCase().includes(search) ||
      item.questionType?.toLowerCase().includes(search)
    );
  }

  private handleSaveError(error: any): void {
    console.error('Save question failed:', error);
    this.saving = false;
    this.errorMessage =
      error?.error?.message || 'Unable to save question. Please check the backend API.';
  }

  clearMessages(): void {
    this.message = '';
    this.errorMessage = '';
  }
}
