
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SubjectService } from '../../services/subject';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';




@Component({
  selector: 'app-subject',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subject.html'
})
export class SubjectComponent implements OnInit {

 
  subjects: any[] = [];
  filteredSubjects: any[] = [];

  subject: any = this.emptySubject();

  showForm = false;
  editingSubject = false;
  loading = false;
  saving = false;

  searchText = '';

  successMessage = '';
  errorMessage = '';
isActive: ((value: any, index: number, array: any[]) => value is AnyCatcher) | undefined;

  constructor(private http: HttpClient,private subjectService: SubjectService) {}

  ngOnInit(): void {
    this.getSubjects();
  }

  emptySubject(): any {
    return {
      name: '',
      code: '',
      status: 'ACTIVE'
    };
  }

  getSubjects(): void {
    this.loading = true;

    this.subjectService.getSubjects().subscribe({
      next: (data: any) => {
        this.subjects = Array.isArray(data) ? data : [];
        this.searchSubjects();
        this.loading = false;
      },
      error: (error:any) => {
        console.error(error);
        this.errorMessage = 'Failed to load subjects.';
        this.loading = false;
      }
    });
  }

  openCreateForm(): void {
    this.subject = this.emptySubject();
    this.editingSubject = false;
    this.showForm = true;
    this.clearMessages();
  }

  editSubject(item: any): void {
    this.subject = { ...item };
    this.editingSubject = true;
    this.showForm = true;
    this.clearMessages();
  }

  closeForm(): void {
    this.showForm = false;
    this.editingSubject = false;
    this.subject = this.emptySubject();
  }

  saveSubject(): void {
    this.clearMessages();

    if (
      !this.subject.name.trim() ||
      !this.subject.code.trim()
    ) {
      this.errorMessage = 'Please enter subject name and subject code.';
      return;
    }

    this.saving = true;

    const request = this.editingSubject
      ? this.subjectService.updateSubject(this.subject.id, this.subject)
      : this.subjectService.addSubject(this.subject);

    request.subscribe({
      next: () => {
        this.successMessage = this.editingSubject
          ? 'Subject updated successfully.'
          : 'Subject created successfully.';

        this.closeForm();
        this.getSubjects();
        this.saving = false;
      },
      error: (error:any) => {
        console.error(error);
        this.errorMessage =
          error?.error?.message || 'Failed to save subject.';
        this.saving = false;
      }
    });
  }

  deleteSubject(item: any): void {
    if (!item.id) {
      this.errorMessage = 'Subject ID is missing.';
      return;
    }

    if (!confirm(`Are you sure you want to delete ${item.subjectName}?`)) {
      return;
    }

    this.clearMessages();

    this.subjectService.deleteSubject(item.id).subscribe({
      next: () => {
        this.successMessage = 'Subject deleted successfully.';
        this.getSubjects();
      },
      error: (error:any) => {
        console.error(error);
        this.errorMessage =
          error?.error?.message || 'Failed to delete subject.';
      }
    });
  }

  toggleStatus(item: any): void {
  //   if (!item.id) {
  //     return;
  //   }

  //   const updatedSubject = {
  //     ...item,
  //     status: item.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
  //   };

  //   this.subjectService.updateSubject(item.id, updatedSubject).subscribe({

  //   }).subscribe({
  //     next: () => {
  //       item.status = updatedSubject.status;
  //       this.successMessage = `Subject ${updatedSubject.status === 'ACTIVE' ? 'enabled' : 'disabled'} successfully.`;
  //       this.searchSubjects();
  //     },
  //     error: (error:any) => {
  //       console.error(error);
  //       this.errorMessage = 'Failed to change subject status.';
  //     }
  //   });
  }

  searchSubjects(): void {
    const search = this.searchText.toLowerCase().trim();

    this.filteredSubjects = this.subjects.filter(item =>
      item.subjectName?.toLowerCase().includes(search) ||
      item.subjectCode?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      item.status?.toLowerCase().includes(search)
    );
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
