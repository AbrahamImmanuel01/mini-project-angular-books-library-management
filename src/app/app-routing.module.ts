import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from './auth/auth.guard';
import { BookIssueManagementComponent } from './home/book-issue-management/book-issue-management.component';
import { BookManagementComponent } from './home/book-management/book-management.component';
import { CategoryManagementComponent } from './home/category-management/category-management.component';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { UserManagementComponent } from './home/user-management/user-management.component';

const appRoutes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'user', component: UserManagementComponent },
      { path: 'category', component: CategoryManagementComponent },
      { path: 'book', component: BookManagementComponent },
      { path: 'book-issue', component: BookIssueManagementComponent }
    ]
  },
  { path: 'auth', component: AuthComponent },
  { path: '**', redirectTo: '/auth', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
