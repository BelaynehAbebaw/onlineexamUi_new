
import { Routes } from '@angular/router';
import { Mainlayout } from '../layouts/mainlayout/mainlayout';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import('../pages/login/login')
        .then(m => m.Login)
  },
  {
    path: '',
    component: Mainlayout,
    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('../pages/dashboard/dashboard')
            .then(m => m.Dashboard)
      },

      {
        path: 'users',
        loadComponent: () =>
          import('../pages/user/user')
            .then(m => m.User)
      },
      {
  path: 'subjects',
  loadComponent: () =>
    import('../pages/subject/subject')
      .then(m => m.SubjectComponent)
},

      {
        path: 'questions',
        loadComponent: () =>
          import('../pages/questions/questions')
            .then(m => m.Questions)
      },

      {
        path: 'results',
        loadComponent: () =>
          import('../pages/results/results')
            .then(m => m.Results)
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];
