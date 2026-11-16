
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Userservice } from '../../services/userservice';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './user.html'
})
export class User implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];

  user: any = this.emptyUser();

  showForm = false;
  editingUser = false;

  loading = false;
  saving = false;
  deleting = false;

  searchText = '';

  successMessage = '';
  errorMessage = '';

  constructor(private userService: Userservice) {}

  ngOnInit(): void {
    this.getUsers();
  }

  // Empty user object
  emptyUser(): any {
    return {
      id: null,
      name: '',
      email: '',
      password: '',
      role: 'STUDENT',
      status: 'ACTIVE'
    };
  }

  // Open create form
  openCreateForm(): void {
    this.user = this.emptyUser();
    this.editingUser = false;
    this.showForm = true;
    this.clearMessages();
  }

  // Close form
  closeForm(): void {
    this.showForm = false;
    this.editingUser = false;
    this.user = this.emptyUser();
  }

  // Load users
  getUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getUsers().subscribe({
      next: (response: any) => {
        this.users = Array.isArray(response)
          ? response
          : response?.data || [];

        this.searchUsers();

      },
      error: (error: any) => {
        console.error('Loading users failed:', error);

        this.errorMessage =
          error?.message || 'Failed to load users.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // Create or update user
  saveUser(): void {

    this.clearMessages();

    if (!this.user.name?.trim() || !this.user.email?.trim()) {
      this.errorMessage = 'Please enter the name and email.';
      return;
    }

    if (!this.editingUser && !this.user.password?.trim()) {
      this.errorMessage = 'Please enter a password.';
      return;
    }

    this.saving = true;

    let request: Observable<any>;

    if (this.editingUser) {

      // Do not send an empty password during profile updates.
      const updatedUser = { ...this.user };
      delete updatedUser.password;

      request = this.userService.updateUser(
        this.user.id,
        updatedUser
      );

    } else {

      request = this.userService.createUser(this.user);

    }

    request.subscribe({
      next: () => {

        this.successMessage = this.editingUser
          ? 'User updated successfully.'
          : 'User created successfully.';

        this.closeForm();
        this.getUsers();

      },
      error: (error: any) => {

        console.error('Saving user failed:', error);

        this.errorMessage =
          error?.error?.message ||
          error?.message ||
          'Failed to save user.';

      },
      complete: () => {
        this.saving = false;
      }
    });
  }

  // Edit user
  editUser(item: any): void {

    this.user = {
      ...item,
      password: ''
    };

    this.editingUser = true;
    this.showForm = true;

    this.clearMessages();
  }

  // Delete user

deleteUser(item: any): void {

  const confirmed = confirm(
    `Are you sure you want to delete ${item.name}?`
  );

  if (!confirmed) {
    return;
  }

  this.clearMessages();
  this.deleting = true;

  this.userService.deleteUser(item.id).subscribe({

    next: () => {
      this.successMessage = 'User deleted successfully.';
      this.getUsers();
    },

    error: (error: any) => {
      console.error('Deleting user failed:', error);

      this.errorMessage =
        error?.error?.message ||
        error?.message ||
        'Failed to delete user.';

      this.deleting = false;
    },

    complete: () => {
      this.deleting = false;
    }

  });
}

  // Enable / Disable user
  toggleStatus(item: any): void {

  const currentStatus = item.status || 'ACTIVE';

  const newStatus =
    currentStatus === 'ACTIVE'
      ? 'DISABLED'
      : 'ACTIVE';

  const updatedUser = {
    ...item,
    status: newStatus
  };

  this.userService.updateUser(item.id, updatedUser)
    .subscribe({

      next: () => {

        item.status = newStatus;

        this.successMessage =
          newStatus === 'ACTIVE'
            ? 'User enabled successfully.'
            : 'User disabled successfully.';

        this.getUsers();

      },

      error: (error: any) => {

        console.error('Changing user status failed:', error);

        this.errorMessage = 'Failed to change user status.';

      }

    });
}


  // Search users
  searchUsers(): void {

    const search = this.searchText.trim().toLowerCase();

    this.filteredUsers = this.users.filter((item: any) => {

      return (
        item.name?.toLowerCase().includes(search) ||
        item.email?.toLowerCase().includes(search) ||
        item.role?.toLowerCase().includes(search) ||
        (item.status || 'ACTIVE').toLowerCase().includes(search)
      );

    });
  }

  // Clear search
  clearSearch(): void {
    this.searchText = '';
    this.searchUsers();
  }

  // Clear messages
  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

}
